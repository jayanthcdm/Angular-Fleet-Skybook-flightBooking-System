import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BookingStateService } from '../../core/services/booking-state.service';
import { Passenger } from '../../core/models/models';

@Component({
  selector: 'app-passenger-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="container animate-in">
      <div class="page-header">
        <h1>👥 Passenger Information</h1>
        <p>Please enter traveller details for {{ passengerCount }} passenger{{ passengerCount > 1 ? 's' : '' }}</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div formArrayName="passengers">
          @for (ctrl of passengersArray.controls; track $index) {
            <mat-card class="passenger-card" [formGroupName]="$index">
              <div class="passenger-card-header">
                <div class="badge-number">{{ $index + 1 }}</div>
                <h3>Passenger {{ $index + 1 }} Details</h3>
              </div>

              <div class="passenger-card-body">
                <!-- Names -->
                <div class="grid-2">
                  <div class="form-group">
                    <label [attr.for]="'fn-' + $index">First Name *</label>
                    <input
                      [id]="'fn-' + $index"
                      type="text"
                      class="form-control"
                      formControlName="firstName"
                      placeholder="e.g. Rahul"
                    />
                    @if (isInvalid($index, 'firstName')) {
                      <div class="error-message">First name is required</div>
                    }
                  </div>

                  <div class="form-group">
                    <label [attr.for]="'ln-' + $index">Last Name *</label>
                    <input
                      [id]="'ln-' + $index"
                      type="text"
                      class="form-control"
                      formControlName="lastName"
                      placeholder="e.g. Sharma"
                    />
                    @if (isInvalid($index, 'lastName')) {
                      <div class="error-message">Last name is required</div>
                    }
                  </div>
                </div>

                <!-- Age & Gender -->
                <div class="grid-2">
                  <div class="form-group">
                    <label [attr.for]="'age-' + $index">Age *</label>
                    <input
                      [id]="'age-' + $index"
                      type="number"
                      class="form-control"
                      formControlName="age"
                      placeholder="Age (1-120)"
                      min="1"
                      max="120"
                    />
                    @if (isInvalid($index, 'age')) {
                      <div class="error-message">Age must be between 1 and 120</div>
                    }
                  </div>

                  <div class="form-group">
                    <label [attr.for]="'gender-' + $index">Gender *</label>
                    <select
                      [id]="'gender-' + $index"
                      class="form-control"
                      formControlName="gender"
                    >
                      <option value="" disabled>Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    @if (isInvalid($index, 'gender')) {
                      <div class="error-message">Gender selection is required</div>
                    }
                  </div>
                </div>

                <!-- Email & Phone -->
                <div class="grid-2">
                  <div class="form-group">
                    <label [attr.for]="'email-' + $index">Email Address *</label>
                    <input
                      [id]="'email-' + $index"
                      type="email"
                      class="form-control"
                      formControlName="email"
                      placeholder="rahul@example.com"
                    />
                    @if (isInvalid($index, 'email')) {
                      <div class="error-message">Valid email address is required</div>
                    }
                  </div>

                  <div class="form-group">
                    <label [attr.for]="'phone-' + $index">Mobile Phone *</label>
                    <input
                      [id]="'phone-' + $index"
                      type="tel"
                      class="form-control"
                      formControlName="phone"
                      placeholder="+91 9876543210"
                    />
                    @if (isInvalid($index, 'phone')) {
                      <div class="error-message">Valid phone number (10+ digits) is required</div>
                    }
                  </div>
                </div>
              </div>
            </mat-card>
          }
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" (click)="goBack()">
            ← Back to Flights
          </button>
          <button
            mat-raised-button
            color="primary"
            type="submit"
            class="btn-continue"
            [disabled]="form.invalid"
          >
            <span>Continue to Seat Selection →</span>
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .passenger-card {
      padding: 1.75rem !important;
      margin-bottom: 1.5rem;
      border-radius: 14px !important;
      box-shadow: 0 2px 10px rgba(0,0,0,0.06) !important;
    }

    .passenger-card-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.25rem;
      padding-bottom: 0.75rem;
      border-bottom: 2px solid #f1f5f9;

      .badge-number {
        background: #0d47a1;
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 0.9rem;
      }

      h3 {
        font-size: 1.2rem;
        font-weight: 700;
        color: #1e293b;
      }
    }

    .form-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 2rem;
    }

    .btn-continue {
      padding: 0.75rem 2rem !important;
      font-size: 1rem !important;
      font-weight: 700 !important;
      border-radius: 50px !important;
    }
  `]
})
export class PassengerDetailsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private bookingState = inject(BookingStateService);

  form!: FormGroup;
  passengerCount = 1;

  get passengersArray(): FormArray {
    return this.form.get('passengers') as FormArray;
  }

  ngOnInit(): void {
    if (!this.bookingState.selectedFlight()) {
      this.router.navigate(['/search']);
      return;
    }

    this.passengerCount = this.bookingState.passengerCount();

    const existing = this.bookingState.passengers();
    const groupList: FormGroup[] = [];

    for (let i = 0; i < this.passengerCount; i++) {
      const prev = existing[i];
      groupList.push(this.fb.group({
        firstName: [prev?.firstName || '', [Validators.required, Validators.minLength(2)]],
        lastName: [prev?.lastName || '', [Validators.required, Validators.minLength(1)]],
        age: [prev?.age || null, [Validators.required, Validators.min(1), Validators.max(120)]],
        gender: [prev?.gender || '', Validators.required],
        email: [prev?.email || '', [Validators.required, Validators.email]],
        phone: [prev?.phone || '', [Validators.required, Validators.pattern(/^[+]?[0-9\s-]{10,15}$/)]]
      }));
    }

    this.form = this.fb.group({
      passengers: this.fb.array(groupList)
    });
  }

  isInvalid(index: number, field: string): boolean {
    const ctrl = this.passengersArray.at(index).get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  goBack(): void {
    this.router.navigate(['/results']);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const list: Passenger[] = this.passengersArray.value.map((p: any) => ({
      firstName: p.firstName.trim(),
      lastName: p.lastName.trim(),
      age: Number(p.age),
      gender: p.gender,
      email: p.email.trim(),
      phone: p.phone.trim()
    }));

    this.bookingState.passengers.set(list);
    this.router.navigate(['/seats']);
  }
}
