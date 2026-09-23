# Campus Service Desk — Functional Requirements & Business Rules

## 1. Purpose

This document defines the functional behavior and core business rules of Campus Service Desk.

The requirements describe what the system must do during the MVP. They provide the foundation for use cases, database design, API design, authorization, testing, and acceptance criteria.

---

# 2. Authentication & Account Management

### FR-AUTH-001 — User registration

The system shall allow eligible users to create an account.

The registration process shall collect the minimum information required for identification and authentication.

### FR-AUTH-002 — User login

The system shall allow registered users to authenticate using valid credentials.

### FR-AUTH-003 — User logout

The system shall allow authenticated users to terminate their authenticated session.

### FR-AUTH-004 — Protected resources

The system shall require authentication before allowing access to protected application functionality.

### FR-AUTH-005 — Role-based access

The system shall restrict functionality according to the authenticated user's role.

Supported MVP roles:

* Student
* Staff
* Admin

### FR-AUTH-006 — Deactivated accounts

The system shall prevent deactivated users from accessing protected functionality.

Historical records associated with a deactivated user shall remain preserved.

---

# 3. Ticket Creation

### FR-TKT-001 — Create ticket

An authenticated student shall be able to create a campus issue ticket.

### FR-TKT-002 — Required ticket information

A ticket shall require:

* Title
* Description
* Category
* Location

### FR-TKT-003 — Optional attachment

A student may attach a supported image to a ticket.

### FR-TKT-004 — Ticket identifier

The system shall generate a unique identifier for every ticket.

Example:

`CSD-2026-000124`

### FR-TKT-005 — Initial status

A newly created ticket shall have the status:

`OPEN`

### FR-TKT-006 — Ticket ownership

The system shall associate each ticket with the authenticated student who created it.

The student shall not be able to create a ticket on behalf of another user.

### FR-TKT-007 — Timestamp

The system shall record when a ticket is created.

---

# 4. Ticket Viewing

### FR-VIEW-001 — Student tickets

A student shall be able to view tickets created by that student.

### FR-VIEW-002 — Staff tickets

A staff member shall be able to view tickets assigned to that staff member.

### FR-VIEW-003 — Admin tickets

An administrator shall be able to view all tickets.

### FR-VIEW-004 — Ticket details

Authorized users shall be able to view relevant ticket information, including:

* Ticket identifier
* Title
* Description
* Category
* Location
* Priority
* Current status
* Reporter
* Assigned staff member
* Comments
* Attachments
* Resolution information
* Relevant timestamps

### FR-VIEW-005 — Unauthorized access prevention

The system shall reject requests to access ticket information when the authenticated user does not have permission to access that ticket.

---

# 5. Ticket Assignment

### FR-ASSIGN-001 — Assign ticket

An administrator shall be able to assign an eligible staff member to an unassigned ticket.

### FR-ASSIGN-002 — Reassign ticket

An administrator shall be able to reassign a ticket when operationally necessary.

### FR-ASSIGN-003 — Assignment visibility

The assigned staff member shall be able to see tickets assigned to them.

The reporting student shall be able to see the assigned staff member when appropriate.

### FR-ASSIGN-004 — Assignment status

When an administrator assigns an `OPEN` ticket to a staff member, the ticket shall enter:

`ASSIGNED`

The system shall not automatically mark the ticket as `IN_PROGRESS` merely because it has been assigned.

---

# 6. Ticket Priority

### FR-PRIORITY-001 — Priority levels

The MVP shall support the following priority levels:

* LOW
* MEDIUM
* HIGH
* URGENT

### FR-PRIORITY-002 — Default priority

A newly created ticket shall receive a default priority of:

`MEDIUM`

### FR-PRIORITY-003 — Administrative priority control

Administrators shall be able to change the official priority of a ticket.

Students shall not directly control the official ticket priority.

### FR-PRIORITY-004 — Priority visibility

Authorized users shall be able to see the current ticket priority.

---

# 7. Ticket Status Workflow

The system shall enforce a controlled ticket lifecycle.

The primary MVP workflow is:

`OPEN → ASSIGNED → IN_PROGRESS → RESOLVED → CLOSED`

Cancellation is possible from the early stages:

`OPEN → CANCELLED`

`ASSIGNED → CANCELLED`

Resolution rejection can return a ticket to active work:

`RESOLVED → IN_PROGRESS`

---

## FR-STATUS-001 — Open

A newly created ticket shall begin in `OPEN`.

