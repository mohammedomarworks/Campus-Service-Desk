# Campus Service Desk — Use Cases

## 1. Overview

This document defines the primary use cases for the Campus Service Desk MVP.

The three primary actors are:

* Student
* Staff
* Admin

A use case represents a meaningful interaction between an actor and the system.

---

# 2. Use Case Index

| ID    | Use Case                  | Primary Actor           |
| ----- | ------------------------- | ----------------------- |
| UC-01 | Register Account          | Student                 |
| UC-02 | Login                     | Student / Staff / Admin |
| UC-03 | Create Ticket             | Student                 |
| UC-04 | View Own Tickets          | Student                 |
| UC-05 | View Ticket Details       | Student / Staff / Admin |
| UC-06 | Add Comment               | Student / Staff / Admin |
| UC-07 | Upload Attachment         | Student / Staff / Admin |
| UC-08 | Cancel Ticket             | Student                 |
| UC-09 | Assign Ticket             | Admin                   |
| UC-10 | Reassign Ticket           | Admin                   |
| UC-11 | Start Work on Ticket      | Staff                   |
| UC-12 | Resolve Ticket            | Staff                   |
| UC-13 | Confirm Resolution        | Student                 |
| UC-14 | Reject Resolution         | Student                 |
| UC-15 | Search and Filter Tickets | Authorized User         |
| UC-16 | Manage Categories         | Admin                   |
| UC-17 | Manage Locations          | Admin                   |
| UC-18 | Manage Users              | Admin                   |
| UC-19 | View Dashboard            | Student / Staff / Admin |

---

# 3. UC-01 — Register Account

## Primary Actor

Student

## Goal

Create an account that can be used to access Campus Service Desk.

## Preconditions

* The student does not already have an account.
* Registration is available.

## Main Flow

1. Student opens the registration page.
2. Student enters required account information.
3. System validates the submitted information.
4. System verifies that the account information is not already registered.
5. System securely stores the credentials.
6. System creates the user account with the appropriate initial role.
7. System confirms successful registration.

## Alternative Flows

### A1 — Invalid information

If the submitted information is invalid:

1. System rejects the request.
2. System displays validation errors.
3. Student corrects the information.

### A2 — Existing account

If the account already exists:

1. System rejects the registration.
2. System informs the student that the account already exists.

---

# 4. UC-02 — Login

## Primary Actor

Student / Staff / Admin

## Goal

Authenticate and access protected functionality.

## Preconditions

* User has an account.
* Account is active.

## Main Flow

1. User enters credentials.
2. System validates credentials.
3. System authenticates the user.
4. System establishes an authenticated session.
5. System determines the user's role.
6. System displays the appropriate dashboard.

## Alternative Flows

### A1 — Invalid credentials

System rejects the login attempt and displays an appropriate error.

### A2 — Deactivated account

System denies protected access to the deactivated account.

---

# 5. UC-03 — Create Ticket

## Primary Actor

Student

## Goal

Report a campus issue.

## Preconditions

* Student is authenticated.
* At least one active category exists.
* At least one active location exists.

## Main Flow

1. Student opens the ticket creation form.
2. Student enters the issue title.
3. Student enters the description.
4. Student selects a category.
5. Student selects a location.
6. Student optionally attaches an image.
7. Student submits the form.
8. System validates the input.
9. System creates the ticket.
10. System generates a unique ticket identifier.
11. System sets the initial status to `OPEN`.
12. System sets the default priority to `MEDIUM`.
13. System associates the ticket with the authenticated student.
14. System records the creation timestamp.
15. System displays the created ticket.

## Alternative Flows

### A1 — Validation failure

The system rejects the request and identifies the invalid fields.

### A2 — Invalid category

If the selected category is inactive or invalid, the system rejects the request.

### A3 — Invalid location

If the selected location is inactive or invalid, the system rejects the request.

### A4 — Invalid attachment

If the uploaded file does not satisfy attachment rules, the ticket submission is rejected or the invalid attachment is removed according to the final upload design.

---

# 6. UC-04 — View Own Tickets

## Primary Actor

Student

## Goal

Monitor previously submitted issues.

## Preconditions

* Student is authenticated.

## Main Flow

