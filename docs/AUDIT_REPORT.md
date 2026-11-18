# SkyBook Flight Booking System – Comprehensive Audit Report

**Date of Audit:** 2026-11-18  
**Auditor:** Senior Angular Architect & Flight Booking Domain Specialist  
**Application:** SkyBook – Flight Booking System (Angular 21 + JSON Server)  
**Status:** Remediated & Fully Verified  

---

## 1. Executive Summary

A comprehensive, line-by-line inspection of the SkyBook codebase was conducted across configuration, models, services, guards, routing, and all user-facing components. Several critical business logic bugs, currency inconsistencies, styling defects, and architecture vulnerabilities were identified and resolved.

The project was refactored from a flat page-based layout into a clean, feature-driven enterprise architecture (`core/`, `shared/`, `features/`), equipped with Angular Material 21 components, functional route guards, centralized fare calculations, and simulated payment with database persistence.

---

## 2. Identified Defect Matrix & Remediation

| Issue ID | Severity | Affected File | Description | Proposed Fix | Status |
|:---|:---|:---|:---|:---|:---|
| **AUD-01** | **HIGH** | `features/seats/seat-selection.component.ts` | The `isSeatAvailable()` method excluded First and Business class seats, preventing them from being styled and selected. | Removed premature class filter from availability check; seat selection now allows choosing cabin seats matching passenger counts. | **VERIFIED FIXED** |
| **AUD-02** | **HIGH** | `core/services/booking-state.service.ts` | Selected seat upgrade charges were never factored into the computed total amount, causing fare discrepancy during payment. | Created dedicated `FareCalculationService` to centrally calculate base fares, seat fees, 12% GST, and passenger convenience charges. | **VERIFIED FIXED** |
| **AUD-03** | **MEDIUM** | `features/flights/flight-results.component.ts` | Hardcoded `$` dollar sign was displayed while all fares in `db.json` are in Indian Rupees (INR). | Standardized currency symbol to `₹` (INR) and formatted with `number` pipe. | **VERIFIED FIXED** |
| **AUD-04** | **MEDIUM** | `features/admin/admin.component.ts` | Escaped template strings `$\{{ ... }}` rendered literal `$\` before amounts on screen. | Fixed syntax to clean `₹{{ ... }}` interpolation and added currency pipes. | **VERIFIED FIXED** |
| **AUD-05** | **MEDIUM** | `features/tickets/booking-confirmation.component.ts` | Direct URL navigation or browser refresh redirected to `/bookings` because the component depended solely on in-memory signals. | Added query param `?pnr=` lookup fallback and retrieval from `BookingService.getBookingByPnr()`. | **VERIFIED FIXED** |
| **AUD-06** | **MEDIUM** | `core/guards/booking-flow.guard.ts` | Guard blocked direct navigation to `/confirmation` when refreshing with a valid PNR. | Updated `bookingConfirmedGuard` to accept active PNR query parameters. | **VERIFIED FIXED** |
| **AUD-07** | **LOW** | `core/services/api.service.ts` | Unhandled HTTP errors caused silent application freezes when JSON server was unreachable. | Introduced `handleError` with user-friendly messages for connection failure, 404, and 500 errors. | **VERIFIED FIXED** |
| **AUD-08** | **LOW** | `angular.json` | Scaffolding lacked test configurations and initial bundle budget was too conservative for Angular Material. | Added `tsx` test runner script in `package.json` and adjusted production budget thresholds. | **VERIFIED FIXED** |

---

## 3. Verified Clean Areas

1. **Angular 21 Standalone Architecture:** All components cleanly use `@Component` with `standalone: true` and direct imports.
2. **Signals & Computed State:** Fine-grained reactivity using Angular `signal()` and `computed()` without memory leaks.
3. **Reactive Forms Validation:** Cross-field validations (origin ≠ destination, return date ≥ departure date, age 1–120, email pattern, phone pattern) function accurately.
4. **JSON Server Database:** `db.json` normalized with Indian hubs (DEL, BOM, BLR, MAA, CCU, HYD, GOI), top airlines (Air India, IndiGo, SpiceJet, Vistara, Akasa, Emirates, Singapore Airlines), realistic aircraft seat maps, and active bookings.
