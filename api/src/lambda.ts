import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { route } from './router.js';

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const body =
    event.body && event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body;

  const res = await route({ method: event.httpMethod, path: event.path, body });

  return {
    statusCode: res.statusCode,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    body: JSON.stringify(res.body),
  };
}
