# Campus Service Desk — API Design

## 1. Purpose

This document defines the initial API contract for Campus Service Desk.

The API provides a controlled interface between the application UI and the backend business logic.

The API must enforce:

* Authentication
* Authorization
* Input validation
* Business rules
* Data integrity
* Appropriate error handling

---

# 2. API Style

The MVP will use HTTP-based API endpoints implemented through Next.js Route Handlers.

The API will follow REST-style conventions.

Base path:

```text
/api
```

Resources should be represented by nouns.

Preferred:

```text
/api/tickets
/api/categories
/api/locations
/api/users
```

Avoid action-heavy resource names such as:

```text
/api/createTicket
/api/doAssignment
/api/closeTicket
```

Where an operation represents a state-changing domain action, a dedicated action endpoint may be used when it makes the business behavior clearer.

---

# 3. Authentication

Protected endpoints require an authenticated session.

The server determines the authenticated user from the session.

The client must not be trusted to provide:

```text
userId
role
reporterId
```

as authoritative identity information.

For example, ticket creation should conceptually use:

```text
Authenticated Session
        ↓
Current User
        ↓
Create Ticket
        ↓
reporter_id = authenticated user ID
```

not:

```text
Request body
{
  "reporterId": "..."
}
```

---

# 4. Authorization

Authorization is performed after authentication.

Conceptually:

```text
Request
   ↓
Authenticated?
   ↓
Role allowed?
   ↓
Resource access allowed?
   ↓
Business rule valid?
   ↓
Perform operation
```

Examples:

### Student

```text
GET /api/tickets/:ticketId
```

Allowed only when the ticket belongs to that student.

### Staff

```text
PATCH /api/tickets/:ticketId/status
```

Allowed only when the ticket is assigned to that staff member and the requested transition is valid.

### Admin

```text
POST /api/tickets/:ticketId/assignment
```

Allowed when the authenticated user is an administrator.

---

# 5. HTTP Status Codes

The application should use consistent HTTP status codes.

| Status | Meaning                         | Example                                             |
| ------ | ------------------------------- | --------------------------------------------------- |
| 200    | Successful request              | Ticket retrieved                                    |
| 201    | Resource created                | Ticket created                                      |
| 204    | Successful request with no body | Logout or deletion-like operation where appropriate |
| 400    | Invalid request                 | Malformed request data                              |
| 401    | Authentication required/failed  | No valid session                                    |
| 403    | Authenticated but forbidden     | Student attempting admin action                     |
| 404    | Resource not found              | Ticket does not exist                               |
| 409    | Conflict                        | Duplicate email or conflicting state                |
| 422    | Validation failure              | Invalid field values                                |
| 429    | Too many requests               | Rate limit exceeded                                 |
| 500    | Unexpected server error         | Unhandled application failure                       |

The API must not expose internal error details through `500` responses.

### Validation Status Code Convention

To ensure consistency across endpoints:

* **`400 Bad Request`**: Used for invalid or malformed query parameters, invalid query syntax, or malformed request bodies (e.g. malformed JSON).
* **`422 Unprocessable Entity`**: Used for validly formed request bodies that fail semantic validation (e.g. invalid field lengths, missing required fields, or unavailable referenced entities).

---

# 6. Standard Success Response

For endpoints that return a resource, the API should use a predictable structure.

Example:

```json
{
  "data": {
    "id": "ticket-uuid",
    "ticketNumber": "CSD-2026-000124",
    "title": "Projector not working",
    "status": "OPEN",
    "priority": "MEDIUM"
  }
}
```

The exact fields depend on the endpoint.

---

# 7. Standard Error Response

Errors should use a predictable structure.

Example:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "One or more fields are invalid.",
    "fields": {
      "title": "Title is required."
    }
  }
}
```

Another example:

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to perform this action."
  }
}
```

The response should provide useful information without exposing:

* Stack traces
* SQL errors
* Authentication secrets
* Database credentials
* Internal implementation details

---

# 8. Ticket Endpoints

## 8.1 Create Ticket

```http
POST /api/tickets
```

### Authentication

Required.

### Role

Student.

