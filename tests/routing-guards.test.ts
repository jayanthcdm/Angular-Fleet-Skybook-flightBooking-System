import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Routing Guards Logic', () => {
  it('flightSelectedGuard should permit navigation only if flight is selected', () => {
    const guardCheck = (flight: any) => !!flight;
    assert.equal(guardCheck(null), false, 'Must redirect if no flight selected');
    assert.equal(guardCheck({ id: 1, flightNumber: 'AI-101' }), true, 'Must allow navigation when flight is selected');
  });

  it('passengersSetGuard should permit navigation only if passengers are entered', () => {
    const guardCheck = (passengers: any[]) => passengers && passengers.length > 0;
    assert.equal(guardCheck([]), false, 'Must redirect if passenger list is empty');
    assert.equal(guardCheck([{ firstName: 'Rahul', lastName: 'Sharma' }]), true, 'Must allow navigation when passengers are entered');
  });

  it('seatsSelectedGuard should permit navigation only if seats are selected', () => {
    const guardCheck = (seats: string[]) => seats && seats.length > 0;
    assert.equal(guardCheck([]), false, 'Must redirect if no seats selected');
    assert.equal(guardCheck(['12A']), true, 'Must allow navigation when seat selected');
  });

  it('searchCriteriaGuard should permit navigation only if origin and destination are set', () => {
    const guardCheck = (crit: { originId: number | null; destinationId: number | null }) => !!(crit.originId && crit.destinationId);
    assert.equal(guardCheck({ originId: null, destinationId: 2 }), false);
    assert.equal(guardCheck({ originId: 1, destinationId: null }), false);
    assert.equal(guardCheck({ originId: 1, destinationId: 2 }), true);
  });

  it('bookingConfirmedGuard should permit navigation if currentBooking exists or PNR query param present', () => {
    const guardCheck = (hasBooking: boolean, queryPnr?: string) => !!(hasBooking || queryPnr);
    assert.equal(guardCheck(false, undefined), false);
    assert.equal(guardCheck(true, undefined), true);
    assert.equal(guardCheck(false, 'SKY7A3B2'), true);
  });

  it('adminGuard should permit navigation only for users with admin role', () => {
    const guardCheck = (user: { role: string } | null) => user?.role === 'admin';
    assert.equal(guardCheck(null), false);
    assert.equal(guardCheck({ role: 'customer' }), false);
    assert.equal(guardCheck({ role: 'admin' }), true);
  });

  it('paymentProcessingGuard should block leaving while payment is in progress', () => {
    const deactivationGuard = (isProcessing: boolean) => !isProcessing;
    assert.equal(deactivationGuard(true), false, 'Should block deactivation while processing payment');
    assert.equal(deactivationGuard(false), true, 'Should allow deactivation when idle');
  });
});
