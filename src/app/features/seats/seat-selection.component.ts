import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BookingStateService } from '../../core/services/booking-state.service';
import { ApiService } from '../../core/services/api.service';
import { SeatMap } from '../../core/models/models';

@Component({
  selector: 'app-seat-selection',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="container animate-in">
      <div class="page-header">
        <h1>💺 Select Your Seats</h1>
        <p>
          Aircraft: <strong>{{ flight()?.aircraft }}</strong> ·
          Select {{ requiredSeats }} seat{{ requiredSeats > 1 ? 's' : '' }} for your journey
        </p>
      </div>

      @if (loading()) {
        <div class="card loading-card">
          <mat-progress-spinner mode="indeterminate" diameter="48"></mat-progress-spinner>
          <p>Loading interactive cabin seat map...</p>
        </div>
      }

      @if (!loading() && seatMap()) {
        <!-- Status Bar -->
        <mat-card class="selection-status-card">
          <div class="selection-info">
            <span class="selection-count">
              Selected: <strong>{{ selectedSeats().length }}</strong> / {{ requiredSeats }} seats
            </span>
            @if (selectedSeats().length > 0) {
              <span class="seat-tags">
                @for (seat of selectedSeats(); track seat) {
                  <span class="seat-badge">{{ seat }}</span>
                }
              </span>
            }
          </div>

          <div class="selection-cost">
            <span>Seat Upgrade Charges:</span>
            <strong>₹{{ seatCostTotal().toLocaleString() }}</strong>
          </div>
        </mat-card>

        <!-- Legend -->
        <div class="card legend-card">
          <div class="legend-item">
            <span class="legend-box legend-box--available"></span>
            <span>Economy (Included)</span>
          </div>
          <div class="legend-item">
            <span class="legend-box legend-box--business"></span>
            <span>Business (+₹{{ seatMap()!.business.price }})</span>
          </div>
          @if (seatMap()!.firstClass.rows.length) {
            <div class="legend-item">
              <span class="legend-box legend-box--first"></span>
              <span>First (+₹{{ seatMap()!.firstClass.price }})</span>
            </div>
          }
          <div class="legend-item">
            <span class="legend-box legend-box--legroom"></span>
            <span>Extra Legroom (+₹300)</span>
          </div>
          <div class="legend-item">
            <span class="legend-box legend-box--selected"></span>
            <span>Selected</span>
          </div>
          <div class="legend-item">
            <span class="legend-box legend-box--occupied"></span>
            <span>Occupied</span>
          </div>
        </div>

        <!-- Fuselage / Airplane Seat Grid -->
        <div class="airplane-container">
          <div class="airplane-nose">
            <div class="cockpit-window"></div>
          </div>

          <div class="airplane-body card">
            <div class="seat-grid">
              <!-- Column Letters Header -->
              <div class="seat-grid-row header-row">
                <span class="row-num-spacer"></span>
                @for (letter of seatLetters(); track $index) {
                  @if (letter === '|') {
                    <span class="aisle-spacer">Aisle</span>
                  } @else {
                    <span class="col-letter">{{ letter }}</span>
                  }
                }
              </div>

              <!-- Seat Rows -->
              @for (row of seatRows(); track row) {
                <div class="seat-grid-row" [class.exit-row]="isExtraLegroom(row)">
                  <span class="row-number">{{ row }}</span>

                  @for (letter of seatLetters(); track $index) {
                    @if (letter === '|') {
                      <span class="aisle-spacer"></span>
                    } @else {
                      <button
                        type="button"
                        class="seat-btn"
                        [class.seat--occupied]="isSeatOccupied(row, letter)"
                        [class.seat--selected]="isSeatSelected(row, letter)"
                        [class.seat--first]="isFirstClass(row) && !isSeatOccupied(row, letter) && !isSeatSelected(row, letter)"
                        [class.seat--business]="isBusiness(row) && !isSeatOccupied(row, letter) && !isSeatSelected(row, letter)"
                        [class.seat--legroom]="isExtraLegroom(row) && !isFirstClass(row) && !isBusiness(row) && !isSeatOccupied(row, letter) && !isSeatSelected(row, letter)"
                        [class.seat--available]="isEconomy(row) && !isExtraLegroom(row) && !isSeatOccupied(row, letter) && !isSeatSelected(row, letter)"
                        [disabled]="isSeatOccupied(row, letter)"
                        (click)="toggleSeat(row, letter)"
                        [attr.title]="getSeatTooltip(row, letter)"
                      >
                        {{ letter }}
                      </button>
                    }
                  }
                </div>
              }
            </div>
          </div>

          <div class="airplane-tail"></div>
        </div>

        <!-- Navigation Actions -->
        <div class="actions-row">
          <button type="button" class="btn btn-secondary" (click)="goBack()">
            ← Back to Passengers
          </button>
          <button
            mat-raised-button
            color="primary"
            class="btn-continue"
            [disabled]="selectedSeats().length !== requiredSeats"
            (click)="onContinue()"
          >
            <span>Continue to Payment →</span>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .selection-status-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 2rem !important;
      margin-bottom: 1.25rem;
      border-radius: 14px !important;
      background: white !important;
      box-shadow: 0 2px 10px rgba(0,0,0,0.06) !important;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .selection-info {
      display: flex;
      align-items: center;
      gap: 1rem;
      font-size: 1.05rem;
    }

    .seat-tags {
      display: flex;
      gap: 0.5rem;
    }

    .seat-badge {
      background: #0d47a1;
      color: white;
      padding: 0.3rem 0.75rem;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.9rem;
    }

    .selection-cost {
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
      font-size: 1.1rem;

      strong {
        color: #2e7d32;
        font-size: 1.3rem;
      }
    }

    .legend-card {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 1.5rem;
      padding: 1rem 1.5rem;
      margin-bottom: 2rem;
      border-radius: 12px;
      font-size: 0.85rem;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .legend-box {
      width: 22px;
      height: 22px;
      border-radius: 6px;
      border: 1px solid rgba(0,0,0,0.15);

      &--available { background: #e8f5e9; border-color: #4caf50; }
      &--business { background: #ede7f6; border-color: #7e57c2; }
      &--first { background: #fff8e1; border-color: #ffa000; }
      &--legroom { background: #e0f2fe; border: 2px dashed #0284c7; }
      &--selected { background: #0d47a1; border-color: #0d47a1; }
      &--occupied { background: #fee2e2; border-color: #ef4444; }
    }

    .airplane-container {
      max-width: 580px;
      margin: 0 auto 2.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .airplane-nose {
      width: 260px;
      height: 70px;
      background: #e2e8f0;
      border-radius: 130px 130px 0 0;
      border: 3px solid #cbd5e1;
      border-bottom: none;
      display: flex;
      justify-content: center;
      align-items: center;

      .cockpit-window {
        width: 80px;
        height: 18px;
        background: #475569;
        border-radius: 20px 20px 0 0;
      }
    }

    .airplane-body {
      width: 100%;
      background: white;
      border: 3px solid #cbd5e1;
      border-top: none;
      border-bottom: none;
      border-radius: 0;
      padding: 1.5rem 1rem;
      overflow-x: auto;
    }

    .airplane-tail {
      width: 220px;
      height: 40px;
      background: #e2e8f0;
      border-radius: 0 0 110px 110px;
      border: 3px solid #cbd5e1;
      border-top: none;
    }

    .seat-grid {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      align-items: center;
    }

    .seat-grid-row {
      display: flex;
      align-items: center;
      gap: 0.35rem;

      &.exit-row {
        background: rgba(2, 132, 199, 0.05);
        padding: 4px 6px;
        border-radius: 8px;
      }
    }

    .row-num-spacer, .row-number {
      width: 28px;
      text-align: right;
      font-size: 0.8rem;
      font-weight: 700;
      color: #64748b;
      margin-right: 4px;
    }

    .col-letter {
      width: 36px;
      text-align: center;
      font-size: 0.85rem;
      font-weight: 700;
      color: #475569;
    }

    .aisle-spacer {
      width: 28px;
      text-align: center;
      font-size: 0.65rem;
      color: #94a3b8;
    }

    .seat-btn {
      width: 36px;
      height: 38px;
      border-radius: 8px;
      border: 1.5px solid transparent;
      font-family: inherit;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;

      &:hover:not(:disabled) {
        transform: scale(1.08);
      }

      &.seat--available {
        background: #e8f5e9;
        border-color: #81c784;
        color: #2e7d32;
      }

      &.seat--business {
        background: #ede7f6;
        border-color: #b39ddb;
        color: #5e35b1;
      }

      &.seat--first {
        background: #fff8e1;
        border-color: #ffe082;
        color: #f57f17;
      }

      &.seat--legroom {
        background: #e0f2fe;
        border: 2px dashed #0284c7;
        color: #0369a1;
      }

      &.seat--selected {
        background: #0d47a1 !important;
        border-color: #0d47a1 !important;
        color: white !important;
        box-shadow: 0 2px 8px rgba(13, 71, 161, 0.4);
      }

      &.seat--occupied {
        background: #fee2e2;
        border-color: #fca5a5;
        color: #b91c1c;
        cursor: not-allowed;
        opacity: 0.65;
      }
    }

    .actions-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 580px;
      margin: 0 auto;
    }

    .btn-continue {
      padding: 0.75rem 2.2rem !important;
      font-size: 1rem !important;
      font-weight: 700 !important;
      border-radius: 50px !important;
    }

    .loading-card {
      text-align: center;
      padding: 3rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
  `]
})
export class SeatSelectionComponent implements OnInit {
  private router = inject(Router);
  private api = inject(ApiService);
  readonly bookingState = inject(BookingStateService);

  requiredSeats = 1;
  loading = signal(true);
  seatMap = signal<SeatMap | null>(null);
  selectedSeats = signal<string[]>([]);
  flight = computed(() => this.bookingState.selectedFlight());

  seatLetters = computed<string[]>(() => {
    const map = this.seatMap();
    if (!map) return [];
    const groups = map.layout.split('-');
    const res: string[] = [];
    groups.forEach((g, idx) => {
      for (const ch of g) res.push(ch);
      if (idx < groups.length - 1) res.push('|');
    });
    return res;
  });

  seatRows = computed<number[]>(() => {
    const map = this.seatMap();
    if (!map) return [];
    return Array.from({ length: map.rows }, (_, i) => i + 1);
  });

  seatCostTotal = computed<number>(() => {
    const map = this.seatMap();
    if (!map) return 0;
    return this.selectedSeats().reduce((sum, seat) => {
      const row = parseInt(seat, 10);
      if (map.firstClass?.rows?.includes(row)) return sum + (map.firstClass.price || 0);
      if (map.business?.rows?.includes(row)) return sum + (map.business.price || 0);
      if (map.extraLegroom?.includes(row)) return sum + 300;
      return sum;
    }, 0);
  });

  ngOnInit(): void {
    if (!this.bookingState.passengers().length) {
      this.router.navigate(['/passengers']);
      return;
    }

    this.requiredSeats = this.bookingState.passengerCount();

    // Restore previously chosen seats
    const prev = this.bookingState.selectedSeats();
    if (prev.length) {
      this.selectedSeats.set([...prev]);
    }

    const aircraft = this.flight()?.aircraft || 'Airbus A320neo';
    this.api.getSeatMapByAircraft(aircraft).subscribe({
      next: (map) => {
        if (map) {
          this.seatMap.set(map);
          this.bookingState.currentSeatMap.set(map);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  isSeatOccupied(row: number, letter: string): boolean {
    return !!this.seatMap()?.occupiedSeats?.includes(`${row}${letter}`);
  }

  isSeatSelected(row: number, letter: string): boolean {
    return this.selectedSeats().includes(`${row}${letter}`);
  }

  isFirstClass(row: number): boolean {
    return !!this.seatMap()?.firstClass?.rows?.includes(row);
  }

  isBusiness(row: number): boolean {
    return !!this.seatMap()?.business?.rows?.includes(row);
  }

  isExtraLegroom(row: number): boolean {
    return !!this.seatMap()?.extraLegroom?.includes(row);
  }

  isEconomy(row: number): boolean {
    return !this.isFirstClass(row) && !this.isBusiness(row);
  }

  getSeatTooltip(row: number, letter: string): string {
    const seatId = `${row}${letter}`;
    if (this.isSeatOccupied(row, letter)) return `${seatId} (Occupied)`;
    if (this.isFirstClass(row)) return `${seatId} (First Class +₹${this.seatMap()?.firstClass.price})`;
    if (this.isBusiness(row)) return `${seatId} (Business Class +₹${this.seatMap()?.business.price})`;
    if (this.isExtraLegroom(row)) return `${seatId} (Extra Legroom +₹300)`;
    return `${seatId} (Standard Economy)`;
  }

  toggleSeat(row: number, letter: string): void {
    if (this.isSeatOccupied(row, letter)) return;

    const seatId = `${row}${letter}`;
    const curr = this.selectedSeats();

    if (curr.includes(seatId)) {
      this.selectedSeats.set(curr.filter(s => s !== seatId));
    } else if (curr.length < this.requiredSeats) {
      this.selectedSeats.set([...curr, seatId]);
    }
  }

  goBack(): void {
    this.router.navigate(['/passengers']);
  }

  onContinue(): void {
    // Assign selected seats to passenger objects
    const seats = this.selectedSeats();
    const updatedPassengers = this.bookingState.passengers().map((p, idx) => ({
      ...p,
      seatNumber: seats[idx] || '12A'
    }));

    this.bookingState.passengers.set(updatedPassengers);
    this.bookingState.selectedSeats.set(seats);
    this.router.navigate(['/payment']);
  }
}
