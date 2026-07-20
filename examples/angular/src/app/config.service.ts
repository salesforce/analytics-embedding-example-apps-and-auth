import { Injectable, signal, type WritableSignal } from '@angular/core';
import {
  initializeAnalyticsSdk,
  retryOrAddOrgs,
  Status,
  OrgStates,
  type BootstrapResponse,
} from '@salesforce/analytics-embedding-sdk';
import { log } from './log';
import { messages } from './messages';

// Salesforce serves Lightning from many host shapes (production, sandboxes,
// scratch orgs, enhanced domains, pre-release instances like `*.pc-rnd.force.com`).
// Enumerating them all is a losing game, so we only check that the org URL is a
// well-formed https URL and let the SDK reject a wrong host at init time.
function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

export interface DemoConfig {
  orgUrl: string;
  authCredential: string;
}

export type ValidationError = 'INVALID_ORG_URL' | 'EMPTY_AUTH_CREDENTIAL';

export type InitState =
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

@Injectable({ providedIn: 'root' })
export class ConfigService {
  /** Current in-memory config, or null before setup. */
  readonly config: WritableSignal<DemoConfig | null> = signal(null);

  /** Init state machine — read by templates. */
  readonly state: WritableSignal<InitState> = signal({ kind: 'idle' });

  private inflight: Promise<BootstrapResponse> | null = null;
  private resolved: BootstrapResponse | null = null;

  validate(input: { orgUrl: string; authCredential: string }): ValidationError | null {
    if (!isHttpsUrl(input.orgUrl.trim())) return 'INVALID_ORG_URL';
    if (input.authCredential.trim().length === 0) return 'EMPTY_AUTH_CREDENTIAL';
    return null;
  }

  save(next: DemoConfig): void {
    const trimmed = {
      orgUrl: next.orgUrl.trim(),
      authCredential: next.authCredential.trim(),
    };
    this.config.set(trimmed);
  }

  clear(): void {
    this.config.set(null);
    this.resolved = null;
    this.inflight = null;
    this.state.set({ kind: 'idle' });
  }

  /**
   * Singleton init. Runs once per page load. Re-init only after a Reset
   * (which reloads the page).
   */
  initOnce(): Promise<BootstrapResponse> {
    if (this.resolved) return Promise.resolve(this.resolved);
    if (this.inflight) return this.inflight;

    const config = this.config();
    if (!config) return Promise.reject(new Error('Cannot init without config'));

    this.state.set({ kind: 'initializing' });
    log.info('initializeAnalyticsSdk: starting', { orgUrl: config.orgUrl });

    this.inflight = initializeAnalyticsSdk({
      orgUrl: config.orgUrl,
      authCredential: config.authCredential,
    })
      .then((response) => {
        this.resolved = response;
        log.info('initializeAnalyticsSdk: resolved', { status: response.status });
        this.applyState(response);
        return response;
      })
      .catch((err: unknown): BootstrapResponse => {
        const fallback: BootstrapResponse = {
          status: Status.FAILURE,
          message: err instanceof Error ? err.message : String(err),
        };
        log.error('initializeAnalyticsSdk: threw', { err });
        this.resolved = fallback;
        this.applyState(fallback);
        return fallback;
      });

    return this.inflight;
  }

  /**
   * After MFA completes, reissue init for the org needing reauthentication.
   * The supported pattern is `authCredential: orgUrl` to resume the
   * existing session without regenerating a frontdoor URL.
   */
  retryAuth(orgUrl: string): Promise<BootstrapResponse> {
    this.state.set({ kind: 'initializing' });
    return retryOrAddOrgs([{ orgUrl, authCredential: orgUrl }])
      .then((response) => {
        this.resolved = response;
        this.applyState(response);
        return response;
      })
      .catch((err: unknown): BootstrapResponse => {
        const fallback: BootstrapResponse = {
          status: Status.FAILURE,
          message: err instanceof Error ? err.message : String(err),
        };
        this.resolved = fallback;
        this.applyState(fallback);
        return fallback;
      });
  }

  private applyState(response: BootstrapResponse): void {
    if (response.status === Status.SUCCESS) {
      this.state.set({ kind: 'ready' });
      return;
    }

    if (response.orgStates) {
      for (const [orgUrl, info] of response.orgStates) {
        if (info.state === OrgStates.AUTH_REDIRECT) {
          const continueUrl =
            info.redirectOrigin && info.redirectUrl
              ? `${info.redirectOrigin}${info.redirectUrl}`
              : undefined;
          this.state.set({
            kind: 'error',
            title: 'Additional verification needed',
            detail: messages.AUTH_REDIRECT,
            continueUrl,
            canRetry: true,
            retryOrgUrl: orgUrl,
          });
          return;
        }
      }
    }

    const sdkMessage = response.message || 'Unknown error';
    this.state.set({
      kind: 'error',
      title: "Couldn't connect",
      detail: messages.INIT_FAILED(sdkMessage),
      canRetry: false,
    });
  }
}
