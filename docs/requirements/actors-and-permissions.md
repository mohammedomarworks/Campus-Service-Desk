# Campus Service Desk — Actors & Permissions

## 1. Actors

Campus Service Desk has three primary application roles:

* Student
* Staff
* Admin

There is also an unauthenticated visitor who can access public pages such as the login page, but cannot access protected system functionality.

---

## 2. Student

A student is a campus user who reports and tracks issues.

### Student capabilities

* Register an account, subject to the system's registration policy
* Log in and log out
* View their own dashboard
* Create a ticket
* View tickets they created
* View ticket details for their own tickets
* Add comments to their own tickets
* Upload permitted attachments to their tickets
* Cancel their own ticket when cancellation is allowed
* View ticket status and timeline
* View assignment information when available
* View resolution information
* Confirm that a resolved issue has been fixed
* Reject a resolution when the issue remains unresolved, causing the ticket to return to an appropriate working state

### Student restrictions

A student cannot:

* View another student's private ticket information
* Assign tickets to staff
* Change the official ticket priority
* Manage categories
* Manage locations
* Manage users
* Change user roles
* Access administrative analytics
* Modify another user's comments
* Directly change a ticket into an arbitrary status
* Mark a ticket as resolved on behalf of staff

---

## 3. Staff

A staff member is responsible for handling tickets assigned to them.

### Staff capabilities

* Log in and log out
* View their staff dashboard
* View tickets assigned to them
* View relevant ticket details
* Add comments
* Upload permitted attachments
* Update the status of tickets they are responsible for
* Add resolution information
* Mark an assigned ticket as resolved

### Staff restrictions

A staff member cannot:

* Assign arbitrary tickets to themselves or other staff unless explicitly permitted by an administrative workflow
* Manage application users
* Change user roles
* Manage system categories
* Manage system locations
* Access administrative settings
* Change system-wide configuration
* Modify tickets belonging to other staff unless the permission is explicitly granted later
* Bypass the ticket state-transition rules

---

## 4. Admin

An admin manages the overall operation of the system.

### Admin capabilities

* Log in and log out
* View the administrative dashboard
* View all tickets
* Search and filter tickets
* View ticket details
* Assign tickets to staff
* Reassign tickets when necessary
* Change ticket priority
* Update ticket status when necessary
* Add administrative comments
* Manage users
* Activate or deactivate users
* Manage user roles where permitted
* Create, update, and deactivate categories
* Create, update, and deactivate locations
* View system-wide ticket statistics
* Monitor ticket activity
* Access administrative system functionality

### Admin restrictions

Administrators must still follow the application's business rules.

Administrative access does not mean that every database record should be directly editable without validation or logging.

---

## 5. Permission Matrix

| Capability                    |             Student |             Staff |                                  Admin |
| ----------------------------- | ------------------: | ----------------: | -------------------------------------: |
| Login                         |                 Yes |               Yes |                                    Yes |
| View own dashboard            |                 Yes |               Yes |                                    Yes |
| Create ticket                 |                 Yes |               No* |                                    No* |
| View own tickets              |                 Yes |                No |                                     No |
| View assigned tickets         |                  No |               Yes |                                    Yes |
| View all tickets              |                  No |                No |                                    Yes |
| Add comments                  |         Own tickets |  Assigned tickets |                    Any relevant ticket |
| Upload attachments            |         Own tickets |  Assigned tickets |                       Relevant tickets |
| Cancel ticket                 |   Own, when allowed |                No |                                    Yes |
| Change ticket priority        |                  No |                No |                                    Yes |
| Assign ticket                 |                  No |                No |                                    Yes |
| Reassign ticket               |                  No |                No |                                    Yes |
| Update assigned ticket status |                  No |               Yes |                                    Yes |
| Mark ticket resolved          |                  No |               Yes |                                    Yes |
| Confirm resolution            | Yes, for own ticket |                No | Administrative override when justified |
| Manage categories             |                  No |                No |                                    Yes |
| Manage locations              |                  No |                No |                                    Yes |
| Manage users                  |                  No |                No |                                    Yes |
| Manage roles                  |                  No |                No |                                    Yes |
| View analytics                |       Personal only | Assigned workload |                            System-wide |
| Access admin settings         |                  No |                No |                                    Yes |

* Staff/Admin ticket creation is outside the initial MVP unless a later business requirement introduces it.

---

## 6. Authorization Principle

Permissions must be enforced on the server.

The user interface may hide buttons and links that a user should not access, but this is not sufficient security.

For example, hiding an "Assign Ticket" button from students does not prevent a malicious request from being sent directly to the API.

The backend must independently verify:

1. The user is authenticated.
2. The user's role allows the requested operation.
3. The user has access to the specific resource.
4. The requested state transition is valid.
5. The submitted data satisfies validation rules.

---

## 7. Ownership Rules

Tickets belong to the student who created them.

For MVP:

* A student can access only their own tickets.
* A staff member can access tickets assigned to them.
* An admin can access all tickets.
* Ticket access must be checked server-side.

Comments and attachments inherit the access rules of the ticket they belong to.

---

## 8. Role Changes

User roles are controlled by administrators.

A normal user must not be able to change their own role.

Role changes must be validated and should become auditable when the audit-log functionality is introduced.

---

## 9. Deactivated Users

A deactivated user must not be able to authenticate into protected application functionality.

Existing historical records created by that user must remain associated with the user for data integrity and traceability.

---

## 10. Future Permissions

The MVP deliberately uses three fixed roles.

A future version may introduce more granular permissions, such as:

* Maintenance staff
* IT support
* Hostel management
* Department representative
* Super administrator

This should not be implemented until there is a demonstrated requirement for it.

---

## Status

Requirements phase — in progress.
