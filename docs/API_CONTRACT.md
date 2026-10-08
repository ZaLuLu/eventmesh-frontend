# EventMesh API Contract Specification

> **Version**: 1.0.0  
> **Status**: Production Reference  
> **Backend Compatibility**: Node.js / Express, NestJS, Go, Python / FastAPI, or any HTTP/JSON engine  
> **Architecture**: Port-and-Adapter architecture (Hexagonal)  

This document serves as the formal interface contract between the EventMesh Frontend and Backend services. Every endpoint is modeled on the TypeScript contracts in `src/api/contracts/` and ports in `src/api/ports/`.

---

## 1. Global Standards & Conventions

### 1.1 Base URL & Content Negotiation
- **Base URL**: Configured via `VITE_API_BASE_URL` (e.g. `https://api.eventmesh.xyz/v1`)
- **Headers**:
  ```http
  Accept: application/json
  Content-Type: application/json
  Authorization: Bearer <jwt-token>
  X-Organization-ID: <org-id>
  ```

### 1.2 Unified Error Response Format
All 4xx and 5xx responses conform to RFC 7807 problem details:
```json
{
  "code": "RESOURCE_NOT_FOUND",
  "message": "Event with identifier 'grand-turing-hackathon' not found.",
  "status": 404,
  "details": {
    "field": "slug",
    "value": "grand-turing-hackathon"
  },
  "timestamp": "2026-10-08T10:00:00.000Z"
}
```

Standard error codes:
- `UNAUTHORIZED` (401): Missing or expired bearer token
- `FORBIDDEN` (403): Role or club ownership check failed
- `NOT_FOUND` (404): Resource not found
- `VALIDATION_FAILED` (422): Schema validation errors (returns field array)
- `CONFLICT` (409): Duplicate email/handle or capacity exceeded
- `RATE_LIMITED` (429): Quota exceeded
- `INTERNAL_ERROR` (500): Server error

### 1.3 Cursor & Offset Pagination
List endpoints accept standard query parameters:
- `page`: 1-based integer (default `1`)
- `limit`: items per page, 1 to 100 (default `20`)
- `sort`: field name with optional prefix `-` for descending (e.g. `-startsAt`)

Paginated response envelope:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 142,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## 2. API Ports & Endpoint Directory

### 2.1 Events Port (`EventsPort`)

#### `GET /api/v1/events`
- **Role**: `ANONYMOUS` (Public)
- **Description**: Search and list published events with faceted filtering.
- **Query Parameters**:
  - `orgId` (string, required)
  - `clubId` (string, optional)
  - `category` (string, optional: `HACKATHON` | `WORKSHOP` | `TALK` | `EXHIBITION` | `COMPETITION` | `SOCIAL`)
  - `status` (string, optional: `PUBLISHED` | `ONGOING` | `COMPLETED`)
  - `query` (string, optional)
  - `from` (ISO8601, optional)
  - `to` (ISO8601, optional)
  - `page`, `limit`
- **Response**: `200 OK` → `{ "data": Event[], "pagination": PaginationMeta }`

#### `GET /api/v1/events/:slugOrId`
- **Role**: `ANONYMOUS` (Public)
- **Description**: Fetch detailed public event by slug or UUID.
- **Response**: `200 OK` → `Event` | `404 Not Found`

#### `GET /api/v1/events/featured`
- **Role**: `ANONYMOUS` (Public)
- **Description**: Fetch signature/hero events for the editorial exhibition wall.
- **Response**: `200 OK` → `Event[]`

---

### 2.2 Admin Events Port (`EventsAdminPort`)

#### `POST /api/v1/admin/events`
- **Role**: `CLUB_LEAD`, `CLUB_ADMIN`, `ORG_ADMIN`, `SYSTEM_ADMIN`
- **Guard**: Club admins can only create events for their assigned club (`organizerClubId`).
- **Request Body**: `CreateEventInput`
  ```json
  {
    "title": "Grand Turing Hackathon 2026",
    "summary": "36-hour competitive hackathon.",
    "description": "Full markdown body...",
    "category": "HACKATHON",
    "organizerClubId": "club-devcraft",
    "startsAt": "2026-10-15T09:00:00Z",
    "endsAt": "2026-10-16T21:00:00Z",
    "venueName": "Turing Auditorium",
    "venueAddress": "Block 4, Tech Park",
    "capacity": 200,
    "registrationDeadline": "2026-10-14T18:00:00Z",
    "requiresApproval": false,
    "tags": ["competitive", "algorithms"],
    "signatureAccentColor": "#E54D2E"
  }
  ```
- **Response**: `201 Created` → `Event`

#### `PATCH /api/v1/admin/events/:id`
- **Role**: `CLUB_LEAD` (own club), `CLUB_ADMIN` (own club), `ORG_ADMIN`
- **Request Body**: `UpdateEventInput`
- **Response**: `200 OK` → `Event`

