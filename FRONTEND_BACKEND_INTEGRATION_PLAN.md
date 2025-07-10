# Frontend-Backend Integration Plan

**Last Updated:** 2025-06-24
**Status:** 🚧 In Progress

## Recent Updates
- ✅ **2025-06-24**: Implemented `/api/auth/refresh` and `/api/auth/me` endpoints
- ✅ **2025-06-24**: Created test page at `/test-auth` for validating auth flow
- ✅ **2025-06-24**: Resolved critical blocker - token refresh now working
- ✅ **2025-06-24**: Implemented `/api/documents/{id}` and `/api/documents/{id}/download` endpoints
- ✅ **2025-06-24**: Created DocumentViewer component with PDF preview support
- ✅ **2025-06-24**: Connected View and Download buttons in documents page
- ✅ **2025-06-24**: Fixed accessibility warnings (added DialogTitle for screen readers)
- ✅ **2025-06-24**: Fixed params await issue in Next.js 15 dynamic routes
- ✅ **2025-06-24**: Improved image viewing with scrollable container
- ⚠️ **2025-06-24**: Note: Some Excel files auto-download due to backend Content-Disposition headers
- ✅ **2025-06-24**: Created unified FileUpload component with progress tracking
- ✅ **2025-06-24**: Implemented batch upload endpoint `/api/upload/batch`
- ✅ **2025-06-24**: Implemented upload task status endpoint `/api/upload/task/[taskId]`
- ✅ **2025-06-24**: Connected upload functionality to Documents page
- ✅ **2025-06-24**: **Phase 4 Started** - Created `/chat` page with streaming interface
- ✅ **2025-06-24**: Implemented `/api/chat` and `/api/chat/stream` endpoints with SSE support
- ✅ **2025-06-24**: Created advanced `/search` page with filters and pagination
- ✅ **2025-06-24**: Updated sidebar navigation with new sections and pages

