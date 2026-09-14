# Nepal Trek Backend API

A REST API for a Nepal trekking company — trek listings, bookings, enquiries, reviews, and admin management.

## Tech Stack
- Node.js, Express 4, TypeScript
- MongoDB with Mongoose
- JWT authentication
- Cloudinary (image uploads)
- Nodemailer + Mailtrap (email)

## Setup

```bash
npm install
cp .env.example .env   # fill in your own values
npm run dev
```

## Environment Variables

See `.env.example` for required variables: `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLOUDINARY_*`, `EMAIL_*`, `FRONTEND_URL`.

---

## API Endpoints

### Auth — `/api/auth`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Create a new account |
| POST | `/login` | Public | Log in, returns JWT |
| POST | `/forgot-password` | Public | Request password reset (emails token) |
| PUT | `/reset-password/:token` | Public | Reset password using token |

### Treks — `/api/treks`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Public | List treks (supports filters, search, pagination) |
| GET | `/:id` | Public | Get single trek |
| GET | `/:trekId/reviews` | Public | Get reviews for a trek |
| POST | `/` | Admin | Create trek |
| PUT | `/:id` | Admin | Update trek |
| DELETE | `/:id` | Admin | Delete trek (blocked if active bookings exist) |
| POST | `/:id/images` | Admin | Upload trek images (multipart form, field name `images`) |

**Query params for `GET /`:** `region`, `difficulty`, `priceType`, `minPrice`, `maxPrice`, `search`, `page`, `limit`

### Bookings — `/api/bookings`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/` | Logged-in user | Create a booking (fixed-price treks only) |
| GET | `/my` | Logged-in user | View own bookings |
| GET | `/availability` | Logged-in user | Check spots left for a trek/date |
| GET | `/` | Admin | View all bookings (filters: `status`, `needsCapacityReview`, pagination) |
| PUT | `/:id/status` | Admin | Update booking status (pending/confirmed/cancelled/completed) |

### Enquiries — `/api/enquiries`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/` | Public | Submit an enquiry (for custom/onRequest treks) |
| GET | `/` | Admin | View all enquiries (filter: `status`, pagination) |
| PUT | `/:id/status` | Admin | Update enquiry status |

### Reviews — `/api/reviews`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/` | Logged-in user | Create review (only for completed bookings) |
| DELETE | `/:id` | Owner or Admin | Delete a review |

### Health
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/health` | Public | Server status check |

---

## Authentication

Protected routes require a header:


Token is returned from `/api/auth/register` or `/api/auth/login`.

## Roles
- `user` — default role, can book treks, submit reviews/enquiries
- `admin` — can manage treks, view all bookings/enquiries, update statuses

## Business Rules
- Treks are either `fixed` (bookable directly) or `onRequest` (enquiry only, no fixed price)
- Bookings auto-calculate price server-side; customer never sets their own price
- Bookings exceeding a trek's `maxGroupSize` for a date are flagged (`needsCapacityReview`), not blocked
- Reviews require a `completed` booking to prevent fake reviews
- Treks with active bookings cannot be deleted