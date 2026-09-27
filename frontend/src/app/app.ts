import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DataField } from './shared/data-field';
import { Footer } from './shared/footer';
import { Nav } from './shared/nav';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DataField, Nav, Footer],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="skip-link" href="#main">Skip to content</a>
    <app-data-field />
    <app-nav />
    <main id="main">
      <router-outlet />
    </main>
    <app-footer />
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
  `,
})
export class App {}
