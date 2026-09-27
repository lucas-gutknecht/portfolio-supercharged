import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiResult, ApiService } from '../../shared/api.service';
import { Icon } from '../../shared/icon';
import { Reveal } from '../../shared/reveal.directive';

interface Endpoint {
  method: 'GET' | 'POST';
  path: string;
  summary: string;
  description: string;
  sampleBody?: object;
}

const ENDPOINTS: Endpoint[] = [
  {
    method: 'GET',
    path: '/api/hello',
    summary: 'Hello world',
    description: 'The smallest possible round trip: CloudFront → API Gateway → Lambda → back to you.',
  },
  {
    method: 'POST',
    path: '/api/send_portfolio_email',
    summary: 'Send an intro email',
    description:
      'Validates the address, reads the Gmail app password from SSM Parameter Store, then sends a real email over SMTP.',
    sampleBody: { recipient_email: 'you@company.com' },
  },
  {
    method: 'GET',
    path: '/api/openapi.json',
    summary: 'OpenAPI spec',
    description: 'The OpenAPI 3 document that describes this API.',
  },
];

/** Escapes JSON and wraps tokens in spans for syntax colouring. */
function highlight(value: unknown): string {
  const json = JSON.stringify(value, null, 2) ?? 'null';
  const escaped = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return escaped.replace(
    /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g,
    (match, str: string | undefined, colon: string | undefined, lit: string | undefined) => {
      if (str) return colon ? `<span class="k">${str}</span>${colon}` : `<span class="s">${str}</span>`;
      if (lit) return `<span class="l">${lit}</span>`;
      return `<span class="n">${match}</span>`;
    },
  );
}

@Component({
  selector: 'app-api-console',
  imports: [FormsModule, Icon, Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './api-console.html',
  styleUrl: './api-console.scss',
})
export class ApiConsole {
  private readonly api = inject(ApiService);

  protected readonly endpoints = ENDPOINTS;
  protected readonly selected = signal(ENDPOINTS[0]);
  protected readonly body = signal('');
  protected readonly loading = signal(false);
  protected readonly result = signal<ApiResult | null>(null);
  protected readonly bodyError = signal('');

  protected readonly responseHtml = computed(() => {
    const r = this.result();
    return r ? highlight(r.body) : '';
  });

  protected readonly curl = computed(() => {
    const ep = this.selected();
    const origin = typeof location !== 'undefined' ? location.origin : '';
    if (ep.method === 'GET') return `curl ${origin}${ep.path}`;
    const compact = this.body().replace(/\s+/g, ' ').trim();
    return `curl -X POST ${origin}${ep.path} \\\n  -H "Content-Type: application/json" \\\n  -d '${compact}'`;
  });

  protected select(ep: Endpoint): void {
    this.selected.set(ep);
    this.body.set(ep.sampleBody ? JSON.stringify(ep.sampleBody, null, 2) : '');
    this.result.set(null);
    this.bodyError.set('');
  }

  protected async send(): Promise<void> {
    const ep = this.selected();
    let payload: unknown;
    if (ep.method === 'POST') {
      try {
        payload = JSON.parse(this.body());
      } catch {
        this.bodyError.set('The request body must be valid JSON.');
        return;
      }
    }
    this.bodyError.set('');
    this.loading.set(true);
    this.result.set(await this.api.call(ep.method, ep.path, payload));
    this.loading.set(false);
  }

  protected statusClass(status: number): string {
    if (status >= 200 && status < 300) return 'ok';
    if (status >= 400 && status < 500) return 'warn';
    return 'bad';
  }
}