1. Student opens the ticket dashboard.
2. System identifies the authenticated student.
3. System retrieves tickets belonging to that student.
4. System displays the ticket list.
5. Student may search, filter, or sort the list.

## Authorization Rule

The system must never return another student's private tickets.

---

# 7. UC-05 — View Ticket Details

## Primary Actors

Student / Staff / Admin

## Goal

Inspect the information and current state of a ticket.

## Preconditions

* User is authenticated.
* User is authorized to access the ticket.

## Main Flow

1. User selects a ticket.
2. System verifies access permissions.
3. System retrieves the ticket and relevant related information.
4. System displays the ticket details.
5. System displays the current workflow state.
6. System displays relevant comments and attachments.

## Alternative Flow

### A1 — Unauthorized access

The system rejects the request.

The user must not receive private ticket information.

---

# 8. UC-06 — Add Comment

## Primary Actors

Student / Staff / Admin

## Goal

Add information to the ticket discussion.

## Main Flow

1. User opens an authorized ticket.
2. User enters a comment.
3. System validates the comment.
4. System associates the comment with the authenticated user.
5. System stores the comment.
6. System records the creation timestamp.
7. System displays the new comment in the ticket history.

---

# 9. UC-07 — Upload Attachment

## Primary Actors

Student / Staff / Admin

## Goal

Attach visual evidence to a ticket.

## Main Flow

1. Authorized user selects an image.
2. System validates file type and size.
3. System uploads the file to the configured storage service.
4. System stores attachment metadata and its relationship to the ticket.
5. System displays the attachment to authorized users.

---

# 10. UC-08 — Cancel Ticket

## Primary Actor

Student

## Goal

Cancel a ticket that no longer needs to be handled.

## Preconditions

* Student owns the ticket.
* Ticket is in an allowed cancellation state.

## Main Flow

1. Student opens their ticket.
2. Student selects cancellation.
3. System verifies ownership.
4. System verifies that the current status allows cancellation.
5. System changes the ticket status to `CANCELLED`.
6. System records the relevant timestamp.
7. System displays the updated state.

## Alternative Flow

### A1 — Invalid cancellation

If cancellation is not allowed in the current state, the system rejects the operation.

---

# 11. UC-09 — Assign Ticket

## Primary Actor

Admin

## Goal

Assign an open ticket to an appropriate staff member.

## Preconditions

* Admin is authenticated.
* Ticket exists.
* Ticket is assignable.
* Selected staff member is active.

## Main Flow

1. Admin opens a ticket.
2. Admin selects a staff member.
3. System verifies the admin's permission.
4. System verifies that the staff account is eligible.
5. System records the assignment.
6. System changes the ticket status from `OPEN` to `ASSIGNED`.
7. System records the update.

---

# 12. UC-10 — Reassign Ticket

## Primary Actor

Admin

## Goal

Transfer responsibility for a ticket to another staff member.

## Preconditions

* Admin is authorized.
* Ticket is not closed or cancelled.
* New staff member is active.

## Main Flow

1. Admin opens the ticket.
2. Admin selects another eligible staff member.
3. System validates the operation.
4. System changes the assignment.
5. System records the new assignment.
6. System preserves appropriate historical information.

---

# 13. UC-11 — Start Work on Ticket

## Primary Actor

Staff

## Goal

Indicate that work has started.

## Preconditions

* Staff is authenticated.
* Ticket is assigned to that staff member.
* Ticket is in `ASSIGNED`.

## Main Flow

1. Staff opens the assigned ticket.
2. Staff starts work.
3. Staff changes the status to `IN_PROGRESS`.
4. System verifies assignment.
5. System validates the state transition.
6. System records the status change.

---

# 14. UC-12 — Resolve Ticket

## Primary Actor

Staff

## Goal

Report that the issue has been addressed.

## Preconditions

* Staff is assigned to the ticket.
* Ticket is `IN_PROGRESS`.

## Main Flow

1. Staff opens the ticket.
2. Staff performs the necessary work.
3. Staff enters resolution information.
4. Staff optionally uploads resolution evidence.
5. Staff submits the resolution.
6. System validates the resolution information.
7. System changes the ticket status to `RESOLVED`.
8. System records the resolution timestamp.
9. System makes the resolution available to the reporting student.

