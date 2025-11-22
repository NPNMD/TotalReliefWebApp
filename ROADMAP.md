# Project Roadmap: Medical Video Supervision & Paging System

**Status:** Phase 1 (MVP) - Initialization
**Based on:** Technical Design Document v1.0

---

## 🚀 Phase 1: MVP (Minimum Viable Product)
**Goal:** Deliver core video calling, presence tracking, and FCM push notifications for 8 facilities and supervisors.

### 1. Foundation & Infrastructure
- [x] **Project Setup**
    - [x] Initialize Firebase Project (`totalreliefmd`)
    - [x] Initialize React App (Vite, TypeScript, TailwindCSS)
    - [x] Configure Directory Structure (Feature-based modular architecture)
    - [ ] Set up GitHub Repository & CI/CD Actions
    - [x] Configure Environment Variables (.env) ✅

**Status:** ✅ 80% Complete - Infrastructure is solid. Missing GitHub CI/CD setup.

### 2. Authentication & User Management
- [-] **Firebase Auth Integration**
    - [x] Implement Authentication Context/Provider
    - [x] Create Login Page (Email/Password)
    - [x] Implement Password Reset Flow ✅
    - [ ] Implement "Remember Me" Persistence
- [-] **Role-Based Access Control (RBAC)**
    - [x] Define Firestore Security Rules (proper RBAC implemented) ✅
    - [x] Implement Custom Claims (Admin, Supervisor, Facility) (Simulated via Firestore Profile)
    - [x] Create "Unauthorized" / Protected Route wrappers
- [-] **Admin User Management**
    - [x] Create Admin Dashboard Layout
    - [x] Implement "Create User" Form (no auto-email trigger yet)
    - [-] Build User List View (basic sorting, no filtering UI)
    - [-] Implement Edit/Delete/Disable User functions (Delete & Disable work, Edit missing)

**Status:** ⚠️ 65% Complete - Core auth works. Missing: password reset, proper security rules, edit users, filtering.

### 3. Real-Time Presence System
- [-] **Firestore Presence**
    - [x] Create `presence` collection schema (via hook logic)
    - [x] Implement `onDisconnect` hooks for offline detection (`usePresence` hook)
    - [x] Build "Heartbeat" mechanism (update lastSeen every 30s) ✅
    - [x] Handle "Idle" state detection (mouse/keyboard inactivity) ✅
- [-] **Roster UI**
    - [x] Build `UserCard` component with status indicators (basic implementation)
    - [x] Build `RosterList` with real-time subscriptions (functional)
    - [ ] Implement filtering (Show only Available, etc.)

**Status:** ⚠️ 50% Complete - Basic presence tracking works via onDisconnect. Missing: heartbeat, idle detection, status filtering.

### 4. Video Communication (Daily.co)
- [-] **Integration**
    - [-] Set up Daily.co Domain & API Keys (requires VITE_DAILY_API_KEY env var)
    - [x] Create `VideoProvider` wrapper for Daily-js
