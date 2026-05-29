import { TestBed } from '@angular/core/testing';
import { ConfigService, STORAGE_KEYS } from './config.service';

describe('ConfigService', () => {
  let service: ConfigService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfigService);
  });

  it('config() returns null when localStorage is empty', () => {
    expect(service.config()).toBeNull();
  });

  it('save() persists both keys', () => {
    service.save({
      orgUrl: 'https://acme.lightning.force.com',
      authCredential: 'frontdoor',
    });
    expect(localStorage.getItem(STORAGE_KEYS.orgUrl)).toBe(
      'https://acme.lightning.force.com',
    );
    expect(localStorage.getItem(STORAGE_KEYS.authCredential)).toBe('frontdoor');
    expect(service.config()).toEqual({
      orgUrl: 'https://acme.lightning.force.com',
      authCredential: 'frontdoor',
    });
  });

  it('clear() removes both keys', () => {
    service.save({
      orgUrl: 'https://acme.lightning.force.com',
      authCredential: 'frontdoor',
    });
    service.clear();
    expect(service.config()).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.orgUrl)).toBeNull();
  });

  it('validate() rejects my.salesforce.com URLs', () => {
    expect(
      service.validate({
        orgUrl: 'https://acme.my.salesforce.com',
        authCredential: 'frontdoor',
      }),
    ).toBe('INVALID_ORG_URL');
  });

  it('validate() accepts Lightning URLs', () => {
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