### Request

```json
{
  "title": "Projector not working",
  "description": "The projector turns on but no image is displayed.",
  "categoryId": "category-uuid",
  "locationId": "location-uuid"
}
```

Attachment handling may use a separate upload flow rather than embedding binary data directly inside this JSON request.

### Server-controlled fields

The client must not control:

```text
id
ticketNumber
reporterId
status
official priority
createdAt
updatedAt
```

### Success

```text
201 Created
```

---

# 9. List Tickets

```http
GET /api/tickets
```

Authentication required.

The returned tickets must be restricted to the authenticated user's permission scope.

### Student

Returns the student's own tickets.

### Staff

Returns tickets assigned to that staff member.

### Admin

Returns tickets across the system.

---

# 10. Ticket Query Parameters

Supported MVP parameters:

```text
status
priority
categoryId
locationId
assignedStaffId
search
page
limit
sort
```

Example:

```http
GET /api/tickets?status=IN_PROGRESS&page=1&limit=20
```

Administrative-only filters such as:

```text
assignedStaffId
locationId
```

must be authorization-checked.

---

# 11. Pagination

List endpoints should use pagination.

Example response:

```json
{
  "data": [
    {
      "id": "ticket-1",
      "ticketNumber": "CSD-2026-000124"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 124,
    "totalPages": 7
  }
}
```

Pagination prevents large numbers of records from being loaded unnecessarily.

The implementation may later switch to cursor-based pagination if scale or query requirements justify it.

---

# 12. Get Ticket

```http
GET /api/tickets/:ticketId
```

Authentication required.

The server must verify ticket access before returning the ticket.

A response may include:

```text
Ticket
Reporter
Assigned Staff
Category
Location
Comments
Attachments
Current Resolution
Relevant History
```

The API should avoid returning unnecessary private information.

---

# 13. Update Ticket

```http
PATCH /api/tickets/:ticketId
```

This endpoint should be used only for fields that the authenticated role is allowed to modify.

It should not become a generic unrestricted ticket update operation.

For example:

```text
PATCH /api/tickets/:ticketId
```

should not allow a student to submit:

```json
{
  "status": "CLOSED",
  "priority": "URGENT",
  "assignedStaffId": "..."
}
```

The server must reject unauthorized or business-invalid changes.

---

# 14. Assignment

## Assign

```http
POST /api/tickets/:ticketId/assignment
```

### Role

Admin.

### Request

```json
{
  "staffId": "staff-user-uuid"
}
```

### Server behavior

The server verifies:

* Admin authentication
* Staff account exists
* Staff account is active
* Ticket is assignable
* Operation is authorized

Then:

```text
Update current assignment
+
Create assignment history
+
Change OPEN → ASSIGNED
```

These related database operations should execute consistently.

---

# 15. Reassignment

The same endpoint may support reassignment:

```http
POST /api/tickets/:ticketId/assignment
```

with a new staff identifier.

The previous assignment remains represented in:

```text
assignment_history
```

---

# 16. Start Work

```http
POST /api/tickets/:ticketId/status
```

### Role

Assigned Staff.

### Request

```json
{
  "status": "IN_PROGRESS"
}
```

The server checks:

```text
Current user is assigned staff?
        ↓
Current ticket status = ASSIGNED?
        ↓
ASSIGNED → IN_PROGRESS allowed?
        ↓
Create status history
        ↓
Update ticket
```

---

# 17. Resolve Ticket

```http
POST /api/tickets/:ticketId/resolutions
```

### Role

Assigned Staff.

### Request

```json
{
  "description": "Replaced the HDMI cable and tested the projector successfully."
}
```

### Server behavior

The server verifies:

* User is authenticated
* User is assigned to the ticket
* Current status is `IN_PROGRESS`
* Resolution description is valid

Then:

```text
Create Resolution
        +
Change IN_PROGRESS → RESOLVED
        +
Create Status History
        +
Set resolvedAt
```

These changes should be handled consistently.

---

# 18. Confirm Resolution

```http
POST /api/tickets/:ticketId/confirmation
```

### Role

Ticket reporter.

### Request

