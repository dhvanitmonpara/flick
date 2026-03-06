# Routing & Navigation

<cite>
**Referenced Files in This Document**
- [layout.tsx](file://web/src/app/layout.tsx)
- [layout.tsx](file://web/src/app/(root)/layout.tsx)
- [not-found.tsx](file://web/src/app/(root)/not-found.tsx)
- [layout.tsx](file://web/src/app/(root)/(app)/layout.tsx)
- [page.tsx](file://web/src/app/(root)/(app)/page.tsx)
- [page.tsx](file://web/src/app/(root)/(app)/p/[id]/page.tsx)
- [page.tsx](file://web/src/app/(root)/(app)/college/page.tsx)
- [page.tsx](file://web/src/app/(root)/(app)/notifications/page.tsx)
- [layout.tsx](file://web/src/app/(root)/(app)/u/layout.tsx)
- [auth-client.ts](file://web/src/lib/auth-client.ts)
- [postTopics.ts](file://web/src/types/postTopics.ts)
- [PostBranchs.ts](file://web/src/types/PostBranchs.ts)
- [parse-topic.ts](file://web/src/utils/parse-topic.ts)
- [unparse-topic.ts](file://web/src/utils/unparse-topic.ts)
</cite>

## Update Summary
**Changes Made**
- Updated branch and topic navigation system from path-based to query-parameter-based routing
- Removed dedicated branch and topic page components, transitioning to filter-based navigation
- Enhanced query parameter handling for branch and topic filtering
- Updated sidebar navigation to use query parameters instead of separate routes
- Improved active link detection logic to handle query parameters

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
This document explains the routing and navigation system built with Next.js App Router. The system has transitioned from path-based routing to query-parameter-based navigation for branch and topic filtering. It covers route groups, nested layouts, dynamic routes for posts and user profiles, navigation patterns, active link highlighting, protected/public route strategies, SEO and metadata, and performance optimizations. The system now uses query parameters for filtering content while maintaining the same layout hierarchy and navigation structure.

## Project Structure
The routing model centers around three primary layout layers with query-parameter-based filtering:
- Root layout: top-level layout and global health check redirection
- App layout group: main application shell with sidebar, trending panel, and active navigation highlighting using query parameters
- Page routes: content pages such as feed, post detail, college feed, notifications, and user sub-app

```mermaid
graph TB
root_layout["Root Layout<br/>(web/src/app/layout.tsx)"]
root_group["Root Group Layout<br/>(web/src/app/(root)/layout.tsx)"]
app_group["App Group Layout<br/>(web/src/app/(root)/(app)/layout.tsx)"]
feed["Feed Page<br/>(web/src/app/(root)/(app)/page.tsx)"]
post_detail["Post Detail Page<br/>(web/src/app/(root)/(app)/p/[id]/page.tsx)"]
college_feed["College Feed Page<br/>(web/src/app/(root)/(app)/college/page.tsx)"]
notifications["Notifications Page<br/>(web/src/app/(root)/(app)/notifications/page.tsx)"]
user_profile["User Profile<br/>(web/src/app/(root)/(app)/u/profile/page.tsx)"]
not_found["Not Found Page<br/>(web/src/app/(root)/not-found.tsx)"]
root_layout --> root_group
root_group --> app_group
app_group --> feed
app_group --> post_detail
app_group --> college_feed
app_group --> notifications
app_group --> user_profile
root_group --> not_found
```

**Diagram sources**
- [layout.tsx](file://web/src/app/layout.tsx#L1-L35)
- [layout.tsx](file://web/src/app/(root)/layout.tsx#L1-L31)
- [layout.tsx](file://web/src/app/(root)/(app)/layout.tsx#L1-L131)
- [page.tsx](file://web/src/app/(root)/(app)/page.tsx#L1-L194)
- [page.tsx](file://web/src/app/(root)/(app)/p/[id]/page.tsx#L1-L187)
- [page.tsx](file://web/src/app/(root)/(app)/college/page.tsx#L1-L128)
- [page.tsx](file://web/src/app/(root)/(app)/notifications/page.tsx#L1-L74)
- [layout.tsx](file://web/src/app/(root)/(app)/u/layout.tsx#L1-L24)
- [not-found.tsx](file://web/src/app/(root)/not-found.tsx#L1-L18)

**Section sources**
- [layout.tsx](file://web/src/app/layout.tsx#L1-L35)
- [layout.tsx](file://web/src/app/(root)/layout.tsx#L1-L31)
- [layout.tsx](file://web/src/app/(root)/(app)/layout.tsx#L1-L131)

## Core Components
- Root layout defines global HTML metadata and theme container
- Root group layout performs a server health check and redirects to a maintenance page if the backend is unavailable
- App group layout provides the main application shell with a persistent sidebar, trending section, and active link highlighting logic using query parameters
- Page routes implement specific views: feed with query-parameter filtering, post detail, college feed, notifications, and user profile

Key responsibilities:
- Active link detection uses pathname and search params to compute active state for navigation tabs with query parameter support
- Query parameter-based filtering for branch and topic on the feed page
- Dynamic route for post detail resolves by ID and hydrates post and comments
- College feed filters posts by the authenticated user's college
- Notifications page lists and marks seen notifications
- User profile requires authentication guard

**Updated** Transitioned from path-based branch/topic navigation to query-parameter-based filtering system

**Section sources**
- [layout.tsx](file://web/src/app/layout.tsx#L15-L18)
- [layout.tsx](file://web/src/app/(root)/layout.tsx#L12-L20)
- [layout.tsx](file://web/src/app/(root)/(app)/layout.tsx#L113-L123)
- [page.tsx](file://web/src/app/(root)/(app)/page.tsx#L24-L50)
- [page.tsx](file://web/src/app/(root)/(app)/p/[id]/page.tsx#L36-L107)
- [page.tsx](file://web/src/app/(root)/(app)/college/page.tsx#L22-L39)
- [page.tsx](file://web/src/app/(root)/(app)/notifications/page.tsx#L18-L50)
- [layout.tsx](file://web/src/app/(root)/(app)/u/layout.tsx#L8-L22)

## Architecture Overview
The routing architecture leverages Next.js App Router with route groups and nested layouts. The health check in the root group ensures the UI only renders when the backend is ready. The app group encapsulates navigation and content areas with query-parameter-based filtering, while page routes implement domain-specific logic.

```mermaid
sequenceDiagram
participant Browser as "Browser"
participant RootGroup as "Root Group Layout"
participant AppLayout as "App Group Layout"
participant Feed as "Feed Page"
participant PostDetail as "Post Detail Page"
Browser->>RootGroup : Request /
RootGroup->>RootGroup : Health check
RootGroup-->>Browser : Redirect to /server-booting if unhealthy
RootGroup-->>AppLayout : Render app shell
AppLayout-->>Feed : Render feed with query params
Browser->>PostDetail : Navigate to /p/[id]
PostDetail-->>Browser : Render post detail with comments
```

**Diagram sources**
- [layout.tsx](file://web/src/app/(root)/layout.tsx#L12-L20)
- [layout.tsx](file://web/src/app/(root)/(app)/layout.tsx#L21-L37)
- [page.tsx](file://web/src/app/(root)/(app)/page.tsx#L1-L194)
- [page.tsx](file://web/src/app/(root)/(app)/p/[id]/page.tsx#L1-L187)

## Detailed Component Analysis

### Route Groups and Nested Layouts
- Root group layout wraps the entire app and enforces a server health check before rendering children
- App group layout composes the main UI: sidebar, content area, trending panel, and footer actions with query-parameter-aware navigation
- Global metadata and theme container are defined in the root layout

```mermaid
graph TB
root["Root Layout<br/>(web/src/app/layout.tsx)"]
root_group["Root Group Layout<br/>(web/src/app/(root)/layout.tsx)"]
app_group["App Group Layout<br/>(web/src/app/(root)/(app)/layout.tsx)"]
root --> root_group
root_group --> app_group
```

**Diagram sources**
- [layout.tsx](file://web/src/app/layout.tsx#L1-L35)
- [layout.tsx](file://web/src/app/(root)/layout.tsx#L1-L31)
- [layout.tsx](file://web/src/app/(root)/(app)/layout.tsx#L1-L131)

**Section sources**
- [layout.tsx](file://web/src/app/layout.tsx#L1-L35)
- [layout.tsx](file://web/src/app/(root)/layout.tsx#L1-L31)
- [layout.tsx](file://web/src/app/(root)/(app)/layout.tsx#L1-L131)

### Feed Route and Query-Parameter Filtering
- The feed page fetches posts filtered by branch/topic via URL search params using query parameters
- Active link highlighting is computed by comparing current pathname and search params against tab destinations with query parameter support
- Loading skeletons improve perceived performance during initial fetch
- Query parameter parsing supports both branch and topic filters with proper URL encoding

**Updated** Migrated from path-based branch/topic routes to query-parameter-based filtering system

```mermaid
flowchart TD
Start(["Enter Feed"]) --> ReadParams["Read branch/topic from URL query params"]
ReadParams --> ParseParams["Parse and validate query parameters"]
ParseParams --> FetchPosts["Fetch posts with branch/topic filters"]
FetchPosts --> HasData{"Has posts?"}
HasData --> |Yes| RenderPosts["Render Post components"]
HasData --> |No| EmptyState["Show empty state with actions"]
RenderPosts --> End(["Done"])
EmptyState --> ClearFilters["Clear query parameters"]
ClearFilters --> FetchPosts
```

**Diagram sources**
- [page.tsx](file://web/src/app/(root)/(app)/page.tsx#L24-L50)
- [layout.tsx](file://web/src/app/(root)/(app)/layout.tsx#L113-L123)

**Section sources**
- [page.tsx](file://web/src/app/(root)/(app)/page.tsx#L24-L50)
- [layout.tsx](file://web/src/app/(root)/(app)/layout.tsx#L113-L123)

### Branch and Topic Navigation System
- Branch navigation uses query parameters: `/page?branch=bca`
- Topic navigation uses query parameters: `/page?topic=ask+flick`
- Sidebar generates navigation links with proper URL encoding for spaces and special characters
- Active link detection accounts for query parameters in URL comparison
- Topic parsing converts spaces to '+' and '/' to '_' for URL compatibility

**Updated** Implemented comprehensive query-parameter-based branch and topic navigation system

```mermaid
graph LR
Sidebar["Sidebar Navigation"] --> BranchQuery["?branch=parameter"]
Sidebar --> TopicQuery["?topic=parameter"]
BranchQuery --> Feed["Feed Page"]
TopicQuery --> Feed
Feed --> FilterPosts["Filter Posts API"]
FilterPosts --> RenderResults["Render Results"]
```

**Diagram sources**
- [layout.tsx](file://web/src/app/(root)/(app)/layout.tsx#L61-L101)
- [parse-topic.ts](file://web/src/utils/parse-topic.ts#L1-L5)
- [unparse-topic.ts](file://web/src/utils/unparse-topic.ts#L1-L41)

**Section sources**
- [layout.tsx](file://web/src/app/(root)/(app)/layout.tsx#L61-L101)
- [parse-topic.ts](file://web/src/utils/parse-topic.ts#L1-L5)
- [unparse-topic.ts](file://web/src/utils/unparse-topic.ts#L1-L41)
- [postTopics.ts](file://web/src/types/postTopics.ts#L1-L17)
- [PostBranchs.ts](file://web/src/types/PostBranchs.ts#L1-L20)

### Post Detail Route (Dynamic Route)
- Dynamic route pattern resolves by post ID and hydrates post content and comment tree
- View count is incremented on render; comments are fetched and rendered as a tree
- Fallback behavior navigates to home if ID is missing or fetch fails

```mermaid
sequenceDiagram
participant Nav as "Navigation"
participant PostPage as "Post Detail Page"
participant API as "Post/Comment APIs"
Nav->>PostPage : Navigate to /p/[id]
PostPage->>API : Fetch post by ID
API-->>PostPage : Post data
PostPage->>API : Increment view
PostPage->>API : Fetch comments by post ID
API-->>PostPage : Comments array
PostPage->>PostPage : Build comment tree
PostPage-->>Nav : Render post and comments
```

**Diagram sources**
- [page.tsx](file://web/src/app/(root)/(app)/p/[id]/page.tsx#L36-L107)
- [page.tsx](file://web/src/app/(root)/(app)/p/[id]/page.tsx#L161-L184)

**Section sources**
- [page.tsx](file://web/src/app/(root)/(app)/p/[id]/page.tsx#L36-L107)
- [page.tsx](file://web/src/app/(root)/(app)/p/[id]/page.tsx#L161-L184)

### College Feed Route
- Filters posts by the authenticated user's college using profile store
- Maintains query parameter state when navigating between different feed views

**Section sources**
- [page.tsx](file://web/src/app/(root)/(app)/college/page.tsx#L22-L39)

### Notifications Route
- Lists notifications and marks unseen ones as seen after loading
- Uses toast notifications for errors and updates UI reactively

**Section sources**
- [page.tsx](file://web/src/app/(root)/(app)/notifications/page.tsx#L18-L50)

### User Profile Route with Authentication Guard
- Requires user authentication before accessing profile pages
- Redirects unauthenticated users to sign-in page with informative toast message
- Provides private layout wrapper for user-specific routes

**Updated** Added authentication guard for user profile navigation

**Section sources**
- [layout.tsx](file://web/src/app/(root)/(app)/u/layout.tsx#L8-L22)

### Not Found Handling
- Dedicated 404 page with a friendly message and a link back to home

**Section sources**
- [not-found.tsx](file://web/src/app/(root)/not-found.tsx#L1-L18)

### Authentication and Protected Routes
- Authentication client is configured to integrate with the backend auth endpoints
- User profile routes have explicit authentication guards
- While explicit route guards are not visible in the provided files, the presence of an auth client indicates centralized auth state and navigation hooks can be used to enforce protected routes elsewhere in the app

**Section sources**
- [auth-client.ts](file://web/src/lib/auth-client.ts#L1-L11)

## Dependency Analysis
- Root layout depends on global metadata and theme variables
- Root group layout depends on app health API to decide rendering
- App group layout depends on navigation utilities and stores for active state and content hydration with query parameter support
- Page routes depend on service APIs for data fetching and store modules for state management
- Branch and topic navigation depends on parsing utilities for URL parameter handling

```mermaid
graph LR
RootLayout["Root Layout"] --> RootGroup["Root Group Layout"]
RootGroup --> AppLayout["App Group Layout"]
AppLayout --> Feed["Feed Page"]
AppLayout --> PostDetail["Post Detail Page"]
AppLayout --> College["College Feed Page"]
AppLayout --> Notifications["Notifications Page"]
AppLayout --> UserProfile["User Profile"]
RootGroup --> NotFound["Not Found Page"]
AppLayout --> QueryUtils["Query Parameter Utils"]
QueryUtils --> ParseTopic["parse-topic.ts"]
QueryUtils --> UnparseTopic["unparse-topic.ts"]
```

**Diagram sources**
- [layout.tsx](file://web/src/app/layout.tsx#L1-L35)
- [layout.tsx](file://web/src/app/(root)/layout.tsx#L1-L31)
- [layout.tsx](file://web/src/app/(root)/(app)/layout.tsx#L1-L131)
- [page.tsx](file://web/src/app/(root)/(app)/page.tsx#L1-L194)
- [page.tsx](file://web/src/app/(root)/(app)/p/[id]/page.tsx#L1-L187)
- [page.tsx](file://web/src/app/(root)/(app)/college/page.tsx#L1-L128)
- [page.tsx](file://web/src/app/(root)/(app)/notifications/page.tsx#L1-L74)
- [layout.tsx](file://web/src/app/(root)/(app)/u/layout.tsx#L1-L24)
- [not-found.tsx](file://web/src/app/(root)/not-found.tsx#L1-L18)
- [parse-topic.ts](file://web/src/utils/parse-topic.ts#L1-L5)
- [unparse-topic.ts](file://web/src/utils/unparse-topic.ts#L1-L41)

**Section sources**
- [layout.tsx](file://web/src/app/layout.tsx#L1-L35)
- [layout.tsx](file://web/src/app/(root)/layout.tsx#L1-L31)
- [layout.tsx](file://web/src/app/(root)/(app)/layout.tsx#L1-L131)
- [page.tsx](file://web/src/app/(root)/(app)/page.tsx#L1-L194)
- [page.tsx](file://web/src/app/(root)/(app)/p/[id]/page.tsx#L1-L187)
- [page.tsx](file://web/src/app/(root)/(app)/college/page.tsx#L1-L128)
- [page.tsx](file://web/src/app/(root)/(app)/notifications/page.tsx#L1-L74)
- [layout.tsx](file://web/src/app/(root)/(app)/u/layout.tsx#L1-L24)
- [not-found.tsx](file://web/src/app/(root)/not-found.tsx#L1-L18)
- [parse-topic.ts](file://web/src/utils/parse-topic.ts#L1-L5)
- [unparse-topic.ts](file://web/src/utils/unparse-topic.ts#L1-L41)

## Performance Considerations
- Suspense boundaries: The feed page uses a Suspense boundary to progressively reveal content while initializing
- Skeleton loaders: Used during initial fetch to reduce perceived latency
- Efficient navigation: Active link computation avoids unnecessary re-renders by comparing pathname and search params with query parameter support
- Client-side caching: Stores are used to avoid redundant network requests (e.g., comments and posts)
- Query parameter optimization: URL-encoded parameters prevent unnecessary route changes and maintain browser history efficiently
- Prefetching and route-based code splitting: Next.js automatically splits route code; consider adding link-level prefetching for frequently visited routes (e.g., post detail after clicking a feed item)

## Troubleshooting Guide
- Server health check failure: If the backend is unreachable, the root group layout redirects to a maintenance page. Verify backend availability and network connectivity
- 404 handling: When navigating to unknown routes, the dedicated 404 page displays a friendly message and a link back to home
- Post detail errors: On invalid or missing post ID, the post detail page navigates to home. Confirm the ID exists and the API responds correctly
- Notifications loading: If notifications fail to load, the UI shows an error toast; retry or check network conditions
- Query parameter issues: If branch or topic filters aren't working, verify URL encoding and ensure proper parameter names are used
- Authentication redirects: User profile routes redirect to sign-in if not authenticated; check auth state and token validity

**Section sources**
- [layout.tsx](file://web/src/app/(root)/layout.tsx#L12-L20)
- [not-found.tsx](file://web/src/app/(root)/not-found.tsx#L1-L18)
- [page.tsx](file://web/src/app/(root)/(app)/p/[id]/page.tsx#L89-L107)
- [layout.tsx](file://web/src/app/(root)/(app)/u/layout.tsx#L11-L16)

## Conclusion
The routing and navigation system uses Next.js App Router with route groups and nested layouts to structure the application. The system has successfully transitioned from path-based branch and topic navigation to a more flexible query-parameter-based filtering system. The app group provides a robust navigation shell with active link highlighting that supports query parameters, while page routes implement domain logic for feeds, posts, college-specific content, notifications, and user profiles with authentication guards. Authentication is integrated via a dedicated client, and the system includes health checks, 404 handling, and performance optimizations such as skeleton loaders, Suspense boundaries, and efficient query parameter handling.