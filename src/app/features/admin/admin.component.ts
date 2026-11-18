import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Flight, Airline, Airport, Booking } from '../../core/models/models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container animate-in">
      <div class="page-header">
        <h1>⚙️ Airline Administration</h1>
        <p>Control center for flights, fleet, airports, bookings, and operations</p>
      </div>

      <!-- Navigation Tabs -->
      <div class="admin-tabs">
        <button [class.active]="activeTab() === 'dashboard'" (click)="setTab('dashboard')">
          📊 Dashboard & Stats
        </button>
        <button [class.active]="activeTab() === 'flights'" (click)="setTab('flights')">
          ✈️ Flights ({{ flights().length }})
        </button>
        <button [class.active]="activeTab() === 'airlines'" (click)="setTab('airlines')">
          🏢 Airlines ({{ airlines().length }})
        </button>
        <button [class.active]="activeTab() === 'airports'" (click)="setTab('airports')">
          🌐 Airports ({{ airports().length }})
        </button>
        <button [class.active]="activeTab() === 'bookings'" (click)="setTab('bookings')">
          📋 Bookings ({{ bookings().length }})
        </button>
      </div>

      <!-- TAB 1: DASHBOARD OVERVIEW -->
      @if (activeTab() === 'dashboard') {
        <div class="dashboard-section animate-in">
          <!-- Stats Grid -->
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">✈️</div>
              <div class="stat-content">
                <div class="stat-label">Total Flights</div>
                <div class="stat-value">{{ flights().length }}</div>
                <div class="stat-sub">Across 15 Global Hubs</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">🎫</div>
              <div class="stat-content">
                <div class="stat-label">Total Bookings</div>
                <div class="stat-value">{{ bookings().length }}</div>
                <div class="stat-sub">{{ confirmedBookingsCount() }} confirmed, {{ cancelledBookingsCount() }} cancelled</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">💰</div>
              <div class="stat-content">
                <div class="stat-label">Total Revenue</div>
                <div class="stat-value">₹{{ totalRevenue().toLocaleString() }}</div>
                <div class="stat-sub">From confirmed bookings</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">🏢</div>
              <div class="stat-content">
                <div class="stat-label">Partner Airlines</div>
                <div class="stat-value">{{ airlines().length }}</div>
                <div class="stat-sub">Operating worldwide</div>
              </div>
            </div>
          </div>

          <!-- Quick Recent Bookings -->
          <div class="card recent-card">
            <div class="section-title-bar">
              <h2>Recent Reservations</h2>
              <button class="btn btn-sm btn-secondary" (click)="setTab('bookings')">View All</button>
            </div>
            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>PNR</th>
                    <th>Passenger(s)</th>
                    <th>Flight</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  @for (b of recentBookings(); track b.id) {
                    <tr>
                      <td><strong>{{ b.pnr }}</strong></td>
                      <td>
                        {{ b.passengers[0].firstName }} {{ b.passengers[0].lastName }}
                        @if (b.passengers.length > 1) {
                          <span class="badge badge-info">+{{ b.passengers.length - 1 }} more</span>
                        }
                      </td>
                      <td>{{ getFlightNumber(b.flightId) }}</td>
                      <td>{{ b.bookingDate | date:'mediumDate' }}</td>
                      <td><strong>₹{{ b.totalAmount.toLocaleString() }}</strong></td>
                      <td>
                        <span class="badge" [ngClass]="{
                          'badge-success': b.status === 'confirmed',
                          'badge-danger': b.status === 'cancelled',
                          'badge-warning': b.status === 'pending'
                        }">{{ b.status | uppercase }}</span>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }

      <!-- TAB 2: MANAGE FLIGHTS -->
      @if (activeTab() === 'flights') {
        <div class="manage-section animate-in">
          <div class="action-header">
            <div>
              <h2>Flight Schedules & Operations</h2>
              <p>Add new flights, edit routes, or decommission flights</p>
            </div>
            <button class="btn btn-primary" (click)="toggleFlightForm()">
              {{ showFlightForm() ? '✕ Close Form' : '+ Add New Flight' }}
            </button>
          </div>

          <!-- Add / Edit Flight Form -->
          @if (showFlightForm()) {
            <div class="card form-modal-card animate-in">
              <h3>{{ editingFlightId() ? 'Edit Flight #' + flightForm.flightNumber : 'Schedule New Flight' }}</h3>
              <form (ngSubmit)="saveFlight()">
                <div class="grid-3">
                  <div class="form-group">
                    <label>Flight Number *</label>
                    <input type="text" class="form-control" [(ngModel)]="flightForm.flightNumber" name="flightNumber" placeholder="e.g. AF204" required />
                  </div>
                  <div class="form-group">
                    <label>Airline *</label>
                    <select class="form-control" [(ngModel)]="flightForm.airlineId" name="airlineId" required>
                      @for (a of airlines(); track a.id) {
                        <option [ngValue]="a.id">{{ a.logo }} {{ a.name }} ({{ a.code }})</option>
                      }
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Aircraft Model</label>
                    <input type="text" class="form-control" [(ngModel)]="flightForm.aircraft" name="aircraft" placeholder="e.g. Airbus A320neo" />
                  </div>
                </div>

                <div class="grid-3">
                  <div class="form-group">
                    <label>Origin Airport *</label>
                    <select class="form-control" [(ngModel)]="flightForm.originId" name="originId" required>
                      @for (ap of airports(); track ap.id) {
                        <option [ngValue]="ap.id">{{ ap.code }} - {{ ap.city }} ({{ ap.name }})</option>
                      }
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Destination Airport *</label>
                    <select class="form-control" [(ngModel)]="flightForm.destinationId" name="destinationId" required>
                      @for (ap of airports(); track ap.id) {
                        <option [ngValue]="ap.id">{{ ap.code }} - {{ ap.city }} ({{ ap.name }})</option>
                      }
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Flight Date *</label>
                    <input type="date" class="form-control" [(ngModel)]="flightForm.departureDate" name="departureDate" required />
                  </div>
                </div>

                <div class="grid-4">
                  <div class="form-group">
                    <label>Departure Time *</label>
                    <input type="time" class="form-control" [(ngModel)]="flightForm.departureTime" name="departureTime" required />
                  </div>
                  <div class="form-group">
                    <label>Arrival Time *</label>
                    <input type="time" class="form-control" [(ngModel)]="flightForm.arrivalTime" name="arrivalTime" required />
                  </div>
                  <div class="form-group">
                    <label>Duration Text</label>
                    <input type="text" class="form-control" [(ngModel)]="flightForm.duration" name="duration" placeholder="e.g. 2h 30m" />
                  </div>
                  <div class="form-group">
                    <label>Stops (0=Direct)</label>
                    <input type="number" min="0" max="3" class="form-control" [(ngModel)]="flightForm.stops" name="stops" />
                  </div>
                </div>

                <div class="divider"></div>
                <h4>Fares by Cabin Class (₹ INR)</h4>
                <div class="grid-3">
                  <div class="form-group">
                    <label>Economy Class Fare (₹) *</label>
                    <input type="number" min="1" class="form-control" [(ngModel)]="flightForm.prices.economy" name="priceEco" required />
                  </div>
                  <div class="form-group">
                    <label>Business Class Fare (₹) *</label>
                    <input type="number" min="1" class="form-control" [(ngModel)]="flightForm.prices.business" name="priceBiz" required />
                  </div>
                  <div class="form-group">
                    <label>First Class Fare (₹) *</label>
                    <input type="number" min="1" class="form-control" [(ngModel)]="flightForm.prices.first" name="priceFirst" required />
                  </div>
                </div>

                <h4>Available Seats Capacity</h4>
                <div class="grid-3">
                  <div class="form-group">
                    <label>Economy Seats</label>
                    <input type="number" min="0" class="form-control" [(ngModel)]="flightForm.seatsAvailable.economy" name="seatsEco" />
                  </div>
                  <div class="form-group">
                    <label>Business Seats</label>
                    <input type="number" min="0" class="form-control" [(ngModel)]="flightForm.seatsAvailable.business" name="seatsBiz" />
                  </div>
                  <div class="form-group">
                    <label>First Class Seats</label>
                    <input type="number" min="0" class="form-control" [(ngModel)]="flightForm.seatsAvailable.first" name="seatsFirst" />
                  </div>
                </div>

                <div class="form-actions">
                  <button type="button" class="btn btn-secondary" (click)="cancelFlightEdit()">Cancel</button>
                  <button type="submit" class="btn btn-primary">{{ editingFlightId() ? 'Update Flight' : 'Create Flight' }}</button>
                </div>
              </form>
            </div>
          }

          <!-- Flights Table -->
          <div class="card">
            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>Flight</th>
                    <th>Airline</th>
                    <th>Route</th>
                    <th>Date</th>
                    <th>Times</th>
                    <th>Economy</th>
                    <th>Business</th>
                    <th>First</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (f of flights(); track f.id) {
                    <tr>
                      <td><strong>{{ f.flightNumber }}</strong></td>
                      <td>
                        <span>{{ getAirlineLogo(f.airlineId) }} {{ getAirlineName(f.airlineId) }}</span>
                      </td>
                      <td>
                        <strong>{{ getAirportCode(f.originId) }}</strong> → <strong>{{ getAirportCode(f.destinationId) }}</strong>
                        <div class="sub-text">{{ f.aircraft }} • {{ f.stops === 0 ? 'Non-stop' : f.stops + ' stop(s)' }}</div>
                      </td>
                      <td>{{ f.departureDate }}</td>
                      <td>{{ f.departureTime }} - {{ f.arrivalTime }}</td>
                      <td>₹{{ f.prices.economy | number }}</td>
                      <td>₹{{ f.prices.business | number }}</td>
                      <td>₹{{ f.prices.first | number }}</td>
                      <td>
                        <div class="btn-group">
                          <button class="btn btn-sm btn-secondary" (click)="editFlight(f)">✏️ Edit</button>
                          <button class="btn btn-sm btn-danger" (click)="deleteFlight(f.id)">🗑️ Del</button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }

      <!-- TAB 3: MANAGE AIRLINES -->
      @if (activeTab() === 'airlines') {
        <div class="manage-section animate-in">
          <div class="action-header">
            <div>
              <h2>Partner Airlines Directory</h2>
              <p>Configure airlines and fleet partners</p>
            </div>
            <button class="btn btn-primary" (click)="toggleAirlineForm()">
              {{ showAirlineForm() ? '✕ Close Form' : '+ Add Airline' }}
            </button>
          </div>

          @if (showAirlineForm()) {
            <div class="card form-modal-card animate-in">
              <h3>{{ editingAirlineId() ? 'Edit Airline' : 'Add Partner Airline' }}</h3>
              <form (ngSubmit)="saveAirline()">
                <div class="grid-3">
                  <div class="form-group">
                    <label>Airline Code (2-letters) *</label>
                    <input type="text" maxlength="3" class="form-control" [(ngModel)]="airlineForm.code" name="airCode" required />
                  </div>
                  <div class="form-group">
                    <label>Airline Name *</label>
                    <input type="text" class="form-control" [(ngModel)]="airlineForm.name" name="airName" required />
                  </div>
                  <div class="form-group">
                    <label>Emoji / Logo *</label>
                    <input type="text" class="form-control" [(ngModel)]="airlineForm.logo" name="airLogo" placeholder="e.g. ✈️ or 🦅" required />
                  </div>
                </div>
                <div class="form-actions">
                  <button type="button" class="btn btn-secondary" (click)="cancelAirlineEdit()">Cancel</button>
                  <button type="submit" class="btn btn-primary">Save Airline</button>
                </div>
              </form>
            </div>
          }

          <div class="card">
            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>Logo</th>
                    <th>Code</th>
                    <th>Airline Name</th>
                    <th>Flights Count</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (a of airlines(); track a.id) {
                    <tr>
                      <td style="font-size: 1.5rem;">{{ a.logo }}</td>
                      <td><strong>{{ a.code }}</strong></td>
                      <td>{{ a.name }}</td>
                      <td>{{ getAirlineFlightCount(a.id) }} flights</td>
                      <td>
                        <div class="btn-group">
                          <button class="btn btn-sm btn-secondary" (click)="editAirline(a)">✏️ Edit</button>
                          <button class="btn btn-sm btn-danger" (click)="deleteAirline(a.id)">🗑️ Del</button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }

      <!-- TAB 4: MANAGE AIRPORTS -->
      @if (activeTab() === 'airports') {
        <div class="manage-section animate-in">
          <div class="action-header">
            <div>
              <h2>Global Airports Directory</h2>
              <p>Configure origin and destination hubs</p>
            </div>
            <button class="btn btn-primary" (click)="toggleAirportForm()">
              {{ showAirportForm() ? '✕ Close Form' : '+ Add Airport' }}
            </button>
          </div>

          @if (showAirportForm()) {
            <div class="card form-modal-card animate-in">
              <h3>{{ editingAirportId() ? 'Edit Airport' : 'Register New Airport' }}</h3>
              <form (ngSubmit)="saveAirport()">
                <div class="grid-4">
                  <div class="form-group">
                    <label>IATA Code (3 letters) *</label>
                    <input type="text" maxlength="4" class="form-control" [(ngModel)]="airportForm.code" name="portCode" required />
                  </div>
                  <div class="form-group">
                    <label>Airport Full Name *</label>
                    <input type="text" class="form-control" [(ngModel)]="airportForm.name" name="portName" required />
                  </div>
                  <div class="form-group">
                    <label>City *</label>
                    <input type="text" class="form-control" [(ngModel)]="airportForm.city" name="portCity" required />
                  </div>
                  <div class="form-group">
                    <label>Country *</label>
                    <input type="text" class="form-control" [(ngModel)]="airportForm.country" name="portCountry" required />
                  </div>
                </div>
                <div class="form-actions">
                  <button type="button" class="btn btn-secondary" (click)="cancelAirportEdit()">Cancel</button>
                  <button type="submit" class="btn btn-primary">Save Airport</button>
                </div>
              </form>
            </div>
          }

          <div class="card">
            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>IATA</th>
                    <th>City</th>
                    <th>Airport Name</th>
                    <th>Country</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (ap of airports(); track ap.id) {
                    <tr>
                      <td><span class="airport-badge">{{ ap.code }}</span></td>
                      <td><strong>{{ ap.city }}</strong></td>
                      <td>{{ ap.name }}</td>
                      <td>{{ ap.country }}</td>
                      <td>
                        <div class="btn-group">
                          <button class="btn btn-sm btn-secondary" (click)="editAirport(ap)">✏️ Edit</button>
                          <button class="btn btn-sm btn-danger" (click)="deleteAirport(ap.id)">🗑️ Del</button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }

      <!-- TAB 5: CUSTOMER BOOKINGS -->
      @if (activeTab() === 'bookings') {
        <div class="manage-section animate-in">
          <div class="action-header">
            <div>
              <h2>All Customer Reservations</h2>
              <p>Monitor passenger bookings, cancellations and tickets</p>
            </div>
            <div class="filter-controls">
              <label>Filter Status:</label>
              <select class="form-control select-compact" [(ngModel)]="bookingFilterStatus">
                <option value="all">All Bookings</option>
                <option value="confirmed">Confirmed Only</option>
                <option value="cancelled">Cancelled Only</option>
              </select>
            </div>
          </div>

          <div class="card">
            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>PNR</th>
                    <th>Passengers</th>
                    <th>Flight / Route</th>
                    <th>Date Booked</th>
                    <th>Cabin Class</th>
                    <th>Paid Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  @for (b of filteredBookings(); track b.id) {
                    <tr>
                      <td><strong>{{ b.pnr }}</strong></td>
                      <td>
                        @for (p of b.passengers; track p.firstName + p.lastName) {
                          <div>{{ p.firstName }} {{ p.lastName }} <span class="seat-pill">{{ p.seatNumber || 'N/A' }}</span></div>
                        }
                      </td>
                      <td>
                        <strong>{{ getFlightNumber(b.flightId) }}</strong>
                        <div class="sub-text">{{ getFlightRoute(b.flightId) }}</div>
                      </td>
                      <td>{{ b.bookingDate | date:'mediumDate' }}</td>
                      <td><span class="class-pill">{{ b.class | uppercase }}</span></td>
                      <td><strong>₹{{ b.totalAmount.toLocaleString() }}</strong></td>
                      <td>
                        <span class="badge" [ngClass]="{
                          'badge-success': b.status === 'confirmed',
                          'badge-danger': b.status === 'cancelled',
                          'badge-warning': b.status === 'pending'
                        }">{{ b.status | uppercase }}</span>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .admin-tabs {
      display: flex;
      gap: 0.5rem;
      border-bottom: 2px solid #e2e8f0;
      margin-bottom: 2rem;
      overflow-x: auto;
      padding-bottom: 4px;

      button {
        background: transparent;
        border: none;
        padding: 0.8rem 1.4rem;
        font-family: inherit;
        font-size: 0.95rem;
        font-weight: 600;
        color: #64748b;
        cursor: pointer;
        border-radius: 10px 10px 0 0;
        transition: all 0.2s;
        white-space: nowrap;

        &:hover {
          color: #1a237e;
          background: #f1f5f9;
        }

        &.active {
          color: #1a237e;
          background: white;
          border-bottom: 3px solid #1a237e;
          box-shadow: 0 -2px 8px rgba(0,0,0,0.05);
        }
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.25rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1.25rem;
      box-shadow: 0 2px 6px rgba(0,0,0,0.06);

      .stat-icon {
        font-size: 2.2rem;
        width: 60px;
        height: 60px;
        border-radius: 14px;
        background: #f0f4ff;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .stat-label {
        font-size: 0.85rem;
        font-weight: 600;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .stat-value {
        font-size: 1.8rem;
        font-weight: 800;
        color: #1a237e;
        line-height: 1.2;
      }

      .stat-sub {
        font-size: 0.8rem;
        color: #94a3b8;
        margin-top: 2px;
      }
    }

    .action-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.25rem;
      flex-wrap: wrap;
      gap: 1rem;

      h2 {
        font-size: 1.3rem;
        font-weight: 700;
        color: #1e293b;
      }

      p {
        color: #64748b;
        font-size: 0.9rem;
      }
    }

    .form-modal-card {
      margin-bottom: 1.5rem;
      background: #f8fafc;
      border: 1px solid #cbd5e1;

      h3 {
        margin-bottom: 1rem;
        font-size: 1.15rem;
        color: #1a237e;
      }

      h4 {
        margin: 0.85rem 0 0.5rem;
        font-size: 0.95rem;
        color: #475569;
      }
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1.25rem;
    }

    .table-responsive {
      overflow-x: auto;
    }

    .airport-badge {
      font-weight: 800;
      color: #1a237e;
      background: #e8eaf6;
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      font-size: 0.85rem;
    }

    .seat-pill {
      font-size: 0.75rem;
      background: #e0e7ff;
      color: #3730a3;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 600;
      margin-left: 4px;
    }

    .class-pill {
      font-size: 0.75rem;
      background: #f1f5f9;
      padding: 2px 8px;
      border-radius: 12px;
      font-weight: 600;
      color: #475569;
    }

    .sub-text {
      font-size: 0.75rem;
      color: #94a3b8;
      margin-top: 2px;
    }

    .btn-group {
      display: flex;
      gap: 0.35rem;
    }

    .filter-controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      label {
        font-weight: 600;
        font-size: 0.85rem;
        color: #475569;
      }

      .select-compact {
        width: auto;
        padding: 0.4rem 0.75rem;
      }
    }

    .section-title-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;

      h2 {
        font-size: 1.2rem;
        font-weight: 700;
        color: #1e293b;
      }
    }
  `]
})
export class AdminComponent implements OnInit {
  private api = inject(ApiService);

  activeTab = signal<'dashboard' | 'flights' | 'airlines' | 'airports' | 'bookings'>('dashboard');

  flights = signal<Flight[]>([]);
  airlines = signal<Airline[]>([]);
  airports = signal<Airport[]>([]);
  bookings = signal<Booking[]>([]);

  // Flight form state
  showFlightForm = signal(false);
  editingFlightId = signal<number | null>(null);
  flightForm = {
    flightNumber: '',
    airlineId: 1,
    originId: 1,
    destinationId: 2,
    departureTime: '10:00',
    arrivalTime: '13:00',
    duration: '3h 00m',
    durationMinutes: 180,
    stops: 0,
    stopDetails: [] as string[],
    aircraft: 'Airbus A320neo',
    departureDate: '2027-01-20',
    status: 'scheduled',
    prices: { economy: 150, business: 600, first: 1800 },
    seatsAvailable: { economy: 150, business: 30, first: 10 }
  };

  // Airline form state
  showAirlineForm = signal(false);
  editingAirlineId = signal<number | null>(null);
  airlineForm = {
    code: '',
    name: '',
    logo: '✈️'
  };

  // Airport form state
  showAirportForm = signal(false);
  editingAirportId = signal<number | null>(null);
  airportForm = {
    code: '',
    name: '',
    city: '',
    country: ''
  };

  bookingFilterStatus = 'all';

  // Computed dashboard statistics
  confirmedBookingsCount = computed(() => this.bookings().filter(b => b.status === 'confirmed').length);
  cancelledBookingsCount = computed(() => this.bookings().filter(b => b.status === 'cancelled').length);
  totalRevenue = computed(() => {
    return this.bookings()
      .filter(b => b.status === 'confirmed')
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  });
  recentBookings = computed(() => this.bookings().slice(-5).reverse());

  filteredBookings = computed(() => {
    const list = this.bookings();
    if (this.bookingFilterStatus === 'confirmed') return list.filter(b => b.status === 'confirmed');
    if (this.bookingFilterStatus === 'cancelled') return list.filter(b => b.status === 'cancelled');
    return list;
  });

  ngOnInit(): void {
    this.refreshAllData();
  }

  setTab(tab: 'dashboard' | 'flights' | 'airlines' | 'airports' | 'bookings'): void {
    this.activeTab.set(tab);
  }

  refreshAllData(): void {
    forkJoin({
      flights: this.api.getFlights(),
      airlines: this.api.getAirlines(),
      airports: this.api.getAirports(),
      bookings: this.api.getBookings()
    }).subscribe({
      next: ({ flights, airlines, airports, bookings }) => {
        this.flights.set(flights);
        this.airlines.set(airlines);
        this.airports.set(airports);
        this.bookings.set(bookings);
      },
      error: (err) => console.error('Failed to load admin data:', err)
    });
  }

  // Helpers
  getAirlineName(id: number): string {
    return this.airlines().find(a => a.id === id)?.name || `Airline #${id}`;
  }

  getAirlineLogo(id: number): string {
    return this.airlines().find(a => a.id === id)?.logo || '✈️';
  }

  getAirportCode(id: number): string {
    return this.airports().find(a => a.id === id)?.code || `#${id}`;
  }

  getFlightNumber(id: number): string {
    return this.flights().find(f => f.id === id)?.flightNumber || `FL-${id}`;
  }

  getFlightRoute(id: number): string {
    const f = this.flights().find(x => x.id === id);
    if (!f) return '';
    return `${this.getAirportCode(f.originId)} → ${this.getAirportCode(f.destinationId)}`;
  }

  getAirlineFlightCount(airlineId: number): number {
    return this.flights().filter(f => f.airlineId === airlineId).length;
  }

  // --- Flight Operations ---
  toggleFlightForm(): void {
    if (this.showFlightForm()) {
      this.cancelFlightEdit();
    } else {
      this.resetFlightForm();
      this.showFlightForm.set(true);
    }
  }

  resetFlightForm(): void {
    this.editingFlightId.set(null);
    this.flightForm = {
      flightNumber: '',
      airlineId: this.airlines()[0]?.id || 1,
      originId: this.airports()[0]?.id || 1,
      destinationId: this.airports()[1]?.id || 2,
      departureTime: '10:00',
      arrivalTime: '13:00',
      duration: '3h 00m',
      durationMinutes: 180,
      stops: 0,
      stopDetails: [],
      aircraft: 'Airbus A320neo',
      departureDate: new Date().toISOString().split('T')[0],
      status: 'scheduled',
      prices: { economy: 150, business: 600, first: 1800 },
      seatsAvailable: { economy: 150, business: 30, first: 10 }
    };
  }

  editFlight(flight: Flight): void {
    this.editingFlightId.set(flight.id);
    this.flightForm = {
      flightNumber: flight.flightNumber,
      airlineId: flight.airlineId,
      originId: flight.originId,
      destinationId: flight.destinationId,
      departureTime: flight.departureTime,
      arrivalTime: flight.arrivalTime,
      duration: flight.duration,
      durationMinutes: flight.durationMinutes || 120,
      stops: flight.stops,
      stopDetails: flight.stopDetails || [],
      aircraft: flight.aircraft,
      departureDate: flight.departureDate,
      status: flight.status || 'scheduled',
      prices: { ...flight.prices },
      seatsAvailable: { ...flight.seatsAvailable }
    };
    this.showFlightForm.set(true);
  }

  cancelFlightEdit(): void {
    this.showFlightForm.set(false);
    this.editingFlightId.set(null);
  }

  saveFlight(): void {
    if (this.editingFlightId()) {
      const updated: Flight = {
        id: this.editingFlightId()!,
        ...this.flightForm
      };
      this.api.updateFlight(updated).subscribe(() => {
        this.cancelFlightEdit();
        this.refreshAllData();
      });
    } else {
      this.api.addFlight(this.flightForm).subscribe(() => {
        this.cancelFlightEdit();
        this.refreshAllData();
      });
    }
  }

  deleteFlight(id: number): void {
    if (confirm('Are you sure you want to delete this flight? This action cannot be undone.')) {
      this.api.deleteFlight(id).subscribe(() => {
        this.refreshAllData();
      });
    }
  }

  // --- Airline Operations ---
  toggleAirlineForm(): void {
    if (this.showAirlineForm()) {
      this.cancelAirlineEdit();
    } else {
      this.airlineForm = { code: '', name: '', logo: '✈️' };
      this.editingAirlineId.set(null);
      this.showAirlineForm.set(true);
    }
  }

  editAirline(airline: Airline): void {
    this.editingAirlineId.set(airline.id);
    this.airlineForm = { code: airline.code, name: airline.name, logo: airline.logo };
    this.showAirlineForm.set(true);
  }

  cancelAirlineEdit(): void {
    this.showAirlineForm.set(false);
    this.editingAirlineId.set(null);
  }

  saveAirline(): void {
    if (this.editingAirlineId()) {
      this.api.updateAirline({ id: this.editingAirlineId()!, ...this.airlineForm }).subscribe(() => {
        this.cancelAirlineEdit();
        this.refreshAllData();
      });
    } else {
      this.api.addAirline(this.airlineForm).subscribe(() => {
        this.cancelAirlineEdit();
        this.refreshAllData();
      });
    }
  }

  deleteAirline(id: number): void {
    if (confirm('Are you sure you want to remove this airline?')) {
      this.api.deleteAirline(id).subscribe(() => {
        this.refreshAllData();
      });
    }
  }

  // --- Airport Operations ---
  toggleAirportForm(): void {
    if (this.showAirportForm()) {
      this.cancelAirportEdit();
    } else {
      this.airportForm = { code: '', name: '', city: '', country: '' };
      this.editingAirportId.set(null);
      this.showAirportForm.set(true);
    }
  }

  editAirport(airport: Airport): void {
    this.editingAirportId.set(airport.id);
    this.airportForm = { ...airport };
    this.showAirportForm.set(true);
  }

  cancelAirportEdit(): void {
    this.showAirportForm.set(false);
    this.editingAirportId.set(null);
  }

  saveAirport(): void {
    if (this.editingAirportId()) {
      this.api.updateAirport({ id: this.editingAirportId()!, ...this.airportForm }).subscribe(() => {
        this.cancelAirportEdit();
        this.refreshAllData();
      });
    } else {
      this.api.addAirport(this.airportForm).subscribe(() => {
        this.cancelAirportEdit();
        this.refreshAllData();
      });
    }
  }

  deleteAirport(id: number): void {
    if (confirm('Are you sure you want to remove this airport?')) {
      this.api.deleteAirport(id).subscribe(() => {
        this.refreshAllData();
      });
    }
  }
}
