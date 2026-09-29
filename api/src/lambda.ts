import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { extractClientIp } from './ip.js';
import { route } from './router.js';

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const body =
    event.body && event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body;

  const headers = Object.fromEntries(
    Object.entries(event.headers ?? {}).map(([key, value]) => [key.toLowerCase(), value ?? undefined]),
  ) as Record<string, string | undefined>;
  const clientIp = extractClientIp(headers, event.requestContext?.identity?.sourceIp ?? null);

  const res = await route({ method: event.httpMethod, path: event.path, body, ip: clientIp });

  return {
    statusCode: res.statusCode,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    body: JSON.stringify(res.body),
  };
}
