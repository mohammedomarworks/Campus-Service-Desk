# Campus Service Desk — Technology & Architecture Decisions

## 1. Purpose

This document records the major technology and architecture decisions for Campus Service Desk.

The goal is to build a maintainable full-stack application that demonstrates sound software engineering practices without introducing unnecessary infrastructure complexity.

---

# 2. Architecture Style

## Decision

Use a **modular monolithic architecture** inside a single Next.js application.

The application will contain:

```text
Presentation
    ↓
Route Handlers / Server Actions where appropriate
    ↓
Application / Business Logic
    ↓
Data Access
    ↓
PostgreSQL
```

The application will not use separate frontend and backend deployments for MVP.

---

# 3. Why a Modular Monolith?

The project is being developed by one engineer and targets a relatively small campus deployment.

A modular monolith provides:

* One repository
* One deployment
* One application
* Clear module boundaries
* Simple local development
* Simple deployment
* Easier debugging
* Lower operational complexity

The internal code structure will still separate business concerns.

This means:

```text
Simple deployment
+
Structured internal architecture
```

rather than:

```text
Many services
+
High infrastructure overhead
```

---

# 4. Frontend Framework

## Decision

**Next.js with App Router**

The project was scaffolded using:

* TypeScript
* App Router
* Tailwind CSS
* ESLint
* Turbopack

Next.js provides routing, server/client component architecture, server-side capabilities, and Route Handlers within the same application.

Route Handlers support HTTP methods including GET, POST, PUT, PATCH, and DELETE, making them suitable for our REST-style application API.

---

# 5. Programming Language

## Decision

**TypeScript**

TypeScript will be used throughout the application.

Reasons:

* Static type checking
* Better IDE assistance
* Safer API contracts
* Better database-model integration
* Easier refactoring
* Improved maintainability

Generated database types and application types should be used wherever practical instead of duplicating type definitions.

---

# 6. Styling

## Decision

**Tailwind CSS**

Tailwind will be used for application styling.

The project already has Tailwind configured.

We will prioritize:

* Responsive design
* Reusable UI patterns
* Accessibility
* Consistent spacing
* Consistent typography
* Clear status/priority indicators

A component library may be introduced later where it provides clear value.

---

# 7. Database

## Decision

**PostgreSQL**

PostgreSQL is the primary database for the application.

Reasons:

* Relational data model matches the domain
* Strong referential integrity
* Foreign keys
* Transactions
* Constraints
* Indexes
* Good support for reporting and aggregation

The system contains many relationships:

```text
User
 ↓
Ticket
 ↓
Category
Location
Comments
Attachments
Resolutions
History
```

A relational database is therefore appropriate.

---

# 8. Database Hosting

## Decision

**Neon PostgreSQL**

Neon will be used as the hosted PostgreSQL provider.

Reasons:

* Managed PostgreSQL
* Vercel integration
* Suitable serverless connection model
* Database branching capability
* Suitable for development and deployment
* Supports a small project while leaving room for growth

The exact production database configuration will be finalized during deployment.

---

# 9. ORM

## Decision

**Prisma ORM 7**

Prisma will be used as the application's database access layer.

Prisma provides:

* Type-safe database access
* Schema modeling
* Database migrations
* Relationship handling
* Query building
* Development tooling

Prisma 7 remains fully supported while Prisma 8 is currently a release candidate.

For the MVP, stable Prisma 7 is preferred over adopting a release candidate as a foundation.

The project should pin the selected major/stable version through `package-lock.json`.

---

# 10. Authentication

## Decision

**Better Auth**

Better Auth will handle authentication and session management.

The MVP authentication model will initially support:

* Email/password registration
* Login
* Logout
* Session management

Later additions may include:

* Email verification
* Password reset
* DIU email restrictions
* Two-factor authentication
* Passkeys

The application's business user record and authentication records must remain conceptually distinct even if they are stored in the same PostgreSQL database.

---

# 11. Authorization

Authentication and authorization will be treated as separate concerns.

Authentication answers:

> Who is this user?

Authorization answers:

> What may this user do?

The application will implement role-based authorization for:

```text
STUDENT
STAFF
ADMIN
```

Authorization checks will be performed on the server.

The UI may hide unavailable actions, but server-side authorization is the security boundary.

---

# 12. API Architecture

## Decision

Use Next.js Route Handlers for explicit application API endpoints.

Example structure:

```text
app/
└── api/
    ├── tickets/
    │   ├── route.ts
    │   └── [ticketId]/
    │       ├── route.ts
    │       ├── comments/
    │       │   └── route.ts
    │       └── status/
    │           └── route.ts
    │
    ├── categories/
    ├── locations/
    └── users/
```

