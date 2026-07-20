import { useId, useState } from 'react';
import {
  validateConfig,
  EMPTY_ASSETS,
  type AssetConfig,
  type DemoConfig,
  type ValidationError,
} from './lib/config';
import { messages } from './lib/messages';

interface SetupProps {
  onConfig: (config: DemoConfig) => void;
}

/**
 * Collects a demo credential and forwards it to the app. The value remains
 * in React state only and is discarded when the document reloads.
 */
export function Setup({ onConfig }: SetupProps): React.ReactElement {
  const orgUrlId = useId();
  const authId = useId();
  const dashboardId = useId();
  const metricId = useId();
  const visualizationId = useId();
  const agentId = useId();
  const [orgUrl, setOrgUrl] = useState('');
  const [authCredential, setAuthCredential] = useState('');
  const [assets, setAssets] = useState<AssetConfig>({ ...EMPTY_ASSETS });
  const [error, setError] = useState<ValidationError | null>(null);
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const validation = validateConfig({ orgUrl, authCredential, assets });
    if (validation) {
      setError(validation);
      return;
    }
    const config: DemoConfig = {
      orgUrl: orgUrl.trim(),
      authCredential: authCredential.trim(),
      assets: {
        dashboard: assets.dashboard.trim(),
        metric: assets.metric.trim(),
        visualization: assets.visualization.trim(),
        agent: assets.agent.trim(),
      },
    };
    onConfig(config);
  };

  return (
    <main id="main" className="setup">
      <title>Configure — Analytics Embedding SDK example</title>
      <header>
        <h1>Configure the demo</h1>
        <p>
          This example needs a Salesforce org URL, asset IDs or API names, and
          a frontdoor URL to establish a session.{' '}
          <a
            href="https://github.com/salesforce/analytics-embedding-example-apps-and-auth/blob/main/docs/how-to-get-frontdoor-url.md"
            target="_blank"
            rel="noopener noreferrer"
          >
            How do I get these?
          </a>
        </p>
      </header>

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

        <h2>Assets to embed</h2>
        <p className="hint">
          Enter at least one asset ID or API name.
        </p>

        <div className="field">
          <label htmlFor={dashboardId}>Dashboard ID or API name</label>
          <input
            id={dashboardId}
            name="dashboard"
            value={assets.dashboard}
            placeholder="YourDashboardApiName"
            onChange={(e) =>
              setAssets({ ...assets, dashboard: e.target.value })
            }
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <div className="field">
          <label htmlFor={metricId}>Metric ID or API name</label>
          <input
            id={metricId}
            name="metric"
            value={assets.metric}
            placeholder="YourMetricApiName"
            onChange={(e) => setAssets({ ...assets, metric: e.target.value })}
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <div className="field">
          <label htmlFor={visualizationId}>Visualization ID or API name</label>
          <input
            id={visualizationId}
            name="visualization"
            value={assets.visualization}
            placeholder="YourVisualizationApiName"
            onChange={(e) =>
              setAssets({ ...assets, visualization: e.target.value })
            }
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <div className="field">
          <label htmlFor={agentId}>Analytics Agent ID or API name</label>
          <input
            id={agentId}
            name="agent"
            value={assets.agent}
            placeholder="YourAnalyticsAgentApiName"
            onChange={(e) => setAssets({ ...assets, agent: e.target.value })}
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <div className="field">
          <label htmlFor={authId}>Frontdoor URL (auth credential)</label>
          <textarea
            id={authId}
            name="authCredential"
            placeholder="Paste a freshly generated frontdoor URL"
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
        {error === 'EMPTY_ASSET_CONFIG' ? (
          <p className="error" role="alert">
            Enter at least one asset ID or API name.
          </p>
        ) : null}

        <p className="hint">
          <strong>Demo only.</strong> Use a sandbox org. This configuration
          stays in memory and is discarded when you reload or reset the page.
        </p>

        <button type="submit" className="btn btn--primary">
          Connect
        </button>
      </form>
    </main>
  );
}