```json
{
  "confirmed": true
}
```

When confirmed:

```text
RESOLVED → CLOSED
```

The server also records the closure timestamp.

---

# 19. Reject Resolution

The same endpoint may support rejection:

```json
{
  "confirmed": false,
  "comment": "The projector still shows no image."
}
```

Server behavior:

```text
Verify reporter
      ↓
Verify current status = RESOLVED
      ↓
Preserve resolution
      ↓
Optionally create comment
      ↓
RESOLVED → IN_PROGRESS
```

The previous resolution record must remain intact.

---

# 20. Cancel Ticket

```http
POST /api/tickets/:ticketId/cancellation
```

### Role

Ticket reporter.

### Allowed current states

```text
OPEN
ASSIGNED
```

### Result

```text
OPEN → CANCELLED

or

ASSIGNED → CANCELLED
```

The server must reject cancellation after work has entered `IN_PROGRESS`.

---

# 21. Comments

## List Comments

```http
GET /api/tickets/:ticketId/comments
```

Authenticated and authorized users only.

## Add Comment

```http
POST /api/tickets/:ticketId/comments
```

### Request

```json
{
  "content": "The issue is still occurring."
}
```

The server determines the author from the authenticated session.

The client must not provide an authoritative `authorId`.

---

# 22. Categories

## List Active Categories

```http
GET /api/categories
```

Accessible to authenticated users.

By default, ticket creation should use active categories.

## Create Category

```http
POST /api/categories
```

Admin only.

## Update Category

```http
PATCH /api/categories/:categoryId
```

Admin only.

## Deactivate Category

```http
POST /api/categories/:categoryId/deactivation
```

Admin only.

Historical ticket references must remain valid.

---

# 23. Locations

## List Active Locations

```http
GET /api/locations
```

Authenticated users.

## Create Location

```http
POST /api/locations
```

Admin only.

## Update Location

```http
PATCH /api/locations/:locationId
```

Admin only.

## Deactivate Location

```http
POST /api/locations/:locationId/deactivation
```

Admin only.

---

# 24. Users

## List Users

```http
GET /api/users
```

Admin only.

## Get User

```http
GET /api/users/:userId
```

Admin only, subject to privacy requirements.

## Update User

```http
PATCH /api/users/:userId
```

Admin only for administrative fields.

## Deactivate User

```http
POST /api/users/:userId/deactivation
```

Admin only.

User deactivation must not delete historical tickets or comments.

---

# 25. Dashboard APIs

Dashboard data can be exposed through dedicated endpoints.

Examples:

```http
GET /api/dashboard/student
GET /api/dashboard/staff
GET /api/dashboard/admin
```

The server determines the user's role and returns only appropriate information.

Dashboard statistics must be calculated from persisted data.

---

# 26. File Upload API

Attachment uploads may use a dedicated flow rather than sending binary files through normal JSON ticket requests.

Conceptually:

```text
POST /api/uploads
```

or a controlled direct-to-storage workflow.

The final implementation will depend on the selected Vercel Blob upload architecture.

The system must validate:

* File type
* File size
* Ticket access
* Uploader authorization

---

# 27. API Resource Ownership

The API must derive ownership from the authenticated session.

Incorrect:

```json
{
  "reporterId": "someone-elses-id"
}
```

Correct concept:

```text
Authenticated Session
        ↓
session.user.id
        ↓
ticket.reporterId
```

This prevents users from impersonating another user through request data.

---

# 28. Validation

Request validation will use schemas.

Conceptually:

```text
HTTP Request
    ↓
Parse
    ↓
Validate with schema
    ↓
Business authorization
    ↓
Business rules
    ↓
Database
```

Invalid data should be rejected before database mutation.

---

# 29. State Transition Validation

Status updates must not simply accept any enum value.

For example:

```text
IN_PROGRESS → CLOSED
```

is syntactically valid as an enum value but invalid according to business rules.

Therefore the server must validate the transition:

```text
currentStatus
+
requestedStatus
+
actor
        ↓
Transition Policy
        ↓
Allowed / Rejected
```

---

# 30. Rate Limiting

