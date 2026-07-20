import { randomBytes } from 'node:crypto';

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function renderSuccessPage(frontdoorUrl) {
  const nonce = randomBytes(18).toString('base64url');
  const safeUrl = escapeHtml(frontdoorUrl);
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="referrer" content="no-referrer">
    <title>Frontdoor URL ready</title>
    <style nonce="${nonce}">
      :root { font-family: system-ui, sans-serif; color-scheme: light dark; }
      main { max-width: 760px; margin: 4rem auto; padding: 1.5rem; }
      textarea { box-sizing: border-box; width: 100%; min-height: 9rem; padding: .75rem; }
      button { margin-top: 1rem; padding: .65rem 1rem; cursor: pointer; }
      .warning { color: #b45f06; }
    </style>
  </head>
  <body>
    <main>
      <h1>Frontdoor URL ready</h1>
      <p class="warning"><strong>Use it now.</strong> It is valid for up to one minute and can be consumed only once.</p>
      <label for="frontdoor">Copy this value into the example app's Frontdoor URL field:</label>
      <textarea id="frontdoor" readonly spellcheck="false">${safeUrl}</textarea>
      <button id="copy" type="button">Copy to clipboard</button>
      <p id="status" role="status"></p>
      <p>You can close this tab. The local callback server has stopped.</p>
    </main>
    <script nonce="${nonce}">
      history.replaceState(null, '', '/');
      const value = document.querySelector('#frontdoor');
      const status = document.querySelector('#status');
      document.querySelector('#copy').addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(value.value);
          status.textContent = 'Copied. Paste it into the example immediately.';
        } catch {
          value.select();
          status.textContent = 'Clipboard access was blocked. Press Ctrl/Cmd+C.';
        }
      });
    </script>
  </body>
</html>`;
  return { html, nonce };
}

export function renderErrorPage(message) {
  const safeMessage = escapeHtml(message);
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="referrer" content="no-referrer">
    <title>Frontdoor URL generation failed</title>
  </head>
  <body>
    <main>
      <h1>Frontdoor URL generation failed</h1>
      <p>${safeMessage}</p>
      <p>Return to the terminal, correct the configuration, and run the utility again.</p>
    </main>
  </body>
</html>`;
}