This document provides a comprehensive mapping of all frontend pages to their backend API endpoints, tracking what's complete, what's in progress, and what's blocked.

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Pages Status Overview](#pages-status-overview)
3. [Detailed Page Analysis](#detailed-page-analysis)
4. [API Routes Implementation Status](#api-routes-implementation-status)
5. [Missing Features & Blockers](#missing-features--blockers)
6. [Implementation Roadmap](#implementation-roadmap)
7. [Technical Debt & Improvements](#technical-debt--improvements)

---

## Executive Summary

### Current State
- **Total Pages Identified:** 35 (14 existing + 21 needed)
- **Fully Functional:** 11 pages (31%) ⬆️ +2
- **Partially Functional:** 2 pages (6%)
- **Not Built Yet:** 22 pages (63%) ⬇️ -2

### Key Findings
1. Authentication flow is complete and working with token refresh
2. Document management is now fully functional with view/download capabilities
3. Team/organization features need API implementation
4. Search works but lacks advanced features (suggestions, history)
5. Chat/AI features not implemented yet

---

## Pages Status Overview

### ✅ Fully Functional Pages (11)
1. `/login` - Authentication working
2. `/signup` - Registration with invite handling
3. `/forgot-password` - Password reset request
4. `/invite` - Invitation acceptance flow
5. `/check-domain` - Domain verification
6. `/waitlist` - Waitlist signup
7. `/onboarding` - Onboarding dashboard
8. `/onboarding/invite-team` - Team invitation sending
9. `/documents` - Full document management with view/download
10. `/chat` - AI assistant with streaming responses
11. `/search` - Advanced search with filters and pagination

### ⚠️ Partially Functional Pages (2)
1. `/dashboard` - Search works, missing recent searches & file upload
2. `/onboarding/first-integration` - Upload endpoint needs verification

### ❌ Not Built Yet (22)

#### Core User Features
1. `/profile` - User profile management (avatar, name, email)
2. `/settings` - Main settings page
3. `/settings/security` - Password change, 2FA settings
4. `/settings/account` - Account management, deletion
5. `/reset-password` - Complete password reset flow
6. `/verify-email` - Email verification page

#### Team & Organization
7. `/team` - Team member list and management
8. `/team/invites` - Manage pending invitations
9. `/organization` - Organization settings and info
10. `/organization/members` - Organization-wide member list

#### Document Features
11. `/documents/[id]` - Single document viewer with AI chat
12. `/documents/upload` - Dedicated upload page
13. `/saved` - Bookmarked/saved documents
14. `/recents` - Recently viewed documents
15. `/history` - Search and activity history

#### Integrations
16. `/connections` - List all connections
17. `/connections/new` - Create new connection
18. `/connections/[id]` - Connection details & sync management
19. `/integrations` - Available integrations catalog

#### Admin & Monitoring
20. `/admin` - Admin dashboard (role-based)
21. `/admin/monitoring` - System health and sync status

#### Additional Pages
22. `/notifications` - Notification center

---

## Detailed Page Analysis

### 1. Login Page (`/login`)
**Status:** ✅ Fully Functional

**Current API Connections:**
- `POST /api/auth/login` ✅
  - Sends: `email`, `password`, `rememberMe`
  - Returns: Authentication cookie
  - Error handling: Rate limiting, invalid credentials

**Implementation Notes:**
- Uses server-side API route as proxy
- Proper error handling with status codes
- Redirects to dashboard on success

---

### 2. Signup Page (`/signup`)
**Status:** ✅ Fully Functional

**Current API Connections:**
- `POST /api/auth/signup` ✅
  - Sends: User details, company info, invite token
  - Returns: Success/error with status codes
- `POST /api/auth/check-domain` ✅
  - Checks if company exists for domain
- `GET /api/invites/validate` ✅
  - Validates invitation tokens

**Implementation Notes:**
- Smart routing for company creation vs joining
- Invite flow properly integrated
- Terms acceptance tracked

---

### 3. Dashboard Page (`/dashboard`)
**Status:** ⚠️ Partially Functional

**Current API Connections:**
- `POST /api/search/full` ✅
  - Full-text search with results

**Missing Connections:**
- Recent searches API ❌
  - Currently using `mockRecentSearches`
  - Need: `GET /api/search/history` or client-side storage
- File attachment upload ❌
  - UI exists but not connected
  - Need: `POST /api/upload` connection

**UI Elements Without Backend:**
- Recent searches section
- File attachment button
- Search filters (not implemented)

---

### 4. Documents Page (`/documents`)
**Status:** ✅ Fully Functional

**Current API Connections:**
- `GET /api/documents` ✅
  - Pagination, sorting, filtering
  - Returns document list with metadata
- `GET /api/documents/{id}` ✅
  - Get single document details
- `GET /api/documents/{id}/download` ✅
  - Download document with optional `?view=true` parameter
  - View mode shows PDFs inline, images in scrollable container

**Implementation Notes:**
- DocumentViewer component handles different file types
- PDFs display inline in iframe
- Images display in scrollable container
- Non-previewable files show download prompt
- Fixed Next.js 15 params await requirements
- Added accessibility improvements (DialogTitle)

**Known Issues:**
- Some Excel files auto-download due to backend Content-Disposition headers
- Bookmark functionality still needs API endpoint

**Missing Connections:**
- Bookmark/save document ❌
  - Need: New endpoint or document update
  - Toast shows "Bookmark feature coming soon!"

---

### 5. Onboarding Pages
#### 5.1 Main Onboarding (`/onboarding`)
**Status:** ✅ Fully Functional

**Current API Connections:**
- `GET /api/onboarding/status` ✅
- `GET /api/users/profile` ✅

#### 5.2 First Integration (`/onboarding/first-integration`)
**Status:** ⚠️ Partially Functional

**Current API Connections:**
- `GET /api/users/profile` ✅
- `POST /api/upload` ⚠️ (implemented but needs testing)
- `POST /api/onboarding/complete-step` ✅
- `POST /api/onboarding/skip-step` ✅

**Issues:**
- Upload endpoint exists but may not handle all file types
- No progress tracking for document processing
- No error handling for failed uploads

#### 5.3 Invite Team (`/onboarding/invite-team`)
**Status:** ✅ Fully Functional

**Current API Connections:**
- `GET /api/users/profile` ✅
- `POST /api/invites/send` ✅
- `POST /api/onboarding/complete-step` ✅
- `POST /api/onboarding/skip-step` ✅

---

### 6. Other Pages

#### Check Domain (`/check-domain`)
**Status:** ✅ Fully Functional
- `POST /api/auth/check-domain` ✅

#### Forgot Password (`/forgot-password`)
**Status:** ✅ Fully Functional
- `POST /api/auth/forgot-password` ✅

#### Invite (`/invite`)
**Status:** ✅ Fully Functional
- `GET /api/invites/validate` ✅
- Redirects to signup with token

#### Waitlist (`/waitlist`)
**Status:** ✅ Fully Functional
- `POST /api/waitlist` ✅

---

## Pages That Need to Be Built

### 1. User Profile & Settings Pages

#### `/profile` - User Profile Page
**Required API Endpoints:**
- `GET /api/users/profile` ✅ (exists)
- `PATCH /api/users/profile` ❌
- `POST /api/users/upload-avatar` ❌
- `DELETE /api/users/avatar` ❌

**Features:**
- View and edit profile information
- Upload/change avatar
- View role and organization info

#### `/settings/security` - Security Settings
**Required API Endpoints:**
- `POST /api/auth/change-password` ❌
- `POST /api/auth/change-email` ❌
- `GET /api/auth/me` ❌

**Features:**
- Change password
- Change email address
- Enable 2FA (future)

#### `/reset-password` - Password Reset Completion
**Required API Endpoints:**
- `POST /api/auth/reset-password` ❌

**Features:**
- Complete password reset after clicking email link
- Token validation
- New password form

### 2. Team & Organization Pages

#### `/team` - Team Management
**Required API Endpoints:**
- `GET /api/team/members` ❌
- `PATCH /api/team/members/{id}/role` ❌
- `DELETE /api/team/members/{id}` ❌
- `GET /api/team/stats` ❌

**Features:**
- List all team members
- Change member roles (admin only)
- Remove team members (admin only)
- View team statistics

#### `/team/invites` - Invitation Management
**Required API Endpoints:**
- `GET /api/invites/list` ❌
- `DELETE /api/invites/{id}` ❌
- `POST /api/invites/resend/{id}` ❌

**Features:**
- View pending invitations
- Revoke invitations
- Resend invitations

#### `/organization` - Organization Settings
**Required API Endpoints:**
- `GET /api/organizations/current` ❌
- `PATCH /api/organizations/current` ❌
- `GET /api/organizations/members` ❌

**Features:**
- View/edit organization info
- Manage organization settings
- View all members across teams

### 3. Document Feature Pages

#### `/documents/[id]` - Document Detail Page
**Required API Endpoints:**
- `GET /api/documents/{id}` ❌
- `GET /api/documents/{id}/download` ❌
- `POST /api/chat` ❌
- `POST /api/chat/stream` ❌

**Features:**
- View document content
- Download original file
- Chat with document using AI
- View document metadata

#### `/documents/upload` - Dedicated Upload Page
**Required API Endpoints:**
- `POST /api/upload` ✅ (exists)
- `POST /api/upload/batch` ❌
- `GET /api/upload/task/{id}` ❌

**Features:**
- Drag & drop upload
- Batch upload multiple files
- Upload progress tracking
- Processing status

### 4. AI & Search Pages

#### `/chat` - AI Assistant Interface
**Required API Endpoints:**
- `POST /api/chat` ❌
- `POST /api/chat/stream` ❌
- `GET /api/documents` ✅ (for context)

**Features:**
- Full-screen chat interface
- Streaming responses
- Document citations
- Conversation history

#### `/search` - Advanced Search Page
**Required API Endpoints:**
- `POST /api/search/instant` ❌
- `POST /api/search/full` ✅ (exists)
- `GET /api/search/suggestions` ❌
- `GET /api/documents/filter-options` ❌

**Features:**
- Advanced filters
- Search suggestions
- Save searches
- Export results

### 5. Integration Pages

#### `/connections` - Connection List
**Required API Endpoints:**
- `GET /api/connections` ❌
- `DELETE /api/connections/{id}` ❌
- `PATCH /api/connections/{id}/pause` ❌
- `PATCH /api/connections/{id}/resume` ❌

**Features:**
- List all connections
- Connection status
- Pause/resume syncs
- Delete connections

#### `/connections/new` - Create Connection
**Required API Endpoints:**
- `GET /api/connectors` ❌
- `POST /api/connectors/test-connection` ❌
- `POST /api/connections` ❌
- `GET /api/oauth/authorize/{type}` ❌

**Features:**
- Select connector type
- OAuth flow or credentials
- Test connection
- Configure initial sync

#### `/connections/[id]` - Connection Details
**Required API Endpoints:**
- `GET /api/connections/{id}` ❌
- `PUT /api/connections/{id}` ❌
- `GET /api/syncs?connection_id={id}` ❌
- `POST /api/syncs` ❌
- `GET /api/syncs/{id}/jobs` ❌

**Features:**
- Connection configuration
- Sync management
- Job history
- Error logs

### 6. Admin Pages

#### `/admin` - Admin Dashboard
**Required API Endpoints:**
- `GET /api/monitoring/health` ❌
- `GET /api/team/stats` ❌
- `GET /api/organizations/current` ❌

**Features:**
- System overview
- User statistics
- Document statistics
- Recent activity

#### `/admin/monitoring` - System Monitoring
**Required API Endpoints:**
- `GET /api/monitoring/health` ❌
- `GET /api/monitoring/sync-jobs` ❌
- `GET /api/monitoring/connectors` ❌
- `GET /api/monitoring/credentials/expiring` ❌

**Features:**
- System health status
- Sync job monitoring
- Connector health
- Expiring credentials alerts

---

## API Routes Implementation Status

### ✅ Implemented Routes (24)
```
/api/auth/check-domain
/api/auth/forgot-password
/api/auth/login
/api/auth/logout
/api/auth/me ✅ NEW
/api/auth/refresh ✅ NEW
/api/auth/signup
/api/chat ✅ NEW
/api/chat/stream ✅ NEW
/api/documents
/api/documents/[id] ✅ NEW
/api/documents/[id]/download ✅ NEW
/api/invites/send
/api/invites/validate
/api/onboarding/complete-step
/api/onboarding/skip-step
/api/onboarding/status
/api/search/full
/api/upload
/api/upload/batch ✅ NEW
/api/upload/task/[taskId] ✅ NEW
/api/users/profile
/api/waitlist
```

### ❌ Missing Critical Routes (19)
#### Authentication & User
- `/api/auth/reset-password` - Complete password reset
- `/api/auth/change-password` - Change password
- `/api/auth/change-email` - Change email
- `/api/users/upload-avatar` - Avatar upload
- `/api/users/account` - Account management

#### Documents
- `/api/documents/filter-options` - Filter options
- `/api/documents/bulk` - Bulk operations

#### Team & Organization
- `/api/team/members` - List members
- `/api/team/members/{id}` - Member operations
- `/api/team/stats` - Team statistics
- `/api/organizations/current` - Current org
- `/api/organizations/members` - Org members

#### Search
- `/api/search/instant` - Instant search
- `/api/search/suggestions` - Autocomplete

#### Integrations
- `/api/connections/*` - All connection endpoints
- `/api/connectors/*` - All connector endpoints
- `/api/oauth/*` - OAuth flow endpoints
- `/api/syncs/*` - Sync management

---

## Missing Features & Blockers

### 🚨 Critical Blockers
1. **~~No refresh token implementation~~** ✅ RESOLVED
   - ~~Users will be logged out after token expires~~
   - ~~`api-client.ts` expects `/api/auth/refresh`~~
   - Implemented both `/api/auth/refresh` and `/api/auth/me`

2. **~~Document operations broken~~** ✅ RESOLVED
   - ~~Can't view or download documents~~
   - ~~Core functionality unusable~~
   - Implemented view and download endpoints with inline PDF viewer

3. **~~No file upload progress~~** ✅ RESOLVED
   - ~~Large files appear frozen~~
   - ~~No feedback on processing status~~
   - Implemented FileUpload component with real-time progress
   - Added task status polling for processing feedback

### 🔶 High Priority Missing Features
<!-- 1. **Search enhancements**
   - Recent searches
   - Search suggestions
   - Search history -->

1. **User profile management**
   - Change password
   - Upload avatar
   - Update profile

2. **Team management**
   - View team members
   - Manage roles
   - Remove members

### 🟡 Medium Priority Missing Features
1. **Document bookmarks/favorites**
2. **Bulk document operations**
3. **Integration management UI**
4. **Organization settings**

---

## Implementation Roadmap

### Phase 1: Critical Fixes (Week 1)
1. **Day 1-2: Authentication** ✅ COMPLETED
   - [x] Implement `/api/auth/refresh`
   - [x] Implement `/api/auth/me`
   - [x] Test token refresh flow (created test page at `/test-auth`)

2. **Day 3-4: Document Operations** ✅ COMPLETED
   - [x] Implement `/api/documents/{id}`
   - [x] Implement `/api/documents/{id}/download` with view support
   - [x] Connect UI buttons to endpoints
   - [x] Create DocumentViewer component for inline viewing

3. **Day 5: Upload & Progress** ✅ COMPLETED
   - [x] Verify `/api/upload` works correctly
   - [x] Add `/api/upload/task/{id}` for progress tracking
   - [x] Add `/api/upload/batch` for multiple files
   - [x] Implement unified FileUpload component with progress UI
   - [x] Connect upload to Documents page

### Phase 2: Core Features (Week 2)
1. **Search Enhancements**
   - [ ] Implement search suggestions
   - [ ] Add search history (client-side or API)
   - [ ] Connect instant search

2. **User Profile**
   - [ ] Password change
   - [ ] Email change
   - [ ] Avatar upload

3. **Team Features**
   - [ ] Team member list
   - [ ] Role management
   - [ ] Member removal

### Phase 3: Core Pages (Week 3)
1. **User Management Pages**
   - [ ] Create `/profile` page
   - [ ] Create `/settings/security` page
   - [ ] Create `/reset-password` page

2. **Team Pages**
   - [ ] Create `/team` page
   - [ ] Create `/team/invites` page
   - [ ] Implement role management

3. **Document Pages**
   - [ ] Create `/documents/[id]` viewer
   - [ ] Create `/documents/upload` page
   - [ ] Implement document chat

### Phase 4: Advanced Features (Week 4-5)
1. **AI & Search** ✅ COMPLETED
   - [x] Create `/chat` interface
   - [x] Create `/search` advanced page
   - [x] Implement streaming responses

2. **Integration Management**
   - [ ] Create `/connections` list
   - [ ] Create `/connections/new` page
   - [ ] Create `/connections/[id]` details
   - [ ] Implement OAuth flows

3. **Admin Features**
   - [ ] Create `/admin` dashboard
   - [ ] Create `/admin/monitoring` page
   - [ ] Implement health checks

### Phase 5: Organization Features (Week 6)
1. **Organization Management**
   - [ ] Create `/organization` settings
   - [ ] Create `/organization/members` page
   - [ ] Implement member management

2. **Additional Features**
   - [ ] Create saved documents page
   - [ ] Create recent documents page
   - [ ] Create search history page
   - [ ] Create notifications system

---

## Priority Matrix for New Pages

### 🔴 Critical Priority (Business Core)
These pages are essential for basic product functionality:

1. **Document Viewer** (`/documents/[id]`)
   - Core feature - users need to view documents
   - Chat with documents is key differentiator

2. **User Profile** (`/profile`)
   - Basic user management requirement
   - Avatar and profile updates

3. **Team Management** (`/team`)
   - Essential for B2B product
   - Role-based access control

4. **Password Reset** (`/reset-password`)
   - Security requirement
   - Complete the auth flow

### 🟠 High Priority (User Experience)
These enhance the core experience significantly:

1. **AI Chat** (`/chat`)
   - Key product differentiator
   - Central to value proposition

2. **Advanced Search** (`/search`)
   - Power user feature
   - Better than dashboard search

3. **Connections** (`/connections/*`)
   - Integration is key for data ingestion
   - Competitive advantage

4. **Upload Page** (`/documents/upload`)
   - Better UX for bulk uploads
   - Progress tracking

### 🟡 Medium Priority (Growth & Retention)
These help with user retention and growth:

1. **Organization Settings** (`/organization`)
   - Important for admins
   - Company customization

2. **Security Settings** (`/settings/security`)
   - User trust and compliance
   - Password/email changes

3. **Saved Documents** (`/saved`)
   - User workflow improvement
   - Quick access to important docs

4. **Admin Dashboard** (`/admin`)
   - Operational visibility
   - Usage analytics

### 🟢 Low Priority (Nice to Have)
These can wait until core features are solid:

1. **Recent Documents** (`/recents`)
   - Convenience feature
   - Can use search instead

2. **Search History** (`/history`)
   - Power user feature
   - Not critical path

3. **Notifications** (`/notifications`)
   - Can use email for now
   - Future enhancement

4. **System Monitoring** (`/admin/monitoring`)
   - Internal tool
   - Can use backend directly

---

## Unified Upload Component

### Overview
Created a reusable `FileUpload` component that provides consistent upload functionality across the application.

### Features
- **Drag & Drop**: Full dropzone support with visual feedback
- **Multiple Files**: Support for single or batch uploads
- **Progress Tracking**: Real-time upload progress with task status polling
- **File Type Validation**: Configurable accepted file types
- **Size Limits**: Configurable max file size
- **Error Handling**: Per-file error states and messages
- **Responsive Design**: Works on mobile and desktop

### Implementation Locations
1. **Documents Page** ✅
   - Upload button in header
   - Upload button in empty state
   - Uses FileUploadDialog wrapper

2. **Dashboard Page** 🔄 (Pending)
   - Paperclip icon needs connection
   - Can use compact mode for inline attachment

3. **Onboarding Page** ✅
   - Already has custom implementation
   - Could be refactored to use unified component

### API Endpoints
- `/api/upload` - Single file upload
- `/api/upload/batch` - Multiple file upload
- `/api/upload/task/[taskId]` - Upload progress tracking

### Usage Example
```tsx
<FileUploadDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  onUploadComplete={handleUploadComplete}
  maxFiles={10}
  maxSize={10 * 1024 * 1024} // 10MB
/>
```

---

## Technical Debt & Improvements

### 🔧 Code Quality
1. **API Client Improvements**
   - Centralize API calls in hooks
   - Better error handling
   - Request cancellation

2. **Type Safety**
   - Generate types from OpenAPI spec
   - Strict type checking for API responses

3. **Performance**
   - Implement request caching
   - Add optimistic updates
   - Lazy load heavy components

### 🎨 UX Improvements
1. **Loading States**
   - Skeleton loaders for all data fetching
   - Progress indicators for long operations

2. **Error Handling**
   - User-friendly error messages
   - Retry mechanisms
   - Offline support

3. **Accessibility**
   - Keyboard navigation
   - Screen reader support
   - ARIA labels

### 📊 Monitoring
1. **API Monitoring**
   - Track failed requests
   - Monitor response times
   - Alert on errors

2. **User Analytics**
   - Track feature usage
   - Monitor user flows
   - Identify pain points

---

## Sidebar Navigation Updates

The current sidebar needs updates to accommodate new pages. Here's the proposed structure:

### Main Navigation
```
🏠 Dashboard (/)
📄 Documents (/documents)
💬 Chat (/chat)
🔍 Search (/search)
```

### Library Section
```
📑 All Documents (/documents)
⭐ Saved (/saved)
🕒 Recent (/recents)
📊 History (/history)
```

### Workspace Section
```
👥 Team (/team)
🔌 Connections (/connections)
🏢 Organization (/organization)
```

### User Menu (Top Right)
```
👤 Profile (/profile)
⚙️ Settings
  - Security (/settings/security)
  - Account (/settings/account)
  - Preferences (/settings/preferences)
🛡️ Admin (/admin) - if user is admin
🚪 Logout
```

### Focus Spaces (Remove or Implement)
Currently shows mock data - either:
1. Remove this section entirely
2. Implement as saved searches or document collections
3. Convert to "Quick Access" with pinned documents

---

## Appendix: API Endpoint Mapping

### Backend to Frontend Mapping
| Backend Endpoint | Frontend Usage | Status |
|-----------------|----------------|---------|
| POST /api/v1/auth/login | /login | ✅ |
| POST /api/v1/auth/signup | /signup | ✅ |
| POST /api/v1/auth/refresh | Auto-refresh | ❌ |
| GET /api/v1/documents | /documents | ✅ |
| GET /api/v1/documents/{id} | Document view | ❌ |
| POST /api/v1/search/full | /dashboard | ✅ |
| POST /api/v1/upload | /onboarding/first-integration | ⚠️ |

### Frontend to Backend Requirements
| Frontend Feature | Required Endpoints | Priority |
|-----------------|-------------------|----------|
| Document View | GET /api/documents/{id} | Critical |
| Document Download | GET /api/documents/{id}/download | Critical |
| Token Refresh | POST /api/auth/refresh | Critical |
| Search History | GET /api/search/history | High |
| Team Management | GET/POST/PATCH /api/team/* | High |
| User Settings | PATCH /api/users/profile | Medium |

---

**Note:** This is a living document. Update it as implementation progresses or requirements change.