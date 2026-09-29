export function extractClientIp(
  headers: Record<string, string | undefined> = {},
  fallbackIp?: string | null,
): string | null {
  const candidates = [
    headers['x-forwarded-for'],
    headers['x-real-ip'],
    headers['cf-connecting-ip'],
    headers['true-client-ip'],
    headers['x-client-ip'],
    headers['forwarded'],
  ];

  for (const candidate of candidates) {
    const ip = parseClientIp(candidate);
    if (ip) {
      return ip;
    }
  }

  return normalizeIp(fallbackIp);
}

function parseClientIp(value?: string): string | null {
  if (!value) {
    return null;
  }

  for (const candidate of value.split(',').map((part) => part.trim()).filter(Boolean)) {
    const normalized = normalizeIp(candidate);
    if (normalized) {
      return normalized;
    }
  }

  return null;
}

function normalizeIp(value?: string | null): string | null {
  if (!value) {
    return null;
  }

  let candidate = value.trim();
  if (!candidate) {
    return null;
  }

  if (candidate.startsWith('[') && candidate.includes(']')) {
    const end = candidate.indexOf(']');
    candidate = candidate.slice(1, end).trim();
  }

  if (candidate.includes(':') && candidate.split(':').length > 2) {
    return candidate;
  }

  const lastColon = candidate.lastIndexOf(':');
  if (lastColon !== -1 && lastColon === candidate.indexOf(':')) {
    candidate = candidate.slice(0, lastColon);
  }

  return candidate || null;
}
