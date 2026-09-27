import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { pipelines } from '../../data/profile';

/** Tabbed, animated data-flow diagrams of systems from the experience section. */
@Component({
  selector: 'app-pipeline-diagram',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tabs" role="tablist" aria-label="Pipelines">
      @for (p of pipelines; track p.id; let i = $index) {
        <button
          type="button"
          role="tab"
          class="tab"
          [class.active]="i === active()"
          [attr.aria-selected]="i === active()"
          [style.--accent]="'var(--' + p.accent + ')'"
          (click)="selectPipeline(i)"
        >
          <strong>{{ p.label }}</strong>
          <span>{{ p.company }}</span>
        </button>
      }
    </div>

    <div class="card diagram" role="tabpanel" [style.--accent]="'var(--' + pipeline().accent + ')'">
      <p class="summary">{{ pipeline().summary }}</p>

      <ol class="flow" aria-label="Data flow, in order">
        @for (step of pipeline().steps; track step.name; let i = $index; let last = $last) {
          <li class="stage">
            <button
              type="button"
              class="node"
              [class.active]="i === selectedStep()"
              [attr.aria-pressed]="i === selectedStep()"
              (click)="selectedStep.set(i)"
              (mouseenter)="selectedStep.set(i)"
            >
              <span class="index">{{ i + 1 }}</span>
              <strong>{{ step.name }}</strong>
              <span class="role">{{ step.role }}</span>
            </button>
            @if (!last) {
              <span class="link" aria-hidden="true" [style.--delay]="i * 0.45 + 's'">
                <span class="packet"></span>
                <span class="packet late"></span>
              </span>
            }
          </li>
        }
      </ol>

      <p class="detail" aria-live="polite">
        <span class="detail-name">{{ current().name }}</span> {{ current().detail }}
      </p>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 18px;
    }

    .tab {
      display: grid;
      gap: 2px;
      text-align: left;
      padding: 12px 18px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--text-muted);
      font: inherit;
      cursor: pointer;
      transition:
        border-color 0.25s,
        background 0.25s,
        color 0.25s;

      strong {
        color: var(--text);
        font-family: var(--font-display);
      }
      span {
        font: 500 0.78rem var(--font-mono);
      }

      &:hover {
        border-color: var(--border-strong);
      }
      &.active {
        border-color: color-mix(in srgb, var(--accent) 60%, transparent);
        background: color-mix(in srgb, var(--accent) 10%, transparent);
        span {
          color: var(--accent);
        }
      }
    }

    .diagram {
      padding: 32px;
    }

    .summary {
      margin: 0 0 28px;
      color: var(--text-muted);
    }

    .flow {
      display: flex;
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .stage {
      display: flex;
      align-items: center;
      flex: 1 1 0;
      min-width: 0;

      &:last-child {
        flex: 0 1 auto;
      }
    }

    .node {
      position: relative;
      display: grid;
      justify-items: center;
      gap: 4px;
      width: 150px;
      flex-shrink: 0;
      padding: 18px 12px 16px;
      border-radius: 14px;
      border: 1px solid var(--border-strong);
      background: var(--bg-raised);
      color: var(--text);
      font: inherit;
      text-align: center;
      cursor: pointer;
      transition:
        border-color 0.25s,
        box-shadow 0.25s,
        translate 0.25s var(--ease);

      strong {
        font-family: var(--font-display);
        font-size: 1rem;
      }

      &:hover,
      &.active {
        translate: 0 -3px;
        border-color: var(--accent);
        box-shadow: 0 0 28px -8px var(--accent);
      }
    }

    .index {
      display: grid;
      place-items: center;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      font: 600 0.75rem var(--font-mono);
      color: var(--accent);
      background: color-mix(in srgb, var(--accent) 14%, transparent);
    }

    .role {
      font: 500 0.75rem var(--font-mono);
      color: var(--text-muted);
    }

    .link {
      position: relative;
      flex: 1;
      height: 2px;
      margin: 0 6px;
      min-width: 24px;
      background: linear-gradient(
        90deg,
        color-mix(in srgb, var(--accent) 20%, transparent),
        color-mix(in srgb, var(--accent) 60%, transparent)
      );
    }

    .packet {
      position: absolute;
      top: -3px;
      left: 0;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--accent);
      box-shadow: 0 0 12px var(--accent);
      opacity: 0;
      animation: flow-x 1.8s linear infinite;
      animation-delay: var(--delay);

      &.late {
        animation-delay: calc(var(--delay) + 0.9s);
      }
    }

    @keyframes flow-x {
      0% {
        left: 0;
        opacity: 0;
      }
      15%,
      85% {
        opacity: 1;
      }
      100% {
        left: calc(100% - 8px);
        opacity: 0;
      }
    }

    .detail {
      margin: 28px 0 0;
      padding: 16px 18px;
      border-radius: var(--radius-sm);
      border-left: 3px solid var(--accent);
      background: var(--surface);
      color: var(--text-muted);
      min-height: 3.4em;
    }

    .detail-name {
      color: var(--text);
      font-weight: 600;
      margin-right: 4px;
    }

    @media (max-width: 760px) {
      .diagram {
        padding: 24px 20px;
      }

      .flow {
        flex-direction: column;
        align-items: center;
      }

      .stage {
        flex-direction: column;
        flex: none;
      }

      .node {
        width: min(260px, 100%);
      }

      .link {
        width: 2px;
        height: 36px;
        min-width: 0;
        margin: 6px 0;
      }

      .packet {
        top: 0;
        left: -3px;
        animation-name: flow-y;
      }

      @keyframes flow-y {
        0% {
          top: 0;
          opacity: 0;
        }
        15%,
        85% {
          opacity: 1;
        }
        100% {
          top: calc(100% - 8px);
          opacity: 0;
        }
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .packet {
        display: none;
      }
    }
  `,
})
export class PipelineDiagram {
  protected readonly pipelines = pipelines;
  protected readonly active = signal(0);
  protected readonly selectedStep = signal(0);
  protected readonly pipeline = computed(() => pipelines[this.active()]);
  protected readonly current = computed(() => this.pipeline().steps[this.selectedStep()]);

  protected selectPipeline(i: number): void {
    this.active.set(i);
    this.selectedStep.set(0);
  }
}
