import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface ApiResult {
  ok: boolean;
  status: number;
  ms: number;
  body: unknown;
}

/** Thin wrapper around the portfolio API that reports status and latency. */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  hello(): Promise<ApiResult> {
    return this.call('GET', '/api/hello');
  }

  openApi(): Promise<ApiResult> {
    return this.call('GET', '/api/openapi.json');
  }

  sendEmail(recipient: string): Promise<ApiResult> {
    return this.call('POST', '/api/send_portfolio_email', { recipient_email: recipient });
  }

  async call(method: 'GET' | 'POST', url: string, body?: unknown): Promise<ApiResult> {
    const started = performance.now();
    try {
      const res = await firstValueFrom(
        this.http.request(method, url, { body, observe: 'response', responseType: 'json' }),
      );
      return { ok: true, status: res.status, ms: Math.round(performance.now() - started), body: res.body };
    } catch (err) {
      const e = err as HttpErrorResponse;
      return {
        ok: false,
        status: e.status,
        ms: Math.round(performance.now() - started),
        body: e.error ?? { error: e.message },
      };
    }
  }
}
