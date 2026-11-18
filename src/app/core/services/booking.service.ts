import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map, switchMap, of, catchError } from 'rxjs';
import { ApiService } from './api.service';
import { Booking, Flight, Passenger, CabinClass } from '../models/models';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private api!: ApiService;

  constructor() {
    try {
      this.api = inject(ApiService);
    } catch {
      // Test environment fallback
      this.api = {} as ApiService;
    }
  }

  /**
   * Generates standard airline PNR (6-8 chars alphanumeric)
   */
  generatePNR(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'SKY';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Creates a confirmed booking and updates flight seat inventory
   */
  createBooking(
    flight: Flight,
    passengers: Passenger[],
    cabinClass: CabinClass,
    fare: { total: number; baseFare: number; taxes: number; fees: number },
    paymentId: string
  ): Observable<Booking> {
    const pnr = this.generatePNR();

    const bookingPayload: Omit<Booking, 'id'> = {
      pnr,
      flightId: flight.id,
      passengers,
      class: cabinClass,
      totalAmount: fare.total,
      baseFare: fare.baseFare,
      taxes: fare.taxes,
      fees: fare.fees,
      status: 'confirmed',
      bookingDate: new Date().toISOString(),
      paymentStatus: 'paid',
      paymentId
    };

    return this.api.createBooking(bookingPayload).pipe(
      switchMap(newBooking => {
        // Update flight inventory
        const updatedSeats = { ...flight.seatsAvailable };
        if (updatedSeats[cabinClass] !== undefined) {
          updatedSeats[cabinClass] = Math.max(0, updatedSeats[cabinClass] - passengers.length);
        }
        const updatedFlight: Flight = {
          ...flight,
          seatsAvailable: updatedSeats
        };

        return this.api.updateFlight(updatedFlight).pipe(
          map(() => newBooking),
          catchError(() => of(newBooking))
        );
      })
    );
  }

  /**
   * Retrieves booking details by PNR with flight details
   */
  getBookingByPnr(pnr: string): Observable<Booking | null> {
    return this.api.getBookingByPnr(pnr.trim().toUpperCase()).pipe(
      switchMap(bookings => {
        if (!bookings || bookings.length === 0) return of(null);
        const booking = bookings[0];
        return this.api.getFlightWithDetails(booking.flightId).pipe(
          map(flight => ({ ...booking, flight })),
          catchError(() => of(booking))
        );
      })
    );
  }

  /**
   * Cancels a booking, calculates refund, and restores flight seats
   */
  cancelBooking(booking: Booking): Observable<{ success: boolean; refundAmount: number; message: string }> {
    if (booking.status === 'cancelled') {
      return of({ success: false, refundAmount: 0, message: 'This booking is already cancelled.' });
    }

    // Cancellation fee: flat ₹1,000 or 15% of fare, whichever is lower
    const fee = Math.min(1000, Math.round(booking.totalAmount * 0.15));
    const refundAmount = Math.max(0, booking.totalAmount - fee);

    const updatedBooking: Booking = {
      ...booking,
      status: 'cancelled',
      paymentStatus: 'refunded'
    };

    return this.api.updateBooking(updatedBooking).pipe(
      switchMap(() => {
        // Restore seat inventory for the flight
        return this.api.getFlight(booking.flightId).pipe(
          switchMap(flight => {
            const seats = { ...flight.seatsAvailable };
            const cls = booking.class || 'economy';
            seats[cls] = (seats[cls] || 0) + (booking.passengers?.length || 1);
            return this.api.updateFlight({ ...flight, seatsAvailable: seats });
          }),
          map(() => ({
            success: true,
            refundAmount,
            message: `Booking ${booking.pnr} has been cancelled. Refund of ₹${refundAmount.toLocaleString()} initiated (cancellation charge ₹${fee}).`
          })),
          catchError(() => of({
            success: true,
            refundAmount,
            message: `Booking ${booking.pnr} cancelled and refund of ₹${refundAmount.toLocaleString()} initiated.`
          }))
        );
      })
    );
  }
}
