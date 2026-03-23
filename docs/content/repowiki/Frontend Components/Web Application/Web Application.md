# Web Application

<cite>
**Referenced Files in This Document**
- [layout.tsx](file://web/src/app/layout.tsx)
- [layout.tsx](file://web/src/app/(root)/(app)/layout.tsx)
- [page.tsx](file://web/src/app/(root)/(app)/page.tsx)
- [layout.tsx](file://web/src/app/(root)/auth/layout.tsx)
- [page.tsx](file://web/src/app/(root)/auth/signin/page.tsx)
- [UserProfile.tsx](file://web/src/components/general/UserProfile.tsx)
- [CreatePost.tsx](file://web/src/components/general/CreatePost.tsx)
- [Post.tsx](file://web/src/components/general/Post.tsx)
- [env.ts](file://web/src/config/env.ts)
- [auth-client.ts](file://web/src/lib/auth-client.ts)
- [package.json](file://web/package.json)
- [next.config.ts](file://web/next.config.ts)
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
This document describes the main web application frontend built with Next.js App Router. It covers the nested route groups, layout hierarchy, page components, social platform UI (post creation, display, commenting, engagement), state management with Zustand stores, API integration patterns, real-time communication via Socket.IO, component library usage, Tailwind CSS styling, responsive design, authentication state management, routing configuration, and backend service integration.

## Project Structure
The frontend is organized under the Next.js App Router with route groups that separate the main application from authentication pages and define a root group for the primary feed and navigation. Key areas:
- Root application group: contains the main feed, trending, college-specific views, user profile, and settings.
- Authentication group: dedicated pages for sign-in, sign-up, OTP, OAuth callbacks, and password recovery.
- Shared UI components: general social components (Post, CreatePost, UserProfile), UI primitives, and utilities.
- Configuration: environment variables, client-side auth client, and Next.js compiler settings.

```mermaid
graph TB
A["Root Layout<br/>web/src/app/layout.tsx"] --> B["Root Group<br/>web/src/app/(root)"]
B --> C["App Group<br/>web/src/app/(root)/(app)"]
B --> D["Auth Group<br/>web/src/app/(root)/auth"]
C --> C1["Layout<br/>web/src/app/(root)/(app)/layout.tsx"]
C --> C2["Feed Page<br/>web/src/app/(root)/(app)/page.tsx"]
D --> D1["Auth Layout<br/>web/src/app/(root)/auth/layout.tsx"]
D --> D2["Sign-In Page<br/>web/src/app/(root)/auth/signin/page.tsx"]
```

**Diagram sources**
- [layout.tsx](file://web/src/app/layout.tsx#L1-L21)
- [layout.tsx](file://web/src/app/(root)/(app)/layout.tsx#L1-L290)
- [page.tsx](file://web/src/app/(root)/(app)/page.tsx#L1-L210)
- [layout.tsx](file://web/src/app/(root)/auth/layout.tsx#L1-L19)
- [page.tsx](file://web/src/app/(root)/auth/signin/page.tsx#L1-L293)

**Section sources**
- [layout.tsx](file://web/src/app/layout.tsx#L1-L21)
- [layout.tsx](file://web/src/app/(root)/(app)/layout.tsx#L1-L290)
- [page.tsx](file://web/src/app/(root)/(app)/page.tsx#L1-L210)
- [layout.tsx](file://web/src/app/(root)/auth/layout.tsx#L1-L19)
- [page.tsx](file://web/src/app/(root)/auth/signin/page.tsx#L1-L293)

## Core Components
- Social feed rendering and filtering by branch/topic.
- Post creation with moderation preview and term acceptance flow.
- Post display with engagement metrics and actions.
- User profile menu with logout and navigation.
- Authentication flow with Better Auth client and Google OAuth.
- Environment-driven configuration for API endpoints and base URLs.
- Zustand stores for posts, comments, and profile state.
- Socket.IO integration for real-time updates.

**Section sources**
- [page.tsx](file://web/src/app/(root)/(app)/page.tsx#L23-L191)
- [CreatePost.tsx](file://web/src/components/general/CreatePost.tsx#L104-L406)
- [Post.tsx](file://web/src/components/general/Post.tsx#L42-L176)
- [UserProfile.tsx](file://web/src/components/general/UserProfile.tsx#L30-L106)
- [env.ts](file://web/src/config/env.ts#L4-L28)
- [auth-client.ts](file://web/src/lib/auth-client.ts#L9-L19)

## Architecture Overview
The application follows a layered architecture:
- Routing layer: Next.js App Router with nested route groups and dynamic segments.
- Presentation layer: React components (general social UI, UI primitives).
- State layer: Zustand stores for posts, comments, and profile.
- Services layer: API clients for posts, users, authentication, and notifications.
- Real-time layer: Socket.IO provider and hooks for live updates.
- Authentication layer: Better Auth client with email/password and Google OAuth.

```mermaid
graph TB
subgraph "Routing"
RG["Route Groups<br/>/app/(root)/(app), /app/(root)/auth"]
end
subgraph "Presentation"
UI1["Feed Page<br/>page.tsx"]
UI2["Post Component<br/>Post.tsx"]
UI3["CreatePost Form<br/>CreatePost.tsx"]
UI4["User Profile Menu<br/>UserProfile.tsx"]
end
subgraph "State"
ZS1["Zustand Stores<br/>postStore, commentStore, profileStore"]
end
subgraph "Services"
API1["Post API<br/>postApi"]
API2["User API<br/>userApi"]
API3["Auth API<br/>authApi"]
end
subgraph "Realtime"
SO["Socket Provider<br/>SocketContext"]
end
subgraph "Auth"
BA["Better Auth Client<br/>auth-client.ts"]
end
subgraph "Config"
ENV["Environment<br/>env.ts"]
end
RG --> UI1
UI1 --> UI2
UI1 --> UI3
UI4 --> BA
UI1 --> ZS1
UI2 --> ZS1
UI3 --> ZS1
UI3 --> API1
UI1 --> API1
UI4 --> API2
UI4 --> API3
UI1 --> SO
BA --> ENV
```

**Diagram sources**
- [layout.tsx](file://web/src/app/(root)/(app)/layout.tsx#L39-L55)
- [page.tsx](file://web/src/app/(root)/(app)/page.tsx#L23-L68)
- [Post.tsx](file://web/src/components/general/Post.tsx#L42-L176)
- [CreatePost.tsx](file://web/src/components/general/CreatePost.tsx#L104-L406)
- [UserProfile.tsx](file://web/src/components/general/UserProfile.tsx#L30-L106)
- [auth-client.ts](file://web/src/lib/auth-client.ts#L9-L19)
- [env.ts](file://web/src/config/env.ts#L4-L28)

## Detailed Component Analysis

### App Layout and Navigation
The App Layout composes the sidebar, mobile navigation, trending section, and Socket.IO provider. It renders the main content area and handles responsive behavior. The sidebar provides quick links to Feed, My College, Trending, branches, and topics. Mobile navigation offers a bottom bar for core actions.

```mermaid
flowchart TD
Start(["App Layout Render"]) --> Sidebar["Render Sidebar<br/>Branches & Topics"]
Start --> Content["Render Children (Feed)"]
Start --> Trending["Render Trending Section"]
Start --> MobileNav["Render Mobile Nav"]
Sidebar --> Links["Active/Passive Icons<br/>Path-aware Tabs"]
Content --> Suspense["Suspense Fallback"]
Trending --> SocketProv["SocketProvider"]
MobileNav --> Actions["Feed, College, Create Post, Trending, Profile"]
SocketProv --> End(["Layout Complete"])
```

**Diagram sources**
- [layout.tsx](file://web/src/app/(root)/(app)/layout.tsx#L39-L55)
- [layout.tsx](file://web/src/app/(root)/(app)/layout.tsx#L138-L256)

**Section sources**
- [layout.tsx](file://web/src/app/(root)/(app)/layout.tsx#L1-L290)

### Feed Page and Post Rendering
The Feed page fetches posts filtered by branch and topic query parameters, displays a skeleton loader while loading, and renders either empty state UI or a list of Post components. It integrates with the post store and error handling hook.

```mermaid
sequenceDiagram
participant U as "User"
participant FP as "Feed Page"
participant PS as "postStore"
participant API as "postApi"
participant EH as "useErrorHandler"
U->>FP : Navigate to "/"
FP->>FP : Read branch/topic params
FP->>API : getPosts({branch, topic})
API-->>FP : {success, data.posts}
FP->>PS : setPosts(posts)
FP-->>U : Render posts or skeleton
Note over FP,EH : On error, handleError is invoked
```

**Diagram sources**
- [page.tsx](file://web/src/app/(root)/(app)/page.tsx#L33-L63)
- [page.tsx](file://web/src/app/(root)/(app)/page.tsx#L23-L68)

**Section sources**
- [page.tsx](file://web/src/app/(root)/(app)/page.tsx#L1-L210)

### Post Component and Engagement
Each Post displays metadata (branch, date, college, username, topic), optional private indicator, and an EngagementComponent for voting, comments, sharing, and views. A PostDropdown allows editing/deleting for authorized users.

```mermaid
classDiagram
class Post {
+string id
+string title
+string content
+number upvoteCount
+number downvoteCount
+number commentsCount
+number viewsCount
+string username
+string branch
+string college
+string createdAt
+boolean bookmarked
+string? avatar
+string? avatarFallback
+string? authorId
+string topic
+string? isPrivate
+string userVote
}
class EngagementComponent {
+string id
+string targetType
+object initialCounts
+string[] show
}
class PostDropdown {
+string id
+string type
+boolean bookmarked
+function removePostOnAction
+object? editableData
}
Post --> EngagementComponent : "renders"
Post --> PostDropdown : "renders"
```

**Diagram sources**
- [Post.tsx](file://web/src/components/general/Post.tsx#L20-L40)
- [Post.tsx](file://web/src/components/general/Post.tsx#L160-L172)

**Section sources**
- [Post.tsx](file://web/src/components/general/Post.tsx#L1-L179)

### Create Post Form and Moderation
The CreatePost component wraps a modal form that validates title/content/topic/isPrivate, censors text via moderation utilities, and submits to the post API. It supports updating existing posts and handles term acceptance flow.

```mermaid
flowchart TD
Open["Open CreatePost Modal"] --> LoadConfig["Load Moderation Config"]
LoadConfig --> Validate["Validate Form Fields"]
Validate --> Moderate["Censor Title & Content"]
Moderate --> Submit{"Update or Create?"}
Submit --> |Create| CreateReq["postApi.create(payload)"]
Submit --> |Update| UpdateReq["postApi.update(id, payload)"]
CreateReq --> Success["Toast + Add to Store + Close"]
UpdateReq --> Success
Success --> Close["Close Modal"]
Moderate --> Terms{"Terms Not Accepted?"}
Terms --> |Yes| ShowTerms["Show Terms Form"]
ShowTerms --> Accept["Accept Terms"]
Accept --> Submit
Moderate --> Error["Handle AxiosError / General Error"]
Error --> Retry["Retry Submission"]
```

**Diagram sources**
- [CreatePost.tsx](file://web/src/components/general/CreatePost.tsx#L163-L219)
- [CreatePost.tsx](file://web/src/components/general/CreatePost.tsx#L221-L230)

**Section sources**
- [CreatePost.tsx](file://web/src/components/general/CreatePost.tsx#L1-L409)

### Authentication and Session Management
The sign-in page uses Better Auth client to validate sessions, handle OAuth redirects, and manage sign-in with email/password or Google. It also handles accounts created via OAuth without passwords.

```mermaid
sequenceDiagram
participant U as "User"
participant SP as "Sign-In Page"
participant AC as "authClient"
participant UA as "userApi"
participant NAV as "Next Router"
U->>SP : Visit /auth/signin
SP->>AC : useSession()
AC-->>SP : {data : session, isPending}
SP->>UA : getMe()
UA-->>SP : 200 OK or error
alt Session valid
SP->>NAV : push("/")
else No password for OAuth
SP-->>U : Show OAuth Options Dialog
else Error
SP->>AC : signOut()
SP-->>U : Show error
end
U->>AC : signIn.email(...)
AC-->>SP : {error?}
alt Success
SP->>NAV : push("/")
else Error
SP-->>U : Toast error
end
```

**Diagram sources**
- [page.tsx](file://web/src/app/(root)/auth/signin/page.tsx#L44-L93)
- [page.tsx](file://web/src/app/(root)/auth/signin/page.tsx#L104-L133)

**Section sources**
- [page.tsx](file://web/src/app/(root)/auth/signin/page.tsx#L1-L293)
- [auth-client.ts](file://web/src/lib/auth-client.ts#L9-L19)

### User Profile and Logout
The UserProfile component shows a dropdown with profile, bookmarks, feedback, settings, and logout. Logout triggers both auth API and client sign-out, clears local profile, and navigates to home.

```mermaid
sequenceDiagram
participant U as "User"
participant UP as "UserProfile"
participant AA as "authApi"
participant AC as "authClient"
participant PS as "profileStore"
participant NAV as "Next Router"
U->>UP : Click profile avatar
UP->>UP : Open dropdown
U->>UP : Select "Logout"
UP->>AA : session.logout()
UP->>AC : signOut()
UP->>PS : removeProfile()
UP->>NAV : push("/")
```

**Diagram sources**
- [UserProfile.tsx](file://web/src/components/general/UserProfile.tsx#L35-L45)

**Section sources**
- [UserProfile.tsx](file://web/src/components/general/UserProfile.tsx#L1-L109)

## Dependency Analysis
Key dependencies and integrations:
- Next.js App Router with React Compiler enabled.
- Better Auth for authentication and Google OAuth.
- Axios for HTTP requests.
- Socket.IO client for real-time features.
- Zustand for state management.
- Radix UI and Lucide icons for UI primitives.
- Tailwind CSS v4 for styling.

```mermaid
graph LR
P["web/package.json"] --> N["Next.js"]
P --> BA["Better Auth"]
P --> AX["Axios"]
P --> SI["Socket.IO Client"]
P --> ZS["Zustand"]
P --> RU["Radix UI"]
P --> LC["Lucide Icons"]
P --> TW["Tailwind CSS v4"]
```

**Diagram sources**
- [package.json](file://web/package.json#L13-L52)

**Section sources**
- [package.json](file://web/package.json#L1-L67)
- [next.config.ts](file://web/next.config.ts#L1-L9)

## Performance Considerations
- Use of React Compiler in Next.js improves render performance.
- Suspense boundaries reduce blocking during data fetching.
- Zustand stores minimize re-renders by selecting only necessary slices.
- Conditional rendering of heavy lists (posts) with skeletons improves perceived performance.
- Lazy loading of images and avoiding unnecessary re-renders in components.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
Common issues and remedies:
- Environment variables not loaded: verify NEXT_PUBLIC_* variables and server runtime environment mapping.
- Authentication failures: check Better Auth baseURL and Google OAuth client ID; ensure redirect URIs match.
- Socket connection errors: confirm Socket.IO server availability and CORS configuration.
- Post moderation errors: ensure moderation config loads before submission; handle 403 TERMS_NOT_ACCEPTED by prompting term acceptance.
- Session validation errors: onboarding errors should trigger sign-out and prompt re-authentication.

**Section sources**
- [env.ts](file://web/src/config/env.ts#L4-L28)
- [auth-client.ts](file://web/src/lib/auth-client.ts#L9-L19)
- [CreatePost.tsx](file://web/src/components/general/CreatePost.tsx#L163-L219)
- [page.tsx](file://web/src/app/(root)/auth/signin/page.tsx#L56-L93)

## Conclusion
The web application frontend leverages Next.js App Router with nested route groups, a robust UI built from general social components and UI primitives, and a cohesive state management strategy using Zustand. Authentication is powered by Better Auth with Google OAuth, while real-time features integrate via Socket.IO. The design is responsive, styled with Tailwind CSS, and structured for maintainability and scalability.