- [-] **Call Logic**
    - [x] Build "Call Initiation" Modal (Caller side)
    - [x] Build "Incoming Call" Modal (Recipient side)
    - [x] Implement Firestore `calls` collection for signaling state
    - [x] Handle Call Timeout logic (45s no answer) ✅
    - [-] Build Active Call Interface (relies on Daily.co's built-in UI, no custom controls)

**Status:** ⚠️ 70% Complete - Call flow implemented with modals and signaling. Missing: timeout logic, custom in-call controls. Needs Daily.co API key configuration.

### 5. Push Notifications (Firebase Cloud Messaging)
- [x] **FCM Infrastructure**
    - [x] Configure Firebase Cloud Messaging in Firebase project
    - [x] Create service worker (firebase-messaging-sw.js) for background notifications
    - [x] Implement FCM token registration on user login
    - [x] Create Firebase Cloud Function for FCM push triggers
- [x] **Notification Logic**
    - [x] Request notification permission on first login (company policy)
    - [x] Trigger FCM push on "Missed Call" (Timeout)
    - [x] Trigger FCM push on "No Acknowledgement" (5s delay)
    - [ ] Implement rich notifications with action buttons (Answer/Decline)
    - [ ] Handle notification click actions (open app, answer/decline)
- [ ] **User Settings & Management**
    - [ ] Create notification preferences page
    - [ ] Display FCM token registration status
    - [ ] Implement "Test Push Notification" button
    - [x] Track multiple device tokens per user (fcmTokens array in UserProfile)
    - [ ] Handle token expiry and automatic refresh
- [x] **PWA Configuration**
    - [x] Configure manifest.json for PWA installation
    - [ ] Add install prompts for mobile employees
    - [ ] Optimize notification icons and badges

**Status:** ⚠️ 60% Complete - Core FCM infrastructure and Cloud Functions work. Missing: rich notifications, user settings UI, token refresh, install prompts.

### 6. Polish & QA
- [ ] **UI/UX Polish**
    - [-] Responsive design checks (Mobile/Tablet view - partial mobile support in DashboardLayout)
    - [x] Error handling & Toast notifications (react-hot-toast integrated) ✅
- [ ] **Testing**
    - [ ] Unit Tests for critical logic
    - [ ] End-to-End (E2E) testing of Call Flow

**Status:** ❌ 10% Complete - Minimal polish. No formal testing infrastructure. Needs toast notifications, full responsive design, and test coverage.

---

## 📊 Phase 1 Overall Status: ~60% Complete

**What's Working:**
✅ Firebase project fully configured (Auth, Firestore, RTDB, FCM, Cloud Functions)
✅ Complete authentication flow with role-based access control
✅ Admin dashboard for user management (create, list, disable, delete)
✅ Real-time presence tracking with onDisconnect
✅ Video call infrastructure with Daily.co integration
✅ Call modals (incoming/outgoing) with Firestore signaling
✅ FCM push notification infrastructure and Cloud Functions
✅ Service worker for background notifications
✅ PWA manifest configured

**Major Gaps:**
❌ No password reset flow
❌ Firestore security rules are temporary (wide-open for auth users)
❌ No heartbeat mechanism for presence (only onDisconnect)
❌ No idle state detection
❌ Missing user filtering in roster
❌ Call timeout logic not implemented
❌ No custom in-call controls (using Daily.co defaults)
❌ No rich notifications with action buttons
❌ Missing notification settings UI
❌ No toast notification system
❌ Zero test coverage
❌ Incomplete responsive design
❌ Daily.co API key needs configuration

**Next Development Priorities:**
1. **Security:** Implement proper Firestore security rules with RBAC
2. **Call Timeout:** Add 45-second timeout logic for unanswered calls
3. **User Experience:** Integrate toast notification library (react-hot-toast or similar)
4. **Presence:** Add heartbeat mechanism and idle detection
5. **Settings:** Build notification preferences page
6. **Polish:** Password reset flow and user edit functionality

---

## 🛠 Phase 2: Enhancements (Post-MVP)
**Goal:** Improve usability, analytics, and reliability.

- [ ] **Analytics Dashboard**
    - [ ] Call volume charts
    - [ ] Usage statistics by facility
- [ ] **Quality of Life**
    - [ ] Advanced PWA features (offline mode, background sync)
    - [ ] Call quality ratings/feedback
    - [ ] Bulk User Import (CSV)
    - [ ] Custom notification sounds selection
    - [ ] Multi-device notification management

---

## 🔮 Phase 3: Advanced Features (Future)
**Goal:** Expand capabilities and scale.

- [ ] **Advanced Video**
    - [ ] Multi-party calls
    - [ ] Screen sharing
- [ ] **Integrations**
    - [ ] EHR Integration
    - [ ] Native Mobile Apps (React Native)