The exact endpoint structure will be finalized during API design.

---

# 13. API Design Principle

Route Handlers should remain relatively thin.

A request should conceptually follow:

```text
HTTP Request
     ↓
Route Handler
     ↓
Authentication
     ↓
Authorization
     ↓
Input Validation
     ↓
Business Service
     ↓
Database
     ↓
Response
```

Business rules should not be scattered throughout route handlers.

For example, the rule:

```text
RESOLVED → CLOSED
```

only when the reporter confirms the resolution should belong to the ticket business logic rather than a React component.

---

# 14. Application Structure

The internal application should use clear boundaries.

Initial conceptual structure:

```text
app/
components/
features/
lib/
prisma/
tests/
docs/
public/
```

### `app/`

Contains:

* Routes
* Pages
* Layouts
* Route Handlers
* Route-level UI

### `components/`

Contains reusable presentation components.

Examples:

```text
Button
Modal
DataTable
StatusBadge
PriorityBadge
FormField
```

### `features/`

Contains business-domain modules.

Potential future structure:

```text
features/
├── tickets/
├── categories/
├── locations/
├── users/
└── dashboard/
```

A feature module may contain:

```text
service
validation
policy
types
queries
```

where appropriate.

### `lib/`

Contains shared infrastructure and utilities.

Examples:

```text
lib/
├── auth/
├── db/
├── storage/
├── validation/
└── utils/
```

### `prisma/`

Contains the Prisma schema and related database tooling.

### `tests/`

Contains automated tests.

---

# 15. Business Logic Layer

Business logic should be explicit.

For example:

```text
ticketService.resolveTicket()
ticketService.confirmResolution()
ticketService.rejectResolution()
ticketService.assignTicket()
```

These operations should enforce the domain rules.

A UI component should not decide whether:

```text
IN_PROGRESS → CLOSED
```

is legal.

The business layer should.

---

# 16. Validation

## Decision

Use a schema-validation library such as **Zod** for server-side request validation.

Validation will be applied to:

* Form input
* API request bodies
* Query parameters
* File metadata
* Administrative operations

Client-side validation may improve user experience, but server-side validation remains authoritative.

---

# 17. File Storage

## Decision

**Vercel Blob — Private Storage**

Ticket images and resolution evidence will be stored outside PostgreSQL.

PostgreSQL will store attachment metadata such as:

```text
file name
storage key
mime type
file size
uploader
ticket
resolution
created time
```

The actual binary file will be stored in object storage.

Private Blob storage is preferred because ticket attachments may contain user-generated campus information and should not automatically be public.

---

# 18. File Upload Architecture

Conceptually:

```text
User
 ↓
Upload request
 ↓
Authentication
 ↓
Authorization
 ↓
File validation
 ↓
Vercel Blob
 ↓
Attachment metadata
 ↓
PostgreSQL
```

The application must validate:

* File type
* File size
* Upload result
* Ticket access
* Uploader permissions

The exact upload mechanism will be selected during implementation.

---

# 19. Testing Strategy

The project will use multiple testing levels.

## Unit Tests

Use **Vitest** for isolated business logic.

Examples:

```text
isValidStatusTransition()
canStudentCancelTicket()
canStaffResolveTicket()
canStudentConfirmResolution()
```

Vitest is suitable for fast isolated test execution.

## End-to-End Tests

Use **Playwright** for realistic browser workflows.

Important flows include:

```text
Student login
      ↓
Create ticket
      ↓
Admin assigns ticket
      ↓
Staff starts work
      ↓
Staff resolves ticket
      ↓
Student confirms
      ↓
Ticket closes
```

Playwright supports browser automation and can run Chromium, Firefox, and WebKit tests locally and in CI.

---

# 20. Testing Pyramid

The project should generally follow:

```text
             ┌───────────────┐
             │  E2E Tests    │
             │   Few but     │
             │   important   │
             └───────────────┘
           ┌─────────────────────┐
           │ Integration Tests   │
           │ API + Database      │
           └─────────────────────┘
        ┌───────────────────────────┐
        │ Unit / Business Tests     │
        │ Fast and numerous         │
        └───────────────────────────┘
```

Not every function needs an individual test.

Critical business behavior does.

---

# 21. CI/CD

## Decision

**GitHub Actions + Vercel**

GitHub Actions will run automated quality checks.

Initial CI goals:

```text
Install dependencies
        ↓
Lint
        ↓
Type check
        ↓
Unit tests
        ↓
Build
```

