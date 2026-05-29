import { useEffect, useRef, useState } from 'react';
import { AnalyticsAgent, EventName } from '@salesforce/analytics-embedding-sdk';
import { messages } from '../lib/messages';
import { log } from '../lib/log';

/**
 * Mounts the Agentforce **Analytics Agent** in its own route. Lazy-loaded
 * by `App.tsx` so the dashboard route stays slim.
 *
 * Replace `AGENT_ID` with the ID of an agent in your org.
 */
const AGENT_ID = 'YourAnalyticsAgentApiName';

export function Agent(): React.ReactElement {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const host = containerRef.current;
    let mounted = true;

    const agent = new AnalyticsAgent({
      idOrApiName: AGENT_ID,
      parentIdOrElement: host,
      showHeader: true,
      showHeaderActions: true,
    });

    agent.addEventListener(EventName.ERROR, () => {
      if (!mounted) return;
      log.error('AnalyticsAgent error', { id: AGENT_ID });
      setRenderError(messages.RENDER_FAILED(AGENT_ID));
    });

    agent
      .render()
      .then(() => {
        if (mounted) host.setAttribute('aria-busy', 'false');
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        log.error('AnalyticsAgent render() rejected', { err });
        setRenderError(messages.RENDER_FAILED(AGENT_ID));
      });

    return () => {
      mounted = false;
      agent.remove();
    };
  }, []);

  return (
    <main id="main" className="agent-route">
      <title>AnalyticsAgent — Analytics Embedding SDK example</title>
      <header className="page-header">
        <h1>AnalyticsAgent</h1>
        <p>
          The Agentforce analytics agent in its own route. Lazy-loaded so the
          dashboard route can ship a smaller initial bundle.
        </p>
      </header>

      {renderError ? (
        <p className="error" role="alert">
          {renderError}
        </p>
      ) : null}

      <section
        ref={containerRef}
        role="region"
        aria-label="Analytics agent"
        aria-busy="true"
        className="embed embed--agent"
      />
    </main>
  );
}
