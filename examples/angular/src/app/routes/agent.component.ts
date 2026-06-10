import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  signal,
} from '@angular/core';
import { AnalyticsAgent, EventName } from '@salesforce/analytics-embedding-sdk';
import { messages } from '../messages';
import { log } from '../log';

const AGENT_ID = 'YourAnalyticsAgentApiName';

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

      <section
        #agentHost
        role="region"
        aria-label="Analytics agent"
        aria-busy="true"
        class="embed embed--agent"
      ></section>
    </main>
  `,
})
export class AgentComponent implements AfterViewInit, OnDestroy {
  @ViewChild('agentHost') agentHost!: ElementRef<HTMLElement>;

  private agent: AnalyticsAgent | null = null;
  private mounted = false;

  protected readonly renderError = signal<string | null>(null);

  ngAfterViewInit(): void {
    this.mounted = true;
    // The shell (AppComponent) gates this route on a ready session, so we can
    // mount the agent directly — no init or ready-check needed here.
    const host = this.agentHost.nativeElement;
    this.agent = new AnalyticsAgent({
      idOrApiName: AGENT_ID,
      parentIdOrElement: host,
      showHeader: true,
      showHeaderActions: true,
    });
    this.agent.addEventListener(EventName.ERROR, () => {
      if (!this.mounted) return;
      log.error('AnalyticsAgent error', { id: AGENT_ID });
      this.renderError.set(messages.RENDER_FAILED(AGENT_ID));
    });
    this.agent
      .render()
      .then(() => {
        if (this.mounted) host.setAttribute('aria-busy', 'false');
      })
      .catch((err: unknown) => {
        if (!this.mounted) return;
        log.error('AnalyticsAgent render() rejected', { err });
        this.renderError.set(messages.RENDER_FAILED(AGENT_ID));
      });
  }

  ngOnDestroy(): void {
    this.mounted = false;
    this.agent?.remove();
    this.agent = null;
  }
}
