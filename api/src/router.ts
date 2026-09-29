import { sendEmail } from './email.js';
import { openApiSpec } from './openapi.js';

export interface ApiRequest {
  method: string;
  path: string;
  body: string | null;
  ip?: string | null;
}

export interface ApiResponse {
  statusCode: number;
  body: unknown;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(statusCode: number, body: unknown): ApiResponse {
  return { statusCode, body };
}

/** Transport-agnostic router shared by the Lambda handler and the local dev server. */
export async function route(req: ApiRequest): Promise<ApiResponse> {
  const path = req.path.replace(/\/+$/, '') || '/';
  const method = req.method.toUpperCase();
  const clientIp = req.ip ?? 'unknown';

  console.log(`[visitor] ${clientIp} ${method} ${path}`);

  if (method === 'GET' && path === '/api/hello') {
    return json(200, { message: 'You just made a successful API call!' });
  }

  if (method === 'GET' && path === '/api/openapi.json') {
    return json(200, openApiSpec);
  }

  if (method === 'POST' && path === '/api/send_portfolio_email') {
    let data: { recipient_email?: unknown };
    try {
      data = JSON.parse(req.body ?? '');
    } catch {
      return json(400, { error: 'Request must be JSON' });
    }

    const recipient = typeof data.recipient_email === 'string' ? data.recipient_email.trim() : '';
    if (!recipient) {
      return json(400, { error: 'recipient_email is required in the request body.' });
    }
    if (!EMAIL_PATTERN.test(recipient)) {
      return json(400, { error: 'recipient_email must be a valid email address.' });
    }

    return (await sendEmail(recipient))
      ? json(200, { message: `Email successfully dispatched to ${recipient}` })
      : json(500, { error: 'Failed to send email.' });
  }

  return json(404, { error: `No route for ${method} ${path}` });
}
