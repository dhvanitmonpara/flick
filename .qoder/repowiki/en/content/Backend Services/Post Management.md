# Post Management

<cite>
**Referenced Files in This Document**
- [post.controller.ts](file://server/src/modules/post/post.controller.ts)
- [post.service.ts](file://server/src/modules/post/post.service.ts)
- [post.repo.ts](file://server/src/modules/post/post.repo.ts)
- [post.schema.ts](file://server/src/modules/post/post.schema.ts)
- [post.cache-keys.ts](file://server/src/modules/post/post.cache-keys.ts)
- [post.adapter.ts](file://server/src/infra/db/adapters/post.adapter.ts)
- [post.table.ts](file://server/src/infra/db/tables/post.table.ts)
- [index.ts](file://server/src/routes/index.ts)
- [post.ts](file://web/src/services/api/post.ts)
- [record-audit.ts](file://server/src/lib/record-audit.ts)
- [audit-log.adapter.ts](file://server/src/infra/db/adapters/audit-log.adapter.ts)
- [audit-log.table.ts](file://server/src/infra/db/tables/audit-log.table.ts)
- [audit.types.ts](file://server/src/modules/audit/audit.types.ts)
- [transactions.ts](file://server/src/infra/db/transactions.ts)
- [content-report.service.ts](file://server/src/modules/content-report/content-report.service.ts)
- [content-report.schema.ts](file://server/src/modules/content-report/content-report.schema.ts)
- [ReportPost.tsx](file://admin/src/components/general/ReportPost.tsx)
- [ReportedPost.tsx](file://admin/src/types/ReportedPost.tsx)
- [ReportStore.ts](file://admin/src/store/ReportStore.ts)
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
This document describes the Post Management service for the Flick platform. It covers the complete post lifecycle (creation, retrieval, updating, deletion), anonymous and authenticated access controls, topic categorization, content validation, caching via cache keys, pagination and sorting, branch-based filtering, visibility controls, repository pattern, transaction handling, audit logging, and moderation integration. It also provides examples of CRUD operations and discusses performance considerations for large-scale content management.

## Project Structure
The Post Management feature spans the backend server and the frontend web application:
- Backend: Express controllers, services, repositories, database adapters, cache key generators, and route registration.
- Frontend: API client module exposing typed post endpoints.
- Moderation/Admin: Reporting and administrative actions for content safety.

```mermaid
graph TB
subgraph "Web Frontend"
W_API["post.ts<br/>API client"]
end
subgraph "Server"
R_Index["routes/index.ts<br/>Route registration"]
C_Post["post.controller.ts<br/>HTTP handlers"]
S_Post["post.service.ts<br/>Business logic"]
Repo["post.repo.ts<br/>Repository pattern"]
CK["post.cache-keys.ts<br/>Cache keys"]
AD["post.adapter.ts<br/>DB adapter"]
TBL["post.table.ts<br/>Schema"]
TRX["transactions.ts<br/>Transactions"]
AUD["record-audit.ts<br/>Audit logging"]
AL_AD["audit-log.adapter.ts<br/>Audit persistence"]
AL_TBL["audit-log.table.ts<br/>Audit schema"]
end
subgraph "Moderation/Admin"
CR_SVC["content-report.service.ts<br/>Reporting service"]
CR_SC["content-report.schema.ts<br/>Reporting schemas"]
RP_UI["ReportPost.tsx<br/>Admin actions"]
RP_TYPES["ReportedPost.tsx<br/>Types"]
RP_STORE["ReportStore.ts<br/>UI store"]
end
W_API --> R_Index
R_Index --> C_Post
C_Post --> S_Post
S_Post --> Repo
Repo --> CK
Repo --> AD
AD --> TBL
S_Post --> TRX
S_Post --> AUD
AUD --> AL_AD
AL_AD --> AL_TBL
CR_SVC --> CR_SC
RP_UI --> CR_SVC
RP_TYPES --> RP_UI
RP_STORE --> RP_UI
```

**Diagram sources**
- [post.controller.ts](file://server/src/modules/post/post.controller.ts#L1-L135)
- [post.service.ts](file://server/src/modules/post/post.service.ts#L1-L272)
- [post.repo.ts](file://server/src/modules/post/post.repo.ts#L1-L97)
- [post.cache-keys.ts](file://server/src/modules/post/post.cache-keys.ts#L1-L33)
- [post.adapter.ts](file://server/src/infra/db/adapters/post.adapter.ts#L1-L428)
- [post.table.ts](file://server/src/infra/db/tables/post.table.ts)
- [index.ts](file://server/src/routes/index.ts#L1-L33)
- [post.ts](file://web/src/services/api/post.ts#L1-L48)
- [record-audit.ts](file://server/src/lib/record-audit.ts#L1-L20)
- [audit-log.adapter.ts](file://server/src/infra/db/adapters/audit-log.adapter.ts#L1-L8)
- [audit-log.table.ts](file://server/src/infra/db/tables/audit-log.table.ts#L49-L73)
- [transactions.ts](file://server/src/infra/db/transactions.ts#L1-L20)
- [content-report.service.ts](file://server/src/modules/content-report/content-report.service.ts#L1-L159)
- [content-report.schema.ts](file://server/src/modules/content-report/content-report.schema.ts#L1-L47)
- [ReportPost.tsx](file://admin/src/components/general/ReportPost.tsx#L1-L98)
- [ReportedPost.tsx](file://admin/src/types/ReportedPost.tsx#L1-L28)
- [ReportStore.ts](file://admin/src/store/ReportStore.ts#L1-L42)

**Section sources**
- [index.ts](file://server/src/routes/index.ts#L17-L28)
- [post.controller.ts](file://server/src/modules/post/post.controller.ts#L1-L135)
- [post.service.ts](file://server/src/modules/post/post.service.ts#L1-L272)
- [post.repo.ts](file://server/src/modules/post/post.repo.ts#L1-L97)
- [post.cache-keys.ts](file://server/src/modules/post/post.cache-keys.ts#L1-L33)
- [post.adapter.ts](file://server/src/infra/db/adapters/post.adapter.ts#L1-L428)
- [post.table.ts](file://server/src/infra/db/tables/post.table.ts)
- [post.ts](file://web/src/services/api/post.ts#L1-L48)
- [record-audit.ts](file://server/src/lib/record-audit.ts#L1-L20)
- [audit-log.adapter.ts](file://server/src/infra/db/adapters/audit-log.adapter.ts#L1-L8)
- [audit-log.table.ts](file://server/src/infra/db/tables/audit-log.table.ts#L49-L73)
- [transactions.ts](file://server/src/infra/db/transactions.ts#L1-L20)
- [content-report.service.ts](file://server/src/modules/content-report/content-report.service.ts#L1-L159)
- [content-report.schema.ts](file://server/src/modules/content-report/content-report.schema.ts#L1-L47)
- [ReportPost.tsx](file://admin/src/components/general/ReportPost.tsx#L1-L98)
- [ReportedPost.tsx](file://admin/src/types/ReportedPost.tsx#L1-L28)
- [ReportStore.ts](file://admin/src/store/ReportStore.ts#L1-L42)

## Core Components
- Controller: Parses requests, validates inputs, orchestrates service calls, and returns standardized HTTP responses.
- Service: Implements business logic, enforces authorization, performs data transformations, and records audit events.
- Repository: Encapsulates read/write operations and integrates caching via cache keys.
- Adapter: Maps to database queries using Drizzle ORM with CTEs for engagement metrics and joins for author/college details.
- Cache Keys: Generates deterministic cache keys for single post, lists, counts, and versions to enable cache invalidation and hit rates.
- Routes: Exposes endpoints under /api/v1/posts.
- Web API Client: Provides typed methods for CRUD and trending retrieval.
- Moderation Integration: Reporting service and admin UI for banning/shadow-banning posts and users.

**Section sources**
- [post.controller.ts](file://server/src/modules/post/post.controller.ts#L1-L135)
- [post.service.ts](file://server/src/modules/post/post.service.ts#L1-L272)
- [post.repo.ts](file://server/src/modules/post/post.repo.ts#L1-L97)
- [post.adapter.ts](file://server/src/infra/db/adapters/post.adapter.ts#L1-L428)
- [post.cache-keys.ts](file://server/src/modules/post/post.cache-keys.ts#L1-L33)
- [index.ts](file://server/src/routes/index.ts#L17-L28)
- [post.ts](file://web/src/services/api/post.ts#L1-L48)
- [content-report.service.ts](file://server/src/modules/content-report/content-report.service.ts#L1-L159)

## Architecture Overview
The Post Management service follows a layered architecture:
- Presentation: HTTP endpoints handled by controllers.
- Application: Services encapsulate domain logic and orchestrate repositories and external integrations.
- Persistence: Repository delegates to adapters backed by Drizzle ORM and a relational schema.
- Caching: Cache keys are generated per query signature and versioned to invalidate stale data.
- Observability: Audit logs capture post lifecycle events with contextual metadata.

```mermaid
sequenceDiagram
participant Client as "Web Client"
participant Route as "Express Router"
participant Ctrl as "PostController"
participant Svc as "PostService"
participant Repo as "PostRepo"
participant Cache as "Cache Keys"
participant DB as "DB Adapter"
Client->>Route : "GET /posts?page&limit&sortBy&sortOrder&topic&collegeId&branch"
Route->>Ctrl : "Dispatch request"
Ctrl->>Svc : "getPosts({page, limit, sortBy, sortOrder, topic, collegeId, branch, userId, userCollegeId})"
Svc->>Repo : "CachedRead.findMany(options)"
Repo->>Cache : "Generate cache key"
alt "Cache hit"
Cache-->>Repo : "Cached posts"
else "Cache miss"
Repo->>DB : "findMany(options)"
DB-->>Repo : "Posts with metrics"
Repo->>Cache : "Store with key"
end
Repo-->>Svc : "Posts + meta"
Svc-->>Ctrl : "Paginated result"
Ctrl-->>Client : "200 OK {posts, meta}"
```

**Diagram sources**
- [post.controller.ts](file://server/src/modules/post/post.controller.ts#L23-L53)
- [post.service.ts](file://server/src/modules/post/post.service.ts#L79-L132)
- [post.repo.ts](file://server/src/modules/post/post.repo.ts#L17-L45)
- [post.cache-keys.ts](file://server/src/modules/post/post.cache-keys.ts#L14-L27)
- [post.adapter.ts](file://server/src/infra/db/adapters/post.adapter.ts#L157-L332)

## Detailed Component Analysis

### Post Lifecycle: Creation, Retrieval, Editing, Deletion
- Creation: Controller validates payload against schema, extracts user identity, and delegates to service. Service trims and normalizes inputs, persists via repository write, records audit, and returns enriched post details.
- Retrieval: Controller parses query parameters, passes user context, and calls service. Service fetches from cached read, applies visibility rules, and enriches with engagement metrics.
- Editing: Controller validates updates, checks ownership, and calls service. Service enforces authorization, sanitizes updates, persists changes, and records audit.
- Deletion: Controller validates ID, checks ownership, and invokes service. Service deletes via repository write and records audit.

```mermaid
sequenceDiagram
participant Client as "Web Client"
participant Ctrl as "PostController"
participant Svc as "PostService"
participant Repo as "PostRepo"
participant DB as "DB Adapter"
participant Audit as "Audit Logger"
Client->>Ctrl : "POST /posts {title, content, topic, isPrivate}"
Ctrl->>Svc : "createPost({title, content, topic, isPrivate, postedBy})"
Svc->>Repo : "Write.create()"
Repo->>DB : "INSERT posts"
DB-->>Repo : "New post"
Repo-->>Svc : "New post"
Svc->>Audit : "Record audit event"
Svc->>Repo : "Read.findByIdWithDetails()"
Repo->>DB : "JOIN users, colleges, metrics"
DB-->>Repo : "Post with details"
Repo-->>Svc : "Post with details"
Svc-->>Ctrl : "Post"
Ctrl-->>Client : "201 Created {post}"
```

**Diagram sources**
- [post.controller.ts](file://server/src/modules/post/post.controller.ts#L8-L21)
- [post.service.ts](file://server/src/modules/post/post.service.ts#L8-L45)
- [post.repo.ts](file://server/src/modules/post/post.repo.ts#L89-L94)
- [post.adapter.ts](file://server/src/infra/db/adapters/post.adapter.ts#L26-L155)
- [record-audit.ts](file://server/src/lib/record-audit.ts#L4-L17)

**Section sources**
- [post.controller.ts](file://server/src/modules/post/post.controller.ts#L8-L21)
- [post.service.ts](file://server/src/modules/post/post.service.ts#L8-L45)
- [post.repo.ts](file://server/src/modules/post/post.repo.ts#L89-L94)
- [post.adapter.ts](file://server/src/infra/db/adapters/post.adapter.ts#L26-L155)
- [record-audit.ts](file://server/src/lib/record-audit.ts#L4-L17)

### Anonymous Post Functionality and Visibility Controls
- Anonymous access: When no user is present, only public posts are visible.
- College-only posts: Requires authenticated user whose college matches the post author’s college.
- Enforcement occurs during retrieval by checking user context and applying database filters.

**Section sources**
- [post.service.ts](file://server/src/modules/post/post.service.ts#L60-L73)
- [post.adapter.ts](file://server/src/infra/db/adapters/post.adapter.ts#L232-L245)

### Topic Categorization System
- Topics are validated against a strict enumeration with support for case-insensitive matching and URL-decoded normalization.
- Filtering is applied in the adapter to restrict results to the requested topic.

**Section sources**
- [post.schema.ts](file://server/src/modules/post/post.schema.ts#L3-L15)
- [post.schema.ts](file://server/src/modules/post/post.schema.ts#L44-L69)
- [post.adapter.ts](file://server/src/infra/db/adapters/post.adapter.ts#L247-L250)

### Content Validation Mechanisms
- Zod schemas enforce minimum/maximum lengths, required fields, UUID formats, and enum constraints for topics.
- Service trims whitespace for title and content prior to persistence.

**Section sources**
- [post.schema.ts](file://server/src/modules/post/post.schema.ts#L17-L33)
- [post.service.ts](file://server/src/modules/post/post.service.ts#L21-L27)

### Caching Strategy Using Cache Keys
- Single post: Dedicated key per post ID; details key includes a version to invalidate on updates.
- List queries: Composite key encoding page, limit, sort parameters, topic, collegeId, branch, and user identifiers.
- Counts: Separate key for counts filtered similarly to list queries.
- Version keys: Global list version and per-post version enable cache invalidation without touching data.

```mermaid
flowchart TD
Start(["Cache Key Generation"]) --> Single["Single Post Key<br/>post:id:{id}"]
Start --> Details["Details Key<br/>post:details:v{version}:{id}:{userId|anonymous}"]
Start --> Many["Many Key<br/>post:many:v{listVersion}:{page}:{limit}:{sortBy}:{sortOrder}:{topic|all}:{collegeId|all}:{branch|all}:{userId|anonymous}:{userCollegeId|none}"]
Start --> Count["Count Key<br/>post:count:{topic|all}:{collegeId|all}:{branch|all}:{userCollegeId|none}"]
Start --> Versions["Versions<br/>post:version:{id}<br/>posts:list:version"]
Single --> End(["Used by repo.cached()"])
Details --> End
Many --> End
Count --> End
Versions --> End
```

**Diagram sources**
- [post.cache-keys.ts](file://server/src/modules/post/post.cache-keys.ts#L4-L31)

**Section sources**
- [post.cache-keys.ts](file://server/src/modules/post/post.cache-keys.ts#L1-L33)
- [post.repo.ts](file://server/src/modules/post/post.repo.ts#L7-L56)

### Pagination and Sorting
- Pagination: Page and limit are normalized with minimum/maximum bounds; offset calculated as (page - 1) * limit.
- Sorting: Sort by createdAt, updatedAt, or views with ascending/descending order.
- Meta: Total count, total pages, current page, limit, and hasMore flag included in response.

**Section sources**
- [post.schema.ts](file://server/src/modules/post/post.schema.ts#L40-L43)
- [post.adapter.ts](file://server/src/infra/db/adapters/post.adapter.ts#L174-L298)
- [post.service.ts](file://server/src/modules/post/post.service.ts#L108-L131)

### Branch-Based Filtering
- Filtering by branch is supported via a join with users and equality condition on branch.
- Combined with topic, collegeId, and visibility rules.

**Section sources**
- [post.adapter.ts](file://server/src/infra/db/adapters/post.adapter.ts#L256-L258)

### Post Search Functionality
- Topic search supports exact match, case-insensitive match, and URL-decoded normalization.
- Additional filters (collegeId, branch) are available via query parameters.

**Section sources**
- [post.schema.ts](file://server/src/modules/post/post.schema.ts#L44-L69)
- [post.adapter.ts](file://server/src/infra/db/adapters/post.adapter.ts#L252-L258)

### Trending Post Calculation
- Trending is computed by retrieving top posts sorted by views with a fixed limit.
- Frontend types define a simple trending model for rendering.

**Section sources**
- [post.ts](file://web/src/services/api/post.ts#L39-L47)
- [post.adapter.ts](file://server/src/infra/db/adapters/post.adapter.ts#L262-L298)

### Content Moderation Integration
- Reporting: Users can create reports for posts; service validates and records audit.
- Admin Actions: Admin UI supports banning/unbanning posts, shadow-banning, and user sanctions.
- Status Updates: Reports can be resolved or ignored; bulk deletions are supported.

```mermaid
sequenceDiagram
participant User as "Reporter"
participant Admin as "Admin UI"
participant CR_Svc as "ContentReportService"
participant Post as "PostService"
participant Audit as "Audit Logger"
User->>CR_Svc : "Create report {targetId, type, reason, message}"
CR_Svc->>Audit : "Record audit event"
Admin->>CR_Svc : "Update report status"
Admin->>Post : "Toggle ban/shadow-ban"
Post->>Audit : "Record audit event"
```

**Diagram sources**
- [content-report.service.ts](file://server/src/modules/content-report/content-report.service.ts#L9-L39)
- [content-report.schema.ts](file://server/src/modules/content-report/content-report.schema.ts#L5-L14)
- [ReportPost.tsx](file://admin/src/components/general/ReportPost.tsx#L23-L85)
- [post.service.ts](file://server/src/modules/post/post.service.ts#L35-L40)

**Section sources**
- [content-report.service.ts](file://server/src/modules/content-report/content-report.service.ts#L1-L159)
- [content-report.schema.ts](file://server/src/modules/content-report/content-report.schema.ts#L1-L47)
- [ReportPost.tsx](file://admin/src/components/general/ReportPost.tsx#L1-L98)
- [ReportedPost.tsx](file://admin/src/types/ReportedPost.tsx#L1-L28)
- [ReportStore.ts](file://admin/src/store/ReportStore.ts#L1-L42)

### Relationship Between Posts and Users
- Posts reference authors via postedBy, linking to users and colleges.
- Adapter joins provide author username, branch, and college details alongside post data.

**Section sources**
- [post.adapter.ts](file://server/src/infra/db/adapters/post.adapter.ts#L106-L154)

### Post Repository Pattern and Transaction Handling
- Repository separates CachedRead, Read, and Write concerns; CachedRead uses cache keys for performance.
- Transactions: Centralized transaction runner ensures consistent execution across operations.

**Section sources**
- [post.repo.ts](file://server/src/modules/post/post.repo.ts#L6-L95)
- [transactions.ts](file://server/src/infra/db/transactions.ts#L1-L20)

### Audit Logging for Post Operations
- Audit entries capture action, entity type, entity ID, before/after snapshots, and device metadata.
- Audit logs persisted to a dedicated table with indexes for efficient querying.

**Section sources**
- [record-audit.ts](file://server/src/lib/record-audit.ts#L4-L17)
- [audit-log.adapter.ts](file://server/src/infra/db/adapters/audit-log.adapter.ts#L5-L8)
- [audit-log.table.ts](file://server/src/infra/db/tables/audit-log.table.ts#L49-L73)
- [audit.types.ts](file://server/src/modules/audit/audit.types.ts#L7-L21)

### Examples of Post CRUD Operations
- Create: Send POST /api/v1/posts with {title, content, topic, isPrivate}.
- Retrieve: GET /api/v1/posts with optional {page, limit, sortBy, sortOrder, topic, collegeId, branch}.
- Retrieve by ID: GET /api/v1/posts/{id}.
- Update: PATCH /api/v1/posts/{id} with partial fields.
- Delete: DELETE /api/v1/posts/{id}.
- Increment Views: POST /api/v1/posts/{id}/view.
- Trending: GET /api/v1/posts?sortBy=views&sortOrder=desc&limit=5.

**Section sources**
- [post.controller.ts](file://server/src/modules/post/post.controller.ts#L8-L94)
- [post.ts](file://web/src/services/api/post.ts#L14-L47)

## Dependency Analysis
```mermaid
graph LR
Ctrl["post.controller.ts"] --> Svc["post.service.ts"]
Svc --> Repo["post.repo.ts"]
Repo --> CK["post.cache-keys.ts"]
Repo --> AD["post.adapter.ts"]
AD --> TBL["post.table.ts"]
Svc --> TRX["transactions.ts"]
Svc --> AUD["record-audit.ts"]
AUD --> AL_AD["audit-log.adapter.ts"]
AL_AD --> AL_TBL["audit-log.table.ts"]
R_Index["routes/index.ts"] --> Ctrl
W_API["post.ts"] --> R_Index
```

**Diagram sources**
- [post.controller.ts](file://server/src/modules/post/post.controller.ts#L1-L135)
- [post.service.ts](file://server/src/modules/post/post.service.ts#L1-L272)
- [post.repo.ts](file://server/src/modules/post/post.repo.ts#L1-L97)
- [post.cache-keys.ts](file://server/src/modules/post/post.cache-keys.ts#L1-L33)
- [post.adapter.ts](file://server/src/infra/db/adapters/post.adapter.ts#L1-L428)
- [post.table.ts](file://server/src/infra/db/tables/post.table.ts)
- [transactions.ts](file://server/src/infra/db/transactions.ts#L1-L20)
- [record-audit.ts](file://server/src/lib/record-audit.ts#L1-L20)
- [audit-log.adapter.ts](file://server/src/infra/db/adapters/audit-log.adapter.ts#L1-L8)
- [audit-log.table.ts](file://server/src/infra/db/tables/audit-log.table.ts#L49-L73)
- [index.ts](file://server/src/routes/index.ts#L17-L28)
- [post.ts](file://web/src/services/api/post.ts#L1-L48)

**Section sources**
- [post.controller.ts](file://server/src/modules/post/post.controller.ts#L1-L135)
- [post.service.ts](file://server/src/modules/post/post.service.ts#L1-L272)
- [post.repo.ts](file://server/src/modules/post/post.repo.ts#L1-L97)
- [post.cache-keys.ts](file://server/src/modules/post/post.cache-keys.ts#L1-L33)
- [post.adapter.ts](file://server/src/infra/db/adapters/post.adapter.ts#L1-L428)
- [post.table.ts](file://server/src/infra/db/tables/post.table.ts)
- [transactions.ts](file://server/src/infra/db/transactions.ts#L1-L20)
- [record-audit.ts](file://server/src/lib/record-audit.ts#L1-L20)
- [audit-log.adapter.ts](file://server/src/infra/db/adapters/audit-log.adapter.ts#L1-L8)
- [audit-log.table.ts](file://server/src/infra/db/tables/audit-log.table.ts#L49-L73)
- [index.ts](file://server/src/routes/index.ts#L17-L28)
- [post.ts](file://web/src/services/api/post.ts#L1-L48)

## Performance Considerations
- Caching: Use composite cache keys for list queries and version keys to invalidate efficiently. Prefer CachedRead for hot paths.
- Queries: Leverage CTEs for engagement metrics to avoid N+1 queries; ensure indexes on frequently filtered columns.
- Pagination: Cap limit to prevent oversized payloads; compute totals only when necessary.
- Sorting: Ensure appropriate indexes for sort fields (createdAt, updatedAt, views).
- Transactions: Wrap multi-step operations to maintain consistency and reduce contention.
- Audit Sampling: Use sampling to reduce audit overhead in high-throughput scenarios.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
- Unauthorized Access: Verify user context and college matching for private posts.
- Not Found Errors: Confirm post existence and cache freshness; consider clearing related cache keys.
- Validation Failures: Review Zod schemas for required fields and length constraints.
- Audit Gaps: Ensure observability context is initialized and audit buffer is flushed.

**Section sources**
- [post.service.ts](file://server/src/modules/post/post.service.ts#L50-L73)
- [post.schema.ts](file://server/src/modules/post/post.schema.ts#L17-L33)
- [record-audit.ts](file://server/src/lib/record-audit.ts#L4-L17)

## Conclusion
The Post Management service implements a robust, scalable system for content lifecycle operations with strong validation, caching, pagination, and visibility controls. It integrates seamlessly with moderation workflows and maintains comprehensive audit trails. The repository pattern and transaction handling ensure reliability, while cache keys and composite query signatures optimize performance for large-scale deployments.

[No sources needed since this section summarizes without analyzing specific files]

## Appendices

### API Endpoints Summary
- POST /api/v1/posts
- GET /api/v1/posts
- GET /api/v1/posts/{id}
- PATCH /api/v1/posts/{id}
- DELETE /api/v1/posts/{id}
- POST /api/v1/posts/{id}/view
- GET /api/v1/posts (trending)

**Section sources**
- [post.controller.ts](file://server/src/modules/post/post.controller.ts#L8-L94)
- [post.ts](file://web/src/services/api/post.ts#L14-L47)