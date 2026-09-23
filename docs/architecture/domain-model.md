# Campus Service Desk — Domain Model

## 1. Purpose

This document defines the primary business entities, value sets, and relationships in Campus Service Desk.

The domain model is derived from the approved MVP requirements.

It will later be translated into:

* Entity Relationship Diagram
* PostgreSQL schema
* Prisma models
* API contracts
* Application services and business logic

---

# 2. Core Domain Entities

The MVP contains the following primary entities:

```text
User
Ticket
Category
Location
Comment
Attachment
Resolution
TicketStatusHistory
AssignmentHistory
```

---

# 3. User

A `User` represents a person who can interact with the application.

## Main responsibilities

A user may:

* Report tickets
* Work on assigned tickets
* Manage the system

depending on their role.

## Important attributes

Conceptually:

```text
User
├── id
├── name
├── email
├── password/authentication reference
├── role
├── isActive
├── createdAt
└── updatedAt
```

## Role

The MVP supports:

```text
STUDENT
STAFF
ADMIN
```

Role is a controlled value rather than a separate entity in the MVP.

---

# 4. Ticket

A `Ticket` is the central business entity.

It represents a reported campus problem.

## Important attributes

Conceptually:

```text
Ticket
├── id
├── ticketNumber
├── title
├── description
├── status
├── priority
├── reporter
├── assignedStaff
├── category
├── location
├── createdAt
├── updatedAt
├── resolvedAt
└── closedAt
```

## Responsibilities

A ticket stores:

* Problem information
* Reporter information
* Current workflow state
* Current priority
* Current assignment
* Category
* Location
* Important timestamps

Additional information such as comments, attachments, and resolution attempts is represented through related entities.

---

# 5. Category

A `Category` classifies a ticket.

Example categories:

```text
Classroom
Laboratory
Wi-Fi / Network
Furniture
Hostel
Cleanliness
Electrical
Other
```

## Important attributes

```text
Category
├── id
├── name
├── description
├── isActive
├── createdAt
└── updatedAt
```

A category may be deactivated without destroying historical ticket relationships.

---

# 6. Location

A `Location` identifies where the reported issue occurred.

Examples:

```text
Building 5 — Room 502
Main Laboratory
Library
Hostel A — Room 203
Cafeteria
```

## Important attributes

Conceptually:

```text
Location
├── id
├── name
├── building
├── floor
├── room
├── isActive
├── createdAt
└── updatedAt
```

The MVP keeps location modeling intentionally simple.

We do not create separate `Building`, `Floor`, and `Room` entities unless future real-user requirements justify that level of hierarchy.

---

# 7. Comment

A `Comment` represents a message added to a ticket.

Comments create the communication history between students, staff, and administrators.

## Important attributes

```text
Comment
├── id
├── ticket
├── author
├── content
└── createdAt
```

A comment belongs to exactly one ticket and has exactly one author.

---

# 8. Attachment

An `Attachment` represents a file associated with a ticket.

The actual file is stored in an external object/file storage service.

The database stores metadata and the relationship to the ticket.

## Important attributes

```text
Attachment
├── id
├── ticket
├── uploader
├── fileName
├── storageKey / URL reference
├── mimeType
├── fileSize
└── createdAt
```

The MVP primarily expects image attachments.

---

# 9. Resolution

A `Resolution` represents a staff member's attempt to resolve a ticket.

We intentionally model this separately from `Ticket`.

## Why?

A ticket may have more than one resolution attempt.

Example:

```text
Attempt 1
Staff says projector cable replaced
Student rejects resolution

Attempt 2
Staff replaces projector
Student confirms resolution
```

If resolution were simply stored as:

```text
ticket.resolution = ...
```

we could lose the history of previous attempts.

Instead:

```text
Ticket
   │
   ├── Resolution 1
   └── Resolution 2
```

## Important attributes

