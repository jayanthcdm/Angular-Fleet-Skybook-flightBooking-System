# Key Angular Concepts in SkyBook

## 1. Standalone Components & Modern Control Flow
- Every component is marked `standalone: true`.
- Zero `NgModules`. Dependencies (`CommonModule`, `ReactiveFormsModule`, Material modules) are imported locally per component.
- Modern control flow `@if`, `@for (...; track ...)`, and `@switch` replace `*ngIf` and `*ngFor` with compile-time type-safety.

## 2. Fine-Grained Reactivity with Signals
- Application state is held in `signal<T>()` wrappers (e.g. `selectedFlight`, `selectedSeats`, `currentBooking`).
- Derived computations use `computed<T>()` to automatically evaluate without side effects:
  ```typescript
  readonly totalBaseFare = computed(() => this.fareBreakdown().baseFare);
  readonly taxes = computed(() => this.fareBreakdown().taxes);
  readonly totalAmount = computed(() => this.fareBreakdown().total);
  ```

## 3. Functional Route Guards (`CanActivateFn`)
- Functional guards in `src/app/core/guards/`:
  - `flightSelectedGuard`: Ensures a flight is chosen before visiting `/passengers`.
  - `passengersSetGuard`: Requires valid traveller profiles before accessing `/seats`.
  - `seatsSelectedGuard`: Requires seat selection before proceeding to `/payment`.
  - `bookingConfirmedGuard`: Allows access to e-ticket if booking state or PNR exists.
  - `adminGuard`: Protects `/admin` console for authorized users.

## 4. Reactive Forms & Dynamic FormArrays
- The passenger management module uses a dynamic `FormArray` driven by the user's passenger count.
- Cross-field validation prevents selecting matching origin/destination or invalid return dates.

## 5. Angular Material Integration
- Prebuilt theme (`@angular/material/prebuilt-themes/indigo-pink.css`) combined with custom responsive SCSS.
- Components utilized: `MatToolbar`, `MatCard`, `MatButton`, `MatIcon`, `MatProgressSpinner`, `MatButtonToggle`, `MatChips`.
