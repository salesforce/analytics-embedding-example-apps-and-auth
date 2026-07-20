import { TestBed } from '@angular/core/testing';
import { ConfigService } from './config.service';

describe('ConfigService', () => {
  let service: ConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfigService);
  });

  it('config() starts empty', () => {
    expect(service.config()).toBeNull();
  });

  it('save() holds a trimmed config in memory', () => {
    service.save({
      orgUrl: '  https://acme.lightning.force.com  ',
      authCredential: '  frontdoor  ',
    });
    expect(service.config()).toEqual({
      orgUrl: 'https://acme.lightning.force.com',
      authCredential: 'frontdoor',
    });
    expect(localStorage.length).toBe(0);
  });

  it('clear() discards the in-memory config', () => {
    service.save({
      orgUrl: 'https://acme.lightning.force.com',
      authCredential: 'frontdoor',
    });
    service.clear();
    expect(service.config()).toBeNull();
  });

  it('validate() rejects a malformed org URL', () => {
    expect(
      service.validate({
        orgUrl: 'not-a-url',
        authCredential: 'frontdoor',
      }),
    ).toBe('INVALID_ORG_URL');
  });

  it('validate() accepts an https org URL', () => {
    expect(
      service.validate({
        orgUrl: 'https://acme.lightning.force.com',
        authCredential: 'frontdoor',
      }),
    ).toBeNull();
  });

  it('validate() rejects empty auth credential', () => {
    expect(
      service.validate({
        orgUrl: 'https://acme.lightning.force.com',
        authCredential: '   ',
      }),
    ).toBe('EMPTY_AUTH_CREDENTIAL');
  });
});
