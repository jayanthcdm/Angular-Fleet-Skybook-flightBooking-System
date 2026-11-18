# SkyBook Architecture Overview

SkyBook is structured following enterprise Angular best practices with feature-driven architecture and layered design.

```
src/app/
├── core/                           # Singleton services, guards, interceptors, and data models
│   ├── guards/
│   │   ├── admin.guard.ts          # Protects administrative dashboard
│   │   └── booking-flow.guard.ts   # Step-by-step route guard for booking funnel
│   ├── models/
│   │   └── models.ts               # Strict TypeScript interfaces
│   └── services/
│       ├── api.service.ts          # HttpClient interface to simulated REST backend
│       ├── auth.service.ts         # User authentication & demo role management
│       ├── booking.service.ts      # PNR generation, inventory restoration, cancellations
│       ├── booking-state.service.ts# Centralized Signals-based workflow state
│       ├── fare-calculation.service.ts # Pure business calculation of base fares, GST & fees
│       └── payment.service.ts      # Simulated payment gateway with failure triggers
│
├── shared/                         # Reusable presentation components
│   └── components/
│       ├── loading-spinner.component.ts
│       └── page-header.component.ts
│
├── features/                       # Lazy-loaded functional domain modules
│   ├── home/                       # Landing hero, top routes, value propositions
│   ├── flights/                    # Search filters, sorting, real-time results
│   ├── passengers/                 # Reactive FormArray for traveller details
│   ├── seats/                      # Interactive fuselage seat map & cabin class rules
│   ├── payments/                   # Itemized fare review & card transaction simulation
│   ├── tickets/                    # Printable digital boarding pass & PNR display
│   ├── bookings/                   # PNR lookup & cancellation with refund calculations
│   └── admin/                      # Operations console (Flight, Fleet, Airport, Booking CRUD)
│
├── app.config.ts                   # Application providers (Router, HttpClient, ErrorListeners)
├── app.routes.ts                   # Lazy-loaded route map with functional CanActivateFn guards
└── app.ts                          # App shell with Material toolbar and responsive navigation
```
