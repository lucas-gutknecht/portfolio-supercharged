import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { education, experience, profile, toolbox } from '../data/profile';
import { UiService } from './ui.service';

interface Line {
  kind: 'in' | 'out' | 'err' | 'accent';
  text: string;
}

const SECTIONS = ['about', 'skills', 'experience', 'pipelines', 'resume', 'contact'];
const PAGES: Record<string, string> = { home: '/', website: '/this-website', api: '/live-api' };

const HELP: Line[] = [
  { kind: 'accent', text: 'Available commands' },
  { kind: 'out', text: '  whoami        who I am, in one line' },
  { kind: 'out', text: '  about         a short bio' },
  { kind: 'out', text: '  skills        my toolbox, by group' },
  { kind: 'out', text: '  experience    roles, newest first' },
  { kind: 'out', text: '  education     certifications and degrees' },
  { kind: 'out', text: '  contact       how to reach me' },
  { kind: 'out', text: '  resume        download my resume (PDF)' },
  { kind: 'out', text: '  goto <place>  ' + [...SECTIONS, ...Object.keys(PAGES)].join(' | ') },
  { kind: 'out', text: '  clear         clear the screen' },
  { kind: 'out', text: '  exit          close the terminal' },
];

/** A small in-page shell for exploring the portfolio. Output is plain text only. */
@Component({
  selector: 'app-terminal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (ui.terminalOpen()) {
      <div class="backdrop" (click)="close()"></div>
      <div class="window" role="dialog" aria-modal="true" aria-label="Terminal" (click)="focusInput()">
        <div class="titlebar">
          <span class="dots" aria-hidden="true"><i></i><i></i><i></i></span>
          <span class="title">lucas&#64;portfolio: ~</span>
          <button type="button" class="x" (click)="close()" aria-label="Close terminal">✕</button>
        </div>
        <div #screen class="screen" role="log" aria-live="polite">
          @for (line of lines(); track $index) {
            <div class="line" [class]="'line ' + line.kind">
              @if (line.kind === 'in') {
                <span class="ps1">$</span>
              }{{ line.text }}
            </div>
          }
          <label class="prompt">
            <span class="ps1">$</span>
            <input
              #input
              type="text"
              aria-label="Terminal command"
              autocomplete="off"
              autocapitalize="off"
              spellcheck="false"
              [value]="draft()"
              (input)="draft.set($any($event.target).value)"
              (keydown)="onKey($event)"
            />
          </label>
        </div>
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
    }

    .window {
      position: fixed;
      z-index: 201;
      top: 50%;
      left: 50%;
      translate: -50% -50%;
      display: flex;
      flex-direction: column;
      width: min(760px, calc(100vw - 32px));
      height: min(520px, calc(100vh - 120px));
      border-radius: 14px;
      border: 1px solid var(--border-strong);
      background: #05070c;
      box-shadow:
        0 30px 80px -20px rgba(0, 0, 0, 0.9),
        0 0 40px -10px rgba(34, 211, 238, 0.3);
      overflow: hidden;
      animation: pop 0.2s var(--ease);
    }

    .titlebar {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      background: var(--bg-raised);
      border-bottom: 1px solid var(--border);
      font: 500 0.8rem var(--font-mono);
      color: var(--text-dim);
    }

    .dots {
      display: flex;
      gap: 6px;
      i {
        width: 11px;
        height: 11px;
        border-radius: 50%;
        background: var(--red);
      }
      i:nth-child(2) {
        background: var(--amber);
      }
      i:nth-child(3) {
        background: var(--green);
      }
    }

    .title {
      flex: 1;
      text-align: center;
    }

    .x {
      border: 0;
      background: none;
      color: var(--text-dim);
      cursor: pointer;
      font-size: 0.9rem;
      &:hover {
        color: var(--text);
      }
    }

    .screen {
      flex: 1;
      overflow-y: auto;
      padding: 16px 18px;
      font: 0.88rem/1.6 var(--font-mono);
      color: var(--text-muted);
    }

    .line {
      white-space: pre-wrap;
      overflow-wrap: anywhere;

      &.in {
        color: var(--text);
      }
      &.err {
        color: var(--red);
      }
      &.accent {
        color: var(--cyan);
      }
    }

    .ps1 {
      color: var(--green);
      margin-right: 10px;
    }

    .prompt {
      display: flex;
      align-items: center;

      input {
        flex: 1;
        min-width: 0;
        border: 0;
        outline: 0;
        background: none;
        color: var(--text);
        font: inherit;
        caret-color: var(--cyan);
      }
    }

    @keyframes pop {
      from {
        opacity: 0;
        scale: 0.97;
      }
    }
  `,
})
export class Terminal {
  protected readonly ui = inject(UiService);
  private readonly input = viewChild<ElementRef<HTMLInputElement>>('input');
  private readonly screen = viewChild<ElementRef<HTMLElement>>('screen');

  protected readonly lines = signal<Line[]>(this.banner());
  protected readonly draft = signal('');
  private readonly history: string[] = [];
  private historyIndex = 0;

  constructor() {
    effect(() => {
      const el = this.input()?.nativeElement;
      if (el) queueMicrotask(() => el.focus());
    });
    // Keep the newest output in view.
    effect(() => {
      this.lines();
      const el = this.screen()?.nativeElement;
      if (el) queueMicrotask(() => (el.scrollTop = el.scrollHeight));
    });
  }

  /** Backtick opens the terminal from anywhere except while typing in a field. */
  @HostListener('document:keydown', ['$event'])
  protected onGlobalKey(e: KeyboardEvent): void {
    const target = e.target as HTMLElement;
    const typing = target.matches?.('input, textarea, [contenteditable="true"]');
    if (e.key === '`' && !typing && !this.ui.terminalOpen()) {
      e.preventDefault();
      this.ui.terminalOpen.set(true);
    }
  }

  protected focusInput(): void {
    if (!getSelection()?.toString()) this.input()?.nativeElement.focus();
  }

  protected close(): void {
    this.ui.terminalOpen.set(false);
  }

  protected onKey(e: KeyboardEvent): void {
    if (e.key === 'Enter') {
      const cmd = this.draft().trim();
      this.setDraft('');
      if (cmd) {
        this.history.push(cmd);
        this.historyIndex = this.history.length;
      }
      this.run(cmd);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const step = e.key === 'ArrowUp' ? -1 : 1;
      this.historyIndex = Math.min(Math.max(this.historyIndex + step, 0), this.history.length);
      this.setDraft(this.history[this.historyIndex] ?? '');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      this.complete();
    } else if (e.key === 'Escape') {
      this.close();
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      this.lines.set([]);
    }
  }

  private complete(): void {
    const [cmd, arg] = this.draft().trimStart().split(/\s+/, 2);
    if (arg !== undefined && cmd === 'goto') {
      const match = [...SECTIONS, ...Object.keys(PAGES)].filter((p) => p.startsWith(arg));
      if (match.length === 1) this.setDraft(`goto ${match[0]}`);
      return;
    }
    const names = ['whoami', 'about', 'skills', 'experience', 'education', 'contact', 'resume', 'goto', 'clear', 'exit', 'help'];
    const match = names.filter((n) => n.startsWith(cmd));
    if (match.length === 1) this.setDraft(match[0] + (match[0] === 'goto' ? ' ' : ''));
    else if (match.length > 1) this.print({ kind: 'out', text: match.join('  ') });
  }

  /** Writes the input directly too: if the signal already holds this value, the binding won't touch the DOM. */
  private setDraft(value: string): void {
    this.draft.set(value);
    const el = this.input()?.nativeElement;
    if (el) el.value = value;
  }

  private print(...out: Line[]): void {
    this.lines.update((l) => [...l, ...out]);
  }

  private run(raw: string): void {
    this.print({ kind: 'in', text: raw });
    const [cmd = '', ...args] = raw.toLowerCase().split(/\s+/).filter(Boolean);

    switch (cmd) {
      case '':
        return;
      case 'help':
      case '?':
        return this.print(...HELP);
      case 'whoami':
        return this.print({ kind: 'out', text: `${profile.name}: ${profile.roles.slice(0, 3).join(', ')}.` });
      case 'about':
        return this.print(...profile.bio.flatMap((p) => [{ kind: 'out' as const, text: p }, { kind: 'out' as const, text: '' }]));
      case 'skills':
        return this.print(
          ...toolbox.flatMap((g) => [
            { kind: 'accent' as const, text: g.group },
            { kind: 'out' as const, text: '  ' + g.items.join(' · ') },
          ]),
        );
      case 'experience':
        return this.print(
          ...experience.map((j) => ({
            kind: 'out' as const,
            text: `${`${j.start} – ${j.end}`.padEnd(22)}${j.title}, ${j.company}`,
          })),
        );
      case 'education':
        return this.print(...education.map((e) => ({ kind: 'out' as const, text: `${e.year}  ${e.title}, ${e.org}` })));
      case 'contact':
        return this.print(
          { kind: 'out', text: `email   ${profile.email}` },
          { kind: 'out', text: `github  ${profile.github}` },
          { kind: 'out', text: "Tip: 'goto contact' to have my Lambda email you." },
        );
      case 'resume':
        this.ui.downloadResume();
        return this.print({ kind: 'out', text: 'Downloading Lucas-Gutknecht-Resume.pdf…' });
      case 'goto':
      case 'cd': {
        const place = args[0] ?? '';
        if (SECTIONS.includes(place)) {
          this.close();
          void this.ui.goToSection(place);
        } else if (PAGES[place]) {
          this.close();
          void this.ui.goToPage(PAGES[place]);
        } else {
          this.print({ kind: 'err', text: `goto: unknown place '${place}'. Try: ${[...SECTIONS, ...Object.keys(PAGES)].join(', ')}` });
        }
        return;
      }
      case 'clear':
        return this.lines.set([]);
      case 'exit':
        return this.close();
      case 'sudo':
        return this.print({ kind: 'accent', text: "Permission granted. Try 'goto contact' and let's talk." });
      default:
        return this.print({ kind: 'err', text: `command not found: ${cmd}. Type 'help' for commands.` });
    }
  }

  private banner(): Line[] {
    return [
      { kind: 'accent', text: `Welcome to ${profile.name}'s portfolio shell.` },
      { kind: 'out', text: "Type 'help' to see commands. Tab completes, ↑/↓ recalls history, Esc closes." },
      { kind: 'out', text: '' },
    ];
  }
}
