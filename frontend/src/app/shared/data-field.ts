import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  viewChild,
} from '@angular/core';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  hue: number;
}

const LINK_DISTANCE = 140;
const MOUSE_RADIUS = 180;

/**
 * Full-screen animated "data network": drifting nodes that link up when close
 * and lean toward the cursor. Draws one static frame when reduced motion is on.
 */
@Component({
  selector: 'app-data-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <canvas #canvas aria-hidden="true"></canvas>
    <div class="orb orb-a"></div>
    <div class="orb orb-b"></div>
    <div class="grid"></div>
  `,
  styleUrl: './data-field.scss',
})
export class DataField implements AfterViewInit, OnDestroy {
  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private ctx!: CanvasRenderingContext2D;
  private nodes: Node[] = [];
  private frame = 0;
  private width = 0;
  private height = 0;
  private mouse = { x: -9999, y: -9999 };
  private readonly reducedMotion =
    typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  private readonly onResize = () => this.resize();
  private readonly onMove = (e: PointerEvent) => (this.mouse = { x: e.clientX, y: e.clientY });
  private readonly onLeave = () => (this.mouse = { x: -9999, y: -9999 });

  ngAfterViewInit(): void {
    const ctx = this.canvasRef().nativeElement.getContext('2d');
    if (!ctx) return;
    this.ctx = ctx;
    this.resize();
    window.addEventListener('resize', this.onResize);
    window.addEventListener('pointermove', this.onMove, { passive: true });
    document.addEventListener('pointerleave', this.onLeave);

    if (this.reducedMotion) this.draw();
    else this.loop();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.frame);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('pointermove', this.onMove);
    document.removeEventListener('pointerleave', this.onLeave);
  }

  private resize(): void {
    const canvas = this.canvasRef().nativeElement;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    canvas.width = this.width * dpr;
    canvas.height = this.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Density scales with viewport area, capped so phones stay smooth.
    const count = Math.min(90, Math.round((this.width * this.height) / 16000));
    this.nodes = Array.from({ length: count }, () => ({
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.6 + 0.6,
      hue: Math.random() < 0.5 ? 188 : 262,
    }));
    if (this.reducedMotion) this.draw();
  }

  private loop = (): void => {
    this.step();
    this.draw();
    this.frame = requestAnimationFrame(this.loop);
  };

  private step(): void {
    for (const n of this.nodes) {
      const dx = this.mouse.x - n.x;
      const dy = this.mouse.y - n.y;
      const dist = Math.hypot(dx, dy);
      if (dist < MOUSE_RADIUS && dist > 0) {
        n.vx += (dx / dist) * 0.012;
        n.vy += (dy / dist) * 0.012;
      }
      n.vx *= 0.995;
      n.vy *= 0.995;
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > this.width) n.vx *= -1;
      if (n.y < 0 || n.y > this.height) n.vy *= -1;
    }
  }

  private draw(): void {
    const { ctx, nodes } = this;
    ctx.clearRect(0, 0, this.width, this.height);

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < LINK_DISTANCE) {
          ctx.strokeStyle = `hsla(${(a.hue + b.hue) / 2}, 90%, 65%, ${(1 - d / LINK_DISTANCE) * 0.18})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    for (const n of nodes) {
      ctx.fillStyle = `hsla(${n.hue}, 90%, 70%, 0.7)`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
