# API Integration

<cite>
**Referenced Files in This Document**
- [web/src/services/http.ts](file://web/src/services/http.ts)
- [admin/src/services/http.ts](file://admin/src/services/http.ts)
- [web/src/services/api/post.ts](file://web/src/services/api/post.ts)
- [web/src/services/api/user.ts](file://web/src/services/api/user.ts)
- [web/src/services/api/auth.ts](file://web/src/services/api/auth.ts)
- [web/src/services/api/comment.ts](file://web/src/services/api/comment.ts)
- [web/src/services/api/bookmark.ts](file://web/src/services/api/bookmark.ts)
- [web/src/services/api/vote.ts](file://web/src/services/api/vote.ts)
- [web/src/lib/auth-client.ts](file://web/src/lib/auth-client.ts)
- [admin/src/lib/auth-client.ts](file://admin/src/lib/auth-client.ts)
- [web/src/hooks/useErrorHandler.tsx](file://web/src/hooks/useErrorHandler.tsx)
- [web/src/store/postStore.ts](file://web/src/store/postStore.ts)
- [web/src/store/commentStore.ts](file://web/src/store/commentStore.ts)
- [web/src/store/profileStore.ts](file://web/src/store/profileStore.ts)
- [admin/src/store/ReportStore.ts](file://admin/src/store/ReportStore.ts)
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
This document describes the API integration layer used by the web application. It covers HTTP client configuration, request and response handling, error management, and the API service modules for posts, users, authentication, comments, bookmarks, votes, and notifications. It also explains data fetching patterns, caching strategies, and state synchronization across the frontend. Integration with backend services, authentication headers, and error boundary implementations are documented with practical examples and diagrams.

## Project Structure
The API integration layer is organized into:
- Shared HTTP client configuration for both web and admin applications
- API service modules grouped by domain (posts, users, auth, comments, bookmarks, votes)
- Authentication client integrations
- Error handling utilities and state stores for synchronization

```mermaid
graph TB
subgraph "Web App"
W_HTTP["HTTP Client<br/>web/src/services/http.ts"]
W_POST["Post API<br/>web/src/services/api/post.ts"]
W_USER["User API<br/>web/src/services/api/user.ts"]
W_AUTH["Auth API<br/>web/src/services/api/auth.ts"]
W_COMMENT["Comment API<br/>web/src/services/api/comment.ts"]
W_BOOKMARK["Bookmark API<br/>web/src/services/api/bookmark.ts"]
W_VOTE["Vote API<br/>web/src/services/api/vote.ts"]
W_ERR["Error Handler<br/>web/src/hooks/useErrorHandler.tsx"]
W_STORE_PROFILE["Profile Store<br/>web/src/store/profileStore.ts"]
W_STORE_POST["Post Store<br/>web/src/store/postStore.ts"]
W_STORE_COMMENT["Comment Store<br/>web/src/store/commentStore.ts"]
end
subgraph "Admin App"
A_HTTP["HTTP Client<br/>admin/src/services/http.ts"]
A_REPORT["Report Store<br/>admin/src/store/ReportStore.ts"]
end
W_HTTP --> W_POST
W_HTTP --> W_USER
W_HTTP --> W_AUTH
W_HTTP --> W_COMMENT
W_HTTP --> W_BOOKMARK
W_HTTP --> W_VOTE
A_HTTP --> A_REPORT
W_ERR --> W_STORE_PROFILE
W_STORE_POST --> W_POST
W_STORE_COMMENT --> W_COMMENT
```

**Diagram sources**
- [web/src/services/http.ts](file://web/src/services/http.ts#L1-L135)
- [admin/src/services/http.ts](file://admin/src/services/http.ts#L1-L154)
- [web/src/services/api/post.ts](file://web/src/services/api/post.ts#L1-L68)
- [web/src/services/api/user.ts](file://web/src/services/api/user.ts#L1-L26)
- [web/src/services/api/auth.ts](file://web/src/services/api/auth.ts#L1-L156)
- [web/src/services/api/comment.ts](file://web/src/services/api/comment.ts#L1-L24)
- [web/src/services/api/bookmark.ts](file://web/src/services/api/bookmark.ts#L1-L14)
- [web/src/services/api/vote.ts](file://web/src/services/api/vote.ts#L1-L27)
- [web/src/hooks/useErrorHandler.tsx](file://web/src/hooks/useErrorHandler.tsx#L1-L170)
- [web/src/store/postStore.ts](file://web/src/store/postStore.ts#L1-L30)
- [web/src/store/commentStore.ts](file://web/src/store/commentStore.ts#L1-L34)
- [web/src/store/profileStore.ts](file://web/src/store/profileStore.ts#L1-L45)
- [admin/src/store/ReportStore.ts](file://admin/src/store/ReportStore.ts#L1-L43)

**Section sources**
- [web/src/services/http.ts](file://web/src/services/http.ts#L1-L135)
- [admin/src/services/http.ts](file://admin/src/services/http.ts#L1-L154)

## Core Components
- HTTP client with base URL, credentials, and interceptors for auth tokens and response normalization
- API service modules encapsulating domain-specific endpoints
- Error handling hook with retry and refresh logic
- Zustand stores for state synchronization and caching

Key responsibilities:
- Centralized HTTP configuration and auth header injection
- Consistent response envelope normalization
- Automatic token refresh on 401 Unauthorized
- Domain APIs for CRUD and specialized operations
- Global error extraction and user feedback
- Local state caches synchronized with backend responses

**Section sources**
- [web/src/services/http.ts](file://web/src/services/http.ts#L1-L135)
- [admin/src/services/http.ts](file://admin/src/services/http.ts#L1-L154)
- [web/src/hooks/useErrorHandler.tsx](file://web/src/hooks/useErrorHandler.tsx#L1-L170)

## Architecture Overview
The API integration layer follows a layered architecture:
- HTTP client layer handles base configuration, auth headers, and response normalization
- Service layer exposes typed domain APIs
- State layer manages local caches and synchronization
- Error handling layer centralizes error reporting and recovery

```mermaid
sequenceDiagram
participant UI as "UI Component"
participant API as "API Service"
participant HTTP as "HTTP Client"
participant BE as "Backend API"
participant ERR as "Error Handler"
UI->>API : "Call endpoint with params"
API->>HTTP : "Send request"
HTTP->>BE : "HTTP request with Authorization header"
BE-->>HTTP : "Response envelope"
HTTP-->>API : "Normalized response"
API-->>UI : "Domain result"
Note over HTTP,BE : "On 401 Unauthorized,<br/>attempt token refresh and retry"
HTTP->>BE : "POST /auth/refresh"
BE-->>HTTP : "New access token"
HTTP->>BE : "Retry original request with new token"
BE-->>HTTP : "Success response"
HTTP-->>API : "Normalized response"
API-->>UI : "Domain result"
UI->>ERR : "On error"
ERR-->>UI : "Extract message and show toast"
```

**Diagram sources**
- [web/src/services/http.ts](file://web/src/services/http.ts#L56-L111)
- [web/src/hooks/useErrorHandler.tsx](file://web/src/hooks/useErrorHandler.tsx#L105-L166)
- [web/src/services/api/post.ts](file://web/src/services/api/post.ts#L14-L16)

## Detailed Component Analysis

### HTTP Client Configuration
- Base URL configured from environment variables
- Credentials enabled for cross-origin cookies
- Request interceptor injects Authorization header when present
- Response interceptor normalizes backend envelopes into a unified shape
- Automatic 401 handling with token refresh and queued retry

```mermaid
flowchart TD
Start(["Request Intercept"]) --> GetToken["Get access token"]
GetToken --> HasToken{"Token exists and none set?"}
HasToken --> |Yes| AddHeader["Set Authorization: Bearer token"]
HasToken --> |No| SkipHeader["Skip header"]
AddHeader --> Next["Proceed to next interceptor"]
SkipHeader --> Next
RespStart(["Response Intercept"]) --> Normalize["Normalize envelope to ApiResponse"]
Normalize --> ReturnResp["Return normalized response"]
AuthStart(["401 Unauthorized"]) --> IsRefreshing{"Already refreshing?"}
IsRefreshing --> |Yes| QueueReq["Queue request and wait"]
IsRefreshing --> |No| Refresh["POST /auth/refresh"]
Refresh --> SetHeader["Set Authorization with new token"]
SetHeader --> Retry["Retry original request"]
QueueReq --> Retry
Retry --> Done(["Resolved"])
```

**Diagram sources**
- [web/src/services/http.ts](file://web/src/services/http.ts#L10-L19)
- [web/src/services/http.ts](file://web/src/services/http.ts#L56-L111)
- [web/src/services/http.ts](file://web/src/services/http.ts#L113-L134)

**Section sources**
- [web/src/services/http.ts](file://web/src/services/http.ts#L1-L135)
- [admin/src/services/http.ts](file://admin/src/services/http.ts#L1-L154)

### API Services

#### Posts API
- Fetch paginated posts with filters (branch, topic, sort)
- Search posts by query
- Get posts by college or user
- Increment views, create, update, delete posts
- Retrieve trending posts

```mermaid
sequenceDiagram
participant UI as "UI Component"
participant PostAPI as "postApi"
participant HTTP as "HTTP Client"
UI->>PostAPI : "getPosts({ branch, topic, page, limit, sortBy, sortOrder })"
PostAPI->>HTTP : "GET /posts?branch=...&topic=...&page=...&limit=..."
HTTP-->>PostAPI : "Normalized response"
PostAPI-->>UI : "Posts data"
UI->>PostAPI : "search(q, { page, limit })"
PostAPI->>HTTP : "GET /posts/search?q=...&page=...&limit=..."
HTTP-->>PostAPI : "Normalized response"
PostAPI-->>UI : "Search results"
```

**Diagram sources**
- [web/src/services/api/post.ts](file://web/src/services/api/post.ts#L14-L16)
- [web/src/services/api/post.ts](file://web/src/services/api/post.ts#L17-L18)

**Section sources**
- [web/src/services/api/post.ts](file://web/src/services/api/post.ts#L1-L68)

#### Users API
- Get current user profile
- Accept terms
- Update profile branch
- Block/unblock users
- List blocked users

```mermaid
sequenceDiagram
participant UI as "UI Component"
participant UserAPI as "userApi"
participant HTTP as "HTTP Client"
UI->>UserAPI : "getMe()"
UserAPI->>HTTP : "GET /users/me"
HTTP-->>UserAPI : "Normalized response"
UserAPI-->>UI : "User profile"
UI->>UserAPI : "updateProfile({ branch })"
UserAPI->>HTTP : "PATCH /users/me"
HTTP-->>UserAPI : "Normalized response"
UserAPI-->>UI : "Updated profile"
```

**Diagram sources**
- [web/src/services/api/user.ts](file://web/src/services/api/user.ts#L4-L5)
- [web/src/services/api/user.ts](file://web/src/services/api/user.ts#L13-L14)

**Section sources**
- [web/src/services/api/user.ts](file://web/src/services/api/user.ts#L1-L26)

#### Authentication API
- Session management: login, refresh, logout, logout-all
- OTP flows: send, verify, login variants
- Password management: status, set
- Registration: initialize, finalize
- Onboarding completion
- Account deletion

```mermaid
sequenceDiagram
participant UI as "UI Component"
participant AuthAPI as "authApi"
participant HTTP as "HTTP Client"
UI->>AuthAPI : "session.login(email, password)"
AuthAPI->>HTTP : "POST /auth/login"
HTTP-->>AuthAPI : "Normalized response"
AuthAPI-->>UI : "Login success status"
UI->>AuthAPI : "otp.send(email)"
AuthAPI->>HTTP : "POST /auth/otp/send"
HTTP-->>AuthAPI : "Normalized response"
AuthAPI-->>UI : "OTP sent status"
UI->>AuthAPI : "password.set(newPassword, currentPassword?)"
AuthAPI->>HTTP : "POST /auth/password/set"
HTTP-->>AuthAPI : "Normalized response"
AuthAPI-->>UI : "Password set result"
```

**Diagram sources**
- [web/src/services/api/auth.ts](file://web/src/services/api/auth.ts#L135-L140)
- [web/src/services/api/auth.ts](file://web/src/services/api/auth.ts#L19-L24)
- [web/src/services/api/auth.ts](file://web/src/services/api/auth.ts#L67-L72)

**Section sources**
- [web/src/services/api/auth.ts](file://web/src/services/api/auth.ts#L1-L156)

#### Comments API
- Fetch comments by post ID
- Create, update, delete comments

```mermaid
sequenceDiagram
participant UI as "UI Component"
participant CommentAPI as "commentApi"
participant HTTP as "HTTP Client"
UI->>CommentAPI : "getByPostId(postId)"
CommentAPI->>HTTP : "GET /comments/post/{postId}"
HTTP-->>CommentAPI : "Normalized response"
CommentAPI-->>UI : "Comments list"
UI->>CommentAPI : "create(postId, { content, parentCommentId })"
CommentAPI->>HTTP : "POST /comments/post/{postId}"
HTTP-->>CommentAPI : "Normalized response"
CommentAPI-->>UI : "Created comment"
```

**Diagram sources**
- [web/src/services/api/comment.ts](file://web/src/services/api/comment.ts#L4-L5)
- [web/src/services/api/comment.ts](file://web/src/services/api/comment.ts-L11)

**Section sources**
- [web/src/services/api/comment.ts](file://web/src/services/api/comment.ts#L1-L24)

#### Bookmarks API
- List user bookmarks
- Create/remove bookmarks

```mermaid
sequenceDiagram
participant UI as "UI Component"
participant BookmarkAPI as "bookmarkApi"
participant HTTP as "HTTP Client"
UI->>BookmarkAPI : "listMine()"
BookmarkAPI->>HTTP : "GET /bookmarks/user"
HTTP-->>BookmarkAPI : "Normalized response"
BookmarkAPI-->>UI : "Bookmarks list"
UI->>BookmarkAPI : "create(postId)"
BookmarkAPI->>HTTP : "POST /bookmarks"
HTTP-->>BookmarkAPI : "Normalized response"
BookmarkAPI-->>UI : "Bookmark created"
```

**Diagram sources**
- [web/src/services/api/bookmark.ts](file://web/src/services/api/bookmark.ts#L4-L5)
- [web/src/services/api/bookmark.ts](file://web/src/services/api/bookmark.ts#L7-L8)

**Section sources**
- [web/src/services/api/bookmark.ts](file://web/src/services/api/bookmark.ts#L1-L14)

#### Votes API
- Create, update, remove votes on posts or comments

```mermaid
sequenceDiagram
participant UI as "UI Component"
participant VoteAPI as "voteApi"
participant HTTP as "HTTP Client"
UI->>VoteAPI : "create({ voteType, targetId, targetType })"
VoteAPI->>HTTP : "POST /votes"
HTTP-->>VoteAPI : "Normalized response"
VoteAPI-->>UI : "Vote created"
UI->>VoteAPI : "update({ voteType, targetId, targetType })"
VoteAPI->>HTTP : "PATCH /votes"
HTTP-->>VoteAPI : "Normalized response"
VoteAPI-->>UI : "Vote updated"
```

**Diagram sources**
- [web/src/services/api/vote.ts](file://web/src/services/api/vote.ts#L7-L12)
- [web/src/services/api/vote.ts](file://web/src/services/api/vote.ts#L14-L21)

**Section sources**
- [web/src/services/api/vote.ts](file://web/src/services/api/vote.ts#L1-L27)

### Authentication Clients
- Better Auth client configured with base URL and plugins
- Admin client for admin app
- Web client for web app with Google One Tap configuration

```mermaid
classDiagram
class AuthClient {
+baseURL
+plugins
+signInWithGoogle()
+signInWithEmail()
+signOut()
}
class WebAuthClient {
+baseURL
+plugins : [adminClient, inferAdditionalFields, oneTapClient]
}
class AdminAuthClient {
+baseURL
+plugins : [adminClient, inferAdditionalFields]
}
AuthClient <|-- WebAuthClient
AuthClient <|-- AdminAuthClient
```

**Diagram sources**
- [web/src/lib/auth-client.ts](file://web/src/lib/auth-client.ts#L9-L19)
- [admin/src/lib/auth-client.ts](file://admin/src/lib/auth-client.ts#L4-L10)

**Section sources**
- [web/src/lib/auth-client.ts](file://web/src/lib/auth-client.ts#L1-L20)
- [admin/src/lib/auth-client.ts](file://admin/src/lib/auth-client.ts#L1-L11)

### Error Management and Boundary Implementation
- Centralized error handler extracts messages from backend envelopes
- Handles moderation-specific policies and user-friendly messages
- Implements automatic token refresh on 401 Unauthorized with retry
- Integrates with toast notifications and profile store cleanup

```mermaid
flowchart TD
E_Start(["Error Occurs"]) --> IsAxios{"Is Axios error?"}
IsAxios --> |No| Fallback["Use error.message or fallback"]
IsAxios --> |Yes| Status401{"Status 401?"}
Status401 --> |No| ExtractMsg["Extract message from response"]
Status401 --> |Yes| CodeCheck{"Code == INVALID_SESSION?"}
CodeCheck --> |Yes| ClearProfile["Remove profile and notify"]
CodeCheck --> |No| ShouldRefresh{"Should refresh token?"}
ShouldRefresh --> |Yes| Refresh["POST /auth/refresh"]
Refresh --> Retry["Retry original request"]
ShouldRefresh --> |No| ClearProfile
Retry --> Done(["Resolved"])
ClearProfile --> Done
ExtractMsg --> Done
Fallback --> Done
```

**Diagram sources**
- [web/src/hooks/useErrorHandler.tsx](file://web/src/hooks/useErrorHandler.tsx#L105-L166)
- [web/src/services/http.ts](file://web/src/services/http.ts#L56-L111)

**Section sources**
- [web/src/hooks/useErrorHandler.tsx](file://web/src/hooks/useErrorHandler.tsx#L1-L170)

### State Synchronization and Caching Strategies
- Profile store holds user profile and theme preferences
- Post and comment stores maintain local caches for lists and updates
- Report store synchronizes moderation report states in admin
- Stores support add/update/remove operations to keep UI in sync with backend

```mermaid
graph LR
BE["Backend API"] --> HTTP["HTTP Client"]
HTTP --> API["API Services"]
API --> STORE_PROFILE["Profile Store"]
API --> STORE_POST["Post Store"]
API --> STORE_COMMENT["Comment Store"]
API --> STORE_REPORT["Report Store (Admin)"]
STORE_PROFILE --> UI_PROFILE["UI Profile Views"]
STORE_POST --> UI_POSTS["UI Posts Lists"]
STORE_COMMENT --> UI_COMMENTS["UI Comments Lists"]
STORE_REPORT --> UI_REPORTS["UI Reports Views"]
```

**Diagram sources**
- [web/src/store/profileStore.ts](file://web/src/store/profileStore.ts#L14-L42)
- [web/src/store/postStore.ts](file://web/src/store/postStore.ts#L12-L27)
- [web/src/store/commentStore.ts](file://web/src/store/commentStore.ts#L13-L31)
- [admin/src/store/ReportStore.ts](file://admin/src/store/ReportStore.ts#L11-L40)

**Section sources**
- [web/src/store/profileStore.ts](file://web/src/store/profileStore.ts#L1-L45)
- [web/src/store/postStore.ts](file://web/src/store/postStore.ts#L1-L30)
- [web/src/store/commentStore.ts](file://web/src/store/commentStore.ts#L1-L34)
- [admin/src/store/ReportStore.ts](file://admin/src/store/ReportStore.ts#L1-L43)

## Dependency Analysis
- HTTP client depends on environment configuration and axios
- API services depend on the shared HTTP client
- Error handler depends on axios, toast notifications, and profile store
- Stores are independent and consumed by UI components

```mermaid
graph TB
ENV_WEB["Env (web)"] --> HTTP_WEB["HTTP Client (web)"]
ENV_ADMIN["Env (admin)"] --> HTTP_ADMIN["HTTP Client (admin)"]
HTTP_WEB --> API_POST["postApi"]
HTTP_WEB --> API_USER["userApi"]
HTTP_WEB --> API_AUTH["authApi"]
HTTP_WEB --> API_COMMENT["commentApi"]
HTTP_WEB --> API_BOOKMARK["bookmarkApi"]
HTTP_WEB --> API_VOTE["voteApi"]
HTTP_ADMIN --> REPORT_STORE["ReportStore"]
ERR_HOOK["useErrorHandler"] --> HTTP_WEB
PROFILE_STORE["ProfileStore"] --> UI_PROFILE["UI"]
POST_STORE["PostStore"] --> UI_POSTS["UI"]
COMMENT_STORE["CommentStore"] --> UI_COMMENTS["UI"]
```

**Diagram sources**
- [web/src/services/http.ts](file://web/src/services/http.ts#L5-L8)
- [admin/src/services/http.ts](file://admin/src/services/http.ts#L11-L19)
- [web/src/services/api/post.ts](file://web/src/services/api/post.ts#L1-L1)
- [web/src/hooks/useErrorHandler.tsx](file://web/src/hooks/useErrorHandler.tsx#L1-L10)
- [web/src/store/profileStore.ts](file://web/src/store/profileStore.ts#L1-L12)
- [web/src/store/postStore.ts](file://web/src/store/postStore.ts#L1-L10)
- [web/src/store/commentStore.ts](file://web/src/store/commentStore.ts#L1-L11)
- [admin/src/store/ReportStore.ts](file://admin/src/store/ReportStore.ts#L1-L9)

**Section sources**
- [web/src/services/http.ts](file://web/src/services/http.ts#L1-L135)
- [admin/src/services/http.ts](file://admin/src/services/http.ts#L1-L154)

## Performance Considerations
- Centralized interceptors reduce duplication and overhead
- Queued retries during refresh prevent redundant requests
- Normalized responses simplify UI handling and reduce branching
- Local stores minimize repeated fetches and improve perceived performance
- Consider adding optimistic updates for write-heavy flows (create/update/delete) to enhance responsiveness

## Troubleshooting Guide
Common scenarios and resolutions:
- 401 Unauthorized
  - The client attempts a token refresh automatically; if successful, the original request is retried
  - If refresh fails, the profile is cleared and the user is prompted to log in again
- Content moderation violations
  - The error handler inspects backend metadata and field-level errors to provide user-friendly guidance
- Network or unexpected errors
  - Messages are extracted from the response envelope or error object and surfaced via toast notifications
- Token refresh conflicts
  - Requests are queued while a refresh is in progress; they resolve with the new token

Operational tips:
- Verify environment variables for base URLs
- Ensure cookies are accepted for cross-origin requests
- Confirm that the access token getter is registered so interceptors can attach Authorization headers
- Use the error handler consistently across API calls to standardize user feedback

**Section sources**
- [web/src/services/http.ts](file://web/src/services/http.ts#L56-L111)
- [web/src/hooks/useErrorHandler.tsx](file://web/src/hooks/useErrorHandler.tsx#L105-L166)

## Conclusion
The API integration layer provides a robust, centralized mechanism for HTTP communication, consistent error handling, and state synchronization. By encapsulating domain-specific endpoints, normalizing responses, and managing authentication transparently, it enables scalable development and reliable user experiences across the application.