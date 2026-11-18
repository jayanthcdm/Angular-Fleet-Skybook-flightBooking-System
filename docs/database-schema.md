# Database Schema (JSON Server - db.json)

The database schema simulates a relational flight reservation database with JSON Server.

## Collections

### 1. `airports`
- `id` (number): Primary key
- `code` (string): 3-letter IATA code (e.g. `DEL`, `BOM`, `BLR`)
- `name` (string): Official airport title
- `city` (string): Serving metropolitan area
- `country` (string): Country name

### 2. `airlines`
- `id` (number): Primary key
- `code` (string): 2-letter airline code (e.g. `AI`, `6E`, `UK`, `SG`)
- `name` (string): Airline brand name
- `logo` (string): Airline emoji or icon token

### 3. `flights`
- `id` (number): Primary key
- `flightNumber` (string): e.g. `6E-201`, `AI-101`
- `airlineId` (number): Foreign key referencing `airlines.id`
- `originId` (number): Foreign key referencing `airports.id`
- `destinationId` (number): Foreign key referencing `airports.id`
- `departureTime` (string): 24-hour time (e.g. `06:00`)
- `arrivalTime` (string): 24-hour time (e.g. `08:10`)
- `duration` (string): Human-readable duration (`2h 10m`)
- `durationMinutes` (number): Numeric minutes for fast sorting
- `stops` (number): 0 for non-stop, 1+ for connecting
- `stopDetails` (string[]): Connecting airport IATA codes
- `aircraft` (string): Aircraft model (e.g. `Airbus A320neo`)
- `prices` (object): Fares per class `{ economy: number, business: number, first: number }` in INR
- `seatsAvailable` (object): Remaining inventory per class `{ economy: number, business: number, first: number }`
- `departureDate` (string): YYYY-MM-DD format
- `status` (string): `scheduled`, `delayed`, `cancelled`

### 4. `seatMaps`
- `id` (number): Primary key
- `aircraft` (string): Matches `flights.aircraft`
- `rows` (number): Total seat rows
- `seatsPerRow` (number): Total seat columns
- `layout` (string): Cabin aisle configuration (e.g. `ABC-DEF` or `ABC-DEFG-HJK`)
- `firstClass` (object): `{ rows: number[], price: number }`
- `business` (object): `{ rows: number[], price: number }`
- `economy` (object): `{ rows: number[], price: number }`
- `emergencyExitRows` (number[]): Row indices with emergency exits
- `extraLegroom` (number[]): Row indices with extra legroom
- `occupiedSeats` (string[]): Array of seat identifiers already booked (e.g. `['1A', '3B']`)

### 5. `bookings`
- `id` (number): Primary key
- `pnr` (string): Unique 8-character booking reference (e.g. `SKY7A3B2`)
- `flightId` (number): Foreign key referencing `flights.id`
- `passengers` (array): Array of passenger objects with assigned `seatNumber`
- `class` (string): `economy`, `business`, or `first`
- `totalAmount` (number): Final paid fare in INR
- `baseFare` (number): Flight base fare + seat charges
- `taxes` (number): 12% GST
- `fees` (number): Airport & convenience fees
- `status` (string): `confirmed`, `cancelled`, or `pending`
- `bookingDate` (string): ISO 8601 timestamp
- `paymentStatus` (string): `paid`, `refunded`, or `failed`
- `paymentId` (string): Reference to payment transaction

### 6. `payments`
- `id` (number): Primary key
- `transactionId` (string): Reference format `TXN-YYYYMMDD-XXXXXX`
- `bookingId` (number): Foreign key referencing `bookings.id`
- `amount` (number): Amount charged
- `currency` (string): Always `INR`
- `status` (string): `success`, `declined`, or `refunded`
- `method` (string): `Credit/Debit Card`
- `cardLast4` (string): Last 4 digits of card used
- `timestamp` (string): ISO 8601 timestamp

### 7. `users`
- `id` (number): Primary key
- `email` (string): Login email
- `password` (string): Login password
- `name` (string): Display name
- `role` (string): `admin` or `customer`
