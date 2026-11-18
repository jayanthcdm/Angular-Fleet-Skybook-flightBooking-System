# SkyBook – Flight Booking System

SkyBook is a full-featured, enterprise-grade flight booking demonstration application built with **Angular 21**, **TypeScript**, **Angular Material**, **Angular Signals**, and **JSON Server**.

---

## 🚀 Key Modules

1. **Flight Search:** One-way & round-trip search across Indian domestic and international routes with airport validation and class selection.
2. **Flight Results:** Real-time search results with multi-criteria filters (airline, stops, departure window) and sorting (cheapest, fastest).
3. **Passenger Management:** Dynamic reactive form with `FormArray` supporting multiple passengers with full data validation.
4. **Interactive Seat Map:** Visual aircraft cabin layout with seat categories (Economy, Business, First Class, Extra Legroom) and pricing.
5. **Centralized Fare Calculation:** Itemized breakdown of base fares, seat upgrade fees, 12% GST, and passenger convenience charges in INR (₹).
6. **Payment Simulation:** Realistic card payment gateway simulation with loading states, decline testing, and transaction ID generation.
7. **E-Ticket & PNR Confirmation:** Printable digital boarding pass with unique 8-character PNR reference, barcode, and full journey summary.
8. **Manage Bookings:** PNR lookup, reservation history, e-ticket retrieval, and one-click cancellation with automated refund calculation.
9. **Admin Dashboard:** Full operations console with live analytics and complete CRUD for flights, airlines, airports, and customer bookings.

---

## 🛠️ Technology Stack

- **Frontend Framework:** Angular 21 (Standalone Components, Signals, Modern Control Flow)
- **UI & Design:** Angular Material 21 + Responsive Custom SCSS
- **Forms:** Angular Reactive Forms with custom cross-field validators
- **Routing & Security:** Angular Router with functional `CanActivateFn` guards
- **Simulated Backend:** JSON Server (port 3000) backed by `db.json`
- **Testing:** Automated unit testing suite (`npm test`)

---

## 🏁 Quick Start

### 1. Start Both Backend & Frontend:
```bash
npm start
```
- **Angular UI:** [http://localhost:4200](http://localhost:4200)
- **REST API:** [http://localhost:3000](http://localhost:3000)

### 2. Run Automated Tests:
```bash
npm test
```

### 3. Production Build:
```bash
npm run build
```

---

## 🔑 Demo Credentials

- **Admin Account:** `admin@skybook.com` / `admin123`
- **Customer Account:** `demo@skybook.com` / `demo123`
