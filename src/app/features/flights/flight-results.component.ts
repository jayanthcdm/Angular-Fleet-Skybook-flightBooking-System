import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { ApiService } from '../../core/services/api.service';
import { BookingStateService } from '../../core/services/booking-state.service';
import { Flight, SearchCriteria } from '../../core/models/models';

type SortOption = 'price-asc' | 'price-desc' | 'duration-asc' | 'duration-desc';

@Component({
  selector: 'app-flight-results',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  template: `
    <div class="results-page container animate-in">
      <!-- Search Summary Bar -->
      @if (criteria()) {
        <mat-card class="summary-bar">
          <div class="summary-route">
            <span class="route-airports">{{ originCode() }} → {{ destCode() }}</span>
            <span class="route-details">
              📅 {{ criteria()!.departureDate }}
              @if (criteria()!.tripType === 'round-trip') {
                · ↩️ {{ criteria()!.returnDate }}
              }
              · 👥 {{ criteria()!.passengers }} {{ criteria()!.passengers === 1 ? 'Passenger' : 'Passengers' }}
              · 💺 {{ criteria()!.class | titlecase }}
            </span>
          </div>
          <a routerLink="/search" mat-stroked-button color="primary">Modify Search</a>
        </mat-card>
      }

      <div class="results-layout">
        <!-- Filter Sidebar -->
        <aside class="filters-panel card">
          <h3 class="filters-title">Filter Flights</h3>

          <!-- Airline Filter -->
          @if (availableAirlines().length) {
            <div class="filter-group">
              <h4>Airlines</h4>
              @for (airline of availableAirlines(); track airline) {
                <label class="filter-checkbox">
                  <input
                    type="checkbox"
                    [checked]="isAirlineSelected(airline)"
                    (change)="toggleAirline(airline)"
                  />
                  <span>{{ airline }}</span>
                </label>
              }
            </div>
          }

          <!-- Stops Filter -->
          <div class="filter-group">
            <h4>Stops</h4>
            <label class="filter-checkbox">
              <input type="checkbox" [checked]="isStopSelected(0)" (change)="toggleStop(0)" />
              <span>Non-stop</span>
            </label>
            <label class="filter-checkbox">
              <input type="checkbox" [checked]="isStopSelected(1)" (change)="toggleStop(1)" />
              <span>1 Stop</span>
            </label>
          </div>

          <!-- Time Window Filter -->
          <div class="filter-group">
            <h4>Departure Window</h4>
            <label class="filter-checkbox">
              <input type="checkbox" [checked]="isTimeSelected('morning')" (change)="toggleTime('morning')" />
              <span>🌅 Morning (06:00 - 12:00)</span>
            </label>
            <label class="filter-checkbox">
              <input type="checkbox" [checked]="isTimeSelected('afternoon')" (change)="toggleTime('afternoon')" />
              <span>☀️ Afternoon (12:00 - 18:00)</span>
            </label>
            <label class="filter-checkbox">
              <input type="checkbox" [checked]="isTimeSelected('evening')" (change)="toggleTime('evening')" />
              <span>🌆 Evening (18:00 - 24:00)</span>
            </label>
            <label class="filter-checkbox">
              <input type="checkbox" [checked]="isTimeSelected('night')" (change)="toggleTime('night')" />
              <span>🌙 Night (00:00 - 06:00)</span>
            </label>
          </div>
        </aside>

        <!-- Flight Results List -->
        <div class="results-column">
          <!-- Sorting Controls -->
          <div class="sort-bar card">
            <span class="results-count">
              <strong>{{ filteredFlights().length }}</strong> flights available
            </span>
            <div class="sort-buttons">
              <button
                class="btn btn-sm"
                [class.btn-primary]="sortOption() === 'price-asc'"
                [class.btn-secondary]="sortOption() !== 'price-asc'"
                (click)="sortOption.set('price-asc')"
              >Price ↑</button>
              <button
                class="btn btn-sm"
                [class.btn-primary]="sortOption() === 'price-desc'"
                [class.btn-secondary]="sortOption() !== 'price-desc'"
                (click)="sortOption.set('price-desc')"
              >Price ↓</button>
              <button
                class="btn btn-sm"
                [class.btn-primary]="sortOption() === 'duration-asc'"
                [class.btn-secondary]="sortOption() !== 'duration-asc'"
                (click)="sortOption.set('duration-asc')"
              >Fastest</button>
            </div>
          </div>

          <!-- Loading State -->
          @if (loading()) {
            <div class="loading-state card">
              <mat-progress-spinner mode="indeterminate" diameter="48"></mat-progress-spinner>
              <p>Searching for real-time fares and flight schedules...</p>
            </div>
          }

          <!-- No Flights Found -->
          @if (!loading() && filteredFlights().length === 0) {
            <div class="no-results card">
              <div class="no-results-icon">✈️</div>
              <h3>No Flights Matching Your Search</h3>
              <p>Try searching for a different date (e.g. 2027-01-15) or adjust your filters.</p>
              <a routerLink="/search" mat-raised-button color="primary">Search Again</a>
            </div>
          }

          <!-- Flight Cards -->
          @for (flight of filteredFlights(); track flight.id) {
            <mat-card class="flight-card">
              <div class="flight-card-inner">
                <!-- Airline info -->
                <div class="airline-info">
                  <span class="airline-logo">{{ flight.airline?.logo || '✈️' }}</span>
                  <div>
                    <div class="airline-name">{{ flight.airline?.name }}</div>
                    <div class="flight-number">{{ flight.flightNumber }} · {{ flight.aircraft }}</div>
                  </div>
                </div>

                <!-- Schedule & Times -->
                <div class="flight-schedule">
                  <div class="schedule-point">
                    <span class="time">{{ flight.departureTime }}</span>
                    <span class="airport-code">{{ flight.origin?.code }}</span>
                    <span class="city-name">{{ flight.origin?.city }}</span>
                  </div>

                  <div class="flight-duration">
                    <span class="duration-text">{{ flight.duration }}</span>
                    <div class="duration-line">
                      <div class="line"></div>
                      <div class="plane-icon">✈</div>
                    </div>
                    <span class="stops-text" [class.non-stop]="flight.stops === 0">
                      {{ flight.stops === 0 ? 'Non-stop' : flight.stops + ' stop (' + flight.stopDetails.join(', ') + ')' }}
                    </span>
                  </div>

                  <div class="schedule-point">
                    <span class="time">{{ flight.arrivalTime }}</span>
                    <span class="airport-code">{{ flight.destination?.code }}</span>
                    <span class="city-name">{{ flight.destination?.city }}</span>
                  </div>
                </div>

                <!-- Price and Select Action -->
                <div class="flight-action">
                  <div class="price">
                    <span class="price-currency">₹</span>
                    <span class="price-amount">{{ getPrice(flight) | number }}</span>
                    <span class="price-unit">/person</span>
                  </div>
                  <div class="seats-left">
                    <span class="badge" [class.badge-warning]="getSeatsAvailable(flight) < 20" [class.badge-info]="getSeatsAvailable(flight) >= 20">
                      {{ getSeatsAvailable(flight) }} seats left
                    </span>
                  </div>
                  <button mat-raised-button color="primary" class="btn-select-flight" (click)="selectFlight(flight)">
                    Select Flight
                  </button>
                </div>
              </div>
            </mat-card>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .results-page {
      padding-top: 1.5rem;
      padding-bottom: 3rem;
    }

    .summary-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.75rem !important;
      margin-bottom: 1.5rem;
      border-radius: 14px !important;
      background: white !important;
      box-shadow: 0 2px 10px rgba(0,0,0,0.06) !important;
    }

    .summary-route {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .route-airports {
      font-size: 1.35rem;
      font-weight: 800;
      color: #0d47a1;
    }

    .route-details {
      font-size: 0.9rem;
      color: #64748b;
      font-weight: 500;
    }

    .results-layout {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 1.5rem;
      align-items: start;
    }

    .filters-panel {
      padding: 1.5rem;
      border-radius: 14px;
    }

    .filters-title {
      font-size: 1.15rem;
      font-weight: 800;
      color: #1e293b;
      margin-bottom: 1.25rem;
      border-bottom: 2px solid #f1f5f9;
      padding-bottom: 0.5rem;
    }

    .filter-group {
      margin-bottom: 1.5rem;

      h4 {
        font-size: 0.85rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #64748b;
        margin-bottom: 0.75rem;
      }
    }

    .filter-checkbox {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin-bottom: 0.5rem;
      cursor: pointer;
      font-size: 0.9rem;
      color: #334155;

      input {
        width: 16px;
        height: 16px;
        accent-color: #0d47a1;
      }
    }

    .sort-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      margin-bottom: 1rem;
      border-radius: 12px;
    }

    .sort-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .flight-card {
      margin-bottom: 1rem;
      border-radius: 14px !important;
      padding: 1.5rem !important;
      transition: transform 0.2s, box-shadow 0.2s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0,0,0,0.1) !important;
      }
    }

    .flight-card-inner {
      display: grid;
      grid-template-columns: 200px 1fr 180px;
      gap: 1.5rem;
      align-items: center;
    }

    .airline-info {
      display: flex;
      align-items: center;
      gap: 0.85rem;

      .airline-logo {
        font-size: 2.2rem;
      }

      .airline-name {
        font-size: 1.05rem;
        font-weight: 800;
        color: #1e293b;
      }

      .flight-number {
        font-size: 0.8rem;
        color: #64748b;
        margin-top: 2px;
      }
    }

    .flight-schedule {
      display: flex;
      align-items: center;
      justify-content: space-around;
      text-align: center;
    }

    .schedule-point {
      display: flex;
      flex-direction: column;

      .time {
        font-size: 1.4rem;
        font-weight: 800;
        color: #0f172a;
      }

      .airport-code {
        font-size: 0.9rem;
        font-weight: 700;
        color: #0d47a1;
      }

      .city-name {
        font-size: 0.8rem;
        color: #64748b;
      }
    }

    .flight-duration {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 130px;

      .duration-text {
        font-size: 0.85rem;
        font-weight: 600;
        color: #64748b;
      }

      .duration-line {
        display: flex;
        align-items: center;
        width: 100%;
        margin: 4px 0;

        .line {
          flex: 1;
          height: 2px;
          background: #cbd5e1;
        }

        .plane-icon {
          color: #0d47a1;
          font-size: 0.9rem;
          margin: 0 4px;
        }
      }

      .stops-text {
        font-size: 0.75rem;
        color: #e65100;
        font-weight: 600;

        &.non-stop {
          color: #2e7d32;
        }
      }
    }

    .flight-action {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.4rem;

      .price {
        display: flex;
        align-items: baseline;
        color: #0f172a;

        .price-currency {
          font-size: 1.1rem;
          font-weight: 700;
          color: #0d47a1;
          margin-right: 2px;
        }

        .price-amount {
          font-size: 1.6rem;
          font-weight: 800;
          color: #0d47a1;
        }

        .price-unit {
          font-size: 0.75rem;
          color: #64748b;
          margin-left: 4px;
        }
      }

      .btn-select-flight {
        border-radius: 50px !important;
        font-weight: 700 !important;
        padding: 0.5rem 1.4rem !important;
      }
    }

    .loading-state, .no-results {
      text-align: center;
      padding: 3.5rem 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .no-results-icon {
      font-size: 3.5rem;
    }

    @media (max-width: 900px) {
      .results-layout {
        grid-template-columns: 1fr;
      }

      .flight-card-inner {
        grid-template-columns: 1fr;
        gap: 1.25rem;
      }

      .flight-action {
        align-items: flex-start;
      }
    }
  `]
})
export class FlightResultsComponent implements OnInit {
  private router = inject(Router);
  private apiService = inject(ApiService);
  private bookingState = inject(BookingStateService);

