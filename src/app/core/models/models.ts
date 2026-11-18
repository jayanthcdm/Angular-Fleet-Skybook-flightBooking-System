export interface Airport {
  id: number;
  code: string;
  name: string;
  city: string;
  country: string;
}

export interface Airline {
  id: number;
  code: string;
  name: string;
  logo: string;
}

export interface FlightPrices {
  economy: number;
  business: number;
  first: number;
}

export interface SeatsAvailable {
  economy: number;
  business: number;
  first: number;
}

export type CabinClass = 'economy' | 'business' | 'first';
export type TripType = 'one-way' | 'round-trip';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'failed';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Flight {
  id: number;
  flightNumber: string;
  airlineId: number;
  originId: number;
  destinationId: number;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  durationMinutes: number;
  stops: number;
  stopDetails: string[];
  aircraft: string;
  prices: FlightPrices;
  seatsAvailable: SeatsAvailable;
  departureDate: string;
  status: string;
  // Populated on client
  airline?: Airline;
  origin?: Airport;
  destination?: Airport;
}

export interface Passenger {
  firstName: string;
  lastName: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  email: string;
  phone: string;
  seatNumber?: string;
}

export interface Booking {
  id?: number;
  pnr: string;
  flightId: number;
  passengers: Passenger[];
  class: CabinClass;
  totalAmount: number;
  baseFare: number;
  taxes: number;
  fees: number;
  status: BookingStatus;
  bookingDate: string;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  // Populated on client
  flight?: Flight;
}

export interface Payment {
  id?: number;
  transactionId: string;
  bookingId: number;
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  method: string;
  cardLast4: string;
  timestamp: string;
}

export interface SeatClassInfo {
  rows: number[];
  price: number;
}

export interface SeatMap {
  id: number;
  aircraft: string;
  rows: number;
  seatsPerRow: number;
  layout: string;
  firstClass: SeatClassInfo;
  business: SeatClassInfo;
  economy: SeatClassInfo;
  emergencyExitRows: number[];
  extraLegroom: number[];
  occupiedSeats: string[];
}

export interface SearchCriteria {
  originId: number | null;
  destinationId: number | null;
  departureDate: string;
  returnDate?: string;
  tripType: TripType;
  passengers: number;
  class: CabinClass;
}

export interface FareBreakdown {
  baseFare: number;
  seatCharges: number;
  taxes: number;
  fees: number;
  total: number;
  perPassenger: number;
  currency: string;
}

export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'customer';
}
