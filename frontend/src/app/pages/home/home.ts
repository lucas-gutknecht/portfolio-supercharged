import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import {
  education,
  experience,
  focusAreas,
  profile,
  skills,
  stats,
  toolbox,
} from '../../data/profile';
import { ApiService } from '../../shared/api.service';
import { Icon } from '../../shared/icon';
import { Reveal } from '../../shared/reveal.directive';

const VISIBLE_JOBS = 3;

type SendState = 'idle' | 'sending' | 'sent' | 'error';

@Component({
  selector: 'app-home',
  imports: [FormsModule, RouterLink, Icon, Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit, OnDestroy {
  private readonly api = inject(ApiService);

  protected readonly profile = profile;
  protected readonly focusAreas = focusAreas;
  protected readonly skills = skills;
  protected readonly toolbox = toolbox;
  protected readonly education = education;
  protected readonly stats = stats;
  protected readonly maxYears = Math.max(...skills.map((s) => s.years));
  protected readonly resumeUrl = inject(DomSanitizer).bypassSecurityTrustResourceUrl(
    `${profile.resume}#view=FitH`,
  );

  // ---------- Hero typewriter ----------
  protected readonly typed = signal('');
  private roleIndex = 0;
  private typeTimer?: ReturnType<typeof setTimeout>;

  // ---------- Animated counters and bars ----------
  protected readonly counts = signal(stats.map(() => 0));
  protected readonly skillsShown = signal(false);

  // ---------- Experience ----------
  protected readonly showAllJobs = signal(false);
  protected readonly jobs = computed(() =>
    this.showAllJobs() ? experience : experience.slice(0, VISIBLE_JOBS),
  );
  protected readonly hiddenJobCount = experience.length - VISIBLE_JOBS;

  // ---------- Resume ----------
  protected readonly resumeOpen = signal(false);

  // ---------- Contact / live email demo ----------
  protected readonly email = signal('');
  protected readonly sendState = signal<SendState>('idle');
  protected readonly sendMessage = signal('');

  ngOnInit(): void {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.typed.set(profile.roles[0]);
    } else {
      this.type(0, false);
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.typeTimer);
  }

  /** Types a role out, pauses, deletes it, then moves to the next one. */
  private type(chars: number, deleting: boolean): void {
    const role = profile.roles[this.roleIndex];
    this.typed.set(role.slice(0, chars));

    let delay = deleting ? 45 : 85;
    if (!deleting && chars === role.length) {
      delay = 2000;
      deleting = true;
    } else if (deleting && chars === 0) {
      deleting = false;
      this.roleIndex = (this.roleIndex + 1) % profile.roles.length;
      delay = 400;
    }
    const next = deleting ? chars - 1 : chars + 1;
    this.typeTimer = setTimeout(() => this.type(Math.max(next, 0), deleting), delay);
  }

  protected countUp(): void {
    const duration = 1600;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      this.counts.set(stats.map((s) => Math.round(s.value * eased)));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  protected skillWidth(years: number): number {
    return this.skillsShown() ? Math.round((years / this.maxYears) * 100) : 0;
  }

  protected async sendIntroEmail(): Promise<void> {
    const recipient = this.email().trim();
    if (!recipient || this.sendState() === 'sending') return;

    this.sendState.set('sending');
    const res = await this.api.sendEmail(recipient);
    const body = res.body as { message?: string; error?: string } | null;

    if (res.ok) {
      this.sendState.set('sent');
      this.sendMessage.set(`Sent! Check ${recipient}. The Lambda answered in ${res.ms} ms.`);
      this.email.set('');
    } else {
      this.sendState.set('error');
      this.sendMessage.set(body?.error ?? 'Something went wrong. Please try again.');
    }
  }
}
