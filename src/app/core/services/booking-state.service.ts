import { Injectable, signal, computed, inject } from '@angular/core';
import { SearchCriteria, Flight, Passenger, Booking, SeatMap } from '../models/models';
import { FareCalculationService } from './fare-calculation.service';

@Injectable({ providedIn: 'root' })
export class BookingStateService {
  private fareCalculator = inject(FareCalculationService);

  // Search state
  readonly searchCriteria = signal<SearchCriteria>({
    originId: null,
    destinationId: null,
    departureDate: '',
    returnDate: '',
    tripType: 'one-way',
    passengers: 1,
    class: 'economy'
  });

  // Selected outbound & return flight
  readonly selectedFlight = signal<Flight | null>(null);
  readonly selectedReturnFlight = signal<Flight | null>(null);

  // Passengers
  readonly passengers = signal<Passenger[]>([]);

  // Selected seats and aircraft seat map
  readonly selectedSeats = signal<string[]>([]);
  readonly currentSeatMap = signal<SeatMap | null>(null);

  // Completed booking reference
  readonly currentBooking = signal<Booking | null>(null);

  // Computed passenger count
  readonly passengerCount = computed(() => Math.max(this.searchCriteria().passengers, 1));

  // Centralized computed fare breakdown
  readonly fareBreakdown = computed(() => {
    return this.fareCalculator.calculateFare(
      this.selectedFlight(),
      this.selectedReturnFlight(),
      this.passengerCount(),
      this.searchCriteria().class,
      this.selectedSeats(),
      this.currentSeatMap()
    );
  });

  readonly totalBaseFare = computed(() => this.fareBreakdown().baseFare);
  readonly seatCharges = computed(() => this.fareBreakdown().seatCharges);
  readonly taxes = computed(() => this.fareBreakdown().taxes);
  readonly fees = computed(() => this.fareBreakdown().fees);
  readonly totalAmount = computed(() => this.fareBreakdown().total);

  reset(): void {
    this.searchCriteria.set({
      originId: null,
      destinationId: null,
      departureDate: '',
      returnDate: '',
      tripType: 'one-way',
      passengers: 1,
      class: 'economy'
    });
    this.selectedFlight.set(null);
    this.selectedReturnFlight.set(null);
    this.passengers.set([]);
    this.selectedSeats.set([]);
    this.currentSeatMap.set(null);
    this.currentBooking.set(null);
  }

  generatePNR(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let pnr = 'SKY';
    for (let i = 0; i < 5; i++) {
      pnr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pnr;
  }
}