```text
Resolution
├── id
├── ticket
├── staff
├── description
├── createdAt
└── optional proof attachment relationship
```

A resolution represents a historical resolution attempt.

---

# 10. TicketStatusHistory

A `TicketStatusHistory` record represents a change in a ticket's status.

This is separate from the ticket's current `status`.

## Why?

The ticket needs to answer both:

> "What is the status now?"

and:

> "How did it get here?"

Example:

```text
OPEN
ASSIGNED
IN_PROGRESS
RESOLVED
IN_PROGRESS
RESOLVED
CLOSED
```

Without history, we would only know:

```text
CLOSED
```

The history provides a timeline for debugging, accountability, analytics, and future audit functionality.

## Important attributes

```text
TicketStatusHistory
├── id
├── ticket
├── fromStatus
├── toStatus
├── changedBy
├── note
└── createdAt
```

`fromStatus` may be nullable for the initial state if we choose to record creation as a history event.

---

# 11. AssignmentHistory

An `AssignmentHistory` record represents assignment or reassignment of a ticket.

## Why?

The current ticket needs to know:

```text
Who is assigned now?
```

But the system may also need to know:

```text
Who was previously responsible?
When did responsibility change?
Who made the assignment?
```

Example:

```text
Assigned to Ahmed
       ↓
Reassigned to Rahim
       ↓
Reassigned to Karim
```

## Important attributes

```text
AssignmentHistory
├── id
├── ticket
├── staff
├── assignedBy
└── createdAt
```

This gives us assignment history without requiring a full generic audit-log system in the MVP.

---

# 12. Controlled Values

Some concepts should not become database tables in the MVP.

## User Role

```text
STUDENT
STAFF
ADMIN
```

## Ticket Status

```text
OPEN
ASSIGNED
IN_PROGRESS
RESOLVED
CLOSED
CANCELLED
```

## Ticket Priority

```text
LOW
MEDIUM
HIGH
URGENT
```

These are controlled domain values.

The exact implementation can be PostgreSQL enums, Prisma enums, or validated application values depending on the final database strategy.

---

# 13. Entity Relationships

The core relationships are:

```text
User
 │
 ├────────────── creates ──────────────→ Ticket
 │                                        │
 │                                        ├── belongs to → Category
 │                                        │
 │                                        ├── occurs at → Location
 │                                        │
 │                                        ├── has many → Comment
 │                                        │
 │                                        ├── has many → Attachment
 │                                        │
 │                                        ├── has many → Resolution
 │                                        │
 │                                        ├── has many → TicketStatusHistory
 │                                        │
 │                                        └── has many → AssignmentHistory
 │
 └────────────── may be assigned to ────→ Ticket
```

More explicitly:

### User → Ticket

A student can create many tickets.

```text
User 1 ──── N Ticket
```

A ticket has one reporter.

---

### User → Assigned Ticket

A staff member can be assigned many tickets.

```text
User 1 ──── N Ticket
```

A ticket has zero or one current assigned staff member.

The relationship is optional because new tickets begin unassigned.

---

### Category → Ticket

A category can be associated with many tickets.

```text
Category 1 ──── N Ticket
```

Each ticket has one category.

---

### Location → Ticket

A location can contain many reported tickets.

```text
Location 1 ──── N Ticket
```

Each ticket has one location.

---

### Ticket → Comment

```text
Ticket 1 ──── N Comment
```

A ticket can have zero or many comments.

---

### User → Comment

```text
User 1 ──── N Comment
```

A user can create many comments.

Each comment has one author.

---

### Ticket → Attachment

```text
Ticket 1 ──── N Attachment
```

A ticket can have multiple attachments.

---

### User → Attachment

```text
User 1 ──── N Attachment
```

A user can upload multiple attachments.

---

### Ticket → Resolution

```text
Ticket 1 ──── N Resolution
```

A ticket can have multiple resolution attempts.

---

### User → Resolution

