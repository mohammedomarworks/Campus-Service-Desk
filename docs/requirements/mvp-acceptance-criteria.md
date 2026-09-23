# Campus Service Desk — MVP Acceptance Criteria

## 1. Purpose

This document defines the conditions under which the Campus Service Desk MVP can be considered functionally complete.

A feature is not considered complete merely because its interface exists.

The feature must satisfy its relevant behavior, authorization, validation, persistence, and testing requirements.

---

# 2. Authentication

The MVP is accepted when:

* A user can register through the approved registration flow.
* A registered user can log in.
* A user can log out.
* Invalid credentials are rejected.
* Deactivated users cannot access protected functionality.
* Protected routes require authentication.
* Role-based restrictions are enforced server-side.
* Passwords are not stored in plaintext.
* Authentication secrets are not committed to Git.

---

# 3. Student Ticket Creation

The MVP is accepted when:

* An authenticated student can create a ticket.
* Title validation works.
* Description validation works.
* Category selection works.
* Location selection works.
* Optional image attachment works.
* Invalid categories are rejected.
* Invalid locations are rejected.
* A unique ticket identifier is generated.
* The initial status is `OPEN`.
* The default priority is `MEDIUM`.
* The authenticated student becomes the ticket reporter.
* Ticket creation data persists correctly in PostgreSQL.
* The student can immediately access the created ticket.

---

# 4. Ticket Viewing

The MVP is accepted when:

* Students can see their own tickets.
* Staff can see their assigned tickets.
* Admins can see all tickets.
* Authorized users can view relevant ticket details.
* Unauthorized users cannot access private ticket information.
* Direct URL/request manipulation does not bypass authorization.

---

# 5. Assignment

The MVP is accepted when:

* Admins can assign eligible staff members.
* Inactive staff members cannot receive new assignments.
* Assignment changes persist correctly.
* Assignment changes update the ticket workflow appropriately.
* Staff members can see their assigned tickets.
* Reassignment works correctly.
* Existing historical ticket information remains intact.

---

# 6. Ticket Workflow

The MVP is accepted when the system correctly enforces:

```text
OPEN
 ↓
ASSIGNED
 ↓
IN_PROGRESS
 ↓
RESOLVED
 ↓
CLOSED
```

And:

```text
OPEN → CANCELLED
ASSIGNED → CANCELLED
RESOLVED → IN_PROGRESS
```

The system must reject invalid transitions.

---

# 7. Resolution

The MVP is accepted when:

* Assigned staff can start work.
* Assigned staff can mark a ticket as resolved.
* Required resolution information is validated.
* Resolution information is saved.
* Resolution timestamp is recorded.
* Student can review the resolution.
* Student can confirm resolution.
* Confirmation changes the ticket to `CLOSED`.
* Student can reject an inadequate resolution.
* Rejection changes the ticket back to `IN_PROGRESS`.
* Previous resolution information remains preserved.

---

# 8. Comments

The MVP is accepted when:

* Authorized users can add comments.
* Empty comments are rejected.
* Comment authorship is stored correctly.
* Comment timestamps are stored.
* Unauthorized users cannot add comments.
* Comments remain associated with the correct ticket.

---

# 9. Attachments

The MVP is accepted when:

* Supported image files can be uploaded.
* Oversized files are rejected.
* Unsupported files are rejected.
* Failed uploads do not leave broken attachment records.
* Authorized users can access relevant attachments.
* Unauthorized users cannot access protected attachments.

---

# 10. Categories

The MVP is accepted when admins can:

* Create categories.
* Update categories.
* Deactivate categories.

The system must:

* Show only active categories when creating new tickets.
* Preserve historical category associations.

---

# 11. Locations

The MVP is accepted when admins can:

* Create locations.
* Update locations.
* Deactivate locations.

The system must:

* Show only active locations when creating new tickets.
* Preserve historical location associations.

---

# 12. User Management

The MVP is accepted when admins can:

* View users.
* Activate users.
* Deactivate users.
* Manage supported roles.

The system must:

* Prevent normal users from changing their own role.
* Preserve historical records when a user is deactivated.
* Prevent removal of the last valid administrator through normal administrative actions.

---

# 13. Search and Filtering

The MVP is accepted when authorized users can search and filter tickets within their permission scope.

Required filters include:

* Status
* Category
* Priority

Administrators should additionally be able to filter by:

* Location
* Assigned staff

---

# 14. Dashboards

### Student

The dashboard shows a useful summary of the student's own tickets.

### Staff

The dashboard shows assigned workload and relevant status information.

### Admin

The dashboard shows system-wide ticket statistics.

The statistics must be based on persisted database data rather than hardcoded values.

---

# 15. Error Handling

The MVP is accepted when common failures produce controlled application behavior.

Examples include:

* Invalid input
* Unauthorized request
* Missing resource
* Invalid state transition
* Database failure
* Attachment failure

Production responses must not expose sensitive implementation details.

---

# 16. Testing

The MVP is not considered complete without automated tests for critical business behavior.

At minimum, tests should cover:

* Authentication protection
* Role authorization
* Student ticket ownership
* Ticket creation validation
* Assignment permissions
* Valid state transitions
* Invalid state transitions
* Resolution confirmation
* Resolution rejection
* Cancellation rules

Additional integration/end-to-end tests should cover the most important user workflows.

---

# 17. Build and Deployment

The MVP is accepted when:

* The application builds successfully.
* Linting/quality checks pass.
* Automated tests pass.
* Environment variables are documented.
* The production application is deployed.
* The deployment process is documented.
* The production application can successfully execute the core ticket workflow.

---

# 18. Documentation

The repository should contain:

* Project README
* Requirements documentation
* Architecture documentation
* Database documentation
* API documentation
* Testing documentation
* Environment variable documentation
* Deployment instructions
* Known limitations
* Future roadmap

---

# 19. MVP End-to-End Demonstration

The strongest acceptance test is a complete real workflow:

```text
Student logs in
      ↓
Student creates ticket
      ↓
Admin sees ticket
      ↓
Admin assigns staff
      ↓
Staff sees assignment
      ↓
Staff starts work
      ↓
Staff adds comments
      ↓
Staff provides resolution
      ↓
Ticket becomes RESOLVED
      ↓
Student reviews resolution
      ↓
Student confirms
      ↓
Ticket becomes CLOSED
```

The complete workflow must work without manual database manipulation.

---

# 20. MVP Completion Definition

Campus Service Desk MVP is considered complete only when:

1. Core user roles work.
2. Core ticket lifecycle works.
3. Authorization is enforced server-side.
4. Data is persisted correctly.
5. Critical edge cases are handled.
6. Critical business rules are tested.
7. Production build succeeds.
8. Application is deployed.
9. Documentation explains the system.
10. The complete ticket workflow can be demonstrated from start to finish.

---

## Status

Requirements phase — complete pending review and system-design translation.
