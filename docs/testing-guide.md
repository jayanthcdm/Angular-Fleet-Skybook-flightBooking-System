# SkyBook Testing Guide

SkyBook includes an automated unit test suite covering pure business calculations, PNR generation, inventory restoration, payment simulations, and form validations.

## Running Tests

Execute the automated test suite with:

```bash
npm test
```

## Test Suites

1. **`tests/fare-calculation.test.ts`**
   - Verifies zero fare fallback for empty searches.
   - Verifies base fare calculation across passenger counts and cabin classes.
   - Verifies 12% GST calculation and flat convenience fees.
   - Verifies seat upgrade surcharges (Business, First, Extra Legroom).
   - Verifies return journey fare calculation.

2. **`tests/booking-service.test.ts`**
   - Verifies 8-character PNR format matching `^SKY[A-Z0-9]{5}$`.
   - Verifies PNR uniqueness across subsequent generations.
   - Verifies cancellation fee calculation (min of ₹1,000 or 15% of fare).
   - Verifies net refund calculation.

3. **`tests/payment-service.test.ts`**
   - Verifies transaction reference format `TXN-YYYYMMDD-XXXXXX`.
   - Verifies double-submission prevention and state tracking.

4. **`tests/validation.test.ts`**
   - Verifies origin ≠ destination constraint.
   - Verifies return date ≥ departure date validation.
   - Verifies email pattern validation.
   - Verifies age constraints (1–120).
