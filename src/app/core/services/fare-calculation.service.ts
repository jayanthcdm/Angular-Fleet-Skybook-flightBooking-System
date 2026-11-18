import { Injectable } from '@angular/core';
import { Flight, CabinClass, FareBreakdown, SeatMap } from '../models/models';

@Injectable({ providedIn: 'root' })
export class FareCalculationService {
  private readonly TAX_RATE = 0.12; // 12% GST
  private readonly SERVICE_FEE_PER_PASSENGER = 150; // ₹150 convenience fee per passenger

  /**
   * Calculates comprehensive fare breakdown
   */
  calculateFare(
    outboundFlight: Flight | null,
    returnFlight: Flight | null,
    passengerCount: number,
    cabinClass: CabinClass,
    selectedSeats: string[],
    seatMap: SeatMap | null
  ): FareBreakdown {
    if (!outboundFlight) {
      return {
        baseFare: 0,
        seatCharges: 0,
        taxes: 0,
        fees: 0,
        total: 0,
        perPassenger: 0,
        currency: 'INR'
      };
    }

    const outboundPrice = outboundFlight.prices[cabinClass] || outboundFlight.prices.economy;
    const returnPrice = returnFlight ? (returnFlight.prices[cabinClass] || returnFlight.prices.economy) : 0;
    const baseFare = (outboundPrice + returnPrice) * Math.max(passengerCount, 1);

    // Calculate seat upgrade / premium charges
    let seatCharges = 0;
    if (seatMap && selectedSeats.length > 0) {
      selectedSeats.forEach(seat => {
        const row = parseInt(seat, 10);
        if (!isNaN(row)) {
          if (seatMap.firstClass?.rows?.includes(row)) {
            seatCharges += seatMap.firstClass.price || 0;
          } else if (seatMap.business?.rows?.includes(row)) {
            seatCharges += seatMap.business.price || 0;
          } else if (seatMap.extraLegroom?.includes(row)) {
            seatCharges += 300; // Extra legroom seat fee
          }
        }
      });
    }

    const subtotal = baseFare + seatCharges;
    const taxes = Math.round(subtotal * this.TAX_RATE);
    const fees = this.SERVICE_FEE_PER_PASSENGER * Math.max(passengerCount, 1);
    const total = subtotal + taxes + fees;
    const perPassenger = Math.round(total / Math.max(passengerCount, 1));

    return {
      baseFare,
      seatCharges,
      taxes,
      fees,
      total,
      perPassenger,
      currency: 'INR'
    };
  }
}
