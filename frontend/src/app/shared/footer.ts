import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { REPO_URL, profile } from '../data/profile';
import { Icon } from './icon';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container inner">
      <div class="left">
        <span class="mark">LG</span>
        <div>
          <strong>{{ profile.name }}</strong>
          <span class="muted">Software &amp; Data Engineer · {{ profile.location }}</span>
        </div>
      </div>

      <div class="links">
        <a [href]="'mailto:' + profile.email" aria-label="Email"><app-icon name="mail" /></a>
        <a [href]="profile.github" target="_blank" rel="noopener" aria-label="GitHub"><app-icon name="github" /></a>
        <a [href]="profile.resume" download aria-label="Download resume"><app-icon name="download" /></a>
      </div>

      <p class="built">
        Built with Angular and TypeScript on AWS Lambda, delivered through CloudFront.
        <a routerLink="/this-website">See how it works</a> ·
        <a [href]="repoUrl" target="_blank" rel="noopener">Source</a> · © {{ year }}
      </p>
    </div>
  `,
  styles: `
    :host {
      display: block;
      position: relative;
      border-top: 1px solid var(--border);
      background: rgba(7, 9, 15, 0.6);
      backdrop-filter: blur(10px);
      padding: 40px 0;
    }
    .inner {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
    }
    .left {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .left div {
      display: flex;
      flex-direction: column;
      line-height: 1.35;
    }
    .mark {
      display: grid;
      place-items: center;
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: var(--gradient);
      font: 600 0.95rem var(--font-display);
    }
    .muted {
      color: var(--text-muted);
      font-size: 0.9rem;
    }
    .links {
      display: flex;
      gap: 10px;
    }
    .links a {
      display: grid;
      place-items: center;
      width: 44px;
      height: 44px;
      border-radius: 12px;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--text-muted);
      font-size: 1.1rem;
      transition:
        color 0.2s,
        border-color 0.2s,
        transform 0.3s var(--ease);
    }
    .links a:hover {
      color: var(--cyan);
      border-color: var(--cyan);
      transform: translateY(-3px);
    }
    .built {
      flex-basis: 100%;
      margin: 8px 0 0;
      color: var(--text-dim);
      font-size: 0.85rem;
    }
  `,
})
export class Footer {
  protected readonly profile = profile;
  protected readonly repoUrl = REPO_URL;
  protected readonly year = new Date().getFullYear();
}
