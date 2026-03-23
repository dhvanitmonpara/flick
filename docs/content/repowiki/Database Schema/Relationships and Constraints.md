# Relationships and Constraints

<cite>
**Referenced Files in This Document**
- [drizzle.config.ts](file://server/drizzle.config.ts)
- [auth.table.ts](file://server/src/infra/db/tables/auth.table.ts)
- [post.table.ts](file://server/src/infra/db/tables/post.table.ts)
- [comment.table.ts](file://server/src/infra/db/tables/comment.table.ts)
- [vote.table.ts](file://server/src/infra/db/tables/vote.table.ts)
- [college.table.ts](file://server/src/infra/db/tables/college.table.ts)
- [feedback.table.ts](file://server/src/infra/db/tables/feedback.table.ts)
- [notification.table.ts](file://server/src/infra/db/tables/notification.table.ts)
- [content-report.table.ts](file://server/src/infra/db/tables/content-report.table.ts)
- [user-block.table.ts](file://server/src/infra/db/tables/user-block.table.ts)
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

## Introduction
This document explains the database relationships, foreign key constraints, referential integrity rules, and validation constraints across Flick’s entities. It details parent-child relationships, many-to-many associations, cascade behaviors, enum definitions, indexing strategies, and query optimization patterns. It also covers constraint violation scenarios and approaches to maintain data consistency.

## Project Structure
The database schema is defined using Drizzle ORM with PostgreSQL dialect. The schema is split into individual table definitions under a dedicated folder and configured via a central configuration file.

```mermaid
graph TB
cfg["Drizzle Config<br/>server/drizzle.config.ts"] --> tbls["Tables Folder<br/>server/src/infra/db/tables/*"]
tbls --> auth["auth.table.ts"]
tbls --> post["post.table.ts"]
tbls --> comment["comment.table.ts"]
tbls --> vote["vote.table.ts"]
tbls --> college["college.table.ts"]
tbls --> feedback["feedback.table.ts"]
tbls --> notification["notification.table.ts"]
tbls --> content_report["content-report.table.ts"]
tbls --> user_block["user-block.table.ts"]
```

**Diagram sources**
- [drizzle.config.ts](file://server/drizzle.config.ts#L1-L14)
- [auth.table.ts](file://server/src/infra/db/tables/auth.table.ts#L1-L187)
- [post.table.ts](file://server/src/infra/db/tables/post.table.ts#L1-L39)
- [comment.table.ts](file://server/src/infra/db/tables/comment.table.ts#L1-L22)
- [vote.table.ts](file://server/src/infra/db/tables/vote.table.ts#L1-L33)
- [college.table.ts](file://server/src/infra/db/tables/college.table.ts#L1-L24)
- [feedback.table.ts](file://server/src/infra/db/tables/feedback.table.ts#L1-L26)
- [notification.table.ts](file://server/src/infra/db/tables/notification.table.ts#L1-L30)
- [content-report.table.ts](file://server/src/infra/db/tables/content-report.table.ts#L1-L26)
- [user-block.table.ts](file://server/src/infra/db/tables/user-block.table.ts#L1-L40)

**Section sources**
- [drizzle.config.ts](file://server/drizzle.config.ts#L1-L14)

## Core Components
- Entities and primary keys are defined as UUIDs for most tables, except where noted.
- Foreign keys enforce referential integrity with explicit cascade behaviors.
- Unique constraints prevent duplicates for critical identifiers.
- Check constraints enforce business rules at the database level.
- Indexes optimize frequent queries by visibility, lookups, and uniqueness.

Key constraints and behaviors:
- Cascade deletes on user deletion propagate to related records (sessions, accounts, two-factor records, posts, comments, votes, content reports).
- Set null on parent deletion for hierarchical comments.
- Unique indexes on composite keys for votes and user blocks.
- Partial constraints ensuring consistent user status and branch assignment.

**Section sources**
- [auth.table.ts](file://server/src/infra/db/tables/auth.table.ts#L14-L187)
- [post.table.ts](file://server/src/infra/db/tables/post.table.ts#L13-L39)
- [comment.table.ts](file://server/src/infra/db/tables/comment.table.ts#L5-L22)
- [vote.table.ts](file://server/src/infra/db/tables/vote.table.ts#L6-L33)
- [college.table.ts](file://server/src/infra/db/tables/college.table.ts#L3-L24)
- [feedback.table.ts](file://server/src/infra/db/tables/feedback.table.ts#L4-L26)
- [notification.table.ts](file://server/src/infra/db/tables/notification.table.ts#L12-L30)
- [content-report.table.ts](file://server/src/infra/db/tables/content-report.table.ts#L7-L26)
- [user-block.table.ts](file://server/src/infra/db/tables/user-block.table.ts#L11-L40)

## Architecture Overview
The schema centers around an authentication and user model, with posts, comments, votes, feedback, notifications, content reports, and colleges. Relationships are primarily parent-child with a few many-to-one and many-to-many-like constructs enforced by unique constraints.

```mermaid
erDiagram
AUTH {
text id PK
text name
text email UK
boolean email_verified
timestamp created_at
timestamp updated_at
boolean two_factor_enabled
text role
text image
boolean banned
text ban_reason
timestamp ban_expires
}
PLATFORM_USER {
uuid id PK
uuid auth_id UK
text username UK
uuid college_id FK
text branch
integer karma
boolean is_accepted_terms
text status
timestamp created_at
timestamp updated_at
}
SESSION {
text id PK
timestamp expires_at
text token UK
text ip_address
text user_agent
text user_id FK
text impersonated_by
timestamp created_at
timestamp updated_at
}
ACCOUNT {
text id PK
text account_id
text provider_id
text user_id FK
text access_token
text refresh_token
text id_token
timestamp access_token_expires_at
timestamp refresh_token_expires_at
text scope
text password
timestamp created_at
timestamp updated_at
}
TWO_FACTOR {
text id PK
text secret
text backup_codes
text user_id FK
timestamp created_at
timestamp updated_at
}
COLLEGES {
uuid id PK
text name
text emailDomain
text city
text state
text profile
timestamp created_at
timestamp updated_at
}
POSTS {
uuid id PK
text title
text content
uuid postedBy FK
text topic
boolean isPrivate
boolean isBanned
boolean isShadowBanned
integer views
timestamp createdAt
timestamp updatedAt
}
COMMENTS {
uuid id PK
text content
uuid postId FK
uuid commentedBy FK
boolean isBanned
uuid parentCommentId FK
timestamp createdAt
timestamp updatedAt
}
VOTES {
uuid id PK
uuid user_id FK
text target_type
uuid target_id
text vote_type
}
FEEDBACKS {
uuid id PK
uuid user_id FK
text type
text title
text content
text status
timestamp created_at
timestamp updated_at
}
NOTIFICATIONS {
uuid id PK
boolean seen
uuid postId FK
text receiverId
jsonb actorUsernames
text content
text type
timestamp createdAt
timestamp updatedAt
}
CONTENT_REPORTS {
uuid id PK
text type
uuid post_id FK
uuid comment_id FK
uuid reported_by FK
text reason
text status
text message
timestamp created_at
timestamp updated_at
}
USER_BLOCKS {
uuid id PK
text blocker_id FK
text blocked_id FK
timestamp created_at
}
AUTH ||--o| PLATFORM_USER : "auth.id = platformUser.auth_id"
COLLEGES ||--o{ PLATFORM_USER : "colleges.id = platformUser.college_id"
AUTH ||--o{ SESSION : "auth.id = session.user_id"
AUTH ||--o{ ACCOUNT : "auth.id = account.user_id"
AUTH ||--o{ TWO_FACTOR : "auth.id = two_factor.user_id"
PLATFORM_USER ||--o{ POSTS : "platformUser.id = posts.postedBy"
POSTS ||--o{ COMMENTS : "posts.id = comments.postId"
PLATFORM_USER ||--o{ COMMENTS : "platformUser.id = comments.commentedBy"
PLATFORM_USER ||--o{ VOTES : "platformUser.id = votes.user_id"
POSTS ||--o{ CONTENT_REPORTS : "posts.id = content_reports.post_id"
COMMENTS ||--o{ CONTENT_REPORTS : "comments.id = content_reports.comment_id"
PLATFORM_USER ||--o{ CONTENT_REPORTS : "platformUser.id = content_reports.reported_by"
AUTH ||--o{ USER_BLOCKS : "auth.id = user_blocks.blocker_id"
AUTH ||--o{ USER_BLOCKS : "auth.id = user_blocks.blocked_id"
POSTS ||--o{ NOTIFICATIONS : "posts.id = notifications.postId"
```

**Diagram sources**
- [auth.table.ts](file://server/src/infra/db/tables/auth.table.ts#L14-L187)
- [post.table.ts](file://server/src/infra/db/tables/post.table.ts#L13-L39)
- [comment.table.ts](file://server/src/infra/db/tables/comment.table.ts#L5-L22)
- [vote.table.ts](file://server/src/infra/db/tables/vote.table.ts#L6-L33)
- [college.table.ts](file://server/src/infra/db/tables/college.table.ts#L3-L24)
- [feedback.table.ts](file://server/src/infra/db/tables/feedback.table.ts#L4-L26)
- [notification.table.ts](file://server/src/infra/db/tables/notification.table.ts#L12-L30)
- [content-report.table.ts](file://server/src/infra/db/tables/content-report.table.ts#L7-L26)
- [user-block.table.ts](file://server/src/infra/db/tables/user-block.table.ts#L11-L40)

## Detailed Component Analysis

### Authentication and User Model
- Primary identity is stored in the AUTH table with unique email and timestamps.
- PLATFORM_USER links to AUTH via a unique foreign key, ensuring one user per auth record.
- Unique username and unique authId constraints enforce identity integrity.
- CASCADE DELETE from AUTH to SESSION, ACCOUNT, and TWO_FACTOR ensures cleanup on user removal.
- PLATFORM_USER references COLLEGES with CASCADE DELETE to keep college membership consistent.
- CHECK constraint enforces that branch is null only when status equals ONBOARDING; otherwise branch must be present.

```mermaid
flowchart TD
Start(["Platform User Insert"]) --> CheckStatus["Check Status Value"]
CheckStatus --> IsOnboarding{"Status == 'ONBOARDING'?"}
IsOnboarding --> |Yes| BranchNull["Branch must be NULL"]
IsOnboarding --> |No| BranchNotNull["Branch must NOT be NULL"]
BranchNull --> Pass["Constraint OK"]
BranchNotNull --> Pass
Pass --> End(["Persist Record"])
```

**Diagram sources**
- [auth.table.ts](file://server/src/infra/db/tables/auth.table.ts#L61-L67)

**Section sources**
- [auth.table.ts](file://server/src/infra/db/tables/auth.table.ts#L14-L187)

### Posts
- Posts belong to a single user (postedBy) with CASCADE DELETE to remove dependent comments and votes.
- Topic is an enum; visibility flags support shadow/banning policies.
- Visibility index accelerates queries filtering by ban/shadow ban and creation time.

```mermaid
sequenceDiagram
participant U as "PlatformUser"
participant P as "Posts"
participant C as "Comments"
participant V as "Votes"
U->>P : Create Post
P-->>U : Post Created
Note over P,C : On Post Delete -> Cascade Delete Comments
Note over P,V : On Post Delete -> Cascade Delete Votes
```

**Diagram sources**
- [post.table.ts](file://server/src/infra/db/tables/post.table.ts#L19-L21)
- [comment.table.ts](file://server/src/infra/db/tables/comment.table.ts#L10)
- [vote.table.ts](file://server/src/infra/db/tables/vote.table.ts#L13)

**Section sources**
- [post.table.ts](file://server/src/infra/db/tables/post.table.ts#L13-L39)

### Comments
- Comments belong to a post and a user; both foreign keys use CASCADE DELETE.
- Hierarchical comments supported via parentCommentId with SET NULL on parent delete.
- isBanned flag supports moderation.

```mermaid
sequenceDiagram
participant U as "PlatformUser"
participant P as "Posts"
participant C as "Comments"
participant PC as "Parent Comment"
U->>C : Create Comment
C->>P : Link to Post
C->>U : Link to Author
Note over C,PC : Parent Comment Deleted -> Set parentCommentId to NULL
```

**Diagram sources**
- [comment.table.ts](file://server/src/infra/db/tables/comment.table.ts#L8-L17)

**Section sources**
- [comment.table.ts](file://server/src/infra/db/tables/comment.table.ts#L5-L22)

### Votes
- Many-to-one relationship per target type and target ID.
- Composite unique index prevents duplicate votes per user per target.
- Target lookup index optimizes queries by target type and target ID.

```mermaid
flowchart TD
A["Vote Insert"] --> B["Lookup (user_id, target_type, target_id)"]
B --> Exists{"Exists?"}
Exists --> |Yes| E["Reject Duplicate"]
Exists --> |No| C["Insert New Vote"]
C --> D["Update Target Metrics"]
E --> F["End"]
D --> F
```

**Diagram sources**
- [vote.table.ts](file://server/src/infra/db/tables/vote.table.ts#L21-L28)

**Section sources**
- [vote.table.ts](file://server/src/infra/db/tables/vote.table.ts#L6-L33)

### Colleges
- Unique indexes on name, email domain, and city/state improve search performance.
- Profile defaults to a CDN URL for consistency.

**Section sources**
- [college.table.ts](file://server/src/infra/db/tables/college.table.ts#L3-L24)

### Feedback
- Optional user association allows anonymous feedback submission.
- userId uses SET NULL on user deletion to preserve feedback records.

**Section sources**
- [feedback.table.ts](file://server/src/infra/db/tables/feedback.table.ts#L4-L26)

### Notifications
- ReceiverId is not constrained to a specific type; JSON array stores actor usernames.
- Optional postId link to posts; nullable to support general notifications.

**Section sources**
- [notification.table.ts](file://server/src/infra/db/tables/notification.table.ts#L12-L30)

### Content Reports
- Supports reporting either posts or comments via separate foreign keys.
- CASCADE DELETE ensures reports are removed when target content is deleted.
- Composite unique index on reporter and target avoids duplicate reports.

```mermaid
sequenceDiagram
participant R as "Reporter (PlatformUser)"
participant P as "Post"
participant C as "Comment"
participant CR as "ContentReports"
R->>CR : Report Content
alt Reporting Post
CR->>P : Link to Post
P-->>CR : Cascade Delete
else Reporting Comment
CR->>C : Link to Comment
C-->>CR : Cascade Delete
end
```

**Diagram sources**
- [content-report.table.ts](file://server/src/infra/db/tables/content-report.table.ts#L10-L16)

**Section sources**
- [content-report.table.ts](file://server/src/infra/db/tables/content-report.table.ts#L7-L26)

### User Blocks
- Self-referencing user blocks enforced by two foreign keys to AUTH.
- Composite unique index prevents duplicate block entries.

**Section sources**
- [user-block.table.ts](file://server/src/infra/db/tables/user-block.table.ts#L11-L40)

## Dependency Analysis
- Drizzle configuration defines the schema location and PostgreSQL dialect.
- Table definitions import enums and other tables to establish relationships.
- Relations are declared via Drizzle’s relations helper to mirror foreign keys and enable typed joins.

```mermaid
graph LR
cfg["drizzle.config.ts"] --> schema["Schema Files (*.ts)"]
schema --> auth["auth.table.ts"]
schema --> post["post.table.ts"]
schema --> comment["comment.table.ts"]
schema --> vote["vote.table.ts"]
schema --> college["college.table.ts"]
schema --> feedback["feedback.table.ts"]
schema --> notification["notification.table.ts"]
schema --> content_report["content-report.table.ts"]
schema --> user_block["user-block.table.ts"]
```

**Diagram sources**
- [drizzle.config.ts](file://server/drizzle.config.ts#L1-L14)
- [auth.table.ts](file://server/src/infra/db/tables/auth.table.ts#L1-L187)
- [post.table.ts](file://server/src/infra/db/tables/post.table.ts#L1-L39)
- [comment.table.ts](file://server/src/infra/db/tables/comment.table.ts#L1-L22)
- [vote.table.ts](file://server/src/infra/db/tables/vote.table.ts#L1-L33)
- [college.table.ts](file://server/src/infra/db/tables/college.table.ts#L1-L24)
- [feedback.table.ts](file://server/src/infra/db/tables/feedback.table.ts#L1-L26)
- [notification.table.ts](file://server/src/infra/db/tables/notification.table.ts#L1-L30)
- [content-report.table.ts](file://server/src/infra/db/tables/content-report.table.ts#L1-L26)
- [user-block.table.ts](file://server/src/infra/db/tables/user-block.table.ts#L1-L40)

**Section sources**
- [drizzle.config.ts](file://server/drizzle.config.ts#L1-L14)

## Performance Considerations
- Visibility index on posts accelerates filtered retrieval by ban/shadow ban and creation time.
- Session/account/two-factor indices on user_id improve auth-related lookups.
- Two-factor indices on secret and user_id support secure retrieval and uniqueness checks.
- Composite unique index on votes prevents duplicates and speeds up conflict detection.
- Composite unique index on user blocks prevents duplicate blocking pairs.
- Multi-column indexes on colleges (name, email domain, city/state) optimize search and filtering.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
Common constraint violations and resolutions:
- Duplicate vote per user per target: The unique index prevents inserting a second vote for the same user-target combination. Resolve by updating the existing vote or removing it before re-inserting.
- Blocked user attempting to create content: If a user is blocked, ensure the block relationship is enforced at application level to prevent writes; database constraints alone rely on foreign keys.
- Deleting a post removes comments and votes: If dependent records must persist, adjust cascade behavior or soft-delete strategy at the application layer.
- Deleting a user cascades to sessions/accounts/two-factor: If audit trails require preservation, implement soft-delete or archival before hard deletion.
- Status and branch consistency: If a user’s status is not ONBOARDING, branch must be set; otherwise insertion/update will fail the check constraint.

**Section sources**
- [vote.table.ts](file://server/src/infra/db/tables/vote.table.ts#L21-L28)
- [user-block.table.ts](file://server/src/infra/db/tables/user-block.table.ts#L23-L25)
- [auth.table.ts](file://server/src/infra/db/tables/auth.table.ts#L61-L67)

## Conclusion
Flick’s schema enforces strong referential integrity with targeted cascade behaviors, unique constraints, and check constraints. Indexes are strategically placed to support common queries. Adhering to these constraints and leveraging the documented cascade rules helps maintain data consistency and enables efficient query patterns.