An administrator may review the ticket before assignment.

## FR-STATUS-002 — Assigned

A ticket shall enter `ASSIGNED` when an administrator assigns it to a staff member.

## FR-STATUS-003 — In Progress

The assigned staff member shall be able to move an eligible ticket from `ASSIGNED` to `IN_PROGRESS`.

## FR-STATUS-004 — Resolved

The assigned staff member shall be able to mark an `IN_PROGRESS` ticket as `RESOLVED` after providing appropriate resolution information.

## FR-STATUS-005 — Closed

A student shall be able to confirm a `RESOLVED` ticket.

Upon confirmation, the system shall move the ticket to `CLOSED`.

## FR-STATUS-006 — Resolution rejection

A student shall be able to indicate that a resolution did not actually resolve the issue.

A rejected resolution shall return the ticket to:

`IN_PROGRESS`

The staff member shall then be able to continue working on the issue.

## FR-STATUS-007 — Cancellation

A student may cancel their own ticket while it is in an early stage, subject to the cancellation rules.

The MVP shall allow student cancellation from:

* `OPEN`
* `ASSIGNED`

Students shall not normally cancel a ticket once work is actively in progress.

## FR-STATUS-008 — Terminal states

`CLOSED` and `CANCELLED` shall be treated as terminal states in the MVP.

Normal users shall not arbitrarily move a ticket out of a terminal state.

Any future reopening capability shall be introduced as a separate requirement.

## FR-STATUS-009 — Invalid transitions

The system shall reject invalid status transitions.

For example:

`CLOSED → IN_PROGRESS`

shall not be permitted through a normal status-update operation.

---

# 8. Comments

### FR-COM-001 — Add comment

Authorized users shall be able to add comments to a ticket they are permitted to access.

### FR-COM-002 — Comment author

Each comment shall be associated with the authenticated user who created it.

### FR-COM-003 — Comment timestamp

The system shall record when each comment was created.

### FR-COM-004 — Comment visibility

Comments shall only be visible to users who are authorized to access the related ticket.

### FR-COM-005 — Comment history

Comments shall remain associated with the ticket so that the conversation history can be reviewed.

Editing and deletion of comments are outside the initial MVP unless explicitly required later.

---

# 9. Attachments

### FR-ATT-001 — Ticket attachments

Authorized users shall be able to upload supported image attachments to tickets they can access.

### FR-ATT-002 — File validation

The system shall validate uploaded files before accepting them.

Validation shall include appropriate checks such as:

* Supported file type
* File size
* Upload integrity

### FR-ATT-003 — Attachment ownership

Each attachment shall be associated with its ticket and uploader.

### FR-ATT-004 — Attachment access

Attachments shall not be publicly accessible merely because their URL is known.

Access control requirements shall be considered when selecting the storage solution.

---

# 10. Resolution

### FR-RES-001 — Resolution information

Staff shall provide a resolution description when marking a ticket as resolved.

### FR-RES-002 — Resolution proof

Staff may provide an optional image or other supported evidence of the completed work.

### FR-RES-003 — Resolution timestamp

The system shall record when a ticket enters the `RESOLVED` state.

### FR-RES-004 — Student confirmation

The system shall provide the student with a clear mechanism to confirm or reject the reported resolution.

---

# 11. Category Management

### FR-CAT-001 — Categories

Tickets shall belong to a category.

### FR-CAT-002 — Category administration

Administrators shall be able to create categories.

### FR-CAT-003 — Category updates

Administrators shall be able to update category information.

### FR-CAT-004 — Category deactivation

Administrators shall be able to deactivate categories that should no longer be used.

Existing tickets using a deactivated category shall retain their historical category association.

### FR-CAT-005 — Active categories

Students shall only be able to select active categories when creating new tickets.

---

# 12. Location Management

### FR-LOC-001 — Ticket location

Every ticket shall have a location.

### FR-LOC-002 — Location administration

Administrators shall be able to create locations.

### FR-LOC-003 — Location updates

Administrators shall be able to update location information.

### FR-LOC-004 — Location deactivation

Administrators shall be able to deactivate locations that should no longer be available for new tickets.

Existing tickets shall retain their historical location association.

### FR-LOC-005 — Active locations

Students shall only be able to select active locations when creating new tickets.

---

# 13. User Management

### FR-USER-001 — View users

Administrators shall be able to view registered users.

### FR-USER-002 — Manage user status

Administrators shall be able to activate or deactivate user accounts.

