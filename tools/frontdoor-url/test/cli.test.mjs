import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import test from 'node:test';

async function availablePort() {
  const server = createServer();
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, 'localhost', resolve);
  });
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 0;
  await new Promise((resolve) => server.close(resolve));
  return port;
}

function waitFor(predicate, timeoutMs = 5_000) {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const poll = () => {
      const value = predicate();
      if (value) resolve(value);
      else if (Date.now() - started >= timeoutMs) reject(new Error('Timed out'));
      else setTimeout(poll, 20);
    };
    poll();
  });
}

async function runCli(args, env = {}) {
  const child = spawn(process.execPath, ['src/cli.mjs', ...args], {
    cwd: new URL('..', import.meta.url),
    env: {
      ...process.env,
      SF_CLIENT_ID: '',
      SF_CLIENT_SECRET: '',
      SF_LOGIN_URL: '',
      ...env,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let stdout = '';
  let stderr = '';
  child.stdout.setEncoding('utf8');
  child.stderr.setEncoding('utf8');
  child.stdout.on('data', (chunk) => (stdout += chunk));
  child.stderr.on('data', (chunk) => (stderr += chunk));
  const exitCode = await new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('close', resolve);
  });
  return { exitCode, stdout, stderr };
}

test('prints help without requiring configuration', async () => {
  const result = await runCli(['--help']);
  assert.equal(result.exitCode, 0);
  assert.match(result.stdout, /Usage:/);
  assert.equal(result.stderr, '');
});

test('rejects missing configuration', async () => {
  const result = await runCli([]);
  assert.equal(result.exitCode, 1);
  assert.match(result.stderr, /Provide --login-url or SF_LOGIN_URL/);
});

test('rejects invalid ports, absolute redirects, and unknown options', async () => {
  const base = [
    '--login-url',
    'https://example.my.salesforce.com',
    '--client-id',
    'consumer-key',
  ];
  const invalidPort = await runCli([...base, '--port', '70000']);
  assert.equal(invalidPort.exitCode, 1);
  assert.match(invalidPort.stderr, /integer from 1024 to 65535/);

  const absoluteRedirect = await runCli([
    ...base,
    '--redirect-uri',
    'https://example.com/path',
  ]);
  assert.equal(absoluteRedirect.exitCode, 1);
  assert.match(absoluteRedirect.stderr, /relative Salesforce path/);

  const unknownOption = await runCli([...base, '--unknown', 'value']);
  assert.equal(unknownOption.exitCode, 1);
  assert.match(unknownOption.stderr, /Unknown option/);
});

test('an invalid state cannot consume the one-shot OAuth callback', async (t) => {
  const port = await availablePort();
  const child = spawn(
    process.execPath,
    [
      'src/cli.mjs',
      '--login-url',
      'https://example.my.salesforce.com',
      '--client-id',
      'consumer-key',
      '--port',
      String(port),
    ],
    { cwd: new URL('..', import.meta.url), stdio: ['ignore', 'pipe', 'pipe'] },
  );
  t.after(() => {
    if (child.exitCode === null) child.kill('SIGTERM');
  });

  let stdout = '';
  let stderr = '';
  child.stdout.setEncoding('utf8');
  child.stderr.setEncoding('utf8');
  child.stdout.on('data', (chunk) => (stdout += chunk));
  child.stderr.on('data', (chunk) => (stderr += chunk));

  const authUrl = await waitFor(() => {
    const match = stdout.match(/https:\/\/example\.my\.salesforce\.com\/services\/oauth2\/authorize\?[^\s]+/);
    return match ? new URL(match[0]) : null;
  });

  const invalid = await fetch(
    `http://localhost:${port}/callback?state=wrong&error=access_denied`,
  );
  assert.equal(invalid.status, 400);
  assert.equal(invalid.headers.get('x-frame-options'), 'DENY');
  assert.match(invalid.headers.get('content-security-policy'), /frame-ancestors 'none'/);
  assert.match(await invalid.text(), /state mismatch/);
  assert.equal(child.exitCode, null);

  const valid = await fetch(
    `http://localhost:${port}/callback?state=${encodeURIComponent(authUrl.searchParams.get('state'))}&error=access_denied`,
  );
  assert.equal(valid.status, 400);
  const exitCode = await waitFor(() => child.exitCode ?? false);
  assert.equal(exitCode, 1);
  assert.doesNotMatch(stdout + stderr, /access_token|frontdoor\.jsp/);
});