#### `POST /api/v1/admin/events/:id/publish`
- **Role**: `CLUB_ADMIN` (own club), `ORG_ADMIN`
- **Response**: `200 OK` → `Event` (status changed to `PUBLISHED`)

#### `DELETE /api/v1/admin/events/:id`
- **Role**: `CLUB_ADMIN` (own club), `ORG_ADMIN`
- **Response**: `204 No Content`

---

### 2.3 Registrations Port (`RegistrationsPort`)

#### `POST /api/v1/events/:eventId/register`
- **Role**: `ANONYMOUS` or `ATTENDEE`
- **Request Body**:
  ```json
  {
    "eventId": "evt-1",
    "attendeeName": "Aarav Sharma",
    "attendeeEmail": "aarav@example.com",
    "attendeePhone": "+91 9876543210",
    "formAnswers": {
      "experience_level": "intermediate",
      "dietary_preference": "vegetarian"
    }
  }
  ```
- **Response**: `201 Created` →
  ```json
  {
    "registration": {
      "id": "reg-99",
      "ticketCode": "PASS-8842",
      "status": "CONFIRMED",
      "createdAt": "2026-10-08T10:00:00Z"
    },
    "qrDataUrl": "data:image/svg+xml;base64,..."
  }
  ```

#### `GET /api/v1/admin/events/:eventId/registrations`
- **Role**: `VOLUNTEER` (own club), `CLUB_LEAD` (own club), `CLUB_ADMIN` (own club), `ORG_ADMIN`
- **Response**: `200 OK` → `Registration[]`

#### `PATCH /api/v1/admin/registrations/:registrationId`
- **Role**: `CLUB_ADMIN` (own club), `ORG_ADMIN`
- **Request Body**: `{ "status": "APPROVED" | "REJECTED" | "CANCELLED" }`
- **Response**: `200 OK` → `Registration`

---

### 2.4 Check-in & Gate Terminal Port (`CheckinPort`)

#### `POST /api/v1/admin/events/:eventId/checkin`
- **Role**: `VOLUNTEER` (own club), `CLUB_ADMIN` (own club), `ORG_ADMIN`
- **Request Body**:
  ```json
  {
    "ticketCode": "PASS-8842",
    "gateTerminal": "TERMINAL_ALPHA",
    "verifiedBy": "usr-vol-1"
  }
  ```
- **Response**: `200 OK` →
  ```json
  {
    "success": true,
    "attendeeName": "Aarav Sharma",
    "checkedInAt": "2026-10-15T09:12:04Z",
    "alreadyCheckedIn": false
  }
  ```

---

### 2.5 Verification & Certificates Port (`CertificatesPort`)

#### `GET /api/v1/verify/:certificateId`
- **Role**: `ANONYMOUS` (Public)
- **Description**: Public verification endpoint for digital credentials.
- **Response**: `200 OK` →
  ```json
  {
    "certificateId": "TA-2026-001245",
    "recipientName": "Priya Ramanathan",
    "eventName": "Grand Turing Hackathon 2026",
    "issuedAt": "2026-10-16T22:00:00Z",
    "clubName": "DevCraft",
    "signatureValid": true,
    "issuer": "Technical Association Executive Board"
  }
  ```

#### `POST /api/v1/admin/events/:eventId/certificates/generate`
- **Role**: `CLUB_ADMIN` (own club), `ORG_ADMIN`
- **Request Body**: `{ "templateId": "tmpl-standard-honors", "recipientIds": ["reg-1", "reg-2"] }`
- **Response**: `200 OK` → `Certificate[]`

---

### 2.6 Clubs & Organizations Port (`ClubsPort`, `OrganizationsPort`)

#### `GET /api/v1/organizations/:orgId`
- **Role**: `ANONYMOUS` (Public)
- **Response**: `200 OK` → `Organization`

#### `GET /api/v1/organizations/:orgId/clubs`
- **Role**: `ANONYMOUS` (Public)
- **Response**: `200 OK` → `Club[]`

#### `PATCH /api/v1/admin/clubs/:clubId`
- **Role**: `CLUB_ADMIN` (own club), `ORG_ADMIN`
- **Request Body**: `{ "name": "...", "description": "...", "themeColor": "#E54D2E", "socialLinks": {...} }`
- **Response**: `200 OK` → `Club`

---

## 3. Switching from Mock to Real HTTP Backend

The frontend requires **zero code changes** to connect to your real backend. Follow these 3 steps:

1. **Set Environment Variable in `.env.local`**:
   ```env
   VITE_API_MODE=http
   VITE_API_BASE_URL=https://your-backend-api.example.com/api/v1
   ```

2. **Enable CORS on Your Backend**:
   Allow headers: `Authorization`, `Content-Type`, `X-Organization-ID`.  
   Allow origins: `http://localhost:5173`, `https://your-production-domain.com`.

3. **Verify Health**:
   Start the frontend:
   ```bash
   npm run dev
   ```
   All React Query hooks automatically query `httpAdapter` instead of `mockAdapter`.
