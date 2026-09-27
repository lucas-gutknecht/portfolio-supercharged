import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { profile } from '../data/profile';
import { Icon, IconName } from './icon';
import { UiService } from './ui.service';

interface Command {
  label: string;
  group: 'Go to' | 'Pages' | 'Actions';
  icon: IconName;
  keywords?: string;
  run: () => void;
}

/** Ctrl/⌘ + K launcher for jumping around the site and quick actions. */
@Component({
  selector: 'app-command-palette',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (ui.paletteOpen()) {
      <div class="backdrop" (click)="close()"></div>
      <div class="palette" role="dialog" aria-modal="true" aria-label="Command palette">
        <div class="search">
          <app-icon name="search" />
          <input
            #input
            type="text"
            placeholder="Type a command or search…"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            [attr.aria-activedescendant]="filtered().length ? 'cmd-' + active() : null"
            autocomplete="off"
            spellcheck="false"
            [value]="query()"
            (input)="onInput($event)"
            (keydown)="onKey($event)"
          />
          <kbd>Esc</kbd>
        </div>
        <ul id="palette-list" role="listbox">
          @for (cmd of filtered(); track cmd.label; let i = $index) {
            @if (i === 0 || filtered()[i - 1].group !== cmd.group) {
              <li class="group" role="presentation">{{ cmd.group }}</li>
            }
            <li
              [id]="'cmd-' + i"
              role="option"
              class="item"
              [class.active]="i === active()"
              [attr.aria-selected]="i === active()"
              (mousemove)="active.set(i)"
              (click)="execute(cmd)"
            >
              <app-icon [name]="cmd.icon" />
              <span>{{ cmd.label }}</span>
            </li>
          } @empty {
            <li class="none">No matches for “{{ query() }}”</li>
          }
        </ul>
        <footer>
          <span><kbd>↑</kbd><kbd>↓</kbd> move</span>
          <span><kbd>Enter</kbd> run</span>
          <span><kbd>Ctrl</kbd><kbd>K</kbd> toggle</span>
        </footer>
      </div>
    }
  `,
  styles: `
    .backdrop {
      position: fixed;
      inset: 0;
      z-index: 200;
      background: rgba(3, 5, 10, 0.6);
      backdrop-filter: blur(4px);
      animation: fade 0.15s ease-out;
    }

    .palette {
      position: fixed;
      z-index: 201;
      top: 14vh;
      left: 50%;
      translate: -50% 0;
      width: min(600px, calc(100vw - 32px));
      border-radius: var(--radius);
      border: 1px solid var(--border-strong);
      background: var(--bg-raised);
      box-shadow:
        0 30px 80px -20px rgba(0, 0, 0, 0.9),
        0 0 40px -10px rgba(139, 92, 246, 0.35);
      overflow: hidden;
      animation: pop 0.18s var(--ease);
    }

    .search {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 18px;
      border-bottom: 1px solid var(--border);
      color: var(--text-muted);

      input {
        flex: 1;
        min-width: 0;
        border: 0;
        outline: 0;
        background: none;
        color: var(--text);
        font: 1rem var(--font-body);
      }
    }

    ul {
      list-style: none;
      margin: 0;
      padding: 8px;
      max-height: min(420px, 55vh);
      overflow-y: auto;
    }

    .group {
      padding: 10px 12px 6px;
      font: 500 0.7rem var(--font-mono);
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--text-dim);
    }

    .item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: 10px;
      color: var(--text-muted);
      cursor: pointer;

      &.active {
        color: var(--text);
        background: var(--gradient-soft);

        app-icon {
          color: var(--cyan);
        }
      }
    }

    .none {
      padding: 24px 12px;
      text-align: center;
      color: var(--text-dim);
    }

    footer {
      display: flex;
      gap: 18px;
      padding: 10px 18px;
      border-top: 1px solid var(--border);
      font-size: 0.75rem;
      color: var(--text-dim);
    }

    kbd {
      display: inline-block;
      min-width: 20px;
      margin-right: 3px;
      padding: 1px 6px;
      border-radius: 5px;
      border: 1px solid var(--border-strong);
      font: 500 0.7rem var(--font-mono);
      color: var(--text-muted);
      text-align: center;
    }

    @keyframes fade {
      from {
        opacity: 0;
      }
    }
    @keyframes pop {
      from {
        opacity: 0;
        scale: 0.97;
      }
    }

    @media (max-width: 640px) {
      footer {
        display: none;
      }
    }
  `,
})
export class CommandPalette {
  protected readonly ui = inject(UiService);
  private readonly input = viewChild<ElementRef<HTMLInputElement>>('input');
  private returnFocus: HTMLElement | null = null;

  protected readonly query = signal('');
  protected readonly active = signal(0);

  private readonly commands: Command[] = [
    { group: 'Go to', label: 'About', icon: 'user', run: () => this.ui.goToSection('about') },
    { group: 'Go to', label: 'Skills', icon: 'code', keywords: 'toolkit toolbox', run: () => this.ui.goToSection('skills') },
    { group: 'Go to', label: 'Experience', icon: 'pipeline', keywords: 'jobs work roles', run: () => this.ui.goToSection('experience') },
    { group: 'Go to', label: 'Systems diagrams', icon: 'bolt', keywords: 'pipelines architecture', run: () => this.ui.goToSection('pipelines') },
    { group: 'Go to', label: 'Resume', icon: 'expand', keywords: 'cv', run: () => this.ui.goToSection('resume') },
    { group: 'Go to', label: 'Contact', icon: 'mail', keywords: 'email hire', run: () => this.ui.goToSection('contact') },
    { group: 'Pages', label: 'Home', icon: 'arrow', run: () => this.ui.goToPage('/') },
    { group: 'Pages', label: 'How this website is built', icon: 'cloud', keywords: 'architecture aws cdk', run: () => this.ui.goToPage('/this-website') },
    { group: 'Pages', label: 'Live API console', icon: 'terminal', keywords: 'lambda latency', run: () => this.ui.goToPage('/live-api') },
    { group: 'Actions', label: 'Download resume (PDF)', icon: 'download', keywords: 'cv', run: () => this.ui.downloadResume() },
    { group: 'Actions', label: 'Copy email address', icon: 'copy', keywords: 'contact', run: () => this.ui.copyEmail() },
    { group: 'Actions', label: 'Open GitHub', icon: 'github', keywords: 'code repo', run: () => window.open(profile.github, '_blank', 'noopener') },
    { group: 'Actions', label: 'Open terminal', icon: 'terminal', keywords: 'shell cli console', run: () => this.ui.terminalOpen.set(true) },
  ];

  protected readonly filtered = computed(() => {
    const words = this.query().toLowerCase().split(/\s+/).filter(Boolean);
    return this.commands.filter((c) => {
      const text = `${c.label} ${c.group} ${c.keywords ?? ''}`.toLowerCase();
      return words.every((w) => text.includes(w));
    });
  });

  constructor() {
    // However it was opened (shortcut, nav button, terminal), start fresh and remember focus.
    effect(() => {
      if (this.ui.paletteOpen()) {
        this.returnFocus = document.activeElement as HTMLElement | null;
        this.query.set('');
        this.active.set(0);
      }
    });
    effect(() => {
      const el = this.input()?.nativeElement;
      if (el) queueMicrotask(() => el.focus());
    });
  }

  @HostListener('document:keydown', ['$event'])
  protected onGlobalKey(e: KeyboardEvent): void {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (this.ui.paletteOpen()) this.close();
      else this.ui.paletteOpen.set(true);
    }
  }

  protected close(): void {
    this.ui.paletteOpen.set(false);
    this.returnFocus?.focus?.();
  }

  protected onInput(e: Event): void {
    this.query.set((e.target as HTMLInputElement).value);
    this.active.set(0);
  }

  protected onKey(e: KeyboardEvent): void {
    const count = this.filtered().length;
    if (e.key === 'ArrowDown' && count) {
      e.preventDefault();
      this.active.update((i) => (i + 1) % count);
    } else if (e.key === 'ArrowUp' && count) {
      e.preventDefault();
      this.active.update((i) => (i - 1 + count) % count);
    } else if (e.key === 'Enter') {
      const cmd = this.filtered()[this.active()];
      if (cmd) this.execute(cmd);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      this.close();
    } else if (e.key === 'Tab') {
      e.preventDefault(); // Keep focus inside the dialog.
    }
    queueMicrotask(() =>
      document.getElementById(`cmd-${this.active()}`)?.scrollIntoView({ block: 'nearest' }),
    );
  }

  protected execute(cmd: Command): void {
    this.ui.paletteOpen.set(false);
    this.returnFocus = null;
    cmd.run();
  }
}
