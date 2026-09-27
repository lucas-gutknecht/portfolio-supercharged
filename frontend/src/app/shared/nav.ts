import { ChangeDetectionStrategy, Component, HostListener, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Icon } from './icon';

interface NavLink {
  label: string;
  path: string;
  fragment?: string;
}

@Component({
  selector: 'app-nav',
  imports: [RouterLink, RouterLinkActive, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './nav.html',
  styleUrl: './nav.scss',
  host: { '[class.scrolled]': 'scrolled()', '[class.open]': 'open()' },
})
export class Nav {
  protected readonly scrolled = signal(false);
  protected readonly open = signal(false);

  protected readonly links: NavLink[] = [
    { label: 'About', path: '/', fragment: 'about' },
    { label: 'Skills', path: '/', fragment: 'skills' },
    { label: 'Experience', path: '/', fragment: 'experience' },
    { label: 'This Website', path: '/this-website' },
    { label: 'Live API', path: '/live-api' },
  ];

  @HostListener('window:scroll')
  protected onScroll(): void {
    this.scrolled.set(window.scrollY > 16);
  }

  @HostListener('document:keydown.escape')
  protected close(): void {
    this.open.set(false);
  }

  protected toggle(): void {
    this.open.update((v) => !v);
  }
}