---

# 15. UC-13 — Confirm Resolution

## Primary Actor

Student

## Goal

Confirm that the reported problem has actually been fixed.

## Preconditions

* Student owns the ticket.
* Ticket is `RESOLVED`.

## Main Flow

1. Student opens the resolved ticket.
2. Student reviews the resolution.
3. Student confirms the issue is fixed.
4. System verifies ownership and current status.
5. System changes the ticket status to `CLOSED`.
6. System records the closure timestamp.

---

# 16. UC-14 — Reject Resolution

## Primary Actor

Student

## Goal

Report that the issue is not actually resolved.

## Preconditions

* Student owns the ticket.
* Ticket is `RESOLVED`.

## Main Flow

1. Student opens the resolved ticket.
2. Student indicates that the issue remains unresolved.
3. Student may provide an explanatory comment.
4. System verifies ownership.
5. System changes the ticket status to `IN_PROGRESS`.
6. System preserves the previous resolution information.
7. System records the status change.
8. Assigned staff can continue working on the issue.

---

# 17. UC-15 — Search and Filter Tickets

## Primary Actor

Authorized User

## Goal

Find relevant tickets efficiently.

## Main Flow

1. User opens a ticket list.
2. User enters search terms or selects filters.
3. System validates the query.
4. System returns only tickets the user is authorized to access.
5. System applies requested filtering or sorting.

Supported MVP filtering includes:

* Status
* Category
* Priority
* Location
* Assigned staff

---

# 18. UC-16 — Manage Categories

## Primary Actor

Admin

## Goal

Maintain the available ticket categories.

## Main Flow

1. Admin opens category management.
2. Admin creates, updates, or deactivates a category.
3. System validates the operation.
4. System stores the changes.
5. Active categories become available for new tickets.

Existing tickets retain their historical category association.

---

# 19. UC-17 — Manage Locations

## Primary Actor

Admin

## Goal

Maintain the locations available for issue reporting.

## Main Flow

1. Admin opens location management.
2. Admin creates, updates, or deactivates a location.
3. System validates the operation.
4. System stores the changes.
5. Active locations become available for new tickets.

Existing tickets retain their historical location association.

---

# 20. UC-18 — Manage Users

## Primary Actor

Admin

## Goal

Manage user accounts and roles.

## Main Flow

1. Admin opens user management.
2. Admin searches or filters users.
3. Admin opens a user record.
4. Admin changes permitted account properties.
5. System validates the operation.
6. System stores the changes.

Possible administrative actions include:

* Activate user
* Deactivate user
* Change role

---

# 21. UC-19 — View Dashboard

## Primary Actors

Student / Staff / Admin

## Goal

Provide a role-specific overview of relevant system information.

### Student Dashboard

May display:

* Total own tickets
* Open tickets
* In-progress tickets
* Resolved tickets
* Closed tickets

### Staff Dashboard

May display:

* Assigned tickets
* In-progress workload
* Resolved tickets
* Relevant workload summary

### Admin Dashboard

May display:

* Total tickets
* Tickets by status
* Tickets by category
* Tickets by priority
* Tickets by location
* Staff assignment information

---

# 22. General Security Rules

All use cases involving protected resources must verify:

1. Authentication
2. Role permission
3. Resource access
4. Input validity
5. Business-rule compliance

Client-side restrictions must never be considered sufficient authorization.

---

# 23. Use Case Relationship Summary

The central workflow is:

Student
↓
UC-03 Create Ticket
↓
UC-05 View Ticket
↓
UC-09 Assign Ticket
↓
UC-11 Start Work
↓
UC-12 Resolve Ticket
↓
UC-13 Confirm Resolution
↓
Ticket Closed

Alternative resolution path:

UC-12 Resolve Ticket
↓
UC-14 Reject Resolution
↓
Ticket returns to IN_PROGRESS

Alternative cancellation path:

UC-03 Create Ticket
↓
UC-08 Cancel Ticket
↓
Ticket Cancelled

Supporting interactions:

UC-06 Add Comment
UC-07 Upload Attachment
UC-15 Search and Filter
UC-19 View Dashboard

---

## Status

Requirements phase — in progress.
