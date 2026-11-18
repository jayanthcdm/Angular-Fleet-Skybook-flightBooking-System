import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BookingStateService } from '../../core/services/booking-state.service';
import { PaymentService } from '../../core/services/payment.service';
import { BookingService } from '../../core/services/booking.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="container animate-in">
      <div class="page-header">
        <h1>💳 Payment & Checkout</h1>
        <p>Review booking summary, fare breakdown, and complete secure simulated payment</p>
      </div>

      @if (state.selectedFlight(); as flight) {
        <div class="payment-layout">
          <!-- Left: Booking Summary & Itemized Fares -->
          <div class="summary-section">
            <mat-card class="summary-card">
              <h3 class="section-title">
                <mat-icon>flight_takeoff</mat-icon> Flight Summary
              </h3>

              <div class="flight-summary-grid">
                <div class="info-item">
                  <span class="label">Flight</span>
                  <span class="value">{{ flight.flightNumber }} ({{ flight.aircraft }})</span>
                </div>
                <div class="info-item">
                  <span class="label">Route</span>
                  <span class="value">{{ flight.origin?.code }} ({{ flight.origin?.city }}) → {{ flight.destination?.code }} ({{ flight.destination?.city }})</span>
                </div>
                <div class="info-item">
                  <span class="label">Departure</span>
                  <span class="value">{{ flight.departureDate }} at {{ flight.departureTime }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Cabin Class</span>
                  <span class="value capitalize">{{ state.searchCriteria().class }}</span>
                </div>
              </div>

              <div class="divider"></div>

              <h4 class="sub-title">Passengers & Assigned Seats</h4>
              <div class="passenger-list">
                @for (p of state.passengers(); track $index) {
                  <div class="passenger-row">
                    <span class="passenger-name">👤 {{ p.firstName }} {{ p.lastName }} ({{ p.age }}y, {{ p.gender }})</span>
                    <span class="seat-badge">{{ p.seatNumber || state.selectedSeats()[$index] || '12A' }}</span>
                  </div>
                }
              </div>

              <div class="divider"></div>

              <h4 class="sub-title">Itemized Fare Breakdown (INR)</h4>
              <div class="fare-breakdown">
                <div class="fare-row">
                  <span>Base Fare ({{ state.searchCriteria().class | titlecase }} × {{ state.passengerCount() }})</span>
                  <span>₹{{ state.totalBaseFare().toLocaleString() }}</span>
                </div>
                @if (state.seatCharges() > 0) {
                  <div class="fare-row">
                    <span>Seat Selection & Upgrades</span>
                    <span>₹{{ state.seatCharges().toLocaleString() }}</span>
                  </div>
                }
                <div class="fare-row">
                  <span>GST & Aviation Taxes (12%)</span>
                  <span>₹{{ state.taxes().toLocaleString() }}</span>
                </div>
                <div class="fare-row">
                  <span>Convenience & Airport Fees</span>
                  <span>₹{{ state.fees().toLocaleString() }}</span>
                </div>
                <div class="fare-row total-row">
                  <span>Total Payable Amount</span>
                  <span>₹{{ state.totalAmount().toLocaleString() }}</span>
                </div>
              </div>
            </mat-card>
          </div>

          <!-- Right: Simulated Payment Form -->
          <div class="payment-section">
            <mat-card class="payment-card">
              <h3 class="section-title">
                <mat-icon>credit_card</mat-icon> Simulated Card Payment
              </h3>

              <div class="sim-notice">
                <mat-icon>info</mat-icon>
                <span><strong>Simulated Environment:</strong> No real bank charges. Use any demo card (or end in 0000 to test card decline).</span>
              </div>

              @if (errorMessage()) {
                <div class="alert alert-danger">
                  <mat-icon>error</mat-icon>
                  <span>{{ errorMessage() }}</span>
                </div>
              }

              <form [formGroup]="paymentForm" (ngSubmit)="processPayment()">
                <div class="form-group">
                  <label for="cardNum">Card Number *</label>
                  <input
                    id="cardNum"
                    type="text"
                    class="form-control"
                    formControlName="cardNumber"
                    placeholder="4532 1122 3344 5566"
                    maxlength="19"
                    (input)="formatCardNumber($event)"
                  />
                  @if (isFieldInvalid('cardNumber')) {
                    <span class="error-message">Valid 16-digit card number required</span>
                  }
                </div>

                <div class="form-group">
                  <label for="cardHolder">Cardholder Name *</label>
                  <input
                    id="cardHolder"
                    type="text"
                    class="form-control"
                    formControlName="cardHolder"
                    placeholder="e.g. Rahul Sharma"
                  />
                  @if (isFieldInvalid('cardHolder')) {
                    <span class="error-message">Cardholder name is required</span>
                  }
                </div>

                <div class="grid-2">
                  <div class="form-group">
                    <label for="expiry">Expiry (MM/YY) *</label>
                    <input
                      id="expiry"
                      type="text"
                      class="form-control"
                      formControlName="expiry"
                      placeholder="MM/YY"
                      maxlength="5"
                    />
                    @if (isFieldInvalid('expiry')) {
                      <span class="error-message">Format MM/YY required</span>
                    }
                  </div>

                  <div class="form-group">
                    <label for="cvv">CVV *</label>
                    <input
                      id="cvv"
                      type="password"
                      class="form-control"
                      formControlName="cvv"
                      placeholder="•••"
                      maxlength="4"
                    />
                    @if (isFieldInvalid('cvv')) {
                      <span class="error-message">3 or 4 digits required</span>
                    }
                  </div>
                </div>

                <div class="security-badge">
                  <mat-icon>lock</mat-icon>
                  <span>End-to-end 256-bit encrypted simulated gateway</span>
                </div>

                <div class="payment-actions">
                  <button type="button" class="btn btn-secondary" (click)="goBack()" [disabled]="processing()">
                    ← Back to Seats
                  </button>
                  <button
                    mat-raised-button
                    color="primary"
                    type="submit"
                    class="btn-pay"
                    [disabled]="paymentForm.invalid || processing()"
                  >
                    @if (processing()) {
                      <mat-progress-spinner mode="indeterminate" diameter="20"></mat-progress-spinner>
                      <span>Authorizing...</span>
                    } @else {
                      <span>Pay ₹{{ state.totalAmount().toLocaleString() }}</span>
                    }
                  </button>
                </div>
              </form>
            </mat-card>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .payment-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      align-items: start;
    }

    .summary-card, .payment-card {
      padding: 2rem !important;
      border-radius: 16px !important;
      box-shadow: 0 4px 16px rgba(0,0,0,0.06) !important;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.25rem;
      font-weight: 800;
      color: #0d47a1;
      margin-bottom: 1.25rem;

      mat-icon {
        color: #0d47a1;
      }
    }

    .flight-summary-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 2px;

      .label {
        font-size: 0.75rem;
        color: #64748b;
        text-transform: uppercase;
        font-weight: 700;
      }

      .value {
        font-size: 0.95rem;
        font-weight: 700;
        color: #1e293b;
      }
    }

    .sub-title {
      font-size: 0.95rem;
      font-weight: 700;
      color: #334155;
      margin-bottom: 0.75rem;
    }

    .passenger-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      font-size: 0.9rem;
    }

    .seat-badge {
      background: #e0f2fe;
      color: #0369a1;
      padding: 3px 10px;
      border-radius: 6px;
      font-weight: 800;
      font-size: 0.85rem;
    }

    .fare-breakdown {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }

    .fare-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.9rem;
      color: #475569;

      &.total-row {
        margin-top: 0.5rem;
        padding-top: 0.75rem;
        border-top: 2px solid #0d47a1;
        font-size: 1.25rem;
        font-weight: 800;
        color: #0d47a1;
      }
    }

    .sim-notice {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #1e40af;
      padding: 0.75rem 1rem;
      border-radius: 10px;
      font-size: 0.85rem;
      margin-bottom: 1.5rem;

      mat-icon {
        font-size: 1.2rem;
        width: 1.2rem;
        height: 1.2rem;
      }
    }

    .alert-danger {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #fee2e2;
      border: 1px solid #fca5a5;
      color: #991b1b;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-size: 0.85rem;
      margin-bottom: 1rem;
    }

    .security-badge {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      color: #16a34a;
      font-size: 0.8rem;
      font-weight: 600;
      margin: 1.25rem 0;

      mat-icon {
        font-size: 1.1rem;
        width: 1.1rem;
        height: 1.1rem;
      }
    }

    .payment-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1.5rem;
    }

    .btn-pay {
      padding: 0.75rem 2rem !important;
      font-size: 1rem !important;
      font-weight: 700 !important;
      border-radius: 50px !important;
      background: linear-gradient(135deg, #2e7d32, #43a047) !important;
      color: white !important;
      display: inline-flex !important;
      align-items: center !important;
      gap: 0.5rem !important;
    }

    @media (max-width: 850px) {
      .payment-layout {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PaymentComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  readonly state = inject(BookingStateService);
  private paymentService = inject(PaymentService);
  private bookingService = inject(BookingService);

  paymentForm!: FormGroup;
  processing = signal(false);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    if (!this.state.selectedFlight()) {
      this.router.navigate(['/search']);
      return;
    }
    if (!this.state.passengers().length) {
      this.router.navigate(['/passengers']);
      return;
    }

    this.paymentForm = this.fb.group({
      cardNumber: ['4532 8912 3456 7890', [Validators.required, Validators.pattern(/^[0-9\s]{16,19}$/)]],
      cardHolder: ['Rahul Sharma', [Validators.required, Validators.minLength(3)]],
      expiry: ['12/28', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/)]],
      cvv: ['789', [Validators.required, Validators.pattern(/^[0-9]{3,4}$/)]]
    });
  }

  isFieldInvalid(field: string): boolean {
    const ctrl = this.paymentForm.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  formatCardNumber(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    value = value.match(/.{1,4}/g)?.join(' ') || value;
    input.value = value;
    this.paymentForm.get('cardNumber')?.setValue(value, { emitEvent: false });
  }

  goBack(): void {
    this.router.navigate(['/seats']);
  }

  processPayment(): void {
    if (this.paymentForm.invalid || this.processing()) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    this.processing.set(true);
    this.errorMessage.set(null);

    const val = this.paymentForm.value;
    const flight = this.state.selectedFlight()!;
    const passengers = this.state.passengers();
    const cabinClass = this.state.searchCriteria().class;
    const fare = {
      total: this.state.totalAmount(),
      baseFare: this.state.totalBaseFare() + this.state.seatCharges(),
      taxes: this.state.taxes(),
      fees: this.state.fees()
    };

    this.paymentService.processPayment({
      bookingId: 0,
      amount: fare.total,
      cardNumber: val.cardNumber,
      cardHolder: val.cardHolder,
      expiry: val.expiry,
      cvv: val.cvv
    }).subscribe({
      next: (paymentRes) => {
        if (!paymentRes.success) {
          this.processing.set(false);
          this.errorMessage.set(paymentRes.message || 'Payment was declined.');
          return;
        }

        // Create booking in database
        this.bookingService.createBooking(flight, passengers, cabinClass, fare, paymentRes.transactionId)
          .subscribe({
            next: (createdBooking) => {
              this.processing.set(false);
              this.state.currentBooking.set(createdBooking);
              // Save last PNR to localStorage for page-reload persistence
              localStorage.setItem('skybook_last_pnr', createdBooking.pnr);
              this.router.navigate(['/confirmation'], { queryParams: { pnr: createdBooking.pnr } });
            },
            error: (err) => {
              this.processing.set(false);
              this.errorMessage.set('Failed to save booking. Please try again.');
              console.error('Booking creation error:', err);
            }
          });
      },
      error: (err) => {
        this.processing.set(false);
        this.errorMessage.set(err.message || 'Payment simulation failed.');
      }
    });
  }
}
