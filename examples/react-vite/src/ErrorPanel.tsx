interface ErrorPanelProps {
  title: string;
  detail: string;
  onReset?: () => void;
  onRetry?: () => void;
  /** Optional URL to open in a new tab (for AUTH_REDIRECT). */
  continueUrl?: string;
}

/**
 * Canonical error UI shared by every example in this repo. Same shape, same
 * affordances — only the underlying styling system differs.
 */
export function ErrorPanel({
  title,
  detail,
  onReset,
  onRetry,
  continueUrl,
}: ErrorPanelProps): React.ReactElement {
  return (
    <section className="error-panel" role="alert" aria-live="assertive">
      <h2>{title}</h2>
      <p>{detail}</p>
      <div className="error-panel__actions">
        {continueUrl ? (
          <a
            className="btn btn--primary"
            href={continueUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Continue verification
          </a>
        ) : null}
        {onRetry ? (
          <button type="button" className="btn" onClick={onRetry}>
            Retry
          </button>
        ) : null}
        {onReset ? (
          <button type="button" className="btn" onClick={onReset}>
            Reset config
          </button>
        ) : null}
      </div>
      <p className="error-panel__hint">
        Need a frontdoor URL?{' '}
        <a
          href="https://github.com/salesforce/analytics-embedding-example-apps-and-auth/blob/main/docs/how-to-get-frontdoor-url.md"
          target="_blank"
          rel="noopener noreferrer"
        >
          Read the guide
        </a>
        .
      </p>
    </section>
  );
}