  criteria = signal<SearchCriteria | null>(null);
  allFlights = signal<Flight[]>([]);
  loading = signal(true);
  sortOption = signal<SortOption>('price-asc');

  selectedAirlines = signal<Set<string>>(new Set());
  selectedStops = signal<Set<number>>(new Set());
  selectedTimes = signal<Set<string>>(new Set());

  originCode = signal('');
  destCode = signal('');

  availableAirlines = computed(() => {
    const names = new Set<string>();
    this.allFlights().forEach(f => {
      if (f.airline?.name) names.add(f.airline.name);
    });
    return Array.from(names).sort();
  });

  filteredFlights = computed(() => {
    let list = [...this.allFlights()];
    const airlines = this.selectedAirlines();
    const stops = this.selectedStops();
    const times = this.selectedTimes();
    const crit = this.criteria();

    if (airlines.size > 0) {
      list = list.filter(f => f.airline?.name && airlines.has(f.airline.name));
    }

    if (stops.size > 0) {
      list = list.filter(f => stops.has(f.stops));
    }

    if (times.size > 0) {
      list = list.filter(f => {
        const hour = parseInt(f.departureTime.split(':')[0], 10);
        if (times.has('morning') && hour >= 6 && hour < 12) return true;
        if (times.has('afternoon') && hour >= 12 && hour < 18) return true;
        if (times.has('evening') && hour >= 18 && hour < 24) return true;
        if (times.has('night') && hour >= 0 && hour < 6) return true;
        return false;
      });
    }

    const sort = this.sortOption();
    const cls = crit?.class || 'economy';
    list.sort((a, b) => {
      switch (sort) {
        case 'price-asc': return (a.prices[cls] || 0) - (b.prices[cls] || 0);
        case 'price-desc': return (b.prices[cls] || 0) - (a.prices[cls] || 0);
        case 'duration-asc': return a.durationMinutes - b.durationMinutes;
        case 'duration-desc': return b.durationMinutes - a.durationMinutes;
      }
    });

    return list;
  });

