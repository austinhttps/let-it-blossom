import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CherryBlossom } from "../src/cherryblossom";

describe("CherryBlossom Lifecycle & Engine", () => {
  beforeEach(() => {
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      return setTimeout(() => cb(Date.now()), 16) as unknown as number;
    });
    vi.stubGlobal("cancelAnimationFrame", (id: number) => {
      clearTimeout(id);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("handles SSR safely when window is undefined", () => {
    const originalWindow = globalThis.window;
    // @ts-expect-error test SSR
    delete globalThis.window;

    expect(() => {
      const instance = new CherryBlossom();
      expect(instance.canvas).toBeNull();
    }).not.toThrow();

    globalThis.window = originalWindow;
  });

  it("instantiates properly with default options in DOM environment", () => {
    const mockCtx = {
      clearRect: vi.fn(),
      setTransform: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      scale: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      bezierCurveTo: vi.fn(),
      quadraticCurveTo: vi.fn(),
      closePath: vi.fn(),
      fill: vi.fn(),
      createLinearGradient: vi.fn().mockReturnValue({ addColorStop: vi.fn() })
    };

    const mockCanvas = {
      setAttribute: vi.fn(),
      style: {},
      getContext: vi.fn().mockReturnValue(mockCtx),
      width: 0,
      height: 0,
      parentElement: {
        removeChild: vi.fn()
      }
    };

    vi.stubGlobal("document", {
      body: {
        appendChild: vi.fn(),
        clientWidth: 1024,
        clientHeight: 768
      },
      createElement: vi.fn().mockReturnValue(mockCanvas)
    });

    vi.stubGlobal("window", {
      innerWidth: 1024,
      innerHeight: 768,
      devicePixelRatio: 2,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      matchMedia: vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      })
    });

    const cb = new CherryBlossom({ number: 30 });
    expect(cb.number).toBe(30);

    // Dynamic setter
    cb.number = 50;
    expect(cb.number).toBe(50);

    // Stop and Start
    cb.stop();
    cb.start();

    // Clear
    cb.clear();
  });
});
