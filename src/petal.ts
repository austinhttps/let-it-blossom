import { randomRange } from "./math";
import type { PetalStyle } from "./types";

/**
 * Represents a single cherry blossom petal with 3D orientation (yaw, pitch, roll),
 * physics velocities, realistic bezier geometry, and wind responsiveness.
 */
export class Petal {
  // Coordinates
  x = 0;
  y = 0;
  z = 0; // Simulated depth for scale & parallax

  // Dimensions
  size = 15;
  aspectRatio = 1.25; // Length to width ratio

  // Velocities
  vx = 0;
  vy = 0;
  vz = 0;

  // 3D rotation angles & angular velocities
  pitch = 0; // Tumbling end-over-end
  yaw = 0;   // Spinning around horizontal axis
  roll = 0;  // Twisting clockwise/counterclockwise
  dPitch = 0;
  dYaw = 0;
  dRoll = 0;

  // Flutter & sway oscillation parameters
  oscillationPhase = 0;
  oscillationSpeed = 0;
  swayAmplitude = 0;

  // Color & appearance
  color1 = "#ffb7c5";
  color2 = "#ff94aa";
  opacity = 0.85;

  // Mouse wind displacement
  mouseVx = 0;
  mouseVy = 0;

  constructor(width: number, height: number, style?: PetalStyle) {
    this.reset(width, height, true, style);
  }

  /**
   * Re-initializes petal position, velocities, and 3D rotations.
   * If initial is true, petals are scattered vertically across the whole screen.
   */
  reset(width: number, height: number, initial = false, style?: PetalStyle): void {
    const sizeRange = style?.sizeRange ?? [12, 22];
    const opacityRange = style?.opacityRange ?? [0.75, 0.95];
    const colors = style?.colors ?? ["#ffb7c5", "#ff8da1", "#fca3b7", "#ffe4e9"];

    this.size = randomRange(sizeRange[0], sizeRange[1]);
    this.aspectRatio = randomRange(1.15, 1.35);
    this.opacity = randomRange(opacityRange[0], opacityRange[1]);

    // Pick random gradient colors for realistic petal shading
    this.color1 = colors[Math.floor(Math.random() * colors.length)];
    this.color2 = colors[Math.floor(Math.random() * colors.length)];

    // Position
    this.x = randomRange(-50, width + 50);
    this.y = initial ? randomRange(-height, height) : randomRange(-60, -20);
    this.z = randomRange(0.7, 1.25); // Parallax depth

    // Falling velocity (scaled slightly by depth)
    this.vy = randomRange(1.2, 2.6) * this.z;
    this.vx = randomRange(-0.5, 0.8);

    // 3D angles (in radians)
    this.pitch = randomRange(0, Math.PI * 2);
    this.yaw = randomRange(0, Math.PI * 2);
    this.roll = randomRange(0, Math.PI * 2);

    // Rotational velocities (flutter speed)
    this.dPitch = randomRange(0.015, 0.045);
    this.dYaw = randomRange(0.02, 0.06);
    this.dRoll = randomRange(0.01, 0.03);

    // Sway oscillation
    this.oscillationPhase = randomRange(0, Math.PI * 2);
    this.oscillationSpeed = randomRange(0.02, 0.05);
    this.swayAmplitude = randomRange(0.8, 2.2);

    // Reset mouse influence
    this.mouseVx = 0;
    this.mouseVy = 0;
  }

  /**
   * Update particle physics step
   */
  update(
    width: number,
    height: number,
    ambientWind: number,
    mouseX: number | null,
    mouseY: number | null,
    mouseRadius = 140,
    mouseForce = 1.8
  ): void {
    // 3D rotation update
    this.pitch += this.dPitch;
    this.yaw += this.dYaw;
    this.roll += this.dRoll;

    // Organic swaying wave
    this.oscillationPhase += this.oscillationSpeed;
    const sway = Math.sin(this.oscillationPhase) * this.swayAmplitude;

    // Mouse breeze interaction
    if (mouseX !== null && mouseY !== null) {
      const dx = this.x - mouseX;
      const dy = this.y - mouseY;
      const distSq = dx * dx + dy * dy;
      const radSq = mouseRadius * mouseRadius;

      if (distSq < radSq && distSq > 0) {
        const dist = Math.sqrt(distSq);
        const factor = (1 - dist / mouseRadius) * mouseForce;
        // Direction away from mouse with a slight upward and swirling drift
        this.mouseVx += (dx / dist) * factor * 2.5;
        this.mouseVy += ((dy / dist) * factor - 0.5) * 1.5;
      }
    }

    // Dampen mouse breeze impulse
    this.mouseVx *= 0.92;
    this.mouseVy *= 0.92;

    // Update positions
    this.x += (this.vx + ambientWind + sway + this.mouseVx) * this.z;
    this.y += (this.vy + this.mouseVy) * this.z;

    // Reset when moving off-screen
    if (this.y > height + 40 || this.x > width + 80 || this.x < -80) {
      // Loop from top or left depending on wind
      if (ambientWind > 0 && Math.random() < 0.3) {
        // Wrap around from left
        this.x = -30;
        this.y = randomRange(-20, height * 0.7);
      } else {
        this.y = -30;
        this.x = randomRange(-40, width + 40);
      }
      this.mouseVx = 0;
      this.mouseVy = 0;
    }
  }

  /**
   * Draw the petal using Canvas2D bezier curves, transformed into 3D view
   */
  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // Move to petal center
    ctx.translate(this.x, this.y);

    // Apply 3D rotation using 2D projection matrix
    // Roll rotates in 2D plane; Pitch and Yaw squish width/height to simulate 3D rotation
    ctx.rotate(this.roll);
    const scaleX = Math.cos(this.yaw) * this.z;
    const scaleY = Math.cos(this.pitch) * this.z;
    ctx.scale(scaleX, scaleY);

    ctx.globalAlpha = Math.max(0, Math.min(1, this.opacity));

    // Draw realistic sakura petal shape with notch at tip
    // The petal is drawn centered around (0, 0), with base at (0, length/2) and notched tip at (0, -length/2)
    const w = (this.size / this.aspectRatio) * 0.5;
    const h = this.size * 0.5;

    // Gradient shading across the petal
    const grad = ctx.createLinearGradient(0, h, 0, -h);
    grad.addColorStop(0, this.color1);
    grad.addColorStop(1, this.color2);
    ctx.fillStyle = grad;

    ctx.beginPath();
    // Start at bottom base of petal
    ctx.moveTo(0, h);

    // Left curved side up to the left lobe of notch
    ctx.bezierCurveTo(-w * 1.3, h * 0.4, -w * 1.2, -h * 0.6, -w * 0.35, -h);

    // The iconic sakura notch at petal tip
    ctx.quadraticCurveTo(0, -h * 0.75, w * 0.35, -h);

    // Right curved side down back to base
    ctx.bezierCurveTo(w * 1.2, -h * 0.6, w * 1.3, h * 0.4, 0, h);

    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}