```text
User 1 ──── N Resolution
```

A staff member can create multiple resolution attempts.

A resolution belongs to the staff member who performed the work.

---

### Ticket → TicketStatusHistory

```text
Ticket 1 ──── N TicketStatusHistory
```

A ticket can have many status changes.

---

### User → TicketStatusHistory

```text
User 1 ──── N TicketStatusHistory
```

A user records the status change.

The user may be a student, staff member, or administrator depending on the operation.

---

### Ticket → AssignmentHistory

```text
Ticket 1 ──── N AssignmentHistory
```

A ticket may have multiple assignment records over time.

---

### User → AssignmentHistory

There are two conceptual user relationships:

```text
User ──── assigned staff member
User ──── assignment actor
```

For example:

```text
Admin Mohammed
      ↓
assigns ticket
      ↓
Staff Ahmed
```

The history record must be able to distinguish:

```text
assignedStaff
assignedBy
```

---

# 14. Current State vs Historical State

The system intentionally stores both current and historical information.

For example:

```text
Ticket
status = IN_PROGRESS
```

represents the current state.

While:

```text
TicketStatusHistory
OPEN → ASSIGNED
ASSIGNED → IN_PROGRESS
RESOLVED → IN_PROGRESS
```

represents the historical journey.

Likewise:

```text
Ticket
assignedStaff = Ahmed
```

represents current responsibility.

While:

```text
AssignmentHistory
Ahmed
Rahim
Karim
```

represents previous assignments.

This distinction is important for reporting and accountability.

---

# 15. Domain Model Diagram

```text
                         ┌───────────────┐
                         │     USER      │
                         │───────────────│
                         │ id            │
                         │ name          │
                         │ email         │
                         │ role          │
                         │ isActive      │
                         └───────┬───────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
           creates            comments           uploads
              │                  │                  │
              ▼                  ▼                  ▼
        ┌───────────┐      ┌───────────┐      ┌────────────┐
        │  TICKET   │      │  COMMENT  │      │ ATTACHMENT │
        │───────────│      └───────────┘      └────────────┘
        │ id        │
        │ number    │
        │ title     │
        │ desc      │
        │ status    │
        │ priority  │
        └─────┬─────┘
              │
      ┌───────┼──────────────┬────────────────┐
      │       │              │                │
      ▼       ▼              ▼                ▼
   Category Location      Resolution     Status History
                                       
              │
              ▼
       Assignment History

```

---

# 16. Important Design Decisions

## Decision 1 — Resolution is an entity

Resolution is separate from Ticket because a ticket may require multiple resolution attempts.

## Decision 2 — Status history is an entity

The ticket stores its current status, while status history records how it reached that state.

## Decision 3 — Assignment history is an entity

The ticket stores the current assignee, while assignment history records previous assignments.

## Decision 4 — Category and Location are entities

They are managed by administrators and referenced by multiple tickets.

## Decision 5 — Role, Status, and Priority are controlled values

The MVP does not need separate tables for these concepts.

## Decision 6 — Location remains simple

The MVP does not create separate building/floor/room tables.

This can be normalized later if actual requirements justify it.

## Decision 7 — Audit Log is deferred

The MVP uses targeted history entities for important ticket behavior.

A generic `AuditLog` system can be introduced later if real operational requirements justify it.

---

# 17. Questions to Resolve During ERD Design

Before implementing the database, the following design decisions must be finalized:

1. Exact fields and data types
2. Nullability
3. Primary keys
4. Foreign keys
5. Delete behavior
6. Unique constraints
7. Database indexes
8. Timestamp strategy
9. Attachment relationship to Resolution
10. Exact handling of initial status history
11. Exact assignment-history semantics
12. Authentication data ownership

These decisions belong to the database-design phase rather than being guessed during implementation.

---

## Status

System Design — Domain Model defined.

Next step: Entity Relationship Diagram and relational schema design.
