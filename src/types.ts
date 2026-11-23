export interface PetalStyle {
  /**
   * Primary fill color or gradient stop colors for petal.
   * Can be hex, rgba, or array of strings for gradient.
   * Defaults to gentle pastel sakura pinks: ['#ffb7c5', '#ff94aa']
   */
  colors?: string[];
  /**
   * Opacity of petal, default [0.7, 0.95]
   */
  opacityRange?: [number, number];
  /**
   * Base petal size in pixels (length), default [12, 22]
   */
  sizeRange?: [number, number];
}

export interface WindOptions {
  /**
   * Base horizontal wind speed, defaults to 1.5
   */
  speed?: number;
  /**
   * Max random gust variation added to wind, defaults to 2.0
   */
  gust?: number;
  /**
   * Whether mouse cursor repels/swirls petals, defaults to true
   */
  enableMouseBreeze?: boolean;
  /**
   * Radius of mouse breeze influence in pixels, defaults to 140
   */
  mouseRadius?: number;
  /**
   * Force multiplier for mouse breeze, defaults to 1.8
   */
  mouseForce?: number;
}

export interface CherryBlossomOptions {
  /**
   * Container element to mount canvas into, defaults to document.body
   */
  root?: HTMLElement | null;
  /**
   * Total number of petals, defaults to 40 (or window.innerWidth / 30)
   */
  number?: number;
  /**
   * Gravity downward acceleration / speed range [min, max], defaults to [1.2, 2.8]
   */
  gravityRange?: [number, number];
  /**
   * Wind and gust configuration
   */
  wind?: WindOptions;
  /**
   * Petal appearance options
   */
  petalStyle?: PetalStyle;
  /**
   * Canvas CSS styles override, defaults to { zIndex: '999999', pointerEvents: 'none', position: 'fixed' }
   */
  style?: Partial<CSSStyleDeclaration>;
  /**
   * Respect system prefers-reduced-motion media query, defaults to true
   */
  respectReducedMotion?: boolean;
  /**
   * Maximum devicePixelRatio to use for Retina rendering (defaults to 2)
   */
  maxPixelRatio?: number;
}
