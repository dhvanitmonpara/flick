# User Management

<cite>
**Referenced Files in This Document**
- [UserPage.tsx](file://admin/src/pages/UserPage.tsx)
- [UserTable.tsx](file://admin/src/components/general/UserTable.tsx)
- [UserProfile.tsx](file://admin/src/components/general/UserProfile.tsx)
- [User.ts](file://admin/src/types/User.ts)
- [user-moderation.route.ts](file://server/src/modules/moderation/user/user-moderation.route.ts)
- [user-moderation.controller.ts](file://server/src/modules/moderation/user/user-moderation.controller.ts)
- [user-moderation.service.ts](file://server/src/modules/moderation/user/user-moderation.service.ts)
- [user-moderation.schema.ts](file://server/src/modules/moderation/user/user-moderation.schema.ts)
- [user.controller.ts](file://server/src/modules/user/user.controller.ts)
- [user.service.ts](file://server/src/modules/user/user.service.ts)
- [user.repo.ts](file://server/src/modules/user/user.repo.ts)
- [user.schema.ts](file://server/src/modules/user/user.schema.ts)
- [user.dto.ts](file://server/src/modules/user/user.dto.ts)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)
10. [Appendices](#appendices)

## Introduction
This document describes the administrative user management system, focusing on user account oversight, profile viewing capabilities, and user action controls. It explains the user table interface with filtering, sorting, and bulk operations, details user profile management, account status changes, and user activity monitoring. It also covers user suspension workflows, account verification processes, user data inspection tools, search functionality, role management, and permission administration.

## Project Structure
The user management system spans the admin frontend and the server backend:
- Admin frontend: user listing, search, and moderation actions.
- Server backend: admin routes for listing/searching users and updating moderation state; service and adapter layers for persistence and caching.

```mermaid
graph TB
subgraph "Admin Frontend"
UP["UserPage.tsx"]
UT["UserTable.tsx"]
UType["User.ts"]
end
subgraph "Server Backend"
Route["user-moderation.route.ts"]
Ctrl["user-moderation.controller.ts"]
Svc["user-moderation.service.ts"]
Schema["user-moderation.schema.ts"]
UserCtrl["user.controller.ts"]
UserService["user.service.ts"]
UserRepo["user.repo.ts"]
UserSchema["user.schema.ts"]
UserDTO["user.dto.ts"]
end
UP --> UT
UT --> Route
Route --> Ctrl
Ctrl --> Svc
Svc --> Schema
UP --> UserCtrl
UserCtrl --> UserService
UserService --> UserRepo
UserService --> UserSchema
UserService --> UserDTO
```

**Diagram sources**
- [UserPage.tsx](file://admin/src/pages/UserPage.tsx#L1-L235)
- [UserTable.tsx](file://admin/src/components/general/UserTable.tsx#L1-L323)
- [User.ts](file://admin/src/types/User.ts#L1-L16)
- [user-moderation.route.ts](file://server/src/modules/moderation/user/user-moderation.route.ts#L1-L20)
- [user-moderation.controller.ts](file://server/src/modules/moderation/user/user-moderation.controller.ts#L1-L82)
- [user-moderation.service.ts](file://server/src/modules/moderation/user/user-moderation.service.ts#L1-L187)
- [user-moderation.schema.ts](file://server/src/modules/moderation/user/user-moderation.schema.ts#L1-L30)
- [user.controller.ts](file://server/src/modules/user/user.controller.ts#L1-L72)
- [user.service.ts](file://server/src/modules/user/user.service.ts#L1-L137)
- [user.repo.ts](file://server/src/modules/user/user.repo.ts#L1-L67)
- [user.schema.ts](file://server/src/modules/user/user.schema.ts#L1-L40)
- [user.dto.ts](file://server/src/modules/user/user.dto.ts#L1-L17)

**Section sources**
- [UserPage.tsx](file://admin/src/pages/UserPage.tsx#L1-L235)
- [UserTable.tsx](file://admin/src/components/general/UserTable.tsx#L1-L323)
- [User.ts](file://admin/src/types/User.ts#L1-L16)
- [user-moderation.route.ts](file://server/src/modules/moderation/user/user-moderation.route.ts#L1-L20)
- [user-moderation.controller.ts](file://server/src/modules/moderation/user/user-moderation.controller.ts#L1-L82)
- [user-moderation.service.ts](file://server/src/modules/moderation/user/user-moderation.service.ts#L1-L187)
- [user-moderation.schema.ts](file://server/src/modules/moderation/user/user-moderation.schema.ts#L1-L30)
- [user.controller.ts](file://server/src/modules/user/user.controller.ts#L1-L72)
- [user.service.ts](file://server/src/modules/user/user.service.ts#L1-L137)
- [user.repo.ts](file://server/src/modules/user/user.repo.ts#L1-L67)
- [user.schema.ts](file://server/src/modules/user/user.schema.ts#L1-L40)
- [user.dto.ts](file://server/src/modules/user/user.dto.ts#L1-L17)

## Core Components
- Admin user listing and search:
  - Fetches paginated user lists and supports username/email search.
  - Displays counts for visible users, active, blocked, and suspended users.
- User table:
  - Renders user data with profile preview and actions dropdown.
  - Supports blocking/unblocking and suspension/removal of suspension.
- Moderation endpoints:
  - Admin-only endpoints to list/search users and update moderation state (block/suspend).
- User profile management:
  - Profile retrieval and updates via dedicated user endpoints.
- Role and permissions:
  - Admin/moderator routes protected by authentication and role checks.

**Section sources**
- [UserPage.tsx](file://admin/src/pages/UserPage.tsx#L22-L133)
- [UserTable.tsx](file://admin/src/components/general/UserTable.tsx#L41-L116)
- [user-moderation.route.ts](file://server/src/modules/moderation/user/user-moderation.route.ts#L7-L17)
- [user.controller.ts](file://server/src/modules/user/user.controller.ts#L9-L33)

## Architecture Overview
The admin user management flow connects the frontend UI to backend moderation APIs and user services.

```mermaid
sequenceDiagram
participant Admin as "Admin UI<br/>UserPage/UserTable"
participant API as "Admin Routes<br/>user-moderation.route.ts"
participant Ctrl as "Controller<br/>user-moderation.controller.ts"
participant Svc as "Service<br/>user-moderation.service.ts"
participant Repo as "Adapters/Repo"
Admin->>API : GET /users (list/search)
API->>Ctrl : list/search handlers
Ctrl->>Svc : get users by query
Svc->>Repo : find users
Repo-->>Svc : user records
Svc-->>Ctrl : normalized users
Ctrl-->>API : HTTP 200 OK
API-->>Admin : users payload
Admin->>API : PUT / : userId/moderation-state
API->>Ctrl : upsertModerationState
Ctrl->>Svc : block/unblock/suspend
Svc->>Repo : persist state
Repo-->>Svc : updated user
Svc-->>Ctrl : success
Ctrl-->>API : HTTP 200 OK
API-->>Admin : updated state
```

**Diagram sources**
- [UserPage.tsx](file://admin/src/pages/UserPage.tsx#L45-L111)
- [UserTable.tsx](file://admin/src/components/general/UserTable.tsx#L48-L116)
- [user-moderation.route.ts](file://server/src/modules/moderation/user/user-moderation.route.ts#L11-L17)
- [user-moderation.controller.ts](file://server/src/modules/moderation/user/user-moderation.controller.ts#L28-L78)
- [user-moderation.service.ts](file://server/src/modules/moderation/user/user-moderation.service.ts#L7-L183)

## Detailed Component Analysis

### Admin User Listing and Search (UserPage)
- Purpose: Paginated listing of users and search by username or email.
- Key behaviors:
  - Uses limit/offset for pagination.
  - Switches to search endpoint when filters are present.
  - Resets to default list when filters are cleared.
  - Computes dashboard-like stats for active/block/suspend counts.
- Data mapping:
  - Translates backend admin list payload to frontend User type, including suspension metadata.

```mermaid
flowchart TD
Start(["Mount UserPage"]) --> Load["Fetch users (default or search)"]
Load --> IsSearch{"Filters present?"}
IsSearch --> |No| List["GET /users?limit=&offset="]
IsSearch --> |Yes| Search["GET /users/search?username=&email="]
List --> Render["Map to User[] and set state"]
Search --> Render
Render --> Stats["Compute stats: total, active, blocked, suspended"]
Stats --> Done(["Render UserTable"])
```

**Diagram sources**
- [UserPage.tsx](file://admin/src/pages/UserPage.tsx#L45-L133)

**Section sources**
- [UserPage.tsx](file://admin/src/pages/UserPage.tsx#L22-L133)

### User Table and Actions (UserTable)
- Purpose: Render user rows, provide profile preview, and perform moderation actions.
- Columns:
  - Username, Branch, Blocked status, Suspension expiry.
- Actions:
  - Ban/Unban user.
  - Suspend user (opens dialog to set days and reason).
  - Remove suspension.
- State management:
  - Updates local state after successful requests.
  - Handles active action busy state per row.

```mermaid
sequenceDiagram
participant Admin as "Admin UI"
participant Table as "UserTable"
participant API as "PUT / : userId/moderation-state"
participant Ctrl as "Controller"
participant Svc as "Service"
Admin->>Table : Click "Suspend User"
Table->>Table : Open suspension dialog
Admin->>Table : Confirm days and reason
Table->>API : PUT {blocked : false, suspension : {ends, reason}}
API->>Ctrl : upsertModerationState
Ctrl->>Svc : suspendUser(userId, {ends, reason})
Svc-->>Ctrl : success
Ctrl-->>API : ok
API-->>Table : ok
Table->>Table : Update local state and show toast
```

**Diagram sources**
- [UserTable.tsx](file://admin/src/components/general/UserTable.tsx#L48-L144)
- [user-moderation.controller.ts](file://server/src/modules/moderation/user/user-moderation.controller.ts#L48-L71)
- [user-moderation.service.ts](file://server/src/modules/moderation/user/user-moderation.service.ts#L79-L128)

**Section sources**
- [UserTable.tsx](file://admin/src/components/general/UserTable.tsx#L41-L116)
- [UserTable.tsx](file://admin/src/components/general/UserTable.tsx#L146-L262)
- [UserTable.tsx](file://admin/src/components/general/UserTable.tsx#L274-L321)

### Moderation Endpoints and Validation
- Routes:
  - GET /users (admin list with pagination).
  - GET /users/search (admin search by username/email).
  - PUT /:userId/moderation-state (update block/suspension).
  - GET /:userId/suspension (fetch suspension status).
- Authentication and roles:
  - Protected by authenticate, requireAuth, and requireRole("admin", "superadmin").
- Validation:
  - user-moderation.schema enforces presence of either email or username for search, and validates suspension payload.

```mermaid
classDiagram
class UserAdminController {
+list(req)
+search(req)
+upsertModerationState(req)
+getSuspension(req)
}
class UserManagementService {
+blockUser(userId)
+unblockUser(userId)
+suspendUser(userId, suspensionData)
+getSuspensionStatus(userId)
+getUsersByQuery(filters)
+getUserById(userId)
}
UserAdminController --> UserManagementService : "calls"
```

**Diagram sources**
- [user-moderation.controller.ts](file://server/src/modules/moderation/user/user-moderation.controller.ts#L27-L79)
- [user-moderation.service.ts](file://server/src/modules/moderation/user/user-moderation.service.ts#L6-L186)
- [user-moderation.route.ts](file://server/src/modules/moderation/user/user-moderation.route.ts#L7-L17)
- [user-moderation.schema.ts](file://server/src/modules/moderation/user/user-moderation.schema.ts#L3-L29)

**Section sources**
- [user-moderation.route.ts](file://server/src/modules/moderation/user/user-moderation.route.ts#L1-L20)
- [user-moderation.controller.ts](file://server/src/modules/moderation/user/user-moderation.controller.ts#L26-L79)
- [user-moderation.service.ts](file://server/src/modules/moderation/user/user-moderation.service.ts#L142-L183)
- [user-moderation.schema.ts](file://server/src/modules/moderation/user/user-moderation.schema.ts#L1-L30)

### User Profile Management and Verification
- Profile retrieval:
  - Admin can fetch user details via user controller endpoints.
- Profile updates:
  - Update branch via updateUserProfile endpoint.
- Verification and terms:
  - acceptTerms endpoint marks user as having accepted terms.
- DTO and schemas:
  - toPublicUser maps internal user to public shape.
  - user.schema defines validation for branch updates and search queries.

```mermaid
sequenceDiagram
participant Admin as "Admin UI"
participant UserCtrl as "UserController"
participant UserService as "UserService"
participant UserRepo as "UserRepo"
Admin->>UserCtrl : GET /users/ : userId/profile
UserCtrl->>UserService : getUserProfileById(userId)
UserService->>UserRepo : findById
UserRepo-->>UserService : user
UserService-->>UserCtrl : user
UserCtrl-->>Admin : public user
Admin->>UserCtrl : PUT /users/ : userId/profile (branch)
UserCtrl->>UserService : updateUserProfile(userId, {branch})
UserService->>UserRepo : updateById
UserRepo-->>UserService : updated user
UserService-->>UserCtrl : updated user
UserCtrl-->>Admin : updated user
```

**Diagram sources**
- [user.controller.ts](file://server/src/modules/user/user.controller.ts#L9-L51)
- [user.service.ts](file://server/src/modules/user/user.service.ts#L9-L89)
- [user.repo.ts](file://server/src/modules/user/user.repo.ts#L6-L66)
- [user.dto.ts](file://server/src/modules/user/user.dto.ts#L3-L11)
- [user.schema.ts](file://server/src/modules/user/user.schema.ts#L33-L39)

**Section sources**
- [user.controller.ts](file://server/src/modules/user/user.controller.ts#L9-L51)
- [user.service.ts](file://server/src/modules/user/user.service.ts#L43-L89)
- [user.repo.ts](file://server/src/modules/user/user.repo.ts#L6-L66)
- [user.dto.ts](file://server/src/modules/user/user.dto.ts#L1-L17)
- [user.schema.ts](file://server/src/modules/user/user.schema.ts#L33-L39)

### User Suspension Workflows
- Suspension creation:
  - Admin sets suspension end date and reason; backend validates future date and non-empty reason.
- Removal of suspension:
  - Admin removes suspension; backend clears suspension data.
- Active suspension detection:
  - Frontend determines if a suspension is currently active based on end date.

```mermaid
flowchart TD
A["Admin opens suspension dialog"] --> B["Enter days and reason"]
B --> C["Validate inputs"]
C --> D{"Valid?"}
D --> |No| E["Show error toast"]
D --> |Yes| F["Call PUT /:userId/moderation-state"]
F --> G["Service suspendUser(userId, {ends, reason})"]
G --> H["Persist suspension"]
H --> I["Update UI state and show success"]
```

**Diagram sources**
- [UserTable.tsx](file://admin/src/components/general/UserTable.tsx#L118-L144)
- [user-moderation.controller.ts](file://server/src/modules/moderation/user/user-moderation.controller.ts#L48-L71)
- [user-moderation.service.ts](file://server/src/modules/moderation/user/user-moderation.service.ts#L79-L128)

**Section sources**
- [UserTable.tsx](file://admin/src/components/general/UserTable.tsx#L48-L116)
- [user-moderation.service.ts](file://server/src/modules/moderation/user/user-moderation.service.ts#L79-L128)

### User Search Functionality
- Admin search:
  - Requires at least one of email or username; backend returns filtered users without exposing sensitive fields.
- Public search:
  - Public user search endpoint returns public profiles.

```mermaid
sequenceDiagram
participant Admin as "Admin UI"
participant Route as "GET /users/search"
participant Ctrl as "Controller"
participant Svc as "Service"
Admin->>Route : query (username or email)
Route->>Ctrl : search
Ctrl->>Svc : getUsersByQuery(filters)
Svc-->>Ctrl : { users : [{id, username, isBlocked, suspension, college}] }
Ctrl-->>Route : ok
Route-->>Admin : users
```

**Diagram sources**
- [UserPage.tsx](file://admin/src/pages/UserPage.tsx#L73-L111)
- [user-moderation.controller.ts](file://server/src/modules/moderation/user/user-moderation.controller.ts#L41-L46)
- [user-moderation.service.ts](file://server/src/modules/moderation/user/user-moderation.service.ts#L142-L162)

**Section sources**
- [UserPage.tsx](file://admin/src/pages/UserPage.tsx#L73-L111)
- [user-moderation.controller.ts](file://server/src/modules/moderation/user/user-moderation.controller.ts#L41-L46)
- [user-moderation.service.ts](file://server/src/modules/moderation/user/user-moderation.service.ts#L142-L162)

### Role Management and Permission Administration
- Route protection:
  - Admin/moderator endpoints require authentication and role checks ("admin", "superadmin").
- User roles:
  - User retrieval includes roles in the returned payload.

```mermaid
flowchart TD
R["Route"] --> A["authenticate"]
A --> B["requireAuth"]
B --> C["requireRole('admin'|'superadmin')"]
C --> D["Handler"]
```

**Diagram sources**
- [user-moderation.route.ts](file://server/src/modules/moderation/user/user-moderation.route.ts#L7-L9)

**Section sources**
- [user-moderation.route.ts](file://server/src/modules/moderation/user/user-moderation.route.ts#L7-L9)
- [user-moderation.service.ts](file://server/src/modules/moderation/user/user-moderation.service.ts#L164-L183)

### User Activity Monitoring
- Suspension status:
  - Admin can fetch current suspension status for a user.
- Audit logging:
  - User actions are recorded via audit logging utilities.

```mermaid
sequenceDiagram
participant Admin as "Admin UI"
participant Route as "GET / : userId/suspension"
participant Ctrl as "Controller"
participant Svc as "Service"
Admin->>Route : GET
Route->>Ctrl : getSuspension
Ctrl->>Svc : getSuspensionStatus(userId)
Svc-->>Ctrl : { suspension }
Ctrl-->>Route : ok
Route-->>Admin : suspension info
```

**Diagram sources**
- [user-moderation.controller.ts](file://server/src/modules/moderation/user/user-moderation.controller.ts#L73-L78)
- [user-moderation.service.ts](file://server/src/modules/moderation/user/user-moderation.service.ts#L130-L140)

**Section sources**
- [user-moderation.controller.ts](file://server/src/modules/moderation/user/user-moderation.controller.ts#L73-L78)
- [user-moderation.service.ts](file://server/src/modules/moderation/user/user-moderation.service.ts#L130-L140)

## Dependency Analysis
- Frontend-to-backend:
  - UserPage depends on HTTP client to call admin endpoints.
  - UserTable depends on HTTP client and dialogs to trigger moderation actions.
- Backend:
  - Routes depend on controller methods.
  - Controllers depend on service methods.
  - Services depend on repositories/adapters and schemas for validation.
- Types:
  - Admin frontend uses a User type aligned with backend DTOs.

```mermaid
graph LR
UT["UserTable.tsx"] --> API["user-moderation.route.ts"]
UP["UserPage.tsx"] --> API
API --> CTRL["user-moderation.controller.ts"]
CTRL --> SVC["user-moderation.service.ts"]
SVC --> SCHEMA["user-moderation.schema.ts"]
UP --> UC["user.controller.ts"]
UC --> USVC["user.service.ts"]
USVC --> UREPO["user.repo.ts"]
USVC --> USchema["user.schema.ts"]
USVC --> UD["user.dto.ts"]
```

**Diagram sources**
- [UserTable.tsx](file://admin/src/components/general/UserTable.tsx#L1-L14)
- [UserPage.tsx](file://admin/src/pages/UserPage.tsx#L7-L8)
- [user-moderation.route.ts](file://server/src/modules/moderation/user/user-moderation.route.ts#L1-L19)
- [user-moderation.controller.ts](file://server/src/modules/moderation/user/user-moderation.controller.ts#L1-L79)
- [user-moderation.service.ts](file://server/src/modules/moderation/user/user-moderation.service.ts#L1-L187)
- [user-moderation.schema.ts](file://server/src/modules/moderation/user/user-moderation.schema.ts#L1-L30)
- [user.controller.ts](file://server/src/modules/user/user.controller.ts#L1-L72)
- [user.service.ts](file://server/src/modules/user/user.service.ts#L1-L137)
- [user.repo.ts](file://server/src/modules/user/user.repo.ts#L1-L67)
- [user.schema.ts](file://server/src/modules/user/user.schema.ts#L1-L40)
- [user.dto.ts](file://server/src/modules/user/user.dto.ts#L1-L17)

**Section sources**
- [UserTable.tsx](file://admin/src/components/general/UserTable.tsx#L1-L14)
- [UserPage.tsx](file://admin/src/pages/UserPage.tsx#L7-L8)
- [user-moderation.route.ts](file://server/src/modules/moderation/user/user-moderation.route.ts#L1-L19)
- [user-moderation.controller.ts](file://server/src/modules/moderation/user/user-moderation.controller.ts#L1-L79)
- [user-moderation.service.ts](file://server/src/modules/moderation/user/user-moderation.service.ts#L1-L187)
- [user.controller.ts](file://server/src/modules/user/user.controller.ts#L1-L72)
- [user.service.ts](file://server/src/modules/user/user.service.ts#L1-L137)
- [user.repo.ts](file://server/src/modules/user/user.repo.ts#L1-L67)

## Performance Considerations
- Pagination:
  - Use limit/offset to avoid large payloads; keep limit reasonable (as configured in frontend).
- Caching:
  - User reads leverage cached adapters; invalidation occurs on updates to minimize stale data.
- Network efficiency:
  - Prefer search with at least one filter to reduce result sets.
  - Batch moderation actions where possible (bulk operations are not implemented; apply actions individually).

## Troubleshooting Guide
- Common errors:
  - Bad request: invalid suspension end date or missing inputs.
  - Not found: user not found for block/unblock/suspend/get.
  - Role errors: unauthorized access if missing admin/superadmin role.
- Frontend tips:
  - Verify active action busy state to prevent concurrent actions.
  - Ensure suspension reason and days are valid before submitting.
  - Use reset filters to return to default list view.

**Section sources**
- [user-moderation.service.ts](file://server/src/modules/moderation/user/user-moderation.service.ts#L98-L105)
- [user-moderation.controller.ts](file://server/src/modules/moderation/user/user-moderation.controller.ts#L9-L24)
- [UserTable.tsx](file://admin/src/components/general/UserTable.tsx#L122-L144)

## Conclusion
The administrative user management system provides a robust interface for overseeing users, performing moderation actions, and inspecting user data. It integrates secure admin endpoints with a responsive frontend, enabling efficient user oversight, profile management, and activity monitoring while enforcing role-based permissions and input validation.

## Appendices

### Data Model: User Type
```mermaid
erDiagram
USER {
string id PK
string username
string branch
string_or_College college
boolean isBlocked
date suspension_ends
string suspension_reason
int suspension_howManyTimes
datetime createdAt
}
```

**Diagram sources**
- [User.ts](file://admin/src/types/User.ts#L3-L15)

**Section sources**
- [User.ts](file://admin/src/types/User.ts#L1-L16)

### API Definitions
- List users (admin):
  - Method: GET
  - Path: /users
  - Query: query, limit, offset
  - Response: users array with id, username, isBlocked, suspension, college
- Search users (admin):
  - Method: GET
  - Path: /users/search
  - Query: username (optional), email (optional)
  - Response: users array with id, username, isBlocked, suspension, college
- Upsert moderation state:
  - Method: PUT
  - Path: /:userId/moderation-state
  - Body: blocked (boolean), suspension (optional: { ends (ISO), reason })
  - Response: { userId, blocked, suspension }
- Get suspension status:
  - Method: GET
  - Path: /:userId/suspension
  - Response: { suspension }

**Section sources**
- [user-moderation.route.ts](file://server/src/modules/moderation/user/user-moderation.route.ts#L11-L17)
- [user-moderation.controller.ts](file://server/src/modules/moderation/user/user-moderation.controller.ts#L28-L78)
- [user-moderation.schema.ts](file://server/src/modules/moderation/user/user-moderation.schema.ts#L12-L29)