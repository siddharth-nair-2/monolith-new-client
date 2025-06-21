# 🎨 Complete Frontend Pages Guide

## 🔐 Role Hierarchy & Permissions

### User Roles
1. **Admin** - Full administrative access, can manage team and all settings
2. **Member** - Basic access, cannot manage team or send invites

### Important Notes
- **Company Joining**: Users CANNOT join an existing company without an invite
- **Domain Protection**: If a company exists for a domain (e.g., @acme.com), new users with that domain must be invited
- **First User**: Always becomes the "admin" of a new company

## 📋 Table of Contents
1. [Public Pages (No Auth)](#public-pages-no-auth)
2. [Authentication Flow Pages](#authentication-flow-pages)
3. [Onboarding Flow Pages](#onboarding-flow-pages)
4. [Main Application Pages](#main-application-pages)
5. [Admin-Only Pages](#admin-only-pages)
6. [Utility Pages](#utility-pages)
7. [Page Components & States](#page-components--states)

---

## 🌐 Public Pages (No Auth)

### 1. Landing Page (`/`)
**Purpose**: Marketing page introducing the product
- Hero section with product value proposition
- Feature showcase
- Pricing information
- Call-to-action buttons (Sign Up, Login)
- Footer with links

### 2. Sign Up Page (`/signup`)
**Purpose**: New user registration

**Query Parameters**:
- `?invite_token={jwt}` - When joining via invite
- `?email={email}` - Pre-fill email from domain check

**Access**: Public (no auth required)

**Two Distinct Flows**:

#### Flow A: Creating New Company (Becomes Admin)
**When**: No invite_token parameter OR user has generic email domain
- **Required Fields**:
  - Email, Password, Confirm Password
  - First Name, Last Name
  - Company Name (required)
  - Company Size dropdown (optional): "1-10", "11-50", "51-200", "201-500", "500+"
  - Industry dropdown (optional)
- **Validation**:
  - If non-generic domain (e.g., @acme.com), check if company exists
  - If company exists for domain → Show error: "A company workspace already exists for {domain}. Please request an invite from your admin."
  - If no company exists → Allow creation
- **Result**: User becomes "admin" of new company

#### Flow B: Joining Existing Company (Via Invite)
**When**: invite_token parameter is present
- **Required Fields**:
  - Email (must match invite)
  - Password, Confirm Password
  - First Name, Last Name
- **Validation**:
  - Token must be valid and not expired
  - Email must match the one in invite
  - Show company name from invite
- **Result**: User joins company with role from invite (member/admin)

**Additional Features**:
- Password strength indicator
- Terms of service checkbox
- Link to login page
- Domain validation in real-time
- Show invite details if token present

### 3. Login Page (`/login`)
**Purpose**: User authentication
- Email and password fields
- Remember me checkbox
- Forgot password link
- Sign up link
- Social login options (future)
- Error messages for invalid credentials

### 4. Domain Check Page (`/check-domain`)
**Purpose**: Pre-signup validation to check if company exists

**Access**: Public (no auth required)

**API Endpoint**: `POST /api/v1/auth/check-domain`

**Features**:
- Email input field
- Check button
- **Results Display**:
  - If company exists for domain:
    - Show company name
    - Message: "A workspace exists for {domain}"
    - Action: "Request an invite from your admin"
    - Cannot proceed to signup without invite
  - If no company exists:
    - Message: "No workspace found for {domain}"
    - Action: "Create new workspace" → Redirect to `/signup?email={email}`
  - If generic domain (gmail, yahoo, etc.):
    - Message: "Personal email detected"
    - Action: "Create new workspace" → Redirect to `/signup?email={email}`

**Note**: This page prevents unauthorized access to existing companies

### 5. Invite Validation Page (`/invite`)
**Purpose**: Validate and display invite details

**Query Parameters**:
- `?token={jwt}` - Required invite token

**Access**: Public (no auth required)

**API Endpoint**: `GET /api/v1/invites/validate?token={jwt}`

**Display Information**:
- Company name
- Inviter name (who sent the invite)
- Email address (that the invite was sent to)
- Role being offered (member/admin)
- Custom message (if any)
- Expiration status

**Actions**:
- **Accept**: Redirect to `/signup?invite_token={jwt}`
- **Decline**: Return to home page
- **If Expired**: Show message and option to contact admin

**Error States**:
- Invalid token: "This invite link is invalid"
- Expired token: "This invite has expired"
- Already used: "This invite has already been used"

---

## 🔐 Authentication Flow Pages

### 6. Forgot Password Page (`/forgot-password`)
**Purpose**: Initiate password reset
- Email input field
- Submit button
- Success message with email sent confirmation
- Link back to login

### 7. Reset Password Page (`/reset-password?token={token}`)
**Purpose**: Complete password reset
- New password field
- Confirm password field
- Password strength indicator
- Submit button
- Success redirect to login

### 8. Email Verification Page (`/verify-email?token={token}`)
**Purpose**: Verify email address
- Auto-verification on page load
- Success/failure message
- Redirect to appropriate page
- Resend verification option

### 9. Email Change Confirmation (`/confirm-email-change?token={token}`)
**Purpose**: Confirm email address change
- Display old and new email
- Confirm button
- Cancel option
- Security notice

---

## 📝 Onboarding Flow Pages

### 10. Onboarding Dashboard (`/onboarding`)
**Purpose**: Track onboarding progress
- Progress indicator (steps completed)
- Current step highlight
- Skip option for optional steps
- Step cards with status:
  - ✅ Completed
  - 🔄 In Progress
  - ⏭️ Skipped
  - 🔒 Locked
- Continue button to next incomplete step

### 11. Profile Setup Step (`/onboarding/profile`)
**Purpose**: Complete user profile
- Title/Role field
- Department dropdown
- Phone number (optional)
- Bio/About section
- Avatar upload
- LinkedIn profile (optional)
- Save & Continue button

### 12. Company Profile Step (`/onboarding/company`) - **Admin Only**
**Purpose**: Complete company setup
- Company logo upload
- Website URL
- Description
- Address fields
- Timezone selection
- Business hours
- Save & Continue button

### 13. Team Invite Step (`/onboarding/team`)
**Purpose**: Invite initial team members

**Access**:
- **Admins**: Full access to invite
- **Members**: Skip automatically or show "Ask your admin to invite team members"

**Features** (for Admins):
- Bulk email input (comma-separated or line-by-line)
- Role selection: member or admin
- Custom message textarea
- Preview of invites to be sent
- Send invites button
- Skip option (marks step as skipped)
- Show remaining invite quota (10 batches/hour)

### 14. First Document Upload (`/onboarding/documents`)
**Purpose**: Upload initial documents
- Drag-and-drop zone
- File browser button
- Supported formats display
- Upload progress bars
- Processing status
- Skip option
- Tips for organizing documents

### 15. Preferences Setup (`/onboarding/preferences`)
**Purpose**: Configure initial settings
- Notification preferences
- Default search settings
- UI preferences (theme, density)
- Language selection
- Save & Finish button

---

## 🏠 Main Application Pages

### 16. Dashboard/Home (`/dashboard`)
**Purpose**: Main landing after login
- Welcome message
- Quick stats widgets:
  - Documents processed
  - Team members
  - Recent activity
- Quick search bar
- Recent documents carousel
- Suggested actions based on role
- Announcements/updates section

### 17. Search Page (`/search`)
**Purpose**: Document search interface
- Search bar with filters:
  - Date range
  - Document type
  - Owner/uploader
  - Tags
- Search type toggle (instant/full)
- Results list with:
  - Document title
  - Preview snippet
  - Relevance score
  - Source icon
  - Date
- Pagination
- Sort options (relevance, date, name)
- Save search option

### 18. Chat Interface (`/chat`)
**Purpose**: AI-powered Q&A with documents
- Chat message list
- Input box with send button
- Streaming response support
- Citations display with:
  - Source document
  - Relevant chunk
  - Confidence score
- Conversation history sidebar
- New conversation button
- Export conversation option
- Suggested questions

### 19. Documents Library (`/documents`)
**Purpose**: Document management
- Grid/List view toggle
- Document cards/rows showing:
  - Thumbnail/icon
  - Name
  - Type badge
  - Size
  - Upload date
  - Processing status
  - Actions menu
- Filters sidebar:
  - Status (processing, ready, failed)
  - Type (PDF, DOCX, etc.)
  - Date range
  - Size range
- Bulk actions toolbar
- Upload button
- Search within documents

### 20. Document Detail Page (`/documents/{id}`)
**Purpose**: Individual document view
- Document viewer/preview
- Metadata panel:
  - Full details
  - Processing info
  - Chunk count
  - ACL permissions
- Actions toolbar:
  - Download
  - Share
  - Delete
  - Edit permissions
- Activity log
- Related documents
- Back to library button

### 21. Upload Page (`/upload`)
**Purpose**: Document upload interface
- Drag-and-drop zone
- File selection button
- Upload queue with:
  - File names
  - Sizes
  - Progress bars
  - Cancel buttons
- Batch upload support
- Processing status tracker
- Success/error messages
- Continue to library button

### 22. User Profile Page (`/profile`)
**Purpose**: View/edit user profile
- Avatar display/upload
- Personal information form
- Password change section
- Email change section
- Notification preferences
- Connected accounts
- Activity history
- Save changes button

### 23. Account Settings (`/settings`)
**Purpose**: User account management
- Profile settings link
- Security settings:
  - Two-factor auth (future)
  - Active sessions
  - API keys (future)
- Privacy settings
- Data export options
- Delete account option

---

## 👥 Admin Pages

### 24. Team Management (`/team`)
**Purpose**: Manage team members

**Access**: All authenticated users can VIEW, but:
- **Admins**: Can update roles, remove members, send invites
- **Members**: Read-only access to team list

**Features**:
- Members table with:
  - Avatar
  - Name
  - Email
  - Role badge (Admin/Member)
  - Status (active, invited)
  - Last active
  - Actions (visible only to admins):
    - Update role
    - Remove from team
- Pending invites section (visible to all)
- Filters:
  - Role
  - Status
  - Department
- **Admin Only Actions**:
  - Invite new members button
  - Update member roles
  - Remove members
  - Resend/revoke invites
- Export members list (all users)

### 25. Member Detail Page (`/team/{userId}`)
**Purpose**: Individual member management

**Access**:
- **All users**: Can view profiles
- **Admins**: Can manage all members
- **Members**: View only

**Features**:
- Full profile view (all users)
- **Admin Actions**:
  - Update role (member ↔ admin)
  - Cannot change own role
  - Cannot demote last admin
  - Remove from team (cannot remove self)
- Activity history
- Document access log

### 26. Invites Management (`/invites`)
**Purpose**: Manage pending invites

**Access**: Admins only

**API Endpoints**:
- `GET /api/v1/invites/list` - View all invites
- `POST /api/v1/invites/send` - Send new invites
- `DELETE /api/v1/invites/{invite_id}` - Revoke invite
- `POST /api/v1/invites/resend/{invite_id}` - Resend invite

**Features**:
- Invites table with:
  - Email
  - Role (member/admin)
  - Invited by
  - Sent date
  - Status (pending/accepted/expired)
  - Expires at
  - Actions (resend, revoke)
- Filters:
  - Status (pending, accepted, expired)
  - Role
  - Date range
- Send invites form:
  - Bulk email input (up to 10 at once)
  - Role selection
  - Custom message (optional)
- Rate limit: 10 invite batches per hour

### 27. Team Statistics (`/team/stats`)
**Purpose**: Team analytics dashboard

**Access**: All authenticated users

**API Endpoint**: `GET /api/v1/team/stats`

**Displays**:
- Total members count
- Members by role breakdown
- Active vs invited members
- Team growth chart (if historical data available)
- Recent team activity
- Onboarding completion rates

### 28. Organization Settings (`/organization`)
**Purpose**: Company-wide settings

**Access**:
- **Admins**: Full access
- **Members**: No access

**Admin Features**:
- Company profile editing
- Billing information
- Subscription management
- Delete organization (with confirmations)
- Usage statistics
- Data retention settings

---

## 🛠️ Utility Pages

### 29. 404 Not Found (`/404`)
- Friendly error message
- Search suggestion
- Link to dashboard
- Contact support option

### 30. 403 Forbidden (`/403`)
- Permission denied message
- Explanation of required permissions
- Request access button
- Back to dashboard link

### 31. 500 Server Error (`/500`)
- Error message
- Retry button
- Status page link
- Contact support

### 32. Maintenance Page (`/maintenance`)
- Maintenance notice
- Expected duration
- Status updates
- Contact information

### 33. Loading States
- Skeleton screens for:
  - Document lists
  - Search results
  - Chat messages
  - Profile data
- Progress indicators for:
  - File uploads
  - Document processing
  - Bulk operations

---

## 🎯 Page Components & States

### Common Components Across Pages

1. **Navigation Header**
   - Logo/company name
   - Main navigation menu
   - Search bar (context-aware)
   - Notifications bell
   - User avatar dropdown
   - Help/support link

2. **User Menu Dropdown**
   - User name and role
   - Profile link
   - Settings link
   - Team link (admin only)
   - Logout option

3. **Notification Center**
   - Notification list
   - Mark as read
   - Notification settings link
   - Clear all option

4. **Footer** (public pages)
   - Company links
   - Legal links (privacy, terms)
   - Social media links
   - Contact information

5. **Breadcrumbs** (app pages)
   - Hierarchical navigation
   - Current page indicator

6. **Action Modals**
   - Confirmation dialogs
   - Form modals
   - Info/help modals
   - Success/error messages

### Mobile Considerations

All pages should have responsive versions with:
- Hamburger menu for navigation
- Touch-friendly interfaces
- Swipe gestures where appropriate
- Adjusted layouts for small screens
- Bottom navigation for key actions

### State Management Needs

1. **Global States**
   - User authentication status
   - User profile and permissions
   - Current tenant/company context
   - Notification count
   - Active uploads queue

2. **Page-Specific States**
   - Search filters and results
   - Chat conversation history
   - Document processing status
   - Form validation states
   - Pagination states

### Permission-Based UI

Elements that change based on user role:
- Admin menu items
- Bulk action buttons
- Settings access
- Team management features
- Invite capabilities
- Document permissions

### Real-time Updates

Pages requiring WebSocket/polling:
- Upload progress tracking
- Document processing status
- Chat streaming responses
- Team member activity
- Notification updates

---

## 📱 Progressive Web App Features

Consider implementing:
- Offline document viewing
- Push notifications
- App installation prompt
- Background sync for uploads
- Cached search results

---

## 🎨 Design System Needs

Consistent components across all pages:
- Typography scale
- Color palette (with dark mode)
- Icon library
- Button styles
- Form elements
- Cards and containers
- Tables and lists
- Modals and overlays
- Toast notifications
- Loading indicators

---

## 🔒 Access Control Summary

### Public Pages (No Auth Required)
- Landing page (`/`)
- Sign up (`/signup`)
- Login (`/login`)
- Domain check (`/check-domain`)
- Invite validation (`/invite`)
- Password reset flow pages
- Error pages (404, 500, etc.)

### Authenticated User Pages (All Roles)
- Dashboard (`/dashboard`)
- Search (`/search`)
- Chat (`/chat`)
- Documents library (`/documents`)
- Document details (`/documents/{id}`)
- Upload (`/upload`)
- Profile (`/profile`)
- Settings (`/settings`)
- Team list VIEW ONLY (`/team`)
- Team stats (`/team/stats`)
- Onboarding flow (`/onboarding/*`)

### Admin Only Pages
- Invites management (`/invites`)
- Team management actions (update roles, remove members)
- Organization settings (`/organization`)
- Company profile & billing
- Some onboarding steps (team invites, company profile)

---

## 🚨 Critical Implementation Notes

### 1. Signup Flow Restrictions
- **IMPORTANT**: Users CANNOT join existing companies without invites
- Domain checking prevents unauthorized company access
- First user always becomes admin
- Generic emails (gmail.com) can always create new companies

### 2. Role Hierarchy Enforcement
```
Admin > Member
```
- Admins can manage all team members
- Cannot demote the last admin
- Users cannot change their own role
- Admins can promote members to admin

### 3. Query Parameter Handling
Key pages that must handle query params:
- `/signup?invite_token={jwt}&email={email}`
- `/invite?token={jwt}`
- `/reset-password?token={token}`
- `/verify-email?token={token}`
- `/documents?status={status}&type={type}`
- `/search?q={query}&filters={filters}`

### 4. Rate Limiting Awareness
Display rate limit information for:
- Invites: 10 batches/hour
- Auth attempts: 5/15 min
- Uploads: 20 files/minute
- Chat: 10 messages/minute

### 5. Real-time Updates Required
- Document processing status
- Team member changes
- Invite status updates
- Chat streaming responses
- Upload progress

### 6. Multi-Tenant Isolation
Every API call includes tenant context:
- Documents are tenant-scoped
- Team members are tenant-scoped
- Search results are tenant-filtered
- No cross-tenant data leakage

### 7. Onboarding Flow
- Track completion per user
- Some steps are role-specific
- Steps can be skipped (optional)
- Progress persists across sessions

### 8. Error Handling
Always show appropriate messages for:
- Insufficient permissions (403)
- Resource not found (404)
- Rate limit exceeded (429)
- Server errors (500)
- Validation errors (400)