import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { FareCalculationService } from '../src/app/core/services/fare-calculation.service.ts';
import { Flight, SeatMap } from '../src/app/core/models/models.ts';

describe('FareCalculationService', () => {
  const service = new FareCalculationService();

  const mockFlight: Flight = {
    id: 1,
    flightNumber: 'AI-101',
    airlineId: 1,
    originId: 1,
    destinationId: 2,
    departureTime: '08:00',
    arrivalTime: '10:15',
    duration: '2h 15m',
    durationMinutes: 135,
    stops: 0,
    stopDetails: [],
    aircraft: 'Airbus A320neo',
    prices: { economy: 5000, business: 15000, first: 30000 },
    seatsAvailable: { economy: 100, business: 20, first: 5 },
    departureDate: '2027-01-15',
    status: 'scheduled'
  };

  const mockSeatMap: SeatMap = {
    id: 1,
    aircraft: 'Airbus A320neo',
    rows: 30,
    seatsPerRow: 6,
    layout: 'ABC-DEF',
    firstClass: { rows: [1, 2], price: 2000 },
    business: { rows: [3, 4], price: 800 },
    economy: { rows: [5, 6, 7, 8, 9, 10], price: 0 },
    emergencyExitRows: [12, 13],
    extraLegroom: [12, 13],
    occupiedSeats: ['1A', '3B']
  };

  it('should return zero fare when no flight is provided', () => {
    const res = service.calculateFare(null, null, 1, 'economy', [], null);
    assert.equal(res.baseFare, 0);
    assert.equal(res.total, 0);
    assert.equal(res.currency, 'INR');
  });

  it('should correctly calculate one-way economy fare with 12% tax and ₹150 fee', () => {
    const res = service.calculateFare(mockFlight, null, 1, 'economy', ['5A'], mockSeatMap);
    assert.equal(res.baseFare, 5000);
    assert.equal(res.seatCharges, 0); // Standard economy has 0 fee
    assert.equal(res.taxes, Math.round(5000 * 0.12)); // 600
    assert.equal(res.fees, 150);
    assert.equal(res.total, 5000 + 600 + 150); // 5750
  });

  it('should include premium seat charges in total fare', () => {
    // 3A is Business class (+₹800), 12A is Extra Legroom (+₹300)
    const res = service.calculateFare(mockFlight, null, 2, 'economy', ['3A', '12A'], mockSeatMap);
    assert.equal(res.baseFare, 10000);
    assert.equal(res.seatCharges, 800 + 300); // 1100
    const subtotal = 10000 + 1100;
    assert.equal(res.taxes, Math.round(subtotal * 0.12));
    assert.equal(res.fees, 300); // 2 * 150
  });

  it('should calculate return journey fare accurately', () => {
    const returnFlight: Flight = {
      ...mockFlight,
      id: 2,
      originId: 2,
      destinationId: 1,
      prices: { economy: 4500, business: 14000, first: 28000 }
    };

    const res = service.calculateFare(mockFlight, returnFlight, 1, 'economy', [], null);
    assert.equal(res.baseFare, 5000 + 4500); // 9500
    assert.equal(res.taxes, Math.round(9500 * 0.12)); // 1140
    assert.equal(res.fees, 150);
    assert.equal(res.total, 9500 + 1140 + 150); // 10790
  });
});
