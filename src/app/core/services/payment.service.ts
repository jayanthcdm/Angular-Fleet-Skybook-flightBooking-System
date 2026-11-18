import { Injectable, inject, signal } from '@angular/core';
import { Observable, delay, of, tap, switchMap, throwError, map, catchError } from 'rxjs';
import { ApiService } from './api.service';
import { Payment } from '../models/models';

export interface PaymentRequest {
  bookingId: number;
  amount: number;
  cardNumber: string;
  cardHolder: string;
  expiry: string;
  cvv: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  message: string;
  payment?: Payment;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private api!: ApiService;
  readonly isProcessing = signal<boolean>(false);

  constructor() {
    try {
      this.api = inject(ApiService);
    } catch {
      this.api = {} as ApiService;
    }
  }

  /**
   * Generates a unique transaction reference
   */
  generateTransactionId(): string {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomHex = Math.floor(100000 + Math.random() * 900000);
    return `TXN-${dateStr}-${randomHex}`;
  }

  /**
   * Simulates payment processing with JSON Server backend persistence
   */
  processPayment(request: PaymentRequest): Observable<PaymentResult> {
    if (this.isProcessing()) {
      return throwError(() => new Error('A payment transaction is already in progress. Please wait.'));
    }

    this.isProcessing.set(true);

    // Clean card number
    const cleanCard = request.cardNumber.replace(/\s+/g, '');
    const last4 = cleanCard.slice(-4) || '4242';

    // Simulation logic: Cards ending in "0000" trigger simulated failure for testing
    const willFail = last4 === '0000';
    const txnId = this.generateTransactionId();

    return of(null).pipe(
      delay(1000), // realistic network latency
      switchMap(() => {
        if (willFail) {
          this.isProcessing.set(false);
          return of({
            success: false,
            transactionId: txnId,
            message: 'Transaction declined by issuer. (Simulated test failure for card ending in 0000)'
          });
        }

        const paymentPayload: Omit<Payment, 'id'> = {
          transactionId: txnId,
          bookingId: request.bookingId,
          amount: request.amount,
          currency: 'INR',
          status: 'success',
          method: 'Credit/Debit Card',
          cardLast4: last4,
          timestamp: new Date().toISOString()
        };

        if (!this.api || !this.api.createPayment) {
          this.isProcessing.set(false);
          return of({
            success: true,
            transactionId: txnId,
            message: 'Payment approved (offline mode).',
            payment: { ...paymentPayload, id: Date.now() }
          });
        }

        return this.api.createPayment(paymentPayload).pipe(
          map(saved => {
            this.isProcessing.set(false);
            return {
              success: true,
              transactionId: txnId,
              message: 'Payment authorized and processed successfully.',
              payment: saved
            };
          }),
          catchError(() => {
            this.isProcessing.set(false);
            return of({
              success: true,
              transactionId: txnId,
              message: 'Payment approved (offline mode).',
              payment: { ...paymentPayload, id: Date.now() }
            });
          })
        );
      }),
      tap({
        error: () => this.isProcessing.set(false)
      })
    );
  }
}