Rate limiting should be considered for endpoints vulnerable to abuse, especially:

* Authentication
* Registration
* Password-related operations
* Uploads
* Public or high-volume endpoints

The exact production rate-limiting implementation is deferred until deployment architecture is finalized.

---

# 31. Idempotency and Duplicate Requests

Operations caused by repeated user actions should be considered for idempotent behavior.

For example, a repeated resolution confirmation should not create inconsistent state.

The backend should re-check the current state before applying the mutation.

---

# 32. Resource Not Found

When a requested resource does not exist, the API should return:

```text
404 Not Found
```

It must not return unrelated data or leak internal database information.

---

# 33. Authorization Failure

If the user is authenticated but does not have permission:

```text
403 Forbidden
```

The system must not perform the requested operation.

---

# 34. Authentication Failure

If authentication is required but unavailable:

```text
401 Unauthorized
```

The API must not continue to business logic.

---

# 35. Error Codes

The application should eventually standardize machine-readable error codes such as:

```text
UNAUTHORIZED
FORBIDDEN
NOT_FOUND
VALIDATION_ERROR
INVALID_STATUS_TRANSITION
TICKET_NOT_ASSIGNABLE
USER_INACTIVE
CATEGORY_INACTIVE
LOCATION_INACTIVE
CONFLICT
INTERNAL_ERROR
```

These codes allow frontend behavior without depending on human-readable messages.

---

# 36. API Security Principles

The API must follow:

```text
Never trust the client.
```

Client-provided values such as:

```text
userId
role
reporterId
assignedBy
status
```

must never be treated as authoritative without server-side verification.

The server owns:

```text
Identity
Permissions
Business rules
Database mutations
```

---

# 37. API Versioning

The MVP does not require versioned routes such as:

```text
/api/v1/tickets
```

The initial API will use:

```text
/api/tickets
```

Versioning can be introduced if future compatibility requirements justify it.

---

# 38. Endpoint Summary

| Method | Endpoint                                   | Primary Role        |
| ------ | ------------------------------------------ | ------------------- |
| POST   | `/api/tickets`                             | Student             |
| GET    | `/api/tickets`                             | Authorized          |
| GET    | `/api/tickets/:ticketId`                   | Authorized          |
| PATCH  | `/api/tickets/:ticketId`                   | Authorized by field |
| POST   | `/api/tickets/:ticketId/assignment`        | Admin               |
| POST   | `/api/tickets/:ticketId/status`            | Staff/Admin         |
| POST   | `/api/tickets/:ticketId/resolutions`       | Assigned Staff      |
| POST   | `/api/tickets/:ticketId/confirmation`      | Student             |
| POST   | `/api/tickets/:ticketId/cancellation`      | Student             |
| GET    | `/api/tickets/:ticketId/comments`          | Authorized          |
| POST   | `/api/tickets/:ticketId/comments`          | Authorized          |
| GET    | `/api/categories`                          | Authenticated       |
| POST   | `/api/categories`                          | Admin               |
| PATCH  | `/api/categories/:categoryId`              | Admin               |
| POST   | `/api/categories/:categoryId/deactivation` | Admin               |
| GET    | `/api/locations`                           | Authenticated       |
| POST   | `/api/locations`                           | Admin               |
| PATCH  | `/api/locations/:locationId`               | Admin               |
| POST   | `/api/locations/:locationId/deactivation`  | Admin               |
| GET    | `/api/users`                               | Admin               |
| GET    | `/api/users/:userId`                       | Admin               |
| PATCH  | `/api/users/:userId`                       | Admin               |
| POST   | `/api/users/:userId/deactivation`          | Admin               |
| GET    | `/api/dashboard/student`                   | Student             |
| GET    | `/api/dashboard/staff`                     | Staff               |
| GET    | `/api/dashboard/admin`                     | Admin               |

---

# 39. API Design Principles

The API should remain:

* Predictable
* Explicit
* Validated
* Authorized
* Resource-oriented
* Consistent
* Testable

Business actions should be represented clearly rather than creating one generic endpoint capable of performing arbitrary database mutations.

---

## Status

System Design — API contract baseline defined.
