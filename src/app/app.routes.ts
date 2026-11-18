import { Routes } from '@angular/router';
import {
  searchCriteriaGuard,
  flightSelectedGuard,
  passengersSetGuard,
  seatsSelectedGuard,
  bookingConfirmedGuard,
  paymentProcessingGuard
} from './core/guards/booking-flow.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'search',
    loadComponent: () => import('./features/flights/flight-search.component').then(m => m.FlightSearchComponent)
  },
  {
    path: 'results',
    loadComponent: () => import('./features/flights/flight-results.component').then(m => m.FlightResultsComponent),
    canActivate: [searchCriteriaGuard]
  },
  {
    path: 'passengers',
    loadComponent: () => import('./features/passengers/passenger-details.component').then(m => m.PassengerDetailsComponent),
    canActivate: [flightSelectedGuard]
  },
  {
    path: 'seats',
    loadComponent: () => import('./features/seats/seat-selection.component').then(m => m.SeatSelectionComponent),
    canActivate: [passengersSetGuard]
  },
  {
    path: 'payment',
    loadComponent: () => import('./features/payments/payment.component').then(m => m.PaymentComponent),
    canActivate: [seatsSelectedGuard],
    canDeactivate: [paymentProcessingGuard]
  },
  {
    path: 'confirmation',
    loadComponent: () => import('./features/tickets/booking-confirmation.component').then(m => m.BookingConfirmationComponent),
    canActivate: [bookingConfirmedGuard]
  },
  {
    path: 'bookings',
    loadComponent: () => import('./features/bookings/manage-bookings.component').then(m => m.ManageBookingsComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [adminGuard]
  },
  { path: '**', redirectTo: '' }
];
