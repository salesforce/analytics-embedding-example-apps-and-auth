import { useEffect, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AnalyticsAgent, EventName } from '@salesforce/analytics-embedding-sdk';
import { messages } from '../lib/messages';
import { log } from '../lib/log';
import type { AssetConfig } from '../lib/config';

/**
 * Mounts the Agentforce **Analytics Agent** in its own route. Lazy-loaded
 * by `App.tsx` so the dashboard route stays slim.
 *
 * The agent ID comes from the in-memory setup form.
 */
export function Agent(): React.ReactElement {
  const { agent: agentId } = useOutletContext<AssetConfig>();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    if (!agentId || !containerRef.current) return;
    const host = containerRef.current;
    let mounted = true;

    const agent = new AnalyticsAgent({
      idOrApiName: agentId,
      parentIdOrElement: host,
      width: '100%',
      height: '100%',
      showHeader: true,
      showHeaderActions: true,
    });

    agent.addEventListener(EventName.ERROR, () => {
      if (!mounted) return;
      log.error('AnalyticsAgent error', { id: agentId });
      setRenderError(messages.RENDER_FAILED(agentId));
    });

    agent
      .render()
      .then(() => {
        if (mounted) host.setAttribute('aria-busy', 'false');
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        log.error('AnalyticsAgent render() rejected', { err });
        setRenderError(messages.RENDER_FAILED(agentId));
      });

    return () => {
      mounted = false;
      agent.remove();
    };
  }, [agentId]);

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

      {agentId ? (
        <section
          ref={containerRef}
          role="region"
          aria-label="Analytics agent"
          aria-busy="true"
          className="embed embed--agent"
        />
      ) : (
        <section
          role="region"
          aria-label="Analytics agent"
          className="embed embed--agent embed--empty"
        >
          <p className="hint">Analytics Agent not configured.</p>
        </section>
      )}
    </main>
  );
}
