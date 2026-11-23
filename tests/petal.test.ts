import { describe, it, expect, vi } from "vitest";
import { Petal } from "../src/petal";
import { randomRange, clamp } from "../src/math";

describe("Math utilities", () => {
  it("generates numbers within the expected range", () => {
    for (let i = 0; i < 50; i++) {
      const val = randomRange(10, 20);
      expect(val).toBeGreaterThanOrEqual(10);
      expect(val).toBeLessThan(20);
    }
  });

  it("clamps values correctly", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
  });
});

describe("Petal particle physics", () => {
  it("initializes properties properly", () => {
    const petal = new Petal(800, 600);
    expect(petal.size).toBeGreaterThan(0);
    expect(petal.opacity).toBeGreaterThan(0);
    expect(petal.color1).toBeDefined();
    expect(petal.color2).toBeDefined();
  });

  it("updates position over time and respects wind", () => {
    const petal = new Petal(800, 600);
    const initialX = petal.x;
    const initialY = petal.y;
    petal.update(800, 600, 2.0, null, null);
    // Y should increase downwards, X should shift with wind
    expect(petal.y).not.toBe(initialY);
    expect(petal.x).not.toBe(initialX);
  });

  it("reacts to mouse interaction when nearby", () => {
    const petal = new Petal(800, 600);
    petal.x = 200;
    petal.y = 200;
    // Mouse directly to the left at (180, 200)
    petal.update(800, 600, 0, 180, 200, 100, 2);
    // Petal should be repelled to the right (positive mouseVx)
    expect(petal.mouseVx).toBeGreaterThan(0);
  });

  it("draws using 2D canvas context without error", () => {
    const petal = new Petal(800, 600);
    const mockCtx = {
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
      createLinearGradient: vi.fn().mockReturnValue({
        addColorStop: vi.fn()
      }),
      globalAlpha: 1,
      fillStyle: ""
    } as unknown as CanvasRenderingContext2D;

    petal.draw(mockCtx);
    expect(mockCtx.save).toHaveBeenCalled();
    expect(mockCtx.beginPath).toHaveBeenCalled();
    expect(mockCtx.bezierCurveTo).toHaveBeenCalled();
    expect(mockCtx.fill).toHaveBeenCalled();
    expect(mockCtx.restore).toHaveBeenCalled();
  });
});
