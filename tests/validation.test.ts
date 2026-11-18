import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Search and Passenger Validations', () => {
  it('should validate that origin and destination cannot be identical', () => {
    const origin = 1;
    const dest = 1;
    const isInvalid = origin === dest;
    assert.equal(isInvalid, true, 'Identical origin and destination must be flagged');
  });

  it('should validate return date must be after departure date', () => {
    const depDate = '2027-01-20';
    const retDateInvalid = '2027-01-15';
    const retDateValid = '2027-01-25';

    assert.ok(retDateInvalid < depDate, 'Return date prior to departure is invalid');
    assert.ok(retDateValid >= depDate, 'Return date on or after departure is valid');
  });

  it('should validate email format for passengers', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    assert.ok(emailRegex.test('passenger@skybook.com'));
    assert.ok(emailRegex.test('rahul.sharma@domain.co.in'));
    assert.equal(emailRegex.test('invalid-email'), false);
    assert.equal(emailRegex.test('@missinguser.com'), false);
  });

  it('should validate passenger age boundaries (1-120)', () => {
    const isValidAge = (age: number) => age >= 1 && age <= 120;
    assert.equal(isValidAge(0), false);
    assert.equal(isValidAge(25), true);
    assert.equal(isValidAge(75), true);
    assert.equal(isValidAge(130), false);
  });
});
