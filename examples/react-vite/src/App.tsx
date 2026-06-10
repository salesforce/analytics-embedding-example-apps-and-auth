import {
  createContext,
  lazy,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { createHashRouter, Outlet, RouterProvider } from 'react-router-dom';
import { Status } from '@salesforce/analytics-embedding-sdk';
import { Setup } from './Setup';
import { ErrorPanel } from './ErrorPanel';
import { AppHeader } from './AppHeader';
import { Showcase } from './routes/Showcase';
import { initSdkOnce, getAuthRedirect, retryAuth } from './lib/initSdkOnce';
import { clearConfig, type DemoConfig } from './lib/config';
import { messages } from './lib/messages';
import { log } from './lib/log';

const Agent = lazy(() =>
  import('./routes/Agent').then((m) => ({ default: m.Agent })),
);

type InitState =
  | { kind: 'idle' }
  | { kind: 'initializing' }
  | { kind: 'ready' }
  | {
      kind: 'error';
      title: string;
      detail: string;
      continueUrl?: string;
      canRetry: boolean;
      retryOrgUrl?: string;
    };

interface ShellContextValue {
  state: InitState;
  onReset: () => void;
  onRetry: () => void;
}

const ShellContext = createContext<ShellContextValue | null>(null);

function useShell(): ShellContextValue {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error('Shell context missing');
  return ctx;
}

function Shell(): React.ReactElement {
  const { state, onReset, onRetry } = useShell();
  return (
    <div className="app">
      <AppHeader onReset={onReset} resetDisabled={state.kind === 'initializing'} />
      {state.kind === 'initializing' ? (
        <p className="loading" role="status" aria-busy="true">
          Connecting to your Salesforce org…
        </p>
      ) : null}
      {state.kind === 'error' ? (
        <ErrorPanel
          title={state.title}
          detail={state.detail}
          continueUrl={state.continueUrl}
          onReset={onReset}
          onRetry={state.canRetry ? onRetry : undefined}
        />
      ) : null}
      {state.kind === 'ready' ? <Outlet /> : null}
    </div>
  );
}

// Router is created **once** at module load so RouterProvider sees a stable
// instance. createHashRouter avoids the static-host deep-link 404 problem
// without needing server-side rewrites.
const router = createHashRouter([
  {
    path: '/',
    element: <Shell />,
    children: [
      { index: true, element: <Showcase /> },
      {
        path: 'agent',
        element: (
          <Suspense
            fallback={
              <p className="loading" role="status" aria-busy="true">
                Loading agent…
              </p>
            }
          >
            <Agent />
          </Suspense>
        ),
      },
    ],
  },
]);

export function App(): React.ReactElement {
  const [config, setConfig] = useState<DemoConfig | null>(null);
  const [state, setState] = useState<InitState>({ kind: 'idle' });

  const handleConfig = useCallback((next: DemoConfig) => {
    // Flip into 'initializing' alongside the config update so the effect
    // below doesn't need to setState on entry (avoids the
    // react-hooks/set-state-in-effect lint rule).
    setState({ kind: 'initializing' });
    setConfig(next);
  }, []);

  const handleReset = useCallback(() => {
    clearConfig();
    location.assign(location.pathname);
  }, []);

  const handleRetry = useCallback(() => {
    if (state.kind !== 'error' || !state.retryOrgUrl) {
      handleReset();
      return;
    }
    setState({ kind: 'initializing' });
    retryAuth(state.retryOrgUrl)
      .then((response) => {
        if (response.status === Status.SUCCESS) {
          setState({ kind: 'ready' });
          return;
        }
        const sdkMessage = response.message || 'Unknown error';
        setState({
          kind: 'error',
          title: "Couldn't connect",
          detail: messages.INIT_FAILED(sdkMessage),
          canRetry: false,
        });
      })
      .catch((err: unknown) => {
        log.error('retryAuth threw — falling back to reset', { err });
        handleReset();
      });
  }, [state, handleReset]);

  useEffect(() => {
    if (!config) return;
    initSdkOnce(config)
      .then((response) => {
        if (response.status === Status.SUCCESS) {
          setState({ kind: 'ready' });
          return;
        }
        const redirect = getAuthRedirect(response);
        if (redirect) {
          setState({
            kind: 'error',
            title: 'Additional verification needed',
            detail: messages.AUTH_REDIRECT,
            continueUrl: redirect.continueUrl,
            canRetry: true,
            retryOrgUrl: redirect.orgUrl,
          });
          return;
        }
        const sdkMessage = response.message || 'Unknown error';
        setState({
          kind: 'error',
          title: "Couldn't connect",
          detail: messages.INIT_FAILED(sdkMessage),
          canRetry: false,
        });
      })
      .catch((err: unknown) => {
        log.error('init promise threw', { err });
        const sdkMessage = err instanceof Error ? err.message : String(err);
        setState({
          kind: 'error',
          title: "Couldn't connect",
          detail: messages.INIT_FAILED(sdkMessage),
          canRetry: false,
        });
      });
  }, [config]);

  const shellValue = useMemo<ShellContextValue>(
    () => ({ state, onReset: handleReset, onRetry: handleRetry }),
    [state, handleReset, handleRetry],
  );

  if (!config) {
    return <Setup onConfig={handleConfig} />;
  }

  return (
    <ShellContext.Provider value={shellValue}>
      <RouterProvider router={router} />
    </ShellContext.Provider>
  );
}
