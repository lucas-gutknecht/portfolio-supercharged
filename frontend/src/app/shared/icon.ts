import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

const PATHS = {
  arrow: 'M5 12h14M13 6l6 6-6 6',
  download: 'M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19h14',
  mail: 'M4 6h16v12H4zM4 7l8 6 8-6',
  github:
    'M9 19c-4 1.5-4-2-6-2.5m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21',
  pipeline: 'M4 6h5v4H4zM15 14h5v4h-5zM9 8h3a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2M4 16h5M15 6h5',
  cloud: 'M7 18a4.5 4.5 0 0 1-.6-9 6 6 0 0 1 11.5 1.5A4 4 0 0 1 17 18z',
  bolt: 'M13 3 5 14h6l-1 7 8-11h-6z',
  code: 'm8 7-5 5 5 5m8-10 5 5-5 5M14 4l-4 16',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6 6 18',
  external: 'M14 4h6v6m0-6-9 9M18 14v5H5V6h5',
  terminal: 'M4 5h16v14H4zM8 10l2.5 2L8 14m5 0h3',
  check: 'm5 12 4.5 4.5L19 7',
  expand: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
  send: 'M4 12 20 4l-4 16-4-7-8-1zm8 1 8-9',
  play: 'M7 5v14l12-7z',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zm9 2-4-4',
  chevron: 'm6 9 6 6 6-6',
  filter: 'M4 5h16l-6 7.5V19l-4-2v-4.5z',
  copy: 'M9 9h10v10H9zM5 15V5h10',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 8a7 7 0 0 1 14 0',
} as const;

export type IconName = keyof typeof PATHS;

@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path [attr.d]="d()" />
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      width: 1.2em;
      height: 1.2em;
      flex-shrink: 0;
    }
    svg {
      width: 100%;
      height: 100%;
    }
  `,
})
export class Icon {
  readonly name = input.required<IconName>();
  protected readonly d = computed(() => PATHS[this.name()]);
}
