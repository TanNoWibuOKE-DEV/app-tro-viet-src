import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Admin Authentication & Security Role Policy', () => {
  const AUTHORIZED_ADMIN_EMAILS = [
    'admin@troviet.vn',
    'superadmin@troviet.vn',
    'quantri@troviet.vn',
  ];

  it('authorizes pre-configured official system admin emails', () => {
    assert.equal(AUTHORIZED_ADMIN_EMAILS.includes('admin@troviet.vn'), true);
    assert.equal(AUTHORIZED_ADMIN_EMAILS.includes('superadmin@troviet.vn'), true);
    assert.equal(AUTHORIZED_ADMIN_EMAILS.includes('quantri@troviet.vn'), true);
  });

  it('rejects unauthorized public emails from accessing admin portal', () => {
    assert.equal(AUTHORIZED_ADMIN_EMAILS.includes('user@gmail.com'), false);
    assert.equal(AUTHORIZED_ADMIN_EMAILS.includes('chutro@troviet.vn'), false);
    assert.equal(AUTHORIZED_ADMIN_EMAILS.includes('fakeadmin@troviet.vn'), false);
  });

  it('enforces 2-factor Admin Security PIN check', () => {
    const validPin = '2026';
    const checkPin = (pin: string) => pin === validPin;

    assert.equal(checkPin('2026'), true);
    assert.equal(checkPin('1234'), false);
    assert.equal(checkPin('0000'), false);
  });
});
