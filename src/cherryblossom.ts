import { Petal } from "./petal";
import { randomRange } from "./math";
import type { CherryBlossomOptions, WindOptions, PetalStyle } from "./types";

/**
 * CherryBlossom manages the canvas lifecycle, particle physics simulation loop,
 * dynamic wind fluctuations, mouse interaction breeze, and high-DPI responsive rendering.
 */
export class CherryBlossom {
  /**
   * Static default options
   */
  public static readonly DEFAULT_OPTIONS = {
    root: null as HTMLElement | null,
    number: 45,
    gravityRange: [1.2, 2.6] as [number, number],
    wind: {
      speed: 1.5,
      gust: 1.5,
      enableMouseBreeze: true,
      mouseRadius: 140,
      mouseForce: 1.8
    },
    petalStyle: {
      colors: ["#ffb7c5", "#ff8da1", "#fca3b7", "#ffe4e9"],
      opacityRange: [0.75, 0.95] as [number, number],
      sizeRange: [12, 22] as [number, number]
    },
    style: {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      pointerEvents: "none",
      zIndex: "999999"
    } as Partial<CSSStyleDeclaration>,
    respectReducedMotion: true,
    maxPixelRatio: 2
  };

  public readonly canvas: HTMLCanvasElement | null = null;
  private readonly ctx: CanvasRenderingContext2D | null = null;
  private readonly root: HTMLElement | null = null;
  private readonly respectReducedMotion: boolean = true;
  private readonly maxPixelRatio: number = 2;

  // State
  private petals: Petal[] = [];
  private _number: number = 45;
  private _wind: Required<WindOptions> = {
    speed: 1.5,
    gust: 1.5,
    enableMouseBreeze: true,
    mouseRadius: 140,
    mouseForce: 1.8
  };
  private _petalStyle: PetalStyle = {};
  private _gravityRange: [number, number] = [1.2, 2.6];
  
  private animationFrameId: number | null = null;
  private isRunning: boolean = false;
  private isDestroyed: boolean = false;

  // Environment & metrics
  private width: number = 0;
  private height: number = 0;
  private pixelRatio: number = 1;
  private resizeObserver: ResizeObserver | null = null;
  private mediaQueryList: MediaQueryList | null = null;

  // Wind calculation state
  private windTime: number = 0;
  private currentWind: number = 1.5;

  // Mouse tracking
  private mouseX: number | null = null;
  private mouseY: number | null = null;
  private boundOnPointerMove: ((e: PointerEvent | MouseEvent) => void) | null = null;
  private boundOnPointerLeave: (() => void) | null = null;
  private boundOnMotionChange: ((e: MediaQueryListEvent) => void) | null = null;

  constructor(options?: CherryBlossomOptions) {
    const opts = { ...CherryBlossom.DEFAULT_OPTIONS, ...options };

    this._number = Math.max(0, Math.min(10000, opts.number ?? 45));
    const defaultWind = CherryBlossom.DEFAULT_OPTIONS.wind;
    this._wind = {
      speed: opts.wind?.speed ?? defaultWind.speed,
      gust: opts.wind?.gust ?? defaultWind.gust,
      enableMouseBreeze: opts.wind?.enableMouseBreeze ?? defaultWind.enableMouseBreeze,
      mouseRadius: opts.wind?.mouseRadius ?? defaultWind.mouseRadius,
      mouseForce: opts.wind?.mouseForce ?? defaultWind.mouseForce
    };
    this._petalStyle = {
      ...CherryBlossom.DEFAULT_OPTIONS.petalStyle,
      ...(opts.petalStyle || {})
    };
    this._gravityRange = opts.gravityRange || [1.2, 2.6];
    this.respectReducedMotion = opts.respectReducedMotion ?? true;
    this.maxPixelRatio = opts.maxPixelRatio ?? 2;

    // Guard for SSR environments where document/window are undefined
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    this.root = opts.root ?? document.body;
    if (!this.root) return;

    // Create and attach canvas element
    this.canvas = document.createElement("canvas");
    this.canvas.setAttribute("aria-hidden", "true");
    this.ctx = this.canvas.getContext("2d");

    // Apply styles
    const styles = { ...CherryBlossom.DEFAULT_OPTIONS.style, ...(opts.style || {}) };
    Object.assign(this.canvas.style, styles);

    this.root.appendChild(this.canvas);

    // Initial resize and high-DPI setup
    this.updateDimensions();

    // Listen to resize
    if (typeof ResizeObserver !== "undefined" && this.root) {
      this.resizeObserver = new ResizeObserver(() => this.updateDimensions());
      this.resizeObserver.observe(this.root === document.body ? document.documentElement : this.root);
    } else {
      window.addEventListener("resize", this.updateDimensions);
    }

    // Mouse breeze listeners
    if (this._wind.enableMouseBreeze) {
      this.attachMouseListeners();
    }

    // Prefers-reduced-motion listener
    if (this.respectReducedMotion && typeof window.matchMedia === "function") {
      this.mediaQueryList = window.matchMedia("(prefers-reduced-motion: reduce)");
      this.boundOnMotionChange = (e: MediaQueryListEvent) => {
        if (e.matches) {
          this.pause();
        } else if (!this.isDestroyed && this.isRunning) {
          this.resume();
        }
      };
      if (this.mediaQueryList.addEventListener) {
        this.mediaQueryList.addEventListener("change", this.boundOnMotionChange);
      }
    }

    // Spawn petals
    this.initPetals();

    // Check reduced motion setting before starting
    const prefersReduced = this.respectReducedMotion && this.mediaQueryList?.matches;
    if (!prefersReduced) {
      this.start();
    } else {
      // Draw static frame once
      this.renderFrame();
    }
  }

