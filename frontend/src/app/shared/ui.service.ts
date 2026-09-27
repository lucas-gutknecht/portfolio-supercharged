import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { profile } from '../data/profile';

/** App-wide UI state (overlays) and the navigation actions the palette and terminal share. */
@Injectable({ providedIn: 'root' })
export class UiService {
  private readonly router = inject(Router);

  readonly paletteOpen = signal(false);
  readonly terminalOpen = signal(false);
  readonly toast = signal('');
  private toastTimer?: ReturnType<typeof setTimeout>;

  /** Goes to a home-page section, scrolling even when the URL fragment hasn't changed. */
  async goToSection(fragment: string): Promise<void> {
    await this.router.navigate(['/'], { fragment });
    requestAnimationFrame(() =>
      document.getElementById(fragment)?.scrollIntoView({ behavior: this.scrollBehavior() }),
    );
  }

  async goToPage(path: string): Promise<void> {
    await this.router.navigateByUrl(path);
  }

  downloadResume(): void {
    const a = document.createElement('a');
    a.href = profile.resume;
    a.download = 'Lucas-Gutknecht-Resume.pdf';
    a.click();
  }

  async copyEmail(): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(profile.email);
      this.notify(`Copied ${profile.email}`);
      return true;
    } catch {
      this.notify(`Clipboard unavailable. Email: ${profile.email}`);
      return false;
    }
  }

  notify(message: string): void {
    clearTimeout(this.toastTimer);
    this.toast.set(message);
    this.toastTimer = setTimeout(() => this.toast.set(''), 2600);
  }

  scrollBehavior(): ScrollBehavior {
    return matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  }
}