### FR-USER-003 — Manage roles

Administrators shall be able to assign or change supported user roles according to system permissions.

### FR-USER-004 — Self-role modification prevention

Users shall not be able to change their own role through normal user-facing functionality.

### FR-USER-005 — Historical integrity

Deactivating a user shall not delete their historical tickets, comments, or other records required for system integrity.

---

# 14. Search, Filtering, and Sorting

### FR-SEARCH-001 — Ticket search

Authorized users shall be able to search tickets they are permitted to access.

### FR-FILTER-001 — Status filtering

Users shall be able to filter visible tickets by status.

### FR-FILTER-002 — Category filtering

Users shall be able to filter visible tickets by category.

### FR-FILTER-003 — Priority filtering

Users shall be able to filter visible tickets by priority.

### FR-FILTER-004 — Location filtering

Administrators shall be able to filter tickets by location.

### FR-FILTER-005 — Staff filtering

Administrators shall be able to filter tickets by assigned staff member.

### FR-SORT-001 — Sorting

Ticket lists shall support useful sorting options such as newest first and oldest first.

---

# 15. Dashboards and Analytics

### FR-DASH-001 — Student dashboard

The student dashboard shall display a summary of the student's tickets.

### FR-DASH-002 — Staff dashboard

The staff dashboard shall display assigned ticket information and relevant workload summaries.

### FR-DASH-003 — Admin dashboard

The admin dashboard shall display system-wide ticket statistics.

### FR-DASH-004 — Basic analytics

The MVP shall provide basic aggregate information such as:

* Total tickets
* Open tickets
* Assigned tickets
* In-progress tickets
* Resolved tickets
* Closed tickets
* Cancelled tickets
* Tickets by category
* Tickets by priority
* Tickets by location

Advanced reporting is outside the MVP.

---

# 16. Business Rules

## BR-001 — Ticket ownership

The student who creates a ticket becomes its reporter and owner for student-facing access.

## BR-002 — Server-side authorization

Every protected operation shall be authorized on the server regardless of what the client interface displays.

## BR-003 — Status integrity

Tickets may only move through explicitly permitted status transitions.

## BR-004 — Assignment responsibility

Only administrators may assign or reassign tickets during the MVP.

## BR-005 — Resolution responsibility

A staff member may resolve a ticket only when they are assigned to that ticket, unless the operation is performed through an authorized administrative workflow.

## BR-006 — Student confirmation

Only the student who reported the ticket may normally confirm or reject its resolution.

## BR-007 — Priority control

The official ticket priority is controlled by administrators.

## BR-008 — Category validity

A ticket may only use an active category when the ticket is created.

## BR-009 — Location validity

A ticket may only use an active location when the ticket is created.

## BR-010 — Historical preservation

Deactivating categories, locations, or users shall not remove required historical information from existing tickets.

## BR-011 — Cancellation restriction

A student may cancel only their own ticket and only during allowed early workflow states.

## BR-012 — Closed ticket immutability

A closed ticket shall not be modified through ordinary status operations.

Future reopening behavior requires a separate business rule.

## BR-013 — Comment authorship

A comment must always be associated with the authenticated user who created it.

## BR-014 — Resolution requirement

A ticket cannot normally enter `RESOLVED` unless the staff member provides resolution information.

## BR-015 — Student rejection

When a student rejects a resolution, the system shall preserve the previous resolution information and return the ticket to `IN_PROGRESS` rather than deleting the previous history.

## BR-016 — Unique ticket identifiers

Every ticket must have a unique identifier that cannot be reused by another ticket.

## BR-017 — Data validation

All user-provided input must be validated before it is stored or processed.

## BR-018 — Administrative accountability

Administrative actions that materially affect ticket handling should be designed so they can be audited in a future audit-log implementation.

---

# 17. Explicitly Out of Scope for MVP

The following are not required for the first release:

* Email notifications
* SMS notifications
* Push notifications
* QR-based location identification
* SLA automation
* Automatic ticket escalation
* AI-based categorization
* Real-time chat
* Mobile native application
* Multi-university support
* Advanced reporting
* Custom permission builder
* Automated staff workload balancing

These may be considered after the MVP has been tested with real users.

---

# 18. Requirement Traceability

The requirements in this document will later be connected to:

Functional Requirements
↓
User Stories
↓
Use Cases
↓
Database Entities
↓
API Endpoints
↓
UI Features
↓
Automated Tests

A requirement should not be considered fully implemented merely bec
