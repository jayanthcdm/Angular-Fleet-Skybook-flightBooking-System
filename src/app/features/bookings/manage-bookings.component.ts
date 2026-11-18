import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../core/services/api.service';
import { BookingService } from '../../core/services/booking.service';
import { BookingStateService } from '../../core/services/booking-state.service';
import { Booking } from '../../core/models/models';

@Component({
  selector: 'app-manage-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="container animate-in">
      <div class="page-header">
        <h1>✈️ Manage Bookings</h1>
        <p>Retrieve, manage, download tickets, or cancel your reservations</p>
      </div>

      <!-- PNR Search Bar -->
      <mat-card class="search-card">
        <div class="search-bar">
          <div class="search-input-wrapper">
            <mat-icon class="search-icon">search</mat-icon>
            <input
              type="text"
              class="form-control search-input"
              placeholder="Enter 8-digit PNR (e.g. SKY7A3B2)"
              [(ngModel)]="searchPnr"
              (keyup.enter)="searchBooking()"
            />
          </div>
          <button
            mat-raised-button
            color="primary"
            class="btn-search"
            (click)="searchBooking()"
            [disabled]="!searchPnr.trim() || searching()"
          >
            @if (searching()) {
              <mat-progress-spinner mode="indeterminate" diameter="18"></mat-progress-spinner>
            } @else {
              <span>Lookup PNR</span>
            }
          </button>
        </div>

        @if (searchError()) {
          <div class="alert alert-danger">
            <mat-icon>warning</mat-icon>
            <span>{{ searchError() }}</span>
          </div>
        }
      </mat-card>

      <!-- Search Result Card -->
      @if (searchResult(); as res) {
        <mat-card class="detail-card animate-in">
          <div class="detail-header">
            <div>
              <h2>PNR: {{ res.pnr }}</h2>
              <span class="booking-date">Booked on {{ res.bookingDate | date:'medium' }}</span>
            </div>
            <div class="status-box">
              <span class="badge" [ngClass]="{
                'badge-success': res.status === 'confirmed',
                'badge-danger': res.status === 'cancelled',
                'badge-warning': res.status === 'pending'
              }">{{ res.status | uppercase }}</span>
              <span class="badge badge-info">{{ res.paymentStatus | uppercase }}</span>
            </div>
          </div>

          <div class="divider"></div>

          <!-- Flight & Route Details -->
          <div class="flight-overview">
            <div class="route-header">
              <span class="airline-text">{{ res.flight?.airline?.logo }} {{ res.flight?.airline?.name }} · {{ res.flight?.flightNumber }}</span>
              <span class="cabin-text">{{ res.class | titlecase }} Class</span>
            </div>
            <div class="route-ports">
              <strong>{{ res.flight?.origin?.code }} ({{ res.flight?.origin?.city }})</strong>
              <span class="arrow">→</span>
              <strong>{{ res.flight?.destination?.code }} ({{ res.flight?.destination?.city }})</strong>
            </div>
            <div class="flight-time">
              📅 {{ res.flight?.departureDate }} · ⏰ {{ res.flight?.departureTime }} – {{ res.flight?.arrivalTime }}
            </div>
          </div>

          <div class="divider"></div>

          <!-- Passengers and Seats -->
          <h4 class="sub-title">Passengers on this Booking</h4>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Passenger</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Seat</th>
                  <th>Contact</th>
                </tr>
              </thead>
              <tbody>
                @for (p of res.passengers; track p.firstName + p.lastName) {
                  <tr>
                    <td><strong>{{ p.firstName }} {{ p.lastName }}</strong></td>
                    <td>{{ p.age }}</td>
                    <td>{{ p.gender | titlecase }}</td>
                    <td><span class="seat-badge">{{ p.seatNumber || 'N/A' }}</span></td>
                    <td>{{ p.email }} · {{ p.phone }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="divider"></div>

          <!-- Actions & Total -->
          <div class="detail-footer">
            <div class="amount-box">
              <span>Total Paid:</span>
              <strong>₹{{ res.totalAmount.toLocaleString() }}</strong>
            </div>

            <div class="action-buttons">
              <button mat-stroked-button color="primary" (click)="viewTicket(res)">
                <mat-icon>receipt</mat-icon>
                <span>View E-Ticket</span>
              </button>

              @if (res.status === 'confirmed') {
                <button mat-raised-button color="warn" (click)="cancelBooking(res)">
                  <mat-icon>cancel</mat-icon>
                  <span>Cancel Booking</span>
                </button>
              }
            </div>
          </div>
        </mat-card>
      }

      <!-- Booking History Table -->
      <div class="history-section">
        <h2 class="section-title">All Reservations History</h2>

        @if (loading()) {
          <div class="card loading-card">
            <mat-progress-spinner mode="indeterminate" diameter="40"></mat-progress-spinner>
            <p>Loading reservations...</p>
          </div>
        } @else if (allBookings().length === 0) {
          <div class="card empty-card">
            <p>No bookings found in database.</p>
          </div>
        } @else {
          <mat-card class="table-card">
            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>PNR</th>
                    <th>Flight</th>
                    <th>Route</th>
                    <th>Date</th>
                    <th>Passengers</th>
                    <th>Class</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (b of allBookings(); track b.id) {
                    <tr>
                      <td><strong>{{ b.pnr }}</strong></td>
                      <td>{{ b.flight?.flightNumber || 'FL-' + b.flightId }}</td>
                      <td>{{ b.flight?.origin?.code || 'DEL' }} → {{ b.flight?.destination?.code || 'BOM' }}</td>
                      <td>{{ b.bookingDate | date:'shortDate' }}</td>
                      <td>
                        {{ b.passengers[0]?.firstName }} {{ b.passengers[0]?.lastName }}
                        @if (b.passengers.length > 1) {
                          <span class="badge badge-info">+{{ b.passengers.length - 1 }}</span>
                        }
                      </td>
                      <td><span class="class-pill">{{ b.class | uppercase }}</span></td>
                      <td><strong>₹{{ b.totalAmount.toLocaleString() }}</strong></td>
                      <td>
                        <span class="badge" [ngClass]="{
                          'badge-success': b.status === 'confirmed',
                          'badge-danger': b.status === 'cancelled',
                          'badge-warning': b.status === 'pending'
                        }">{{ b.status | uppercase }}</span>
                      </td>
                      <td>
                        <div class="btn-group">
                          <button class="btn btn-sm btn-secondary" (click)="viewTicket(b)">View</button>
                          @if (b.status === 'confirmed') {
                            <button class="btn btn-sm btn-danger" (click)="cancelBooking(b)">Cancel</button>
                          }
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </mat-card>
        }
      </div>
    </div>
  `,
  styles: [`
    .search-card {
      padding: 1.5rem !important;
      margin-bottom: 2rem;
      border-radius: 14px !important;
    }

    .search-bar {
      display: flex;
      gap: 1rem;
    }

    .search-input-wrapper {
      position: relative;
      flex: 1;

      .search-icon {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: #94a3b8;
      }

      .search-input {
        padding-left: 2.75rem;
        font-size: 1.05rem;
        text-transform: uppercase;
      }
    }

    .btn-search {
      padding: 0 1.75rem !important;
      border-radius: 10px !important;
      font-weight: 700 !important;
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
      margin-top: 1rem;
    }

    .detail-card {
      padding: 2rem !important;
      margin-bottom: 2.5rem;
      border-radius: 16px !important;
      border-left: 6px solid #0d47a1;
      box-shadow: 0 4px 16px rgba(0,0,0,0.08) !important;
    }

    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h2 {
        font-size: 1.6rem;
        font-weight: 800;
        color: #0d47a1;
        margin-bottom: 2px;
      }

      .booking-date {
        font-size: 0.85rem;
        color: #64748b;
      }

      .status-box {
        display: flex;
        gap: 0.5rem;
      }
    }

    .flight-overview {
      background: #f8fafc;
      padding: 1.25rem;
      border-radius: 12px;

      .route-header {
        display: flex;
        justify-content: space-between;
        font-size: 1rem;
        font-weight: 700;
        color: #1e293b;
      }

      .route-ports {
        font-size: 1.3rem;
        color: #0d47a1;
        margin: 0.35rem 0;

        .arrow {
          margin: 0 0.5rem;
          color: #94a3b8;
        }
      }

      .flight-time {
        font-size: 0.85rem;
        color: #64748b;
      }
    }

    .sub-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 0.75rem;
    }

    .seat-badge {
      background: #e0f2fe;
      color: #0369a1;
      padding: 2px 8px;
      border-radius: 6px;
      font-weight: 800;
    }

    .detail-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;

      .amount-box {
        font-size: 1.1rem;
        color: #64748b;

        strong {
          font-size: 1.6rem;
          color: #0d47a1;
          margin-left: 0.5rem;
        }
      }

      .action-buttons {
        display: flex;
        gap: 0.75rem;
      }
    }

    .history-section {
      margin-top: 2rem;

      .section-title {
        font-size: 1.4rem;
        font-weight: 800;
        color: #1e293b;
        margin-bottom: 1rem;
      }
    }

    .table-card {
      padding: 0 !important;
      border-radius: 14px !important;
      overflow: hidden;
    }

    .class-pill {
      background: #f1f5f9;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 700;
      color: #475569;
    }

    .btn-group {
      display: flex;
      gap: 0.35rem;
    }

    .loading-card, .empty-card {
      text-align: center;
      padding: 3rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
    }
  `]
})
export class ManageBookingsComponent implements OnInit {
  private api = inject(ApiService);
  private bookingService = inject(BookingService);
  private bookingState = inject(BookingStateService);
  private router = inject(Router);

  searchPnr = '';
  searching = signal(false);
  searchError = signal<string | null>(null);
  searchResult = signal<Booking | null>(null);

  loading = signal(true);
  allBookings = signal<Booking[]>([]);

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.api.getBookingsWithFlights().subscribe({
      next: (list) => {
        this.allBookings.set(list.reverse());
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  searchBooking(): void {
    const code = this.searchPnr.trim().toUpperCase();
    if (!code) return;

    this.searching.set(true);
    this.searchError.set(null);
    this.searchResult.set(null);

    this.bookingService.getBookingByPnr(code).subscribe({
      next: (b) => {
        this.searching.set(false);
        if (b) {
          this.searchResult.set(b);
        } else {
          this.searchError.set(`No reservation found with PNR "${code}". Please check your reference code.`);
        }
      },
      error: (err) => {
        this.searching.set(false);
        this.searchError.set('Failed to lookup PNR. Please check connectivity.');
      }
    });
  }

  viewTicket(b: Booking): void {
    this.bookingState.currentBooking.set(b);
    this.router.navigate(['/confirmation'], { queryParams: { pnr: b.pnr } });
  }

  cancelBooking(b: Booking): void {
    if (!confirm(`Are you sure you want to cancel booking ${b.pnr}? A standard cancellation fee will be deducted and the remaining fare refunded.`)) {
      return;
    }

    this.bookingService.cancelBooking(b).subscribe({
      next: (res) => {
        alert(res.message);
        // Refresh view
        this.loadHistory();
        if (this.searchResult()?.id === b.id) {
          this.searchResult.set({
            ...b,
            status: 'cancelled',
            paymentStatus: 'refunded'
          });
        }
      },
      error: () => alert('Failed to cancel booking. Please try again.')
    });
  }
}
