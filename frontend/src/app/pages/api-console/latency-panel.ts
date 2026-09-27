import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { Icon } from '../../shared/icon';

export interface CallRecord {
  n: number;
  method: string;
  path: string;
  status: number;
  ms: number;
  ok: boolean;
}

const MAX_BARS = 30;
const MIN_SLOTS = 10;
const W = 600;
const H = 160;
const GAP = 2;

function percentile(sorted: number[], p: number): number {
  const i = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[Math.max(i, 0)];
}

/** Rounds up to 1, 2 or 5 × 10^n so the top gridline lands on a readable number. */
function niceMax(value: number): number {
  const pow = 10 ** Math.floor(Math.log10(Math.max(value, 1)));
  return [1, 2, 5, 10].map((m) => m * pow).find((v) => v >= value) ?? value;
}

/** Bar with a 4px rounded top, anchored square to the baseline. */
function barPath(x: number, w: number, h: number): string {
  const r = Math.min(4, w / 2, h);
  const y = H - h;
  return `M${x},${H}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${H}Z`;
}

/** Round-trip latency of every call made from this browser, drawn as a bar per call. */
@Component({
  selector: 'app-latency-panel',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="head">
      <div>
        <h2>Latency, this session</h2>
        <p class="sub">Round trip from your browser through CloudFront, API Gateway and Lambda.</p>
      </div>
      <button class="btn btn-ghost btn-sm" type="button" (click)="burst.emit()" [disabled]="running()">
        @if (running()) {
          <span class="spinner"></span> Pinging
        } @else {
          <app-icon name="bolt" /> Run 10 pings
        }
      </button>
    </div>

    <dl class="tiles">
      <div><dt>Calls</dt><dd>{{ calls().length }}</dd></div>
      <div><dt>Median</dt><dd>{{ stats().median }}</dd></div>
      <div><dt>p95</dt><dd>{{ stats().p95 }}</dd></div>
      <div><dt>Fastest</dt><dd>{{ stats().fastest }}</dd></div>
    </dl>

    @if (calls().length) {
      <div class="chart" (mouseleave)="hovered.set(null)">
        <span class="y-label top">{{ yMax() }} ms</span>
        <span class="y-label mid">{{ yMax() / 2 }} ms</span>
        <div class="plot">
        <svg [attr.viewBox]="'0 0 ' + W + ' ' + H" preserveAspectRatio="none" aria-hidden="true">
          <line class="grid" x1="0" [attr.x2]="W" y1="0.5" y2="0.5" />
          <line class="grid" x1="0" [attr.x2]="W" [attr.y1]="H / 2" [attr.y2]="H / 2" />
          @for (bar of bars(); track bar.call.n) {
            <path
              class="bar"
              [class.error]="!bar.call.ok"
              [class.faded]="hovered() !== null && hovered() !== bar.call.n"
              [attr.d]="bar.d"
            />
            <rect
              class="hit"
              [attr.x]="bar.slotX"
              y="0"
              [attr.width]="slotW()"
              [attr.height]="H"
              (mouseenter)="hovered.set(bar.call.n)"
            />
          }
          <line class="baseline" x1="0" [attr.x2]="W" [attr.y1]="H - 0.5" [attr.y2]="H - 0.5" />
        </svg>
        @if (hoveredBar(); as b) {
          <div
            class="tooltip"
            [class.flip]="b.centerPct > 60"
            [style.left.%]="b.centerPct > 60 ? null : b.rightPct"
            [style.right.%]="b.centerPct > 60 ? 100 - b.leftPct : null"
          >
            <strong>{{ b.call.ms }} ms</strong>
            <span>#{{ b.call.n }} · {{ b.call.method }} {{ b.call.path }}</span>
            <span [class.err-text]="!b.call.ok">{{ b.call.ok ? '' : '⚠ ' }}HTTP {{ b.call.status || 'ERR' }}</span>
          </div>
        }
        </div>
      </div>
      <div class="legend-row">
        <span>Oldest</span>
        @if (hasErrors()) {
          <span class="key"><span class="swatch error"></span>⚠ Failed call</span>
        }
        <span>Latest</span>
      </div>

      <details class="table-view">
        <summary>Show as a table</summary>
        <table>
          <thead>
            <tr><th>#</th><th>Request</th><th>Status</th><th>Latency</th></tr>
          </thead>
          <tbody>
            @for (c of calls(); track c.n) {
              <tr>
                <td>{{ c.n }}</td>
                <td>{{ c.method }} {{ c.path }}</td>
                <td>{{ c.status || 'ERR' }}</td>
                <td>{{ c.ms }} ms</td>
              </tr>
            }
          </tbody>
        </table>
      </details>
    } @else {
      <p class="empty">Send a request or run 10 pings to chart real latencies.</p>
    }

    <p class="note">
      The first call after a quiet spell is usually the slowest: that's a Lambda cold start.
    </p>
  `,
  styles: `
    :host {
      display: block;
    }

    h2 {
      font: 500 0.8rem var(--font-mono);
      text-transform: uppercase;
      letter-spacing: 0.14em;
      color: var(--text-muted);
      margin: 0;
    }

    .head {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px 20px;
    }

    .sub,
    .note,
    .empty {
      margin: 6px 0 0;
      font-size: 0.85rem;
      color: var(--text-dim);
    }

    .empty {
      padding: 36px 0;
      text-align: center;
      color: var(--text-muted);
    }

    .tiles {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin: 20px 0 24px;

      div {
        padding: 12px 14px;
        border-radius: var(--radius-sm);
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid var(--border);
      }
      dt {
        font: 500 0.72rem var(--font-mono);
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--text-dim);
      }
      dd {
        margin: 4px 0 0;
        font: 600 1.35rem var(--font-display);
        color: var(--text);
      }
    }

    .chart {
      position: relative;
      padding-left: 64px;

      .plot {
        position: relative;
      }

      svg {
        display: block;
        width: 100%;
        height: 160px;
        overflow: visible;
      }
    }

    .y-label {
      position: absolute;
      left: 0;
      font: 500 0.72rem var(--font-mono);
      color: var(--text-dim);
      translate: 0 -50%;

      &.top {
        top: 0;
      }
      &.mid {
        top: 50%;
      }
    }

    .grid {
      stroke: var(--border);
      stroke-dasharray: 3 4;
      vector-effect: non-scaling-stroke;
    }

    .baseline {
      stroke: var(--border-strong);
      vector-effect: non-scaling-stroke;
    }

    .bar {
      fill: var(--cyan);
      transition: opacity 0.15s;

      &.error {
        fill: var(--red);
      }
      &.faded {
        opacity: 0.35;
      }
    }

    .hit {
      fill: transparent;
      cursor: crosshair;
    }

    /* Sits beside the hovered bar (flipping left near the right edge) so it never covers the tiles. */
    .tooltip {
      position: absolute;
      top: 50%;
      translate: 6px -50%;

      &.flip {
        translate: -6px -50%;
      }

      display: grid;
      gap: 2px;
      padding: 8px 12px;
      border-radius: 8px;
      background: var(--bg-raised);
      border: 1px solid var(--border-strong);
      box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.8);
      white-space: nowrap;
      pointer-events: none;
      font-size: 0.8rem;
      color: var(--text-muted);

      strong {
        color: var(--text);
        font-size: 0.95rem;
      }
    }

    .err-text {
      color: var(--text);
    }

    .legend-row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding-left: 64px;
      margin-top: 8px;
      font: 500 0.72rem var(--font-mono);
      color: var(--text-dim);
    }

    .key {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: var(--text-muted);
    }

    .swatch {
      width: 10px;
      height: 10px;
      border-radius: 2px;
      &.error {
        background: var(--red);
      }
    }

    .table-view {
      margin-top: 16px;
      font-size: 0.85rem;

      summary {
        cursor: pointer;
        color: var(--text-muted);
      }
      table {
        width: 100%;
        margin-top: 10px;
        border-collapse: collapse;
        font-family: var(--font-mono);
      }
      th,
      td {
        padding: 6px 8px;
        text-align: left;
        border-bottom: 1px solid var(--border);
      }
      th {
        color: var(--text-dim);
        font-weight: 500;
      }
      td:last-child,
      th:last-child {
        text-align: right;
      }
    }

    .note {
      margin-top: 16px;
    }

    @media (max-width: 640px) {
      .tiles {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `,
})
export class LatencyPanel {
  readonly calls = input.required<CallRecord[]>();
  readonly running = input(false);
  readonly burst = output<void>();

  protected readonly W = W;
  protected readonly H = H;
  protected readonly hovered = signal<number | null>(null);

  private readonly recent = computed(() => this.calls().slice(-MAX_BARS));
  protected readonly hasErrors = computed(() => this.recent().some((c) => !c.ok));
  protected readonly yMax = computed(() => niceMax(Math.max(...this.recent().map((c) => c.ms), 1)));
  protected readonly slotW = computed(() => W / Math.max(this.recent().length, MIN_SLOTS));

  protected readonly bars = computed(() => {
    const slot = this.slotW();
    const max = this.yMax();
    return this.recent().map((call, i) => {
      const w = Math.max(slot - GAP, 1);
      const h = Math.max((call.ms / max) * H, 2);
      return {
        call,
        slotX: i * slot,
        leftPct: ((i * slot) / W) * 100,
        centerPct: ((i * slot + slot / 2) / W) * 100,
        rightPct: (((i + 1) * slot) / W) * 100,
        d: barPath(i * slot + GAP / 2, w, h),
      };
    });
  });

  protected readonly hoveredBar = computed(() => this.bars().find((b) => b.call.n === this.hovered()));

  protected readonly stats = computed(() => {
    const ms = this.calls()
      .filter((c) => c.ok)
      .map((c) => c.ms)
      .sort((a, b) => a - b);
    if (!ms.length) return { median: '—', p95: '—', fastest: '—' };
    return {
      median: `${percentile(ms, 50)} ms`,
      p95: ms.length >= 5 ? `${percentile(ms, 95)} ms` : '—',
      fastest: `${ms[0]} ms`,
    };
  });
}
