import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BookingStateService } from '../../core/services/booking-state.service';
import { BookingService } from '../../core/services/booking.service';
import { Booking } from '../../core/models/models';

@Component({
  selector: 'app-booking-confirmation',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="container animate-in">
      @if (loading()) {
        <div class="card loading-card">
          <mat-progress-spinner mode="indeterminate" diameter="48"></mat-progress-spinner>
          <p>Retrieving your confirmed ticket...</p>
        </div>
      } @else if (booking(); as b) {
        <!-- Success Banner -->
        <div class="success-banner no-print">
          <div class="success-icon-wrapper">
            <mat-icon>check_circle</mat-icon>
          </div>
          <h1>Booking Confirmed!</h1>
          <p>Your electronic ticket has been issued and confirmed with the airline.</p>
        </div>

        <!-- PNR Reference Box -->
        <div class="pnr-box">
          <span class="pnr-label">Booking Reference (PNR)</span>
          <span class="pnr-code">{{ b.pnr }}</span>
          <span class="pnr-hint">Keep this code handy for web check-in and managing your booking</span>
        </div>

        <!-- Boarding Pass / E-Ticket -->
        <mat-card class="ticket-card printable-ticket">
          <!-- Ticket Header -->
          <div class="ticket-header">
            <div class="ticket-brand">
              <mat-icon class="brand-plane">flight_takeoff</mat-icon>
              <span>SkyBook Boarding Pass</span>
            </div>
            <div class="ticket-meta">
              <span class="badge badge-success">CONFIRMED</span>
              <span class="badge badge-info">{{ b.class | uppercase }} CLASS</span>
            </div>
          </div>

          <div class="ticket-body">
            <!-- Flight Overview -->
            <div class="route-display">
              <div class="route-endpoint">
                <span class="airport-code">{{ b.flight?.origin?.code || 'DEL' }}</span>
                <span class="city">{{ b.flight?.origin?.city || 'Delhi' }}</span>
                <span class="time">{{ b.flight?.departureTime || '08:00' }}</span>
              </div>

              <div class="route-path">
                <span class="flight-no">{{ b.flight?.flightNumber || 'AI-101' }}</span>
                <div class="flight-line">
                  <div class="dot"></div>
                  <div class="dash"></div>
                  <mat-icon>flight</mat-icon>
                  <div class="dash"></div>
                  <div class="dot"></div>
                </div>
                <span class="duration">{{ b.flight?.duration || '2h 15m' }} · Non-stop</span>
              </div>

              <div class="route-endpoint">
                <span class="airport-code">{{ b.flight?.destination?.code || 'BOM' }}</span>
                <span class="city">{{ b.flight?.destination?.city || 'Mumbai' }}</span>
                <span class="time">{{ b.flight?.arrivalTime || '10:15' }}</span>
              </div>
            </div>

            <div class="divider"></div>

            <!-- Passengers & Seats Table -->
            <h4 class="section-title">Passenger Details & Assigned Seats</h4>
            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>Passenger Name</th>
                    <th>Age / Gender</th>
                    <th>Seat Number</th>
                    <th>Contact Phone</th>
                    <th>Cabin Class</th>
                  </tr>
                </thead>
                <tbody>
                  @for (p of b.passengers; track p.firstName + p.lastName) {
                    <tr>
                      <td><strong>{{ p.firstName }} {{ p.lastName }}</strong></td>
                      <td>{{ p.age }} yrs / {{ p.gender | titlecase }}</td>
                      <td>
                        <span class="seat-pill">{{ p.seatNumber || '12A' }}</span>
                      </td>
                      <td>{{ p.phone }}</td>
                      <td>{{ b.class | titlecase }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <div class="divider"></div>

            <!-- Fare & Payment Summary -->
            <div class="fare-summary-grid">
              <div>
                <h4 class="section-title">Payment Information</h4>
                <div class="payment-details">
                  <div>Status: <strong class="text-success">Paid in Full</strong></div>
                  <div>Payment ID: <code>{{ b.paymentId || 'TXN-SIMULATED' }}</code></div>
                  <div>Date: {{ b.bookingDate | date:'medium' }}</div>
                </div>
              </div>

              <div class="fare-total-box">
                <div class="fare-line"><span>Base Fare:</span> <span>₹{{ b.baseFare.toLocaleString() }}</span></div>
                <div class="fare-line"><span>Taxes & GST:</span> <span>₹{{ b.taxes.toLocaleString() }}</span></div>
                <div class="fare-line"><span>Fees:</span> <span>₹{{ b.fees.toLocaleString() }}</span></div>
                <div class="fare-line grand-total">
                  <span>Total Paid:</span>
                  <span>₹{{ b.totalAmount.toLocaleString() }}</span>
                </div>
              </div>
            </div>

            <!-- Barcode decoration for realistic e-ticket -->
            <div class="barcode-container">
              <div class="fake-barcode"></div>
              <span class="barcode-number">*{{ b.pnr }}*</span>
            </div>
          </div>
        </mat-card>

        <!-- Actions -->
        <div class="ticket-actions no-print">
          <button mat-stroked-button color="primary" (click)="printTicket()">
            <mat-icon>print</mat-icon>
            <span>Print E-Ticket</span>
          </button>
          <a routerLink="/bookings" mat-stroked-button>
            <mat-icon>list_alt</mat-icon>
            <span>Manage All Bookings</span>
          </a>
          <button mat-raised-button color="primary" (click)="bookAnother()">
            <mat-icon>add</mat-icon>
            <span>Book Another Flight</span>
          </button>
        </div>
      } @else {
        <div class="card empty-card">
          <mat-icon class="large-icon">error_outline</mat-icon>
          <h3>Booking Not Found</h3>
          <p>We could not find the requested booking reference.</p>
          <a routerLink="/bookings" mat-raised-button color="primary">Go to My Bookings</a>
        </div>
      }
    </div>
  `,
  styles: [`
    .success-banner {
      text-align: center;
      margin: 1.5rem 0 2rem;

      .success-icon-wrapper {
        mat-icon {
          font-size: 4rem;
          width: 4rem;
          height: 4rem;
          color: #2e7d32;
        }
      }

      h1 {
        font-size: 2.2rem;
        font-weight: 800;
        color: #1e293b;
        margin: 0.5rem 0 0.25rem;
      }

      p {
        font-size: 1rem;
        color: #64748b;
      }
    }

    .pnr-box {
      max-width: 520px;
      margin: 0 auto 2rem;
      background: linear-gradient(135deg, #eff6ff, #dbeafe);
      border: 2px dashed #0d47a1;
      border-radius: 16px;
      padding: 1.5rem 2rem;
      text-align: center;

      .pnr-label {
        display: block;
        font-size: 0.85rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #475569;
        margin-bottom: 0.35rem;
      }

      .pnr-code {
        display: block;
        font-size: 2.6rem;
        font-weight: 800;
        color: #0d47a1;
        letter-spacing: 0.15em;
        font-family: monospace;
      }

      .pnr-hint {
        display: block;
        font-size: 0.8rem;
        color: #64748b;
        margin-top: 0.35rem;
      }
    }

    .ticket-card {
      max-width: 860px;
      margin: 0 auto 2.5rem;
      border-radius: 16px !important;
      padding: 0 !important;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08) !important;
      background: white !important;
    }

    .ticket-header {
      background: linear-gradient(135deg, #0d47a1, #1565c0);
      color: white;
      padding: 1.25rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .ticket-brand {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 800;
        font-size: 1.2rem;
      }

      .ticket-meta {
        display: flex;
        gap: 0.5rem;
      }
    }

    .ticket-body {
      padding: 2rem;
    }

    .route-display {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;
    }

    .route-endpoint {
      display: flex;
      flex-direction: column;

      .airport-code {
        font-size: 2.2rem;
        font-weight: 800;
        color: #0d47a1;
        line-height: 1.1;
      }

      .city {
        font-size: 0.95rem;
        font-weight: 700;
        color: #334155;
      }

      .time {
        font-size: 0.9rem;
        color: #64748b;
        margin-top: 2px;
      }
    }

    .route-path {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.35rem;

      .flight-no {
        font-size: 0.9rem;
        font-weight: 700;
        color: #0d47a1;
      }

      .flight-line {
        display: flex;
        align-items: center;
        gap: 0.35rem;

        .dot {
          width: 8px;
          height: 8px;
          background: #0d47a1;
          border-radius: 50%;
        }

        .dash {
          width: 50px;
          height: 2px;
          background: #cbd5e1;
        }

        mat-icon {
          color: #0d47a1;
        }
      }

      .duration {
        font-size: 0.8rem;
        color: #64748b;
      }
    }

    .section-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 0.75rem;
    }

    .seat-pill {
      background: #e0f2fe;
      color: #0369a1;
      padding: 2px 8px;
      border-radius: 6px;
      font-weight: 800;
    }

    .fare-summary-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      align-items: center;
    }

    .payment-details {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      font-size: 0.9rem;
      color: #475569;
    }

    .fare-total-box {
      background: #f8fafc;
      padding: 1.25rem;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;

      .fare-line {
        display: flex;
        justify-content: space-between;
        font-size: 0.9rem;
        color: #64748b;

        &.grand-total {
          border-top: 2px solid #0d47a1;
          padding-top: 0.5rem;
          margin-top: 0.25rem;
          font-size: 1.25rem;
          font-weight: 800;
          color: #0d47a1;
        }
      }
    }

    .barcode-container {
      margin-top: 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.35rem;

      .fake-barcode {
        width: 220px;
        height: 36px;
        background: repeating-linear-gradient(
          to right,
          #000,
          #000 2px,
          #fff 2px,
          #fff 4px,
          #000 4px,
          #000 7px,
          #fff 7px,
          #fff 9px
        );
      }

      .barcode-number {
        font-family: monospace;
        font-size: 0.85rem;
        letter-spacing: 0.2em;
        color: #64748b;
      }
    }

    .ticket-actions {
      display: flex;
      justify-content: center;
      gap: 1rem;
      flex-wrap: wrap;
      margin-bottom: 3rem;
    }

    .loading-card, .empty-card {
      text-align: center;
      padding: 3.5rem 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .large-icon {
      font-size: 3.5rem;
      width: 3.5rem;
      height: 3.5rem;
      color: #ef4444;
    }

    @media print {
      .no-print {
        display: none !important;
      }

      .ticket-card {
        box-shadow: none !important;
        border: 1px solid #ccc !important;
      }
    }
  `]
})
export class BookingConfirmationComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private bookingState = inject(BookingStateService);
  private bookingService = inject(BookingService);

  booking = signal<Booking | null>(null);
  loading = signal(true);

  ngOnInit(): void {
    // 1. Check in-memory booking state
    const current = this.bookingState.currentBooking();
    if (current) {
      this.booking.set(current);
      this.loading.set(false);
      return;
    }

    // 2. Check query param PNR or localStorage
    const pnr = this.route.snapshot.queryParams['pnr'] || localStorage.getItem('skybook_last_pnr');
    if (pnr) {
      this.bookingService.getBookingByPnr(pnr).subscribe({
        next: (found) => {
          if (found) {
            this.booking.set(found);
            this.bookingState.currentBooking.set(found);
          }
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    } else {
      this.loading.set(false);
    }
  }

  printTicket(): void {
    window.print();
  }

  bookAnother(): void {
    this.bookingState.reset();
    localStorage.removeItem('skybook_last_pnr');
    this.router.navigate(['/search']);
  }
}