  ngOnInit(): void {
    const crit = this.bookingState.searchCriteria();
    if (!crit.originId || !crit.destinationId) {
      this.router.navigate(['/search']);
      return;
    }

    this.criteria.set(crit);
    this.apiService.searchFlights(crit).subscribe({
      next: (flights) => {
        this.allFlights.set(flights);
        this.loading.set(false);

        if (flights.length > 0) {
          this.originCode.set(flights[0].origin?.code || '');
          this.destCode.set(flights[0].destination?.code || '');
        } else {
          this.apiService.getAirports().subscribe(ports => {
            this.originCode.set(ports.find(p => p.id === crit.originId)?.code || '');
            this.destCode.set(ports.find(p => p.id === crit.destinationId)?.code || '');
          });
        }
      },
      error: (err) => {
        console.error('Failed to search flights:', err);
        this.loading.set(false);
      }
    });
  }

  getPrice(flight: Flight): number {
    const cls = this.criteria()?.class || 'economy';
    return flight.prices[cls] || flight.prices.economy;
  }

  getSeatsAvailable(flight: Flight): number {
    const cls = this.criteria()?.class || 'economy';
    return flight.seatsAvailable[cls] ?? flight.seatsAvailable.economy;
  }

  isAirlineSelected(name: string): boolean {
    return this.selectedAirlines().has(name);
  }

  toggleAirline(name: string): void {
    const set = new Set(this.selectedAirlines());
    set.has(name) ? set.delete(name) : set.add(name);
    this.selectedAirlines.set(set);
  }

  isStopSelected(stops: number): boolean {
    return this.selectedStops().has(stops);
  }

  toggleStop(stops: number): void {
    const set = new Set(this.selectedStops());
    set.has(stops) ? set.delete(stops) : set.add(stops);
    this.selectedStops.set(set);
  }

  isTimeSelected(time: string): boolean {
    return this.selectedTimes().has(time);
  }

  toggleTime(time: string): void {
    const set = new Set(this.selectedTimes());
    set.has(time) ? set.delete(time) : set.add(time);
    this.selectedTimes.set(set);
  }

  selectFlight(flight: Flight): void {
    this.bookingState.selectedFlight.set(flight);
    this.router.navigate(['/passengers']);
  }
}
