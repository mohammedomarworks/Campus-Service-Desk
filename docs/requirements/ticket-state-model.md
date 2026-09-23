# Campus Service Desk — Ticket State Model

## 1. Purpose

This document defines the valid lifecycle states and state transitions for Campus Service Desk tickets.

The system must not allow arbitrary status changes.

---

# 2. Ticket States

## OPEN

The ticket has been successfully submitted and is waiting for administrative assignment.

Typical owner:

* Admin / assignment queue

---

## ASSIGNED

An administrator has assigned the ticket to a staff member.

The staff member has not yet started active work.

Typical owner:

* Assigned staff

---

## IN_PROGRESS

The assigned staff member is actively working on the issue.

Typical owner:

* Assigned staff

---

## RESOLVED

The staff member has completed the work and submitted resolution information.

The issue is waiting for confirmation from the reporting student.

Typical owner:

* Student confirmation

---

## CLOSED

The reporting student has confirmed that the issue has been resolved.

This is a terminal state for normal MVP workflow.

---

## CANCELLED

The ticket has been cancelled by the reporting student during an allowed early stage.

This is a terminal state for normal MVP workflow.

---

# 3. Valid State Transitions

```text
              ┌───────────────┐
              │     OPEN      │
              └───────┬───────┘
                      │
                 Admin assigns
                      │
                      ▼
              ┌───────────────┐
              │   ASSIGNED    │
              └───────┬───────┘
                      │
                Staff starts
                      │
                      ▼
              ┌───────────────┐
              │ IN_PROGRESS   │
              └───────┬───────┘
                      │
                 Staff resolves
                      │
                      ▼
              ┌───────────────┐
              │   RESOLVED    │
              └───────┬───────┘
                      │
             ┌────────┴────────┐
             │                 │
       Student confirms   Student rejects
             │                 │
             ▼                 ▼
      ┌─────────────┐    ┌──────────────┐
      │    CLOSED   │    │ IN_PROGRESS  │
      └─────────────┘    └──────────────┘


OPEN ─────────────→ CANCELLED

ASSIGNED ─────────→ CANCELLED
```

---

# 4. Transition Rules

| Current State | Action             | Actor          | New State   |
| ------------- | ------------------ | -------------- | ----------- |
| OPEN          | Assign staff       | Admin          | ASSIGNED    |
| OPEN          | Cancel ticket      | Student        | CANCELLED   |
| ASSIGNED      | Start work         | Assigned Staff | IN_PROGRESS |
| ASSIGNED      | Cancel ticket      | Student        | CANCELLED   |
| IN_PROGRESS   | Resolve ticket     | Assigned Staff | RESOLVED    |
| RESOLVED      | Confirm resolution | Ticket Owner   | CLOSED      |
| RESOLVED      | Reject resolution  | Ticket Owner   | IN_PROGRESS |

---

# 5. Invalid Transitions

The following transitions shall not be permitted through normal MVP workflow:

```text
OPEN → IN_PROGRESS
OPEN → RESOLVED
OPEN → CLOSED

ASSIGNED → CLOSED
ASSIGNED → RESOLVED

IN_PROGRESS → CLOSED

CLOSED → OPEN
CLOSED → ASSIGNED
CLOSED → IN_PROGRESS
CLOSED → RESOLVED

CANCELLED → OPEN
CANCELLED → ASSIGNED
CANCELLED → IN_PROGRESS
CANCELLED → RESOLVED
CANCELLED → CLOSED
```

Administrative overrides, if introduced later, must be designed as explicit functionality rather than bypassing normal validation.

---

# 6. Resolution Rejection

When a student rejects a resolution:

1. The ticket remains associated with the same reporter.
2. The previous resolution information is preserved.
3. The current status becomes `IN_PROGRESS`.
4. The assigned staff member remains associated unless an administrator changes the assignment.
5. The rejection should be recorded in the activity/history model when audit functionality is implemented.
6. The student may provide additional information explaining why the issue remains unresolved.

The system must not erase the historical resolution attempt.

---

# 7. Cancellation Rules

Students may cancel their own tickets only while the ticket is:

* OPEN
* ASSIGNED

Cancellation is not allowed in the normal MVP workflow after work has entered `IN_PROGRESS`.

A cancelled ticket becomes terminal.

---

# 8. Status Transition Validation

A status change request must be validated using all of the following:

```text
Authenticated User
       ↓
Authorization
       ↓
Current Ticket State
       ↓
Requested New State
       ↓
Allowed Transition?
       ↓
Additional Business Rules
       ↓
Database Update
```

The client interface must never be trusted to enforce transitions by itself.

---

# 9. Future Extension

The MVP deliberately keeps the state machine small.

Future states or transitions may include:

* ON_HOLD
* REOPENED
* ESCALATED
* PENDING_STUDENT
* PENDING_EXTERNAL_TEAM

These should be added only after real workflow requirements justify them.

---

## Status

Requirements phase — in progress.
