import test from 'node:test';
import assert from 'node:assert/strict';
import { extractClientIp } from './ip.js';

test('extractClientIp prefers X-Forwarded-For and strips port', () => {
  const ip = extractClientIp({
    'x-forwarded-for': '203.0.113.7, 10.0.0.2',
    'cf-connecting-ip': '198.51.100.3',
  });

  assert.equal(ip, '203.0.113.7');
});

test('extractClientIp falls back to direct request context IP', () => {
  const ip = extractClientIp({ 'x-real-ip': '198.51.100.8' }, '192.0.2.10');

  assert.equal(ip, '198.51.100.8');
});

test('extractClientIp normalizes IPv6 and ports in forwarded headers', () => {
  const ip = extractClientIp({ 'x-forwarded-for': '[2001:db8::1]:443, 198.51.100.17' });

  assert.equal(ip, '2001:db8::1');
});
