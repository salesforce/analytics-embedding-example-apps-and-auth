import { useEffect, useId, useState } from 'react';
import {
  loadConfig,
  saveConfig,
  isStorageAvailable,
  validateConfig,
  type DemoConfig,
  type ValidationError,
} from './lib/config';
import { messages } from './lib/messages';

interface SetupProps {
  onConfig: (config: DemoConfig) => void;
}

/**
 * Renders the in-app setup form when localStorage is empty, OR forwards an
 * already-saved config to its parent. Replaces the need for a `.env` file
 * and lets visitors test-drive the demo without a backend.
 */
export function Setup({ onConfig }: SetupProps): React.ReactElement {
  const orgUrlId = useId();
  const authId = useId();
  const [orgUrl, setOrgUrl] = useState('');
  const [authCredential, setAuthCredential] = useState('');
  const [error, setError] = useState<ValidationError | null>(null);
  // Lazy initializer — runs once on mount; avoids the
  // `react-hooks/set-state-in-effect` antipattern.
  const [storageOk] = useState(() => isStorageAvailable());

  useEffect(() => {
    const existing = loadConfig();
    if (existing) onConfig(existing);
  }, [onConfig]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const validation = validateConfig({ orgUrl, authCredential });
    if (validation) {
      setError(validation);
      return;
    }
    const config: DemoConfig = {
      orgUrl: orgUrl.trim(),
      authCredential: authCredential.trim(),
    };
    if (storageOk) saveConfig(config);
    onConfig(config);
  };

  return (
    <main id="main" className="setup">
      <title>Configure — Analytics Embedding SDK example</title>
      <header>
        <h1>Configure the demo</h1>
        <p>
          This example needs a Salesforce org URL and a frontdoor URL to
          establish a session.{' '}
          <a
            href="https://github.com/salesforce/analytics-embedding-example-apps-and-auth/blob/main/docs/how-to-get-frontdoor-url.md"
            target="_blank"
            rel="noopener noreferrer"
          >
            How do I get these?
          </a>
        </p>
      </header>

      {!storageOk ? (
        <p className="warning" role="status">
          {messages.STORAGE_UNAVAILABLE}
        </p>
      ) : null}

      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor={orgUrlId}>Org URL (Lightning)</label>
          <input
            id={orgUrlId}
            name="orgUrl"
            type="url"
            placeholder="https://yourorg.lightning.force.com"
            value={orgUrl}
            onChange={(e) => setOrgUrl(e.target.value)}
            required
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <div className="field">
          <label htmlFor={authId}>Frontdoor URL (auth credential)</label>
          <textarea
            id={authId}
            name="authCredential"
            placeholder="https://yourorg.lightning.force.com/secur/frontdoor.jsp?sid=..."
            value={authCredential}
            onChange={(e) => setAuthCredential(e.target.value)}
            required
            autoComplete="off"
            spellCheck={false}
            rows={4}
          />
        </div>

        {error === 'INVALID_ORG_URL' ? (
          <p className="error" role="alert">
            {messages.INVALID_ORG_URL}
          </p>
        ) : null}
        {error === 'EMPTY_AUTH_CREDENTIAL' ? (
          <p className="error" role="alert">
            Paste a frontdoor URL — this field is required.
          </p>
        ) : null}

        <p className="hint">
          <strong>Demo only.</strong> Do not paste production credentials. The
          frontdoor URL grants session access — treat it like a password and
          use a sandbox org.
        </p>

        <button type="submit" className="btn btn--primary">
          Save and connect
        </button>
      </form>
    </main>
  );
}
