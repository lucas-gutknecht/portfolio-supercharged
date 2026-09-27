import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DataField } from './shared/data-field';
import { Footer } from './shared/footer';
import { Nav } from './shared/nav';
import { CommandPalette } from './shared/command-palette';
import { Terminal } from './shared/terminal';
import { UiService } from './shared/ui.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DataField, Nav, Footer, CommandPalette, Terminal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="skip-link" href="#main">Skip to content</a>
    <app-data-field />
    <app-nav />
    <main id="main">
      <router-outlet />
    </main>
    <app-footer />
    <app-command-palette />
    <app-terminal />
    <div class="toast" [class.show]="ui.toast()" role="status" aria-live="polite">{{ ui.toast() }}</div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    main {
      position: relative;
      z-index: 1;
      flex: 1;
      /* Routes are lazy-loaded; reserving a screen keeps the footer from jumping when they arrive. */
      min-height: 100vh;
    }
    .skip-link {
      position: absolute;
      left: 16px;
      top: -60px;
      z-index: 100;
      padding: 10px 16px;
      border-radius: 10px;
      background: var(--bg-raised);
      border: 1px solid var(--cyan);
    }
    .skip-link:focus {
      top: 16px;
    }
    .toast {
      position: fixed;
      left: 50%;
      bottom: 28px;
      z-index: 300;
      translate: -50% 20px;
      padding: 10px 18px;
      border-radius: 999px;
      border: 1px solid var(--border-strong);
      background: var(--bg-raised);
      color: var(--text);
      font-size: 0.9rem;
      opacity: 0;
      pointer-events: none;
      transition:
        opacity 0.25s,
        translate 0.3s var(--ease);
    }
    .toast.show {
      opacity: 1;
      translate: -50% 0;
    }
  `,
})
export class App {
  protected readonly ui = inject(UiService);
}
