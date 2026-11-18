import { inject } from '@angular/core';
import { CanActivateFn, CanDeactivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { BookingStateService } from '../services/booking-state.service';
import { PaymentService } from '../services/payment.service';
import { PaymentComponent } from '../../features/payments/payment.component';

/** Protects /results: requires search criteria (origin & destination) to be defined */
export const searchCriteriaGuard: CanActivateFn = () => {
  const state = inject(BookingStateService);
  const router = inject(Router);
  const crit = state.searchCriteria();

  if (crit.originId && crit.destinationId) {
    return true;
  }
  return router.createUrlTree(['/search']);
};

/** Protects /passengers: requires an outbound flight to be selected */
export const flightSelectedGuard: CanActivateFn = () => {
  const state = inject(BookingStateService);
  const router = inject(Router);

  if (state.selectedFlight()) {
    return true;
  }
  return router.createUrlTree(['/search']);
};

/** Protects /seats: requires passengers to have been entered */
export const passengersSetGuard: CanActivateFn = () => {
  const state = inject(BookingStateService);
  const router = inject(Router);

  if (state.passengers().length > 0) {
    return true;
  }
  return router.createUrlTree(['/passengers']);
};

/** Protects /payment: requires at least one seat to be selected */
export const seatsSelectedGuard: CanActivateFn = () => {
  const state = inject(BookingStateService);
  const router = inject(Router);

  if (state.selectedSeats().length > 0) {
    return true;
  }
  return router.createUrlTree(['/seats']);
};

/** Protects /confirmation: allows if currentBooking exists OR if a pnr query parameter is provided */
export const bookingConfirmedGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const state = inject(BookingStateService);
  const router = inject(Router);

  if (state.currentBooking() || route.queryParams['pnr']) {
    return true;
  }
  return router.createUrlTree(['/bookings']);
};

/** CanDeactivate guard for Payment: warns user if payment authorization is in progress */
export const paymentProcessingGuard: CanDeactivateFn<PaymentComponent> = (component: PaymentComponent) => {
  const paymentService = inject(PaymentService);

  if (paymentService.isProcessing() || component.processing()) {
    return confirm('Your payment is currently being processed. Leaving now may cause an incomplete transaction. Do you really want to leave?');
  }
  return true;
};
