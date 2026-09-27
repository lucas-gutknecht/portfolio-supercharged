import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import {
  Job,
  education,
  experience,
  focusAreas,
  profile,
  skillTerms,
  skills,
  stats,
  tagAccents,
  toolbox,
} from '../../data/profile';
import { ApiService } from '../../shared/api.service';
import { Icon } from '../../shared/icon';
import { Reveal } from '../../shared/reveal.directive';
import { UiService } from '../../shared/ui.service';
import { PipelineDiagram } from './pipeline-diagram';

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** True when a job lists the skill in its tags or uses, or mentions it (or one of its search terms) in a highlight. */
function jobUsesSkill(job: Job, skill: string): boolean {
  const lower = skill.toLowerCase();
  if ([...job.tags, ...job.uses].some((t) => t.toLowerCase() === lower)) return true;
  const text = job.highlights.join(' ');
  return [skill, ...(skillTerms[skill] ?? [])].some((term) =>
    new RegExp(`(^|[^\\w])${escapeRegExp(term)}(?![\\w])`, 'i').test(text),
  );
}

/** Skill → jobs that used it, precomputed for every toolbox item and job tag. */
const skillJobs = new Map<string, Set<Job>>();
for (const skill of new Set([...toolbox.flatMap((g) => g.items), ...experience.flatMap((j) => j.tags)])) {
  skillJobs.set(skill, new Set(experience.filter((job) => jobUsesSkill(job, skill))));
}

type SendState = 'idle' | 'sending' | 'sent' | 'error';

@Component({
  selector: 'app-home',
  imports: [FormsModule, RouterLink, Icon, Reveal, PipelineDiagram],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit, OnDestroy {
  private readonly api = inject(ApiService);
  private readonly ui = inject(UiService);

  protected readonly profile = profile;
  protected readonly focusAreas = focusAreas;
  protected readonly skills = skills;
  protected readonly toolbox = toolbox;
  protected readonly education = education;
  protected readonly stats = stats;
  protected readonly tagAccents = tagAccents;
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

  // ---------- Experience: skill filter and expandable cards ----------
  protected readonly currentJob = experience[0];
  protected readonly skillFilter = signal<string | null>(null);
  protected readonly matchingJobs = computed(() => {
    const skill = this.skillFilter();
    return skill ? (skillJobs.get(skill) ?? new Set<Job>()) : null;
  });
  /** With a skill selected, only the roles that used it are shown. */
  protected readonly jobs = computed(() => {
    const matches = this.matchingJobs();
    return matches ? experience.filter((job) => matches.has(job)) : experience;
  });
  protected readonly expanded = signal(new Set<Job>([experience[0]]));
  protected readonly allExpanded = computed(() => this.jobs().every((job) => this.expanded().has(job)));

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

  protected jobCount(skill: string): number {
    return skillJobs.get(skill)?.size ?? 0;
  }

  /** Toggles the experience filter; only matching roles are shown, expanded. */
  protected filterBySkill(skill: string, scroll = false): void {
    if (this.skillFilter() === skill) {
      this.clearFilter();
      return;
    }
    const matches = skillJobs.get(skill) ?? new Set<Job>();
    this.skillFilter.set(skill);
    this.expanded.set(new Set(matches));
    if (scroll) {
      requestAnimationFrame(() =>
        document.getElementById('experience')?.scrollIntoView({ behavior: this.ui.scrollBehavior() }),
      );
    }
  }

  protected clearFilter(): void {
    this.skillFilter.set(null);
    this.expanded.set(new Set([experience[0]]));
  }

  protected toggleJob(job: Job): void {
    this.expanded.update((set) => {
      const next = new Set(set);
      if (!next.delete(job)) next.add(job);
      return next;
    });
  }

  protected toggleAllJobs(): void {
    this.expanded.set(this.allExpanded() ? new Set() : new Set(this.jobs()));
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