  // --- Public Getters and Setters ---

  public get number(): number {
    return this._number;
  }

  public set number(value: number) {
    if (this.isDestroyed) return;
    this._number = Math.max(0, Math.min(10000, Math.floor(value)));
    this.adjustPetalCount();
  }

  public get wind(): Required<WindOptions> {
    return { ...this._wind };
  }

  public set wind(options: Partial<WindOptions>) {
    if (this.isDestroyed) return;
    this._wind = { ...this._wind, ...options };
    if (options.enableMouseBreeze === false) {
      this.removeMouseListeners();
    } else if (options.enableMouseBreeze === true) {
      this.attachMouseListeners();
    }
  }

  public get petalStyle(): PetalStyle {
    return { ...this._petalStyle };
  }

  public set petalStyle(style: PetalStyle) {
    if (this.isDestroyed) return;
    this._petalStyle = { ...this._petalStyle, ...style };
    // Re-apply to all petals
    for (const petal of this.petals) {
      petal.reset(this.width, this.height, false, this._petalStyle);
    }
  }

  // --- Lifecycle Control Methods ---

  /**
   * Starts or resumes the animation loop.
   */
  public start(): void {
    if (this.isDestroyed || this.isRunning) return;
    this.isRunning = true;
    this.resume();
  }

  /**
   * Pauses the animation loop.
   */
  public stop(): void {
    this.isRunning = false;
    this.pause();
  }

  /**
   * Alias for start()
   */
  public resume(): void {
    if (this.animationFrameId === null && !this.isDestroyed) {
      this.animationFrameId = requestAnimationFrame(this.loop);
    }
  }

  /**
   * Alias for stop()
   */
  public pause(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Cleans up canvas, event listeners, observers and removes the element permanently.
   */
  public clear(): void {
    this.isDestroyed = true;
    this.stop();

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    } else if (typeof window !== "undefined") {
      window.removeEventListener("resize", this.updateDimensions);
    }

    if (this.mediaQueryList && this.boundOnMotionChange) {
      if (this.mediaQueryList.removeEventListener) {
        this.mediaQueryList.removeEventListener("change", this.boundOnMotionChange);
      }
    }

    this.removeMouseListeners();

    if (this.canvas && this.canvas.parentElement) {
      this.canvas.parentElement.removeChild(this.canvas);
    }

    this.petals = [];
  }

  // --- Private Implementations ---

  private updateDimensions = (): void => {
    if (!this.canvas || !this.root) return;

    const isBody = this.root === document.body;
    const clientWidth = isBody ? window.innerWidth : this.root.clientWidth;
    const clientHeight = isBody ? window.innerHeight : this.root.clientHeight;

    this.width = clientWidth;
    this.height = clientHeight;

    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    this.pixelRatio = Math.min(dpr, this.maxPixelRatio);

    // Canvas physical buffer resolution
    this.canvas.width = Math.round(this.width * this.pixelRatio);
    this.canvas.height = Math.round(this.height * this.pixelRatio);

    // Scale context to match retina pixels
    if (this.ctx) {
      this.ctx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
    }
  };

  private initPetals(): void {
    this.petals = [];
    for (let i = 0; i < this._number; i++) {
      this.petals.push(new Petal(this.width, this.height, this._petalStyle));
    }
  }

  private adjustPetalCount(): void {
    const current = this.petals.length;
    if (this._number > current) {
      for (let i = current; i < this._number; i++) {
        this.petals.push(new Petal(this.width, this.height, this._petalStyle));
      }
    } else if (this._number < current) {
      this.petals.splice(this._number);
    }
  }

  private attachMouseListeners(): void {
    if (typeof window === "undefined" || this.boundOnPointerMove) return;

    this.boundOnPointerMove = (e: MouseEvent | PointerEvent) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    };

    this.boundOnPointerLeave = () => {
      this.mouseX = null;
      this.mouseY = null;
    };

    window.addEventListener("pointermove", this.boundOnPointerMove, { passive: true });
    window.addEventListener("pointerleave", this.boundOnPointerLeave, { passive: true });
  }

  private removeMouseListeners(): void {
    if (typeof window === "undefined") return;

    if (this.boundOnPointerMove) {
      window.removeEventListener("pointermove", this.boundOnPointerMove);
      this.boundOnPointerMove = null;
    }
    if (this.boundOnPointerLeave) {
      window.removeEventListener("pointerleave", this.boundOnPointerLeave);
      this.boundOnPointerLeave = null;
    }
    this.mouseX = null;
    this.mouseY = null;
  }

  private renderFrame(): void {
    if (!this.ctx || !this.canvas) return;

    this.ctx.clearRect(0, 0, this.width, this.height);

    for (const petal of this.petals) {
      petal.draw(this.ctx);
    }
  }

  private loop = (): void => {
    if (!this.isRunning || this.isDestroyed) return;

    // Organic wind oscillation over time
    this.windTime += 0.015;
    const gust = Math.sin(this.windTime) * this._wind.gust + Math.cos(this.windTime * 0.4) * 0.5;
    this.currentWind = this._wind.speed + gust;

    // Update each petal
    for (let i = 0; i < this.petals.length; i++) {
      this.petals[i].update(
        this.width,
        this.height,
        this.currentWind,
        this.mouseX,
        this.mouseY,
        this._wind.mouseRadius,
        this._wind.mouseForce
      );
    }

    this.renderFrame();

    this.animationFrameId = requestAnimationFrame(this.loop);
  };
}