End-to-end tests may be added to CI once a dedicated test database strategy exists.

Vercel will handle application deployment.

---

# 22. Git Workflow

Development will use:

```text
main
│
├── feature/ticket-creation
├── feature/authentication
├── feature/ticket-assignment
├── feature/comments
└── feature/admin-dashboard
```

The exact branch strategy may be simplified for very small changes.

Meaningful features should generally be developed away from `main`.

---

# 23. Environment Configuration

Secrets and environment-specific configuration must never be committed.

Expected future variables may include:

```text
DATABASE_URL
BETTER_AUTH_SECRET
BETTER_AUTH_URL
BLOB-related configuration
```

The repository will provide:

```text
.env.example
```

containing variable names but not real secrets.

---

# 24. Deployment Architecture

The planned deployment is:

```text
                  GitHub
                    │
                    ▼
                Vercel
                    │
          ┌─────────┴─────────┐
          │                   │
          ▼                   ▼
      Next.js App        Vercel Blob
          │
          ▼
       Prisma
          │
          ▼
     Neon PostgreSQL
```

The production architecture remains a single application deployment.

---

# 25. Runtime

The development and production environment should use an actively supported Node.js LTS release.

The preferred runtime baseline is Node.js 24 LTS.

The project should avoid using a short-lived or end-of-life Node.js release for production.

---

# 26. Caching

Caching will be introduced only where justified.

The MVP should prioritize correctness over aggressive caching.

Potential future candidates include:

* Read-heavy category data
* Location data
* Dashboard aggregates
* Public static content

Ticket workflow mutations should favor correctness and consistency.

---

# 27. Database Transactions

Transactions will be used when multiple related database operations must succeed or fail together.

For example:

```text
Assign Ticket
    ↓
Update current assignment
    +
Create assignment history
    +
Update ticket status
```

These operations should not leave the database in a partially updated state.

---

# 28. Concurrency

The application must not assume that users always work with the latest page state.

Before important mutations, the server should validate the current database state.

Examples:

```text
Current state is still RESOLVED?
Current user still owns the ticket?
Current staff assignment is still valid?
```

Optimistic concurrency techniques may be introduced where necessary.

---

# 29. Logging

The application should use controlled server-side logging for important failures.

Logs should never expose:

* Passwords
* Authentication secrets
* Database credentials
* Sensitive tokens

Future production observability may introduce dedicated error tracking.

---

# 30. What We Are Deliberately NOT Adding

The MVP will not use:

* Microservices
* Kubernetes
* Redis
* Kafka
* RabbitMQ
* GraphQL
* Separate Express backend
* Native mobile application
* Real-time WebSockets
* AI infrastructure
* Dedicated API gateway

These technologies may be appropriate for other systems, but they are not justified by the current Campus Service Desk requirements.

---

# 31. Final Technology Stack

| Layer            | Decision                    |
| ---------------- | --------------------------- |
| Framework        | Next.js App Router          |
| Language         | TypeScript                  |
| Styling          | Tailwind CSS                |
| API              | Next.js Route Handlers      |
| Architecture     | Modular Monolith            |
| Database         | PostgreSQL                  |
| Database Hosting | Neon                        |
| ORM              | Prisma 7                    |
| Authentication   | Better Auth                 |
| Authorization    | Application-level RBAC      |
| Validation       | Zod                         |
| File Storage     | Vercel Blob Private Storage |
| Unit Testing     | Vitest                      |
| E2E Testing      | Playwright                  |
| CI               | GitHub Actions              |
| Deployment       | Vercel                      |
| Runtime          | Node.js 24 LTS              |
| Package Manager  | npm                         |

---

# 32. Architecture Principles

Campus Service Desk will follow these principles:

### Principle 1 — Server is authoritative

The server determines:

* Identity
* Permissions
* Valid input
* Valid workflow transitions
* Database changes

### Principle 2 — Business rules are explicit

Important workflows should be represented by readable business logic.

### Principle 3 — Data integrity matters

Database constraints and application rules should work together.

### Principle 4 — History should be preserved

Important ticket activity should not be silently overwritten.

### Principle 5 — Simplicity is a feature

The system should use the simplest architecture that satisfies the requirements.

### Principle 6 — Design for change

Modules should be separated enough that new functionality can be added without rewriting unrelated areas.

### Principle 7 — Test behavior, not implementation details

Tests should verify what the system is supposed to do.

---

## Status

Technology and architecture decisions — baseline approved.

Next step: API design and database implementation preparation.
