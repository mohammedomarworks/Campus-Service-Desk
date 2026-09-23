# Campus Service Desk — Non-Functional Requirements

## 1. Purpose

This document defines quality requirements for Campus Service Desk.

Functional requirements define what the system does.

Non-functional requirements define how well and under what constraints the system should operate.

---

# 2. Security

## NFR-SEC-001 — Authentication

Protected system functionality shall require authentication.

## NFR-SEC-002 — Authorization

Server-side authorization shall be enforced for protected resources and operations.

## NFR-SEC-003 — Password protection

Passwords shall never be stored in plaintext.

## NFR-SEC-004 — Secret management

Application secrets and credentials shall be stored through environment variables or an appropriate secret-management mechanism.

They shall not be committed to Git.

## NFR-SEC-005 — Input validation

All externally supplied input shall be validated on the server.

## NFR-SEC-006 — Injection protection

Database and application code shall use safe parameterized/data-access mechanisms rather than constructing unsafe database queries from raw user input.

## NFR-SEC-007 — File upload security

Uploaded files shall be subject to appropriate validation and access controls.

## NFR-SEC-008 — Error information

Production errors shall not expose sensitive implementation details.

## NFR-SEC-009 — Least privilege

Users shall have only the permissions necessary for their role.

---

# 3. Data Integrity

## NFR-DATA-001

Database relationships shall preserve referential integrity.

## NFR-DATA-002

Ticket identifiers shall be unique.

## NFR-DATA-003

Historical ticket information shall not be unintentionally destroyed by deactivating users, categories, or locations.

## NFR-DATA-004

Operations that require multiple related database changes shall use appropriate transactional behavior.

---

# 4. Reliability

## NFR-REL-001

The application shall handle expected failures without corrupting persistent data.

## NFR-REL-002

API failures shall return controlled responses.

## NFR-REL-003

The application shall provide useful user-facing error messages for common failure conditions.

## NFR-REL-004

Critical server errors shall be logged appropriately without exposing secrets.

---

# 5. Performance

The MVP does not require aggressive optimization.

However:

## NFR-PERF-001

Common pages should load without unnecessary database requests.

## NFR-PERF-002

Ticket lists shall support pagination or another appropriate bounded-query strategy as the dataset grows.

## NFR-PERF-003

Dashboard statistics shall use efficient aggregate queries rather than retrieving unnecessary individual records.

## NFR-PERF-004

Large files shall not be unnecessarily processed or stored through the application server when direct object storage is appropriate.

---

# 6. Scalability

The MVP is designed for a small campus deployment.

The architecture should nevertheless allow:

* More tickets
* More users
* More categories
* More locations
* More staff members

without requiring a complete rewrite of the application.

The system does not require microservices for MVP scalability.

---

# 7. Maintainability

## NFR-MAIN-001

Code shall use clear naming conventions.

## NFR-MAIN-002

Business rules shall not be duplicated unnecessarily across multiple UI components.

## NFR-MAIN-003

Shared logic should be reusable.

## NFR-MAIN-004

Environment-specific configuration shall be separated from application code.

## NFR-MAIN-005

The repository shall contain appropriate technical documentation.

---

# 8. Testability

## NFR-TEST-001

Important business rules shall be testable independently from the UI.

## NFR-TEST-002

Authorization behavior shall be testable.

## NFR-TEST-003

Ticket state transitions shall be testable.

## NFR-TEST-004

Critical API behavior shall have automated coverage.

---

# 9. Usability

## NFR-USE-001

The interface shall clearly communicate ticket status.

## NFR-USE-002

Forms shall provide useful validation feedback.

## NFR-USE-003

Important actions such as cancellation and resolution confirmation shall require deliberate user interaction.

## NFR-USE-004

The interface shall be responsive on mobile, tablet, and desktop screen sizes.

---

# 10. Accessibility

The application should follow practical accessibility principles including:

* Semantic HTML
* Keyboard accessibility
* Visible focus states
* Appropriate labels
* Reasonable color contrast
* Useful error messages
* Alternative text for meaningful images

Accessibility will be improved iteratively.

---

# 11. Observability

The system should provide enough information to diagnose important problems.

The project should eventually include:

* Structured application logging
* Error tracking where appropriate
* Relevant request/error information
* Audit information for sensitive administrative actions

Full production observability is outside the initial MVP.

---

# 12. Deployment

## NFR-DEP-001

The production application shall be deployable through a documented process.

## NFR-DEP-002

Production configuration shall use environment-specific secrets.

## NFR-DEP-003

The production build must succeed before deployment.

## NFR-DEP-004

The repository should include automated CI checks for important quality gates.

---

# 13. Backup and Recovery

Database backup and recovery procedures are operational concerns that become increasingly important if the application is used by real students.

The MVP deployment should use a PostgreSQL provider with an appropriate backup mechanism.

A production deployment should document the recovery approach.

---

# 14. Engineering Quality

The project shall prioritize:

* Correctness
* Security
* Maintainability
* Testability
* Clear architecture
* Understandable code

The project shall not introduce infrastructure complexity merely to make the architecture appear more advanced.

---

## Status

Requirements phase — in progress.
