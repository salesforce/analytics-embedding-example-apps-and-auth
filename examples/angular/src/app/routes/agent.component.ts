import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { AnalyticsAgent, EventName } from '@salesforce/analytics-embedding-sdk';
import { messages } from '../messages';
import { log } from '../log';
import { ConfigService } from '../config.service';

@Component({
  selector: 'app-agent',
  standalone: true,
  template: `
    <main id="main" class="agent-route">
      <header class="page-header">
        <h1>AnalyticsAgent</h1>
        <p>The Agentforce analytics agent on its own lazy-loaded route.</p>
      </header>

      @if (renderError(); as msg) {
        <p class="error" role="alert">{{ msg }}</p>
      }

      @if (agentId) {
        <section
          #agentHost
          role="region"
          aria-label="Analytics agent"
          aria-busy="true"
          class="embed embed--agent"
        ></section>
      } @else {
        <section
          role="region"
          aria-label="Analytics agent"
          class="embed embed--agent embed--empty"
        >
          <p class="hint">Analytics Agent not configured.</p>
        </section>
      }
    </main>
  `,
})
export class AgentComponent implements AfterViewInit, OnDestroy {
  @ViewChild('agentHost') agentHost?: ElementRef<HTMLElement>;

  protected readonly agentId = inject(ConfigService).config()!.assets.agent;

  private agent: AnalyticsAgent | null = null;
  private mounted = false;

  protected readonly renderError = signal<string | null>(null);

  ngAfterViewInit(): void {
    this.mounted = true;
    // The shell (AppComponent) gates this route on a ready session, so we can
    // mount the agent directly — no init or ready-check needed here.
    if (!this.agentId || !this.agentHost) return;
    const host = this.agentHost.nativeElement;
    this.agent = new AnalyticsAgent({
      idOrApiName: this.agentId,
      parentIdOrElement: host,
      width: '100%',
      height: '100%',
      showHeader: true,
      showHeaderActions: true,
    });
    this.agent.addEventListener(EventName.ERROR, () => {
      if (!this.mounted) return;
      log.error('AnalyticsAgent error', { id: this.agentId });
      this.renderError.set(messages.RENDER_FAILED(this.agentId));
    });
    this.agent
      .render()
      .then(() => {
        if (this.mounted) host.setAttribute('aria-busy', 'false');
      })
      .catch((err: unknown) => {
        if (!this.mounted) return;
        log.error('AnalyticsAgent render() rejected', { err });
        this.renderError.set(messages.RENDER_FAILED(this.agentId));
      });
  }

  ngOnDestroy(): void {
    this.mounted = false;
    this.agent?.remove();
    this.agent = null;
  }
}
