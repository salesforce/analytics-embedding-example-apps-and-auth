import { Link } from 'react-router-dom';

interface AppHeaderProps {
  onReset: () => void;
  resetDisabled?: boolean;
}

export function AppHeader({
  onReset,
  resetDisabled,
}: AppHeaderProps): React.ReactElement {
  return (
    <header className="app-header">
      <div className="app-header__brand">
        <strong>Analytics Embedding SDK</strong>
        <span className="app-header__tag">React 19 example</span>
      </div>
      <nav aria-label="Primary">
        <Link to="/">Showcase</Link>
        <Link to="/agent">Agent</Link>
      </nav>
      <button
        type="button"
        className="btn btn--ghost"
        onClick={onReset}
        disabled={resetDisabled}
        aria-disabled={resetDisabled}
      >
        Reset config
      </button>
    </header>
  );
}
