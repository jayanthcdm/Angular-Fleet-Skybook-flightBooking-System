# REST API Documentation (JSON Server)

SkyBook communicates with JSON Server hosted on `http://localhost:3000`.

## Endpoints

| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/airports` | List all airports |
| `GET` | `/airports/:id` | Get airport by ID |
| `POST` | `/airports` | Add a new airport (Admin) |
| `PUT` | `/airports/:id` | Update airport details (Admin) |
| `DELETE` | `/airports/:id` | Remove airport (Admin) |
| `GET` | `/airlines` | List partner airlines |
| `POST` | `/airlines` | Add a new airline (Admin) |
| `PUT` | `/airlines/:id` | Update airline details (Admin) |
| `DELETE` | `/airlines/:id` | Remove airline (Admin) |
| `GET` | `/flights` | List all scheduled flights |
| `GET` | `/flights/:id` | Get flight by ID |
| `POST` | `/flights` | Create scheduled flight (Admin) |
| `PUT` | `/flights/:id` | Update flight route, schedule, or seat inventory |
| `DELETE` | `/flights/:id` | Cancel/remove scheduled flight (Admin) |
| `GET` | `/seatMaps` | List aircraft cabin layouts |
| `PUT` | `/seatMaps/:id` | Update occupied seats |
| `GET` | `/bookings` | List customer bookings |
| `GET` | `/bookings?pnr=:pnr` | Query booking by unique PNR reference |
| `POST` | `/bookings` | Create new confirmed booking |
| `PUT` | `/bookings/:id` | Update booking status (e.g. cancellation) |
| `GET` | `/payments` | List transaction records |
| `POST` | `/payments` | Record new payment transaction |
| `GET` | `/users` | List registered user profiles |
| `GET` | `/users?email=:email&password=:pwd` | Authenticate user credentials |
