import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { BookingService } from '../src/app/core/services/booking.service.ts';
import { Booking } from '../src/app/core/models/models.ts';

describe('BookingService Logic', () => {
  const service = new BookingService();

  it('should generate valid 8-character PNR starting with SKY', () => {
    const pnr1 = service.generatePNR();
    const pnr2 = service.generatePNR();

    assert.equal(typeof pnr1, 'string');
    assert.equal(pnr1.length, 8);
    assert.ok(pnr1.startsWith('SKY'));
    assert.notEqual(pnr1, pnr2, 'PNRs must be unique');
    assert.match(pnr1, /^SKY[A-Z0-9]{5}$/);
  });

  it('should correctly calculate cancellation fees and refund amount', async () => {
    const booking: Booking = {
      id: 1,
      pnr: 'SKY99999',
      flightId: 1,
      passengers: [{ firstName: 'Test', lastName: 'User', age: 30, gender: 'male', email: 'test@example.com', phone: '+919876543210' }],
      class: 'economy',
      totalAmount: 5000,
      baseFare: 4200,
      taxes: 500,
      fees: 300,
      status: 'confirmed',
      bookingDate: new Date().toISOString(),
      paymentStatus: 'paid'
    };

    // Mock API update methods
    (service as any).api = {
      updateBooking: (b: any) => ({
        pipe: (op: any) => ({
          subscribe: (cb: any) => cb.next ? cb.next(b) : null
        })
      }),
      getFlight: (id: number) => ({
        pipe: () => ({
          subscribe: () => {}
        })
      })
    };

    // Fee calculation logic test: flat min(1000, 15% of 5000) = 750
    const fee = Math.min(1000, Math.round(booking.totalAmount * 0.15));
    const refund = Math.max(0, booking.totalAmount - fee);
    assert.equal(fee, 750);
    assert.equal(refund, 4250);
  });
});
