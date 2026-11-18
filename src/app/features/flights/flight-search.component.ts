import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../core/services/api.service';
import { BookingStateService } from '../../core/services/booking-state.service';
import { Airport, SearchCriteria, CabinClass, TripType } from '../../core/models/models';

@Component({
  selector: 'app-flight-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="search-page container">
      <div class="page-header">
        <h1>🔍 Search Flights</h1>
        <p>Find the best domestic and international flights with live seat availability</p>
      </div>

      <mat-card class="search-card">
        <!-- Trip Type Selection -->
        <div class="trip-type-wrapper">
          <mat-button-toggle-group
            [value]="searchForm.get('tripType')?.value"
            (change)="setTripType($event.value)"
            aria-label="Trip Type"
          >
            <mat-button-toggle value="one-way">
              <mat-icon>arrow_forward</mat-icon> One Way
            </mat-button-toggle>
            <mat-button-toggle value="round-trip">
              <mat-icon>sync_alt</mat-icon> Round Trip
            </mat-button-toggle>
          </mat-button-toggle-group>
        </div>

        <form [formGroup]="searchForm" (ngSubmit)="onSubmit()">
          <div class="form-grid">
            <!-- Origin Airport -->
            <div class="form-group">
              <label for="originSelect" class="field-label">From (Origin)</label>
              <select id="originSelect" class="form-control" formControlName="originId">
                <option [ngValue]="null">Select origin airport</option>
                @for (airport of airports(); track airport.id) {
                  <option [ngValue]="airport.id">{{ airport.city }} ({{ airport.code }}) – {{ airport.name }}</option>
                }
              </select>
              @if (showError('originId')) {
                <div class="error-message">Please select an origin airport</div>
              }
            </div>

            <!-- Destination Airport -->
            <div class="form-group">
              <label for="destSelect" class="field-label">To (Destination)</label>
              <select id="destSelect" class="form-control" formControlName="destinationId">
                <option [ngValue]="null">Select destination airport</option>
                @for (airport of airports(); track airport.id) {
                  <option [ngValue]="airport.id">{{ airport.city }} ({{ airport.code }}) – {{ airport.name }}</option>
                }
              </select>
              @if (showError('destinationId')) {
                <div class="error-message">Please select a destination airport</div>
              }
              @if (searchForm.hasError('sameAirport') && searchForm.get('destinationId')?.touched) {
                <div class="error-message">Destination airport must be different from origin</div>
              }
            </div>

            <!-- Departure Date -->
            <div class="form-group">
              <label for="depDate" class="field-label">Departure Date</label>
              <input
                id="depDate"
                type="date"
                class="form-control"
                formControlName="departureDate"
                [min]="today"
              />
              @if (showError('departureDate')) {
                <div class="error-message">Departure date is required</div>
              }
            </div>

            <!-- Return Date -->
            @if (searchForm.get('tripType')?.value === 'round-trip') {
              <div class="form-group">
                <label for="retDate" class="field-label">Return Date</label>
                <input
                  id="retDate"
                  type="date"
                  class="form-control"
                  formControlName="returnDate"
                  [min]="searchForm.get('departureDate')?.value || today"
                />
                @if (showError('returnDate')) {
                  <div class="error-message">Return date is required for round-trip</div>
                }
                @if (searchForm.hasError('returnBeforeDeparture') && searchForm.get('returnDate')?.touched) {
                  <div class="error-message">Return date must be on or after departure date</div>
                }
              </div>
            }

            <!-- Passengers -->
            <div class="form-group">
              <label for="passCount" class="field-label">Passengers</label>
              <select id="passCount" class="form-control" formControlName="passengers">
                @for (n of passengerOptions; track n) {
                  <option [ngValue]="n">{{ n }} {{ n === 1 ? 'Passenger' : 'Passengers' }}</option>
                }
              </select>
            </div>

            <!-- Cabin Class -->
            <div class="form-group">
              <label for="cabinClass" class="field-label">Cabin Class</label>
              <select id="cabinClass" class="form-control" formControlName="class">
                <option value="economy">Economy</option>
                <option value="business">Business</option>
                <option value="first">First Class</option>
              </select>
            </div>
          </div>

          <div class="submit-row">
            <button
              mat-raised-button
              color="primary"
              type="submit"
              class="btn-search-flights"
              [disabled]="searchForm.invalid"
            >
              <mat-icon>flight_takeoff</mat-icon>
              <span>Search Available Flights</span>
            </button>
          </div>
        </form>
      </mat-card>
    </div>
  `,
  styles: [`
    .search-page {
      padding-top: 1.5rem;
      padding-bottom: 3rem;
      animation: fadeIn 0.4s ease-out;
    }

    .search-card {
      max-width: 860px;
      margin: 0 auto;
      padding: 2.25rem !important;
      border-radius: 16px !important;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08) !important;
    }

    .trip-type-wrapper {
      margin-bottom: 2rem;
      display: flex;
      justify-content: center;
    }

    .field-label {
      display: block;
      font-size: 0.85rem;
      font-weight: 700;
      color: #374151;
      margin-bottom: 0.4rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.25rem 1.5rem;
    }

    .submit-row {
      margin-top: 2.25rem;
      text-align: center;
    }

    .btn-search-flights {
      padding: 0.75rem 2.5rem !important;
      font-size: 1.05rem !important;
      font-weight: 700 !important;
      border-radius: 50px !important;
      height: auto !important;
      background: linear-gradient(135deg, #0d47a1, #1976d2) !important;
      color: white !important;
    }

    @media (max-width: 650px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class FlightSearchComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private apiService = inject(ApiService);
  private bookingState = inject(BookingStateService);

  airports = signal<Airport[]>([]);
  today = '2027-01-15'; // Default aligned with database flight dates
  passengerOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  searchForm: FormGroup = this.fb.group({
    tripType: ['one-way' as TripType],
    originId: [1, Validators.required], // Default Delhi
    destinationId: [2, Validators.required], // Default Mumbai
    departureDate: ['2027-01-15', Validators.required],
    returnDate: [''],
    passengers: [1, [Validators.required, Validators.min(1)]],
    class: ['economy' as CabinClass, Validators.required]
  }, { validators: [this.crossFieldValidator.bind(this)] });

  ngOnInit(): void {
    this.apiService.getAirports().subscribe({
      next: (airports) => this.airports.set(airports),
      error: (err) => console.error('Failed to load airports', err)
    });

    // Restore from state if available
    const criteria = this.bookingState.searchCriteria();
    if (criteria.originId) {
      this.searchForm.patchValue({
        tripType: criteria.tripType,
        originId: criteria.originId,
        destinationId: criteria.destinationId,
        departureDate: criteria.departureDate,
        returnDate: criteria.returnDate || '',
        passengers: criteria.passengers,
        class: criteria.class
      });
      if (criteria.tripType === 'round-trip') {
        this.searchForm.get('returnDate')?.setValidators(Validators.required);
      }
    }
  }

  setTripType(type: TripType): void {
    this.searchForm.patchValue({ tripType: type });
    const retControl = this.searchForm.get('returnDate');
    if (type === 'one-way') {
      retControl?.clearValidators();
      retControl?.setValue('');
    } else {
      retControl?.setValidators(Validators.required);
      if (!retControl?.value) {
        retControl?.setValue('2027-01-20');
      }
    }
    retControl?.updateValueAndValidity();
  }

  crossFieldValidator(control: AbstractControl): ValidationErrors | null {
    const origin = control.get('originId')?.value;
    const dest = control.get('destinationId')?.value;
    const departure = control.get('departureDate')?.value;
    const returnDate = control.get('returnDate')?.value;
    const tripType = control.get('tripType')?.value;
    const errors: ValidationErrors = {};

    if (origin && dest && origin === dest) {
      errors['sameAirport'] = true;
    }
    if (tripType === 'round-trip' && departure && returnDate && returnDate < departure) {
      errors['returnBeforeDeparture'] = true;
    }
    return Object.keys(errors).length ? errors : null;
  }

  showError(field: string): boolean {
    const control = this.searchForm.get(field);
    return !!(control?.invalid && control?.touched);
  }

  onSubmit(): void {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }

    const val = this.searchForm.value;
    const criteria: SearchCriteria = {
      originId: val.originId,
      destinationId: val.destinationId,
      departureDate: val.departureDate,
      returnDate: val.tripType === 'round-trip' ? val.returnDate : undefined,
      tripType: val.tripType,
      passengers: val.passengers,
      class: val.class
    };

    this.bookingState.searchCriteria.set(criteria);
    this.router.navigate(['/results']);
  }
}
