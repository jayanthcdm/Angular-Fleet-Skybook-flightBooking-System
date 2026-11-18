import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, forkJoin, map, catchError, throwError } from 'rxjs';
import { Flight, Airport, Airline, Booking, SeatMap, SearchCriteria, Payment, User } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'An unexpected error occurred';
    if (error.status === 0) {
      message = 'Cannot connect to API server. Please ensure JSON Server is running on port 3000.';
    } else if (error.status === 404) {
      message = 'Requested resource not found.';
    } else if (error.status >= 500) {
      message = 'Server error. Please try again later.';
    }
    console.error('API Error:', error.status, message);
    return throwError(() => new Error(message));
  }

  // === Airports ===
  getAirports(): Observable<Airport[]> {
    return this.http.get<Airport[]>(`${this.baseUrl}/airports`).pipe(catchError(e => this.handleError(e)));
  }

  getAirport(id: number): Observable<Airport> {
    return this.http.get<Airport>(`${this.baseUrl}/airports/${id}`).pipe(catchError(e => this.handleError(e)));
  }

  addAirport(airport: Omit<Airport, 'id'>): Observable<Airport> {
    return this.http.post<Airport>(`${this.baseUrl}/airports`, airport).pipe(catchError(e => this.handleError(e)));
  }

  updateAirport(airport: Airport): Observable<Airport> {
    return this.http.put<Airport>(`${this.baseUrl}/airports/${airport.id}`, airport).pipe(catchError(e => this.handleError(e)));
  }

  deleteAirport(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/airports/${id}`).pipe(catchError(e => this.handleError(e)));
  }

  // === Airlines ===
  getAirlines(): Observable<Airline[]> {
    return this.http.get<Airline[]>(`${this.baseUrl}/airlines`).pipe(catchError(e => this.handleError(e)));
  }

  addAirline(airline: Omit<Airline, 'id'>): Observable<Airline> {
    return this.http.post<Airline>(`${this.baseUrl}/airlines`, airline).pipe(catchError(e => this.handleError(e)));
  }

  updateAirline(airline: Airline): Observable<Airline> {
    return this.http.put<Airline>(`${this.baseUrl}/airlines/${airline.id}`, airline).pipe(catchError(e => this.handleError(e)));
  }

  deleteAirline(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/airlines/${id}`).pipe(catchError(e => this.handleError(e)));
  }

  // === Flights ===
  getFlights(): Observable<Flight[]> {
    return this.http.get<Flight[]>(`${this.baseUrl}/flights`).pipe(catchError(e => this.handleError(e)));
  }

  getFlight(id: number): Observable<Flight> {
    return this.http.get<Flight>(`${this.baseUrl}/flights/${id}`).pipe(catchError(e => this.handleError(e)));
  }

  addFlight(flight: Omit<Flight, 'id'>): Observable<Flight> {
    return this.http.post<Flight>(`${this.baseUrl}/flights`, flight).pipe(catchError(e => this.handleError(e)));
  }

  updateFlight(flight: Flight): Observable<Flight> {
    return this.http.put<Flight>(`${this.baseUrl}/flights/${flight.id}`, flight).pipe(catchError(e => this.handleError(e)));
  }

  deleteFlight(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/flights/${id}`).pipe(catchError(e => this.handleError(e)));
  }

  searchFlights(criteria: SearchCriteria): Observable<Flight[]> {
    return forkJoin({
      flights: this.getFlights(),
      airlines: this.getAirlines(),
      airports: this.getAirports()
    }).pipe(
      map(({ flights, airlines, airports }) => {
        return flights
          .filter(f => {
            const matchOrigin = !criteria.originId || f.originId === criteria.originId;
            const matchDest = !criteria.destinationId || f.destinationId === criteria.destinationId;
            const matchDate = !criteria.departureDate || f.departureDate === criteria.departureDate;
            const classKey = criteria.class || 'economy';
            const hasSeats = f.seatsAvailable[classKey] > 0;
            return matchOrigin && matchDest && matchDate && hasSeats;
          })
          .map(f => ({
            ...f,
            airline: airlines.find(a => a.id === f.airlineId),
            origin: airports.find(a => a.id === f.originId),
            destination: airports.find(a => a.id === f.destinationId)
          }));
      })
    );
  }

  getFlightWithDetails(id: number): Observable<Flight> {
    return forkJoin({
      flight: this.getFlight(id),
      airlines: this.getAirlines(),
      airports: this.getAirports()
    }).pipe(
      map(({ flight, airlines, airports }) => ({
        ...flight,
        airline: airlines.find(a => a.id === flight.airlineId),
        origin: airports.find(a => a.id === flight.originId),
        destination: airports.find(a => a.id === flight.destinationId)
      }))
    );
  }

  // === Bookings ===
  getBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.baseUrl}/bookings`).pipe(catchError(e => this.handleError(e)));
  }

  getBooking(id: number): Observable<Booking> {
    return this.http.get<Booking>(`${this.baseUrl}/bookings/${id}`).pipe(catchError(e => this.handleError(e)));
  }

  getBookingByPnr(pnr: string): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.baseUrl}/bookings?pnr=${pnr}`).pipe(catchError(e => this.handleError(e)));
  }

  createBooking(booking: Omit<Booking, 'id'>): Observable<Booking> {
    return this.http.post<Booking>(`${this.baseUrl}/bookings`, booking).pipe(catchError(e => this.handleError(e)));
  }

  updateBooking(booking: Booking): Observable<Booking> {
    return this.http.put<Booking>(`${this.baseUrl}/bookings/${booking.id}`, booking).pipe(catchError(e => this.handleError(e)));
  }

  getBookingsWithFlights(): Observable<Booking[]> {
    return forkJoin({
      bookings: this.getBookings(),
      flights: this.getFlights(),
      airlines: this.getAirlines(),
      airports: this.getAirports()
    }).pipe(
      map(({ bookings, flights, airlines, airports }) => {
        return bookings.map(b => {
          const flight = flights.find(f => f.id === b.flightId);
          return {
            ...b,
            flight: flight ? {
              ...flight,
              airline: airlines.find(a => a.id === flight.airlineId),
              origin: airports.find(a => a.id === flight.originId),
              destination: airports.find(a => a.id === flight.destinationId)
            } : undefined
          };
        });
      })
    );
  }

  // === Payments ===
  getPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.baseUrl}/payments`).pipe(catchError(e => this.handleError(e)));
  }

  createPayment(payment: Omit<Payment, 'id'>): Observable<Payment> {
    return this.http.post<Payment>(`${this.baseUrl}/payments`, payment).pipe(catchError(e => this.handleError(e)));
  }

  updatePayment(payment: Payment): Observable<Payment> {
    return this.http.put<Payment>(`${this.baseUrl}/payments/${payment.id}`, payment).pipe(catchError(e => this.handleError(e)));
  }

  // === Seat Maps ===
  getSeatMaps(): Observable<SeatMap[]> {
    return this.http.get<SeatMap[]>(`${this.baseUrl}/seatMaps`).pipe(catchError(e => this.handleError(e)));
  }

  getSeatMapByAircraft(aircraft: string): Observable<SeatMap | undefined> {
    return this.getSeatMaps().pipe(
      map(maps => maps.find(m => m.aircraft === aircraft))
    );
  }

  updateSeatMap(seatMap: SeatMap): Observable<SeatMap> {
    return this.http.put<SeatMap>(`${this.baseUrl}/seatMaps/${seatMap.id}`, seatMap).pipe(catchError(e => this.handleError(e)));
  }

  // === Users ===
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/users`).pipe(catchError(e => this.handleError(e)));
  }

  loginUser(email: string, password: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/users?email=${email}&password=${password}`).pipe(catchError(e => this.handleError(e)));
  }
}
