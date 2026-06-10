import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { Component } from '@angular/core';
import { Router, provideRouter } from '@angular/router';
import { AppComponent } from './app.component';
import { ConfigService, STORAGE_KEYS } from './config.service';

// Stub route components so the test exercises AppComponent's outlet gating
// without pulling the real SDK-backed showcase/agent components.
@Component({ standalone: true, template: '<p>showcase stub</p>' })
class ShowcaseStubComponent {}

@Component({ standalone: true, template: '<p>setup stub</p>' })
class SetupStubComponent {}

function setup(): {
  fixture: ComponentFixture<AppComponent>;
  app: AppComponent;
  router: Router;
  config: ConfigService;
} {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([
        { path: 'setup', component: SetupStubComponent },
        { path: '', component: ShowcaseStubComponent, pathMatch: 'full' },
      ]),
    ],
  });
  const fixture = TestBed.createComponent(AppComponent);
  return {
    fixture,
    app: fixture.componentInstance,
    router: TestBed.inject(Router),
    config: TestBed.inject(ConfigService),
  };
}

describe('AppComponent outlet gating', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows the embed route once the session is ready', async () => {
    // Seed a saved config BEFORE the service is constructed so its config
    // signal reads it. The mocked SDK resolves init to SUCCESS → ready.
    localStorage.setItem(STORAGE_KEYS.orgUrl, 'https://acme.lightning.force.com');
    localStorage.setItem(STORAGE_KEYS.authCredential, 'frontdoor');

    const { fixture, app, router, config } = setup();

    // First CD runs the shell's effect, which fires initOnce().
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    await router.navigate(['/']);
    fixture.detectChanges();

    expect(config.state().kind).toBe('ready');
    expect(app.showOutlet()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('showcase stub');
  });

  it('shows setup (outlet open) when there is no config', async () => {
    const { fixture, app, router } = setup();

    fixture.detectChanges();
    await router.navigate(['/setup']);
    fixture.detectChanges();

    // No config → outlet must stay open so the user can reach the setup form.
    expect(app.showOutlet()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('setup stub');
  });
});
