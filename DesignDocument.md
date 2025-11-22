# Technical Design Document (TDD)
## Medical Video Supervision & Paging System

**Version:** 1.0  
**Date:** November 21, 2025  
**Document Owner:** Dr. Nate  
**Status:** Initial Design

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Overview](#2-system-overview)
3. [User Roles & Permissions](#3-user-roles--permissions)
4. [Core Features & Functionality](#4-core-features--functionality)
5. [Technical Architecture](#5-technical-architecture)
6. [Technology Stack](#6-technology-stack)
7. [Database Schema](#7-database-schema)
8. [API & Integration Requirements](#8-api--integration-requirements)
9. [User Interface Specifications](#9-user-interface-specifications)
10. [User Flows](#10-user-flows)
11. [Security & Compliance](#11-security--compliance)
12. [Performance Requirements](#12-performance-requirements)
13. [Deployment Strategy](#13-deployment-strategy)
14. [Cost Analysis](#14-cost-analysis)
15. [Development Timeline](#15-development-timeline)
16. [Risk Assessment & Mitigation](#16-risk-assessment--mitigation)
17. [Future Enhancements](#17-future-enhancements)

---

## 1. Executive Summary

### 1.1 Purpose
This document outlines the technical specifications for a private, HIPAA-compliant medical video supervision and paging system designed to facilitate real-time video communication between medical facilities and on-call supervisors.

### 1.2 Problem Statement
Medical facilities require immediate access to qualified supervisors for consultations, guidance, and emergency decision-making. Traditional phone-based paging systems lack visual communication capabilities and presence awareness, leading to delays and inefficiencies in critical situations.

### 1.3 Solution Overview
A web-based application providing:
- Real-time presence tracking of available supervisors
- One-click video calling between facilities and supervisors
- FCM push notifications for missed calls
- Secure, admin-controlled user management
- Activity logging and audit trails

### 1.4 Target Users
- **8 Medical Facilities**: Staff requiring supervisor consultation
- **Supervisor Circle**: 3-5 physicians providing on-call supervision
- **System Administrator**: Individual managing user accounts and system configuration

### 1.5 Key Success Metrics
- Video call connection time: < 5 seconds
- System uptime: 99.9%
- FCM push notification delivery: < 3 seconds
- User satisfaction: > 4.5/5 rating
- Concurrent video calls supported: Minimum 4 simultaneous

---

## 2. System Overview

### 2.1 High-Level Description
A closed, invite-only web application enabling secure video communication between medical facilities and supervisors with real-time presence indication, persistent connectivity, and FCM push notifications.

### 2.2 Core System Components
1. **Web Application** (React-based SPA)
2. **Authentication Service** (Firebase Auth)
3. **Real-time Database** (Firebase Firestore)
4. **Video Communication Layer** (WebRTC or Daily.co SDK)
5. **Push Notification Service** (Firebase Cloud Messaging)
6. **Admin Dashboard** (React-based management interface)

### 2.3 System Boundaries
**In Scope:**
- User authentication and authorization
- Real-time presence tracking
- Video calling between users
- Push notifications (FCM)
- Call history and logging
- Admin user management
- Basic analytics dashboard

**Out of Scope (Phase 1):**
- Electronic Health Record (EHR) integration
- Call recording and storage
- Mobile native applications (web-responsive only)
- Multi-party conference calls (>2 participants)
- Screen sharing
- File transfer during calls
- Automated scheduling/on-call rotation

---

## 3. User Roles & Permissions

### 3.1 Role Definitions

#### 3.1.1 Administrator
**Description:** System owner with full control over user management and system configuration

**Permissions:**
- Create, read, update, delete (CRUD) all user accounts
- Assign/modify user roles and facilities
- View all system logs and analytics
- Configure system settings (push notification templates, notification rules)
- Reset user passwords
- Enable/disable user accounts
- Access all historical call data

**Restrictions:**
- Cannot delete own account
- Cannot modify audit logs

#### 3.1.2 Supervisor
**Description:** Medical professionals providing on-call supervision and consultation

**Permissions:**
- View all facility users and their online status
- Initiate video calls to any user
- Receive video calls from facility users
- View own call history
- Update own profile (display name, notification preferences)
- Set availability status (Available, Busy, Away, Offline)

**Restrictions:**
- Cannot access admin functions
- Cannot view other supervisors' private data
- Cannot create or delete users

#### 3.1.3 Facility User
**Description:** Staff at medical facilities requiring supervisor consultation

**Permissions:**
- View all supervisors and their online status
- Initiate video calls to supervisors
- Receive video calls from supervisors
- View own call history
- Update own profile (display name, notification preferences)
- Set availability status (Available, Busy, Away)

**Restrictions:**
- Cannot view or call other facility users (facility-to-facility calls disabled)
- Cannot access admin functions
- Cannot modify facility assignment

### 3.2 Permission Matrix

| Feature | Administrator | Supervisor | Facility User |
|---------|--------------|------------|---------------|
| Create Users | ✓ | ✗ | ✗ |
| Delete Users | ✓ | ✗ | ✗ |
| View All Users | ✓ | ✓ | ✓ (Supervisors only) |
| Initiate Call (to Supervisor) | ✓ | ✓ | ✓ |
| Initiate Call (to Facility) | ✓ | ✓ | ✗ |
| Receive Calls | ✓ | ✓ | ✓ |
| View All Call Logs | ✓ | ✗ | ✗ |
| View Own Call Logs | ✓ | ✓ | ✓ |
| Modify System Settings | ✓ | ✗ | ✗ |
| Set Availability Status | ✓ | ✓ | ✓ |
| Access Analytics Dashboard | ✓ | ✗ | ✗ |

---

## 4. Core Features & Functionality

### 4.1 User Authentication & Management

#### 4.1.1 Admin User Creation
**Description:** Administrators manually create user accounts through admin panel

**Functional Requirements:**
- FR-AUTH-001: Admin can create new user with email, temporary password, full name, role, and facility assignment
- FR-AUTH-002: System generates secure random password if admin doesn't specify one
- FR-AUTH-003: New users receive email with login credentials and password reset link
- FR-AUTH-004: Users must change temporary password on first login
- FR-AUTH-005: Admin can bulk import users via CSV template

**User Story:**
```
As an Administrator,
I want to create user accounts with specific roles and facility assignments,
So that I can control who has access to the system.
```

#### 4.1.2 User Login
**Description:** Secure authentication using email and password

**Functional Requirements:**
- FR-AUTH-006: Users log in with email and password
- FR-AUTH-007: System implements rate limiting (5 failed attempts = 15-minute lockout)
- FR-AUTH-008: "Remember Me" option extends session to 30 days
- FR-AUTH-009: Sessions expire after 8 hours of inactivity by default
- FR-AUTH-010: Failed login attempts are logged with IP address

**User Story:**
```
As a Facility User,
I want to securely log into the system,
So that I can access video supervision services.
```

#### 4.1.3 Password Management
**Functional Requirements:**
- FR-AUTH-011: Users can reset password via email link
- FR-AUTH-012: Passwords must meet complexity requirements (8+ chars, uppercase, lowercase, number, special char)
- FR-AUTH-013: Users can change password from profile settings
- FR-AUTH-014: System prevents password reuse (last 5 passwords)
- FR-AUTH-015: Admin can force password reset for any user

### 4.2 Real-Time Presence & Roster

#### 4.2.1 User Presence Tracking
**Description:** System displays real-time online/offline status of all users

**Functional Requirements:**
- FR-PRES-001: User status updates within 3 seconds of state change
- FR-PRES-002: System automatically detects and displays user connectivity status
- FR-PRES-003: Users can manually set status: Available, Busy, Away, Offline
- FR-PRES-004: "Busy" status is automatically set during active video calls
- FR-PRES-005: System detects tab/window visibility and updates presence accordingly
- FR-PRES-006: Idle timeout sets status to "Away" after 10 minutes of inactivity
- FR-PRES-007: System maintains presence connection with heartbeat (every 30 seconds)

**User Story:**
```
As a Facility User,
I want to see which supervisors are currently available,
So that I know who I can call for immediate assistance.
```

#### 4.2.2 User Roster Display
**Description:** List view of all users showing availability and key information

**Functional Requirements:**
- FR-ROST-001: Roster displays user name, facility, role, and current status
- FR-ROST-002: Facility users see only supervisors in their roster
- FR-ROST-003: Supervisors see all facility users and other supervisors
- FR-ROST-004: Roster updates in real-time without page refresh
- FR-ROST-005: Users can search/filter roster by name or facility
- FR-ROST-006: Online users appear at top of list
- FR-ROST-007: Roster indicates last seen time for offline users

**Status Indicators:**
- 🟢 Green: Available (online and ready for calls)
- 🟡 Yellow: Busy (in active call or manually set)
- 🟠 Orange: Away (idle or manually set)
- ⚫ Gray: Offline (logged out or disconnected)

### 4.3 Video Calling

#### 4.3.1 Call Initiation
**Description:** One-click video call initiation with automatic recipient notification

**Functional Requirements:**
- FR-CALL-001: User clicks "Call" button next to available recipient
- FR-CALL-002: System checks recipient availability before initiating call
- FR-CALL-003: Call request displays caller information to recipient
- FR-CALL-004: Recipient receives in-app notification with ring tone
- FR-CALL-005: Recipient has 45 seconds to accept or decline call
- FR-CALL-006: If recipient doesn't respond within 45 seconds, call times out
- FR-CALL-007: System sends FCM push notification to recipient if in-app notification not acknowledged within 5 seconds
- FR-CALL-008: Caller can cancel call request before recipient answers

**User Story:**
```
As a Facility User,
I want to initiate a video call with one click,
So that I can quickly connect with a supervisor in urgent situations.
```

#### 4.3.2 Video Call Experience
**Description:** High-quality, low-latency video and audio communication

**Functional Requirements:**
- FR-CALL-009: System establishes peer-to-peer WebRTC connection for optimal latency
- FR-CALL-010: Video resolution adapts to network conditions (360p to 1080p)
- FR-CALL-011: Audio bitrate: 32-64 kbps
- FR-CALL-012: Call interface displays caller/recipient name and facility
- FR-CALL-013: Call timer displays call duration
- FR-CALL-014: Users can mute/unmute microphone during call
- FR-CALL-015: Users can disable/enable camera during call
- FR-CALL-016: "End Call" button prominently displayed for both parties
- FR-CALL-017: System logs call start time, end time, duration, and participants

**Technical Requirements:**
- Video codec: VP9 or H.264
- Audio codec: Opus
- Maximum latency: 300ms
- Connection establishment time: < 5 seconds

#### 4.3.3 Call Termination & Handling
**Functional Requirements:**
- FR-CALL-018: Either party can end call at any time
- FR-CALL-019: System gracefully handles network disconnections
- FR-CALL-020: If call drops due to network issues, system attempts auto-reconnect for 30 seconds
- FR-CALL-021: User receives notification if call cannot be reconnected
- FR-CALL-022: Call metadata saved to database immediately upon termination
- FR-CALL-023: Users can rate call quality (optional, post-call survey)

### 4.4 Push Notifications (Firebase Cloud Messaging)

#### 4.4.1 FCM Push Notification Trigger Conditions
**Description:** Automated browser push notifications sent when in-app notifications are missed or users are not actively viewing the app

**Functional Requirements:**
- FR-FCM-001: Push notification sent if recipient doesn't acknowledge incoming call within 5 seconds
- FR-FCM-002: Push notification sent if call is missed entirely (timeout without answer)
- FR-FCM-003: Push notification includes caller name, facility, timestamp, and call actions
- FR-FCM-004: Push notification contains click action to open app and view/accept call
- FR-FCM-005: Users are prompted to grant notification permission on first login (company policy requires acceptance)
- FR-FCM-006: Admin can configure notification delay threshold (default: 5 seconds)
- FR-FCM-007: System prevents duplicate notifications for same call event
- FR-FCM-008: Rich notifications with action buttons ("Answer", "Decline") when supported by browser

**Push Notification Examples:**
```
Title: "Incoming Call from Dr. [Name]"
Body: "[Facility] - Click to answer"
Actions: [Answer] [Decline]
Icon: Caller profile picture
Badge: Unread call count

Title: "Missed Call"
Body: "[Name] from [Facility] called at [time]"
Actions: [Call Back] [Dismiss]
```

#### 4.4.2 FCM Configuration & Benefits
**Functional Requirements:**
- FR-FCM-009: Admin can customize push notification templates and sounds
- FR-FCM-010: System automatically requests notification permission on user login
- FR-FCM-011: Push notification delivery status tracked in Firestore
- FR-FCM-012: Users can test push notifications from settings page
- FR-FCM-013: Support for PWA installation prompts for mobile employees (enables better push notification support)

**FCM Benefits:**
- **Free & Unlimited:** No per-notification costs, unlimited capacity
- **Instant Delivery:** Sub-second notification delivery (< 3 seconds)
- **Rich Notifications:** Support for images, actions, sounds, and badges
- **Already Integrated:** Built into Firebase ecosystem, no third-party dependencies
- **Reliable:** 99.9% delivery rate with automatic retry
- **No Phone Numbers Required:** Works with any logged-in user on any device
- **PWA Support:** Full functionality when app installed as Progressive Web App

### 4.5 Call History & Logging

#### 4.5.1 Call History Dashboard
**Description:** Detailed log of all call activity

**Functional Requirements:**
- FR-LOG-001: Users can view their own call history (last 90 days)
- FR-LOG-002: Admin can view all call history with advanced filtering
- FR-LOG-003: Call logs include: timestamp, caller, recipient, duration, outcome (answered/missed/declined)
- FR-LOG-004: Logs sortable by date, duration, caller, recipient
- FR-LOG-005: Export call logs to CSV format
- FR-LOG-006: Call logs include network quality metrics (jitter, packet loss, latency)
- FR-LOG-007: System retains call logs for 2 years minimum

**User Story:**
```
As an Administrator,
I want to view comprehensive call logs with filtering options,
So that I can analyze system usage and identify patterns.
```

#### 4.5.2 Activity Audit Trail
**Functional Requirements:**
- FR-LOG-008: System logs all user login/logout events
- FR-LOG-009: System logs all admin actions (user creation, deletion, role changes)
- FR-LOG-010: Audit logs are immutable (cannot be edited or deleted)
- FR-LOG-011: Audit logs include IP address and user agent
- FR-LOG-012: Admin can search audit logs by user, action type, date range

### 4.6 Admin Dashboard

#### 4.6.1 User Management Interface
**Description:** Centralized admin panel for user account management

**Functional Requirements:**
- FR-ADMIN-001: Admin can view all users in sortable/filterable table
- FR-ADMIN-002: Admin can search users by name, email, facility, role
- FR-ADMIN-003: Admin can edit user profile (name, email, role, facility, phone)
- FR-ADMIN-004: Admin can enable/disable user accounts
- FR-ADMIN-005: Admin can delete user accounts (with confirmation prompt)
- FR-ADMIN-006: Admin can reset user passwords
- FR-ADMIN-007: Admin can view each user's last login date and total call count
- FR-ADMIN-008: Bulk actions available: export users, bulk role assignment, bulk deletion

**User Story:**
```
As an Administrator,
I want a centralized dashboard to manage all user accounts,
So that I can efficiently maintain the system.
```

#### 4.6.2 Analytics & Reporting
**Functional Requirements:**
- FR-ADMIN-009: Dashboard displays total users, active users (last 7 days), total calls (last 30 days)
- FR-ADMIN-010: Dashboard shows call volume by day/week/month (chart)
- FR-ADMIN-011: Dashboard displays average call duration
- FR-ADMIN-012: Dashboard shows busiest times (heatmap)
- FR-ADMIN-013: Dashboard displays most active users (top 10)
- FR-ADMIN-014: Dashboard shows call success rate (answered vs. missed)
- FR-ADMIN-015: Dashboard displays facility usage statistics
- FR-ADMIN-016: All analytics exportable to PDF or CSV

#### 4.6.3 System Configuration
**Functional Requirements:**
- FR-ADMIN-017: Admin can configure idle timeout duration
- FR-ADMIN-018: Admin can configure call timeout duration
- FR-ADMIN-019: Admin can configure push notification delay threshold
- FR-ADMIN-020: Admin can edit push notification message templates
- FR-ADMIN-021: Admin can enable/disable push notifications globally
- FR-ADMIN-022: Admin can configure session expiration time
- FR-ADMIN-023: Admin can set system maintenance mode (disables all calls)

---

## 5. Technical Architecture

### 5.1 Architecture Overview

**Architecture Pattern:** Serverless, Event-Driven Architecture with Real-Time Data Sync

**Diagram:**
```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Web App    │  │  Admin Panel │  │  PWA (Future)│     │
│  │   (React)    │  │   (React)    │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                          ↕ HTTPS/WSS
┌─────────────────────────────────────────────────────────────┐
│                     Service Layer                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Firebase   │  │   WebRTC    │  │  Firebase   │        │
│  │   Auth      │  │  Signaling  │  │     FCM     │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Firestore  │  │  Realtime   │  │   Storage   │        │
│  │  (Primary)  │  │  Database   │  │  (Logs/Ext) │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Component Responsibilities

#### 5.2.1 Frontend (React Web Application)
**Responsibilities:**
- User interface rendering
- User input handling and validation
- WebRTC connection management (camera, microphone)
- Real-time data subscription (presence, calls)
- Local state management (Redux or Context API)
- Routing and navigation

**Key Libraries:**
- React 18+
- React Router (navigation)
- Redux Toolkit or Zustand (state management)
- TailwindCSS or Material-UI (styling)
- Simple-peer or PeerJS (WebRTC abstraction)
- Firebase SDK (auth, database)

#### 5.2.2 Authentication Service (Firebase Auth)
**Responsibilities:**
- User identity verification
- Session token generation and validation
- Password hashing and storage
- Email verification and password reset flows
- Role-based access control (custom claims)

#### 5.2.3 Real-Time Database (Firebase Firestore)
**Responsibilities:**
- User profile storage
- Presence tracking
- Call state management
- Call history storage
- System configuration storage
- Real-time data synchronization to clients

#### 5.2.4 Video Communication (WebRTC + Signaling Server)
**Responsibilities:**
- Peer-to-peer media stream establishment
- NAT traversal (STUN/TURN)
- Codec negotiation
- Bandwidth adaptation
- Connection health monitoring

**Options:**
- **Option A:** Self-hosted signaling server using Firebase Realtime Database
- **Option B:** Managed service (Daily.co, Agora, Twilio Video)

#### 5.2.5 Push Notification Service (Firebase Cloud Messaging)
**Responsibilities:**
- Browser push notification delivery to users
- Notification permission management
- Delivery status tracking and retry logic
- Template rendering with dynamic content
- Rich notification formatting (images, actions, badges)
- Service worker registration and management

#### 5.2.6 Backend Functions (Firebase Cloud Functions)
**Responsibilities:**
- User creation automation (send welcome emails)
- Scheduled tasks (cleanup old logs, presence heartbeat)
- FCM push notification triggering based on Firestore events
- FCM token management and cleanup
- Analytics aggregation
- Admin API endpoints

### 5.3 Data Flow Diagrams

#### 5.3.1 User Login Flow
```
User → Web App → Firebase Auth
                      ↓
              Token Generated
                      ↓
              Custom Claims Applied (role, facility)
                      ↓
              Token Returned → Web App
                      ↓
              Firestore Presence Updated (user online)
                      ↓
              Web App Subscribes to Real-Time Updates
```

#### 5.3.2 Video Call Initiation Flow
```
Caller Clicks "Call" → Web App
                           ↓
                   Check Recipient Status (Firestore)
                           ↓
                   Create Call Document (Firestore)
                           ↓
        Recipient's App Receives Real-Time Update
                           ↓
               Display Call Notification (In-App)
                           ↓
        Start 5-Second Timer → If No Ack → Send FCM Push Notification
                           ↓
            Recipient Accepts → Update Call Document
                           ↓
        Exchange ICE Candidates (Firebase Realtime DB)
                           ↓
                Establish WebRTC Connection
                           ↓
                 Video/Audio Streams
```

#### 5.3.3 Presence Tracking Flow
```
User Logs In → Set Firestore Document (/presence/{userId})
                           ↓
                    { status: 'online', lastSeen: timestamp }
                           ↓
              All Clients Subscribe to /presence Collection
                           ↓
              User Closes Tab → onDisconnect() Trigger
                           ↓
              Set { status: 'offline', lastSeen: timestamp }
                           ↓
              Other Clients Receive Real-Time Update
```

### 5.4 Security Architecture

#### 5.4.1 Authentication & Authorization
- **Token-Based Auth:** Firebase Auth JWT tokens
- **Custom Claims:** Role and facility embedded in token
- **Firestore Security Rules:** Enforce read/write permissions based on claims
- **API Rate Limiting:** Cloud Functions protected by Firebase App Check

#### 5.4.2 Data Encryption
- **In Transit:** All communications over HTTPS/WSS (TLS 1.3)
- **At Rest:** Firestore encryption at rest (default)
- **Video Streams:** Encrypted via DTLS-SRTP (WebRTC standard)

#### 5.4.3 Access Control
- **Principle of Least Privilege:** Users can only access data necessary for their role
- **Security Rules Example (Firestore):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId || 
                     request.auth.token.role == 'admin';
    }
    
    match /calls/{callId} {
      allow read: if request.auth != null && 
                    (resource.data.callerId == request.auth.uid || 
                     resource.data.recipientId == request.auth.uid ||
                     request.auth.token.role == 'admin');
      allow create: if request.auth != null;
      allow update: if request.auth.uid in [resource.data.callerId, 
                                            resource.data.recipientId];
    }
  }
}
```

---

## 6. Technology Stack

### 6.1 Frontend Stack

| Component | Technology | Version | Justification |
|-----------|-----------|---------|---------------|
| **Framework** | React | 18.2+ | Industry standard, component-based, excellent ecosystem |
| **Language** | TypeScript | 5.0+ | Type safety, better IDE support, fewer runtime errors |
| **Build Tool** | Vite | 5.0+ | Faster builds than Webpack, excellent DX |
| **Routing** | React Router | 6.x | Standard routing library for React SPAs |
| **State Management** | Zustand | 4.x | Lightweight, simpler than Redux for this scale |
| **UI Framework** | TailwindCSS | 3.x | Rapid development, utility-first, highly customizable |
| **Component Library** | Headless UI | 1.x | Accessible components compatible with Tailwind |
| **WebRTC** | Simple-peer | 9.x | Simplified WebRTC API, cross-browser compatible |
| **Real-Time DB** | Firebase SDK | 10.x | Official SDK for Firestore and Auth |
| **HTTP Client** | Axios | 1.x | Promise-based, interceptors for auth tokens |

### 6.2 Backend Stack

| Component | Technology | Justification |
|-----------|-----------|---------------|
| **Authentication** | Firebase Auth | Managed service, secure, scalable |
| **Database** | Firestore | Real-time sync, offline support, NoSQL flexibility |
| **Signaling** | Firebase Realtime DB | Low-latency for WebRTC signaling |
| **Storage** | Firebase Storage | File uploads (profile pics, logs - future) |
| **Functions** | Cloud Functions | Serverless, event-driven, auto-scaling |
| **Push Notifications** | Firebase Cloud Messaging (FCM) | Free, unlimited, 99.9% delivery rate, native Firebase integration |
| **Video (Option B)** | Daily.co API | Managed WebRTC, simple SDK, generous free tier |

### 6.3 Development & Deployment Tools

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Version Control** | Git + GitHub | Source code management |
| **CI/CD** | GitHub Actions | Automated testing and deployment |
| **Hosting** | Firebase Hosting | CDN, HTTPS, auto-scaling |
| **Monitoring** | Firebase Analytics | User behavior, error tracking |
| **Logging** | Cloud Logging | Centralized log aggregation |
| **Error Tracking** | Sentry | Real-time error alerts |
| **Testing** | Jest + React Testing Library | Unit and integration tests |
| **E2E Testing** | Playwright | End-to-end testing |
| **Code Quality** | ESLint + Prettier | Linting and formatting |

### 6.4 Technology Decision Matrix

#### WebRTC Implementation Options

| Option | Pros | Cons | Recommendation |
|--------|------|------|----------------|
| **Self-Hosted WebRTC** | Free (excluding TURN server), full control, no vendor lock-in | Complex setup, need to handle TURN/STUN, browser compatibility, scaling challenges | Recommended if budget-conscious and have dev expertise |
| **Daily.co** | Simple API, 10K min/month free, excellent docs, HIPAA-ready tier available | $0.004/min after free tier, vendor dependency | **Recommended for MVP** - fastest to market |
| **Agora** | Robust SDK, good free tier, global reach | Slightly more complex than Daily.co | Good alternative if Daily.co unavailable |
| **Twilio Video** | Enterprise-grade, excellent support | Expensive ($0.004-0.016/min), no free tier | Overkill for this scale |

**Decision:** Start with Daily.co for MVP, migrate to self-hosted if cost becomes prohibitive.

---

## 7. Database Schema

### 7.1 Firestore Collections

#### 7.1.1 Users Collection
**Path:** `/users/{userId}`

**Purpose:** Store user profile information, settings, and metadata

**Schema:**
```typescript
interface User {
  // Identity
  uid: string;                    // Firebase Auth UID (document ID)
  email: string;                  // User email (unique)
  displayName: string;            // Full name
  fcmTokens: string[];            // FCM device tokens for push notifications (array to support multiple devices)
  
  // Role & Facility
  role: 'admin' | 'supervisor' | 'facility';
  facilityId: string;             // Reference to facility document
  facilityName: string;           // Denormalized for quick access
  
  // Settings
  notificationPreferences: {
    pushEnabled: boolean;         // Receive push notifications (FCM)
    emailEnabled: boolean;        // Receive email notifications (future)
    inAppSoundsEnabled: boolean;  // Play notification sounds
    notificationSound: string;    // Custom notification sound selection
  };
  
  // Status
  status: 'available' | 'busy' | 'away' | 'offline';
  isActive: boolean;              // Account enabled/disabled
  
  // Metadata
  createdAt: Timestamp;
  createdBy: string;              // UID of admin who created account
  lastLoginAt: Timestamp;
  lastSeenAt: Timestamp;
  
  // Stats (denormalized for performance)
  totalCalls: number;
  totalCallDuration: number;      // Seconds
}
```

**Indexes:**
- `role` (ascending) + `status` (ascending)
- `facilityId` (ascending) + `status` (ascending)
- `isActive` (ascending) + `lastLoginAt` (descending)

**Security Rules:**
- All authenticated users can read all user documents
- Users can only update their own document (limited fields)
- Admins can create/update/delete any user

---

#### 7.1.2 Facilities Collection
**Path:** `/facilities/{facilityId}`

**Purpose:** Store facility information for organizational purposes

**Schema:**
```typescript
interface Facility {
  id: string;                     // Document ID
  name: string;                   // Facility name
  address: string;                // Physical address
  phone: string;                  // Main phone number
  timezone: string;               // IANA timezone (e.g., "America/Chicago")
  
  // Metadata
  createdAt: Timestamp;
  isActive: boolean;
  
  // Stats
  totalUsers: number;
  totalCallsOriginated: number;
}
```

**Initial Facilities (8):**
1. Houston Medical Center
2. Memorial Hermann
3. Methodist Hospital
4. St. Luke's Hospital
5. Texas Children's Hospital
6. MD Anderson Cancer Center
7. CHI St. Luke's Health
8. TIRR Memorial Hermann

---

#### 7.1.3 Calls Collection
**Path:** `/calls/{callId}`

**Purpose:** Track all call events (active, completed, missed)

**Schema:**
```typescript
interface Call {
  id: string;                     // Auto-generated document ID
  
  // Participants
  callerId: string;               // UID of caller
  callerName: string;             // Denormalized
  callerFacility: string;         // Denormalized
  
  recipientId: string;            // UID of recipient
  recipientName: string;          // Denormalized
  recipientFacility: string;      // Denormalized
  
  // Call State
  status: 'ringing' | 'active' | 'ended' | 'missed' | 'declined' | 'timeout';
  
  // Timestamps
  createdAt: Timestamp;           // Call initiated
  answeredAt: Timestamp | null;   // Call accepted
  endedAt: Timestamp | null;      // Call terminated
  duration: number | null;        // Seconds (null if not answered)
  
  // Notifications
  pushNotificationSent: boolean;
  pushNotificationSentAt: Timestamp | null;
  pushNotificationDelivered: boolean;    // Whether FCM confirmed delivery
  
  // Quality Metrics (collected at end)
  quality: {
    avgLatency: number | null;    // ms
    avgJitter: number | null;     // ms
    packetLoss: number | null;    // percentage
    resolution: string | null;    // e.g., "720p"
  };
  
  // Feedback (optional)
  rating: number | null;          // 1-5 stars
  feedback: string | null;
}
```

**Indexes:**
- `callerId` (ascending) + `createdAt` (descending)
- `recipientId` (ascending) + `createdAt` (descending)
- `status` (ascending) + `createdAt` (descending)
- `createdAt` (descending) - for admin global view

**Security Rules:**
- Users can read calls where they are caller or recipient
- Admins can read all calls
- Only system (Cloud Functions) can create/update calls

---

#### 7.1.4 Presence Collection
**Path:** `/presence/{userId}`

**Purpose:** Real-time user presence tracking with automatic cleanup

**Schema:**
```typescript
interface Presence {
  uid: string;                    // Firebase Auth UID (document ID)
  status: 'online' | 'busy' | 'away' | 'offline';
  lastSeen: Timestamp;
  
  // Connection tracking
  connections: {
    [connectionId: string]: {
      timestamp: Timestamp;
      userAgent: string;
    }
  };
}
```

**Implementation Notes:**
- Uses Firebase Realtime Database `.onDisconnect()` for automatic status updates
- Updated via client-side SDK every 30 seconds (heartbeat)
- Cleaned up by Cloud Function if no heartbeat for 90 seconds

---

#### 7.1.5 Activity Logs Collection
**Path:** `/activityLogs/{logId}`

**Purpose:** Immutable audit trail of all system actions

**Schema:**
```typescript
interface ActivityLog {
  id: string;                     // Auto-generated
  
  // Actor
  actorId: string;                // UID of user performing action
  actorName: string;              // Denormalized
  actorRole: string;              // Denormalized
  
  // Action
  actionType: 'user_created' | 'user_deleted' | 'user_updated' | 
              'login' | 'logout' | 'call_initiated' | 'call_ended' |
              'settings_changed' | 'password_reset';
  
  targetId: string | null;        // UID of affected user (if applicable)
  targetType: 'user' | 'call' | 'system' | null;
  
  // Details
  changes: Record<string, any>;   // Key-value pairs of what changed
  metadata: Record<string, any>;  // Additional context
  
  // Request Info
  ipAddress: string;
  userAgent: string;
  
  // Timestamp
  timestamp: Timestamp;
}
```

**Indexes:**
- `actorId` (ascending) + `timestamp` (descending)
- `actionType` (ascending) + `timestamp` (descending)
- `timestamp` (descending) - for admin global view

**Retention Policy:** 2 years minimum

---

#### 7.1.6 System Config Collection
**Path:** `/config/{configKey}`

**Purpose:** Store system-wide configuration settings

**Schema:**
```typescript
interface SystemConfig {
  key: string;                    // Document ID
  value: any;                     // Configuration value
  type: 'string' | 'number' | 'boolean' | 'object';
  description: string;
  lastModified: Timestamp;
  modifiedBy: string;             // Admin UID
}
```

**Example Documents:**
```json
{
  "key": "call_timeout_seconds",
  "value": 45,
  "type": "number",
  "description": "Seconds before unanswered call times out"
}

{
  "key": "push_delay_seconds",
  "value": 5,
  "type": "number",
  "description": "Delay before sending push notification if call not answered"
}

{
  "key": "push_template_missed_call",
  "value": "MISSED CALL: {callerName} from {facility} tried to reach you.",
  "type": "string",
  "description": "Push notification template for missed calls"
}

{
  "key": "push_template_incoming_call",
  "value": "Incoming call from {callerName} at {facility}",
  "type": "string",
  "description": "Push notification template for incoming calls"
}
```

---

### 7.2 Firebase Realtime Database (Signaling)

**Path:** `/webrtc_signaling/{callId}`

**Purpose:** Exchange WebRTC signaling data (SDP offers/answers, ICE candidates)

**Schema:**
```json
{
  "webrtc_signaling": {
    "call_abc123": {
      "offer": {
        "type": "offer",
        "sdp": "v=0\r\no=- 1234...",
        "from": "userId1"
      },
      "answer": {
        "type": "answer",
        "sdp": "v=0\r\no=- 5678...",
        "from": "userId2"
      },
      "ice_candidates": {
        "userId1": [
          { "candidate": "candidate:...", "sdpMid": "0", "sdpMLineIndex": 0 }
        ],
        "userId2": [
          { "candidate": "candidate:...", "sdpMid": "0", "sdpMLineIndex": 0 }
        ]
      }
    }
  }
}
```

**Cleanup:** Documents automatically deleted after call ends (TTL: 1 hour)

---

### 7.3 Data Relationships

```
User (1) ----belongs to----> (1) Facility
User (1) ----participates in----> (many) Calls
User (1) ----has----> (1) Presence
User (1) ----performs----> (many) Activity Logs
```

---

## 8. API & Integration Requirements

### 8.1 Firebase Authentication API

**Usage:** User authentication and session management

**Key Operations:**
- `createUserWithEmailAndPassword()` - Admin creates user
- `signInWithEmailAndPassword()` - User login
- `sendPasswordResetEmail()` - Password reset flow
- `updatePassword()` - User changes password
- `setCustomUserClaims()` - Assign role/facility to user (server-side)

**Custom Claims Structure:**
```json
{
  "role": "supervisor",
  "facilityId": "facility_001",
  "facilityName": "Houston Medical Center"
}
```

---

### 8.2 Firestore API

**Usage:** All application data storage and real-time sync

**Key Operations:**
- `collection().doc().set()` - Create/update documents
- `collection().doc().get()` - Read single document
- `collection().where().onSnapshot()` - Real-time query subscription
- `collection().orderBy().limit()` - Paginated queries
- `batch()` - Atomic multi-document writes

**Real-Time Subscription Example (Presence):**
```javascript
const unsubscribe = db.collection('presence')
  .where('status', '!=', 'offline')
  .onSnapshot(snapshot => {
    snapshot.docChanges().forEach(change => {
      if (change.type === 'modified') {
        updateUserStatus(change.doc.data());
      }
    });
  });
```

---

### 8.3 Firebase Cloud Messaging (FCM) API

**Base URL:** `https://fcm.googleapis.com/v1/projects/{project-id}/messages:send`

**Authentication:** OAuth 2.0 (Service Account credentials)

**Web Push Protocol:** FCM supports W3C Push API standard for browser notifications

**Send Notification Request (via Admin SDK - Recommended):**
```javascript
import { getMessaging } from 'firebase-admin/messaging';

const message = {
  notification: {
    title: 'Incoming Call from Dr. Smith',
    body: 'Memorial Hermann - Click to answer',
    icon: '/icons/profile-default.png',
    badge: '/icons/badge.png',
    tag: 'call-123',  // Prevents duplicate notifications
  },
  webpush: {
    fcmOptions: {
      link: 'https://app.yourdomain.com/call/123'
    },
    notification: {
      actions: [
        { action: 'answer', title: 'Answer', icon: '/icons/phone.png' },
        { action: 'decline', title: 'Decline', icon: '/icons/decline.png' }
      ],
      requireInteraction: true,  // Keeps notification visible until user acts
      vibrate: [200, 100, 200],  // Vibration pattern
      sound: '/sounds/incoming-call.mp3'
    }
  },
  token: 'user-fcm-device-token-here'
};

await getMessaging().send(message);
```

**Response:**
```json
{
  "name": "projects/myproject/messages/0:1234567890"
}
```

**Token Management:**
- Users grant notification permission on first login
- FCM tokens stored in user's Firestore document (fcmTokens array)
- Tokens can expire - handle TOKEN_EXPIRED errors and remove invalid tokens
- Support multiple tokens per user (multi-device support)

**Service Worker Registration:**
```javascript
// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

firebase.initializeApp({ /* config */ });
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon,
    actions: payload.notification.actions
  };
  
  self.registration.showNotification(notificationTitle, notificationOptions);
});
```

**Delivery Tracking:**
- FCM doesn't provide delivery receipts by default
- Track delivery via client-side acknowledgment (update Firestore when notification received)
- Monitor token expiry and update token management

**Rate Limits:** No practical limit for most applications (millions of messages per second possible)

**Cost:** **$0** - Completely free and unlimited

---

### 8.4 Daily.co Video API (Option B)

**Base URL:** `https://api.daily.co/v1`

**Authentication:** Bearer token (API key)

**Key Endpoints:**

#### Create Room
```http
POST /rooms
Authorization: Bearer {api_key}
Content-Type: application/json

{
  "name": "call_abc123",
  "privacy": "private",
  "properties": {
    "max_participants": 2,
    "enable_recording": false,
    "exp": 1700000000    // Expiration timestamp
  }
}
```

**Response:**
```json
{
  "id": "room_id",
  "name": "call_abc123",
  "url": "https://yourdomain.daily.co/call_abc123",
  "api_created": true,
  "privacy": "private",
  "created_at": "2025-11-21T12:00:00Z"
}
```

#### Get Room Info
```http
GET /rooms/{room_name}
Authorization: Bearer {api_key}
```

#### Delete Room
```http
DELETE /rooms/{room_name}
Authorization: Bearer {api_key}
```

**Client-Side SDK Integration:**
```javascript
import DailyIframe from '@daily-co/daily-js';

const callFrame = DailyIframe.createFrame(containerElement, {
  showLeaveButton: true,
  iframeStyle: { width: '100%', height: '100%' }
});

callFrame.join({ url: roomUrl, token: meetingToken });
```

**Webhooks:** Daily.co can send webhooks for:
- `participant.joined`
- `participant.left`
- `recording.started`

**Cost:** 10,000 minutes/month free, then $0.004/minute

---

### 8.5 Cloud Functions (Serverless Backend)

**Triggers:**

#### HTTP Callable Functions
```typescript
// Admin creates user via API
exports.createUser = functions.https.onCall(async (data, context) => {
  // Verify caller is admin
  if (context.auth.token.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Admin only');
  }
  
  const { email, password, displayName, role, facilityId } = data;
  
  // Create Firebase Auth user
  const userRecord = await admin.auth().createUser({
    email, password, displayName
  });
  
  // Set custom claims
  await admin.auth().setCustomUserClaims(userRecord.uid, {
    role, facilityId
  });
  
  // Create Firestore document
  await admin.firestore().collection('users').doc(userRecord.uid).set({
    uid: userRecord.uid,
    email, displayName, role, facilityId,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  
  return { uid: userRecord.uid };
});
```

#### Firestore Triggers
```typescript
// Send FCM push notification when call document created
exports.onCallCreated = functions.firestore
  .document('calls/{callId}')
  .onCreate(async (snap, context) => {
    const call = snap.data();
    
    // Wait 5 seconds to allow in-app notification acknowledgment
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Check if call still ringing
    const currentCall = await snap.ref.get();
    if (currentCall.data().status === 'ringing') {
      // Get recipient's FCM tokens
      const recipientDoc = await admin.firestore()
        .collection('users')
        .doc(call.recipientId)
        .get();
      
      const fcmTokens = recipientDoc.data()?.fcmTokens || [];
      
      // Send push notification to all registered devices
      const messages = fcmTokens.map(token => ({
        notification: {
          title: `Incoming Call from ${call.callerName}`,
          body: `${call.callerFacility} - Click to answer`
        },
        webpush: {
          notification: {
            actions: [
              { action: 'answer', title: 'Answer' },
              { action: 'decline', title: 'Decline' }
            ],
            requireInteraction: true
          }
        },
        token
      }));
      
      await admin.messaging().sendEach(messages);
      
      // Update call document to track notification sent
      await snap.ref.update({
        pushNotificationSent: true,
        pushNotificationSentAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  });
```

#### Scheduled Functions
```typescript
// Clean up old presence documents daily
exports.cleanupPresence = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days
    
    const snapshot = await admin.firestore().collection('presence')
      .where('lastSeen', '<', new Date(cutoff))
      .get();
    
    const batch = admin.firestore().batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
  });
```

---

## 9. User Interface Specifications

### 9.1 Responsive Design Requirements

**Breakpoints:**
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px - 1919px
- Large Desktop: 1920px+

**Target Devices:**
- Desktop browsers (Chrome, Firefox, Safari, Edge - latest 2 versions)
- Tablets (iPad, Android tablets)
- Mobile (iOS Safari, Android Chrome) - view-only, minimal interaction

**Minimum Screen Resolution:** 1280x720 (desktop), 768x1024 (tablet)

---

### 9.2 Page Layout & Navigation

#### 9.2.1 Login Page
**URL:** `/login`

**Layout:**
- Centered card (max-width: 400px)
- Logo/system name at top
- Email input field
- Password input field
- "Remember Me" checkbox
- "Login" button (full width)
- "Forgot Password?" link below button

**Validation:**
- Real-time email format validation
- Password shown/hidden toggle
- Error messages displayed inline

---

#### 9.2.2 Main Dashboard (Post-Login)
**URL:** `/dashboard`

**Layout Structure:**
```
┌─────────────────────────────────────────────┐
│  Header: Logo | User Name | Status | Logout │
├─────────────┬───────────────────────────────┤
│             │                               │
│   Sidebar   │      Main Content Area        │
│             │                               │
│  - Roster   │  [Dynamically loaded based    │
│  - History  │   on sidebar selection]       │
│  - Settings │                               │
│  - Admin*   │                               │
│             │                               │
└─────────────┴───────────────────────────────┘
```
*Admin menu item visible only to admins

**Header (Top Bar):**
- Left: System logo/name
- Center: Current page title
- Right: User profile picture, status dropdown, logout button

**Sidebar (Left Panel):**
- Fixed width: 240px (desktop), collapsible on tablet
- Menu items:
  - 🏠 Dashboard (user roster)
  - 📞 Call History
  - ⚙️ Settings
  - 👑 Admin Panel (admins only)

**Main Content:**
- Dynamic based on selected sidebar item
- Default view: User Roster

---

#### 9.2.3 User Roster View
**Location:** Main content area when "Dashboard" selected

**Components:**

**Search Bar (Top):**
- Full-width input with search icon
- Placeholder: "Search by name or facility..."
- Real-time filtering

**Filter Dropdown:**
- Options: All | Available | Busy | Away | Offline
- Badge shows count in each category

**User Cards (Grid/List):**
- Layout: Grid on desktop (3-4 columns), List on mobile
- Each card displays:
  - Profile picture or initials avatar
  - Name (bold, 16px)
  - Facility name (gray, 14px)
  - Status indicator (colored dot + text)
  - "Call" button (green, prominent) - only shown if user is available

**Card States:**
- **Available:** Green dot, "Call" button enabled
- **Busy:** Yellow dot, "Call" button grayed out, "(In call)" text
- **Away:** Orange dot, "Call" button grayed out
- **Offline:** Gray dot, no "Call" button

**Empty State:**
- Display if no users match filter: "No users found"

---

#### 9.2.4 Call History View
**Location:** Main content area when "Call History" selected

**Components:**

**Date Range Picker:**
- Dropdown: Last 7 days | Last 30 days | Last 90 days | Custom range
- Export button (CSV download)

**Call Log Table:**
- Columns:
  - Date/Time (sortable)
  - Caller
  - Recipient
  - Duration
  - Status (badge: Answered, Missed, Declined)
  - Quality (icon: ⭐⭐⭐⭐⭐ or "N/A")
- Pagination: 20 entries per page
- Sortable columns (click header to sort)

**Filters:**
- Status: All | Answered | Missed | Declined
- Participant: Dropdown of all users

**Empty State:**
- Display if no calls: "No call history for selected period"

---

#### 9.2.5 Settings View
**Location:** Main content area when "Settings" selected

**Tabs:**
1. **Profile**
   - Display Name (editable)
   - Email (read-only)
   - Phone Number (editable with validation)
   - Facility (read-only)
   - Change Password button

2. **Notifications**
   - Push Notifications: Toggle (on/off) - shows permission status
   - In-App Sounds: Toggle (on/off)
   - Notification Sound: Dropdown selection
   - Test Push Notification button (sends test notification)
   - Device Token Status: Shows registered devices

3. **Preferences**
   - Theme: Light | Dark | Auto
   - Language: English (future: add more)

**Save Button:**
- Fixed at bottom of form
- Only enabled when changes detected

---

#### 9.2.6 Admin Panel
**URL:** `/admin`
**Access:** Admins only

**Tabs:**

**1. User Management**
- Action Bar:
  - "Create User" button (primary, right-aligned)
  - Search input (left-aligned)
  - Bulk actions dropdown (if items selected)

- User Table:
  - Columns: Checkbox | Name | Email | Role | Facility | Status | Last Login | Actions
  - Actions: Edit (pencil icon) | Delete (trash icon)
  - Inline editing for role and facility

- Create User Modal:
  - Fields: Email, Password (auto-generated or custom), Display Name, Role dropdown, Facility dropdown, Phone Number
  - "Send Welcome Email" checkbox (checked by default)
  - Create button

**2. Analytics Dashboard**
- KPI Cards (Top Row):
  - Total Users
  - Active Users (last 7 days)
  - Total Calls (last 30 days)
  - Average Call Duration

- Charts:
  - Call Volume Over Time (line chart, last 30 days)
  - Busiest Hours Heatmap (day of week x hour of day)
  - Top 10 Most Active Users (bar chart)
  - Call Outcomes (pie chart: Answered vs. Missed vs. Declined)

**3. System Configuration**
- Form with configuration fields:
  - Call Timeout (seconds): Number input
  - Push Notification Delay (seconds): Number input
  - Idle Timeout (minutes): Number input
  - Session Expiration (hours): Number input
  - Push Notifications Enabled: Toggle
  - Maintenance Mode: Toggle (disables all calls system-wide)

- Push Notification Templates:
  - Missed Call Title/Body: Text inputs
  - Incoming Call Title/Body: Text inputs
  - Variables available: {callerName}, {facility}, {time}
  - Sound Selection: Dropdown

**4. Activity Logs**
- Filter Bar:
  - User dropdown
  - Action Type dropdown
  - Date range picker

- Log Table:
  - Columns: Timestamp | User | Action | Details | IP Address
  - Expandable rows for full details

---

### 9.3 Video Call Interface

#### 9.3.1 Incoming Call Modal (Recipient)
**Trigger:** When call document created in Firestore

**Layout:**
- Full-screen overlay (semi-transparent dark background)
- Centered modal card (500px wide)
- **Header:** "Incoming Call"
- **Content:**
  - Large profile picture or initials avatar
  - Caller name (24px, bold)
  - Caller facility (16px, gray)
  - Animated ringing icon
- **Actions (Bottom):**
  - "Decline" button (red, left)
  - "Accept" button (green, large, right)
- **Auto-dismiss:** After 45 seconds if no action

**Sound:** Play ringing tone (looping) until action or timeout

---

#### 9.3.2 Outgoing Call Modal (Caller)
**Trigger:** When "Call" button clicked

**Layout:**
- Full-screen overlay
- Centered modal card
- **Header:** "Calling..."
- **Content:**
  - Recipient profile picture
  - Recipient name
  - Recipient facility
  - Animated pulsing icon
  - Status text: "Waiting for [Name] to answer..."
- **Actions:**
  - "Cancel Call" button (red, centered)

**Auto-dismiss:** If recipient doesn't answer within 45 seconds, show "Call timed out" message

---

#### 9.3.3 Active Video Call Interface
**Layout:** Full-screen video interface

```
┌───────────────────────────────────────────────┐
│  [Recipient Video - Full Screen]              │
│                                               │
│  ┌─────────────────┐                         │
│  │ Self Video      │  (Small, top-right)     │
│  │ (Picture-in-    │                          │
│  │  Picture)       │                          │
│  └─────────────────┘                         │
│                                               │
│                                               │
│  ┌─────────────────────────────────────┐     │
│  │  Controls (Bottom, centered)        │     │
│  │  [Mute] [Video Off] [End Call]      │     │
│  └─────────────────────────────────────┘     │
└───────────────────────────────────────────────┘
```

**Video Streams:**
- **Remote Video (Main):** Full screen, object-fit: cover
- **Local Video (PiP):** 240x180px, top-right corner, draggable
- **Swap Button:** Clicking PiP swaps main and local videos

**Control Bar (Bottom):**
- Always visible (no auto-hide)
- Buttons (left to right):
  - 🎤 Mute/Unmute (toggle, red when muted)
  - 📹 Video On/Off (toggle, red when off)
  - 📞 End Call (red, center, large)
  - ⚙️ Settings (gear icon, right) - opens quality/device settings

**Call Info (Top-Left):**
- Participant name
- Call duration timer (MM:SS)
- Connection quality indicator (bars icon, green/yellow/red)

**Connection States:**
- **Connecting:** Show spinner overlay with "Connecting..."
- **Connected:** Video streams visible
- **Reconnecting:** Show "Connection lost, attempting to reconnect..." banner
- **Failed:** Show "Connection failed" message with "Retry" button

---

#### 9.3.4 Post-Call Feedback (Optional)
**Trigger:** After call ends

**Layout:**
- Modal (not full-screen)
- **Header:** "How was your call?"
- **Content:**
  - Star rating (1-5 stars, large)
  - Optional text feedback textarea
- **Actions:**
  - "Skip" button (gray)
  - "Submit" button (blue)

**Auto-dismiss:** After 30 seconds if no interaction

---

### 9.4 Design System

#### Color Palette
- **Primary (Blue):** #2563EB (buttons, links)
- **Success (Green):** #10B981 (available status, accept button)
- **Warning (Yellow):** #F59E0B (busy status)
- **Danger (Red):** #EF4444 (decline button, end call)
- **Gray Scale:** 
  - Gray 50: #F9FAFB (backgrounds)
  - Gray 200: #E5E7EB (borders)
  - Gray 500: #6B7280 (secondary text)
  - Gray 900: #111827 (primary text)

#### Typography
- **Font Family:** Inter, system-ui, sans-serif
- **Heading 1:** 32px, bold, Gray 900
- **Heading 2:** 24px, semibold, Gray 900
- **Body:** 16px, regular, Gray 700
- **Small:** 14px, regular, Gray 500
- **Button Text:** 16px, medium

#### Spacing
- **Base Unit:** 4px
- **Common Spacings:** 8px, 12px, 16px, 24px, 32px, 48px

#### Border Radius
- **Small:** 4px (inputs, badges)
- **Medium:** 8px (cards, buttons)
- **Large:** 16px (modals)
- **Full:** 9999px (status dots, avatars)

#### Shadows
- **Small:** 0 1px 2px rgba(0, 0, 0, 0.05)
- **Medium:** 0 4px 6px rgba(0, 0, 0, 0.1)
- **Large:** 0 10px 15px rgba(0, 0, 0, 0.1)

---

## 10. User Flows

### 10.1 User Creation Flow (Admin)

```
Admin logs in
    ↓
Navigates to Admin Panel > User Management
    ↓
Clicks "Create User" button
    ↓
Fills out user creation form:
  - Email: user@facility.com
  - Password: (auto-generated or custom)
  - Display Name: Dr. John Smith
  - Role: Facility User
  - Facility: Houston Medical Center
  - Phone: +1-555-123-4567
    ↓
Clicks "Create" button
    ↓
System creates Firebase Auth user
System sets custom claims (role, facilityId)
System creates Firestore /users document
System sends welcome email with login link
    ↓
Admin sees success message
New user appears in user table
```

---

### 10.2 User Login Flow

```
User navigates to app URL (https://yourdomain.com)
    ↓
Lands on login page
    ↓
Enters email and password
    ↓
Clicks "Login" button
    ↓
System validates credentials (Firebase Auth)
    ↓
If first login: Redirect to password change page
If returning user: Continue
    ↓
System retrieves custom claims (role, facilityId)
System creates Firestore /presence document:
  { status: 'online', lastSeen: now }
    ↓
Redirect to /dashboard
App subscribes to real-time updates:
  - Presence collection (other users' status)
  - Calls collection (incoming calls)
    ↓
User sees roster with current online users
```

---

### 10.3 Video Call Initiation Flow

```
Caller views roster
    ↓
Identifies available supervisor
    ↓
Clicks "Call" button next to supervisor name
    ↓
App checks recipient's current status:
  - If offline/busy: Show error "User unavailable"
  - If available: Continue
    ↓
Create call document in Firestore:
  { 
    callerId, recipientId, 
    status: 'ringing', 
    createdAt: now 
  }
    ↓
Caller sees "Calling..." modal with recipient info
    ↓
─────────── Recipient Side ───────────
Recipient's app receives real-time update (call doc created)
↓
Display incoming call modal with caller info
Play ringing sound
Start 45-second timeout timer
↓
Start 5-second timer for FCM push notification
↓
If 5 seconds elapse without answer:
Cloud Function sends FCM push notification to recipient's devices
Browser shows push notification with Answer/Decline actions
    ↓
Recipient clicks "Accept"
    ↓
Update call document: { status: 'active', answeredAt: now }
    ↓
Both apps begin WebRTC negotiation:
  1. Caller creates offer (SDP)
  2. Saves offer to /webrtc_signaling/{callId}
  3. Recipient retrieves offer
  4. Recipient creates answer (SDP)
  5. Saves answer to /webrtc_signaling/{callId}
  6. Exchange ICE candidates via Realtime DB
  7. Establish peer-to-peer connection
    ↓
Both apps display active video call interface
Update presence: { status: 'busy' }
    ↓
─────────── During Call ───────────
Users can:
  - Mute/unmute microphone
  - Enable/disable camera
  - View call timer
  - Monitor connection quality
    ↓
─────────── Call End ───────────
Either user clicks "End Call"
    ↓
Update call document: 
  { 
    status: 'ended', 
    endedAt: now,
    duration: (endedAt - answeredAt) 
  }
    ↓
Close WebRTC connection
Update presence: { status: 'available' }
    ↓
Optional: Show post-call feedback modal
    ↓
Return to dashboard/roster view
```

---

### 10.4 Missed Call Flow

```
Caller initiates call (see 10.3)
    ↓
Recipient doesn't answer within 45 seconds
    ↓
Update call document: { status: 'timeout' }
    ↓
Cloud Function sends FCM push notification to recipient:
  Title: "Missed Call"
  Body: "Dr. Smith from Memorial Hermann tried to reach you at 3:45 PM"
  Actions: [Call Back] [Dismiss]
    ↓
Caller sees "Call timed out" message
    ↓
Recipient later logs in
    ↓
Dashboard shows notification badge: "1 missed call"
    ↓
Recipient clicks notification
    ↓
Navigates to Call History
Missed call highlighted at top
    ↓
Recipient can click "Call Back" button next to missed call entry
```

---

### 10.5 Admin Analytics Flow

```
Admin logs in
    ↓
Navigates to Admin Panel > Analytics
    ↓
Dashboard loads:
  - Queries Firestore for aggregated stats
  - Renders KPI cards
  - Renders charts with Chart.js or similar
    ↓
Admin can:
  - Filter by date range
  - Export data to CSV
  - Drill down into specific metrics
    ↓
Admin clicks "Export" button
    ↓
Cloud Function generates CSV from Firestore queries
Returns download link
    ↓
Admin downloads CSV file
```

---

## 11. Security & Compliance

### 11.1 HIPAA Compliance Considerations

**Disclaimer:** This system will handle Protected Health Information (PHI) only if medical discussions occur during video calls. To achieve full HIPAA compliance, additional steps are required.

#### 11.1.1 Required BAA (Business Associate Agreement)
- **Firebase:** Google Cloud offers HIPAA-compliant Firebase with BAA (includes FCM, requires upgraded plan)
- **Daily.co:** Offers HIPAA-compliant tier with BAA

**Action Items:**
- Sign BAA with each provider before handling PHI
- Document all BAAs for audit purposes

#### 11.1.2 Data Encryption
- ✅ **In Transit:** All data encrypted via TLS 1.3 (HTTPS/WSS)
- ✅ **At Rest:** Firestore encrypts at rest by default (AES-256)
- ✅ **Video Streams:** Encrypted via DTLS-SRTP (WebRTC standard)
- ⚠️ **Call Recording:** Not implemented (Phase 1) - if added, must be encrypted

#### 11.1.3 Access Controls
- ✅ Role-based access control (RBAC) via Firebase custom claims
- ✅ Firestore security rules enforce principle of least privilege
- ✅ Multi-factor authentication (MFA) available (recommend enabling for admins)
- ✅ Automatic session timeout (8 hours default)

#### 11.1.4 Audit Trails
- ✅ All user actions logged in /activityLogs collection
- ✅ Logs include: timestamp, actor, action, IP address, user agent
- ✅ Logs are immutable (write-once, no updates/deletes)
- ✅ Retention: 2 years minimum

#### 11.1.5 Data Backup & Recovery
- ✅ Firestore automatic backups (daily, 7-day retention by default)
- 📋 **TODO:** Configure extended backup retention (30+ days)
- 📋 **TODO:** Test restore procedures quarterly

#### 11.1.6 Breach Notification
- 📋 **TODO:** Establish incident response plan
- 📋 **TODO:** Define breach detection procedures
- 📋 **TODO:** Identify breach notification contacts

**Recommendation:** Engage HIPAA compliance consultant before production deployment if handling PHI.

---

### 11.2 Authentication Security

#### 11.2.1 Password Policy
- Minimum 8 characters
- Must contain: uppercase, lowercase, number, special character
- No password reuse (last 5 passwords)
- Passwords hashed with bcrypt (Firebase Auth default)

#### 11.2.2 Session Management
- JWT tokens with 1-hour expiration (refresh token: 30 days)
- "Remember Me" extends refresh token to 30 days
- Idle timeout: 8 hours (configurable)
- Concurrent session limit: 3 devices per user

#### 11.2.3 Brute Force Protection
- Rate limiting: 5 failed login attempts = 15-minute lockout
- IP-based rate limiting via Cloud Functions
- Admin notification after 10 failed attempts from same IP

#### 11.2.4 Two-Factor Authentication (2FA)
- **Phase 1:** Optional for admins
- **Future:** Mandatory for all users
- Methods: SMS or authenticator app (TOTP)

---

### 11.3 Data Privacy

#### 11.3.1 Data Retention
- **User Data:** Retained while account active, deleted 90 days after account deletion
- **Call Logs:** 2 years retention, then archived or deleted
- **Activity Logs:** 2 years retention minimum (audit requirement)
- **Presence Data:** Deleted 7 days after last activity

#### 11.3.2 Right to Deletion
- Users can request account deletion via admin
- Admin can delete user account from admin panel
- Deletion process:
  1. Mark account as deleted (soft delete)
  2. Anonymize associated data (replace PII with "Deleted User")
  3. Schedule hard delete after 90 days
  4. Retain audit logs with anonymized user ID

#### 11.3.3 Data Minimization
- System collects only data necessary for functionality
- No tracking cookies or analytics beyond Firebase Analytics
- Video streams not recorded or stored (unless explicitly enabled in future)

---

### 11.4 Network Security

#### 11.4.1 Firewall & DDoS Protection
- Firebase Hosting includes built-in DDoS protection
- Cloud Functions protected by Google Cloud Armor (optional upgrade)

#### 11.4.2 CORS Configuration
- Strict CORS policy: only allow requests from app domain
- No wildcard (*) origins

#### 11.4.3 Content Security Policy (CSP)
```
Content-Security-Policy: 
  default-src 'self'; 
  script-src 'self' 'unsafe-inline' https://apis.google.com; 
  connect-src 'self' https://*.firebaseio.com https://api.daily.co wss://*.daily.co; 
  img-src 'self' data: https:; 
  style-src 'self' 'unsafe-inline';
```

---

### 11.5 Vulnerability Management

#### 11.5.1 Dependency Scanning
- **Automated:** GitHub Dependabot scans for vulnerable dependencies weekly
- **Action:** Update vulnerable packages within 48 hours of discovery

#### 11.5.2 Security Testing
- **Pre-Production:**
  - OWASP ZAP automated security scan
  - Manual penetration testing (annual)
  - Code review with security checklist
- **Production:**
  - Continuous monitoring with Sentry
  - Quarterly security audits

#### 11.5.3 Incident Response
1. **Detection:** Monitor error logs, user reports, security alerts
2. **Containment:** Disable affected features, rotate credentials if compromised
3. **Investigation:** Review logs, identify root cause, assess impact
4. **Remediation:** Deploy fix, notify affected users
5. **Post-Mortem:** Document incident, update security procedures

---

## 12. Performance Requirements

### 12.1 Response Time Requirements

| Action | Target | Maximum Acceptable |
|--------|--------|--------------------|
| Page Load (Initial) | < 2 seconds | 3 seconds |
| Login Authentication | < 1 second | 2 seconds |
| Roster Update (Real-Time) | < 500ms | 1 second |
| Call Initiation (Button Click → Ringing) | < 2 seconds | 3 seconds |
| WebRTC Connection Establishment | < 5 seconds | 10 seconds |
| FCM Push Notification Delivery | < 3 seconds | 5 seconds |
| Database Query (Read) | < 200ms | 500ms |
| Database Write | < 500ms | 1 second |

---

### 12.2 Scalability Requirements

#### 12.2.1 User Capacity
- **Phase 1:** 15-20 total users (8 facilities + supervisor circle)
- **Phase 2 (Future):** 100 users
- **Phase 3 (Future):** 1,000 users

#### 12.2.2 Concurrent Usage
- **Peak Concurrent Users:** 10 simultaneously logged in
- **Peak Concurrent Calls:** 4 simultaneous video calls
- **Database Operations:** 1,000 reads/writes per second (Firestore easily handles)

#### 12.2.3 Storage Requirements
- **Initial:** < 1 GB (user data, call logs)
- **Annual Growth:** ~5 GB/year (call logs, activity logs)
- **5-Year Projection:** 25 GB

---

### 12.3 Availability Requirements

#### 12.3.1 Uptime SLA
- **Target:** 99.9% uptime (43 minutes downtime per month acceptable)
- **Critical Hours:** 24/7 (medical emergency system)
- **Maintenance Windows:** None (use rolling deployments)

#### 12.3.2 Disaster Recovery
- **RTO (Recovery Time Objective):** 1 hour
- **RPO (Recovery Point Objective):** 15 minutes (Firestore replication lag)

#### 12.3.3 Backup Strategy
- **Firestore:** Automated daily backups
- **Firebase Auth:** Google manages, no backup needed
- **Configuration:** Export system config weekly to Cloud Storage

---

### 12.4 Video Quality Requirements

#### 12.4.1 Video Specifications
- **Resolution:** 720p default, adaptive (360p - 1080p)
- **Frame Rate:** 30 fps
- **Bitrate:** 1-3 Mbps (adaptive)
- **Codec:** VP9 or H.264

#### 12.4.2 Audio Specifications
- **Codec:** Opus
- **Sample Rate:** 48 kHz
- **Bitrate:** 32-64 kbps
- **Latency:** < 300ms (glass-to-glass)

#### 12.4.3 Network Requirements
- **Minimum Bandwidth:** 1.5 Mbps up/down per participant
- **Recommended:** 3 Mbps up/down
- **Packet Loss Tolerance:** < 5%

---

## 13. Deployment Strategy

### 13.1 Environment Setup

#### 13.1.1 Development Environment
- **URL:** `http://localhost:5173` (Vite dev server)
- **Firebase Project:** `medvideo-dev`
- **Database:** Development Firestore instance
- **Push Notifications:** Test mode (FCM dev tokens, logged to console)
- **Video:** Daily.co test room (unlimited duration)

#### 13.1.2 Staging Environment
- **URL:** `https://staging.yourdomain.com`
- **Firebase Project:** `medvideo-staging`
- **Database:** Staging Firestore instance (separate from production)
- **Push Notifications:** Real FCM (limited test devices)
- **Video:** Daily.co production account (limited free tier usage)
- **Purpose:** QA testing, user acceptance testing (UAT)

#### 13.1.3 Production Environment
- **URL:** `https://app.yourdomain.com`
- **Firebase Project:** `medvideo-production`
- **Database:** Production Firestore instance
- **Push Notifications:** Real FCM (all registered users)
- **Video:** Daily.co production account or self-hosted WebRTC
- **Monitoring:** Sentry, Firebase Analytics, Cloud Logging

---

### 13.2 CI/CD Pipeline

#### 13.2.1 GitHub Actions Workflow

**Trigger:** Push to `main` branch or Pull Request

**Steps:**
1. **Checkout Code**
2. **Install Dependencies** (`npm install`)
3. **Lint Code** (`npm run lint`)
4. **Run Unit Tests** (`npm run test`)
5. **Run E2E Tests** (`npm run test:e2e`) - Playwright
6. **Build Production Bundle** (`npm run build`)
7. **Deploy to Firebase Hosting** (only on `main` push)
8. **Deploy Cloud Functions** (only on `main` push)
9. **Run Post-Deployment Smoke Tests**
10. **Notify Team** (Slack webhook)

**Example `.github/workflows/deploy.yml`:**
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm run test
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: medvideo-production
```

---

### 13.3 Deployment Checklist

**Pre-Deployment:**
- [ ] All tests passing (unit, integration, E2E)
- [ ] Code reviewed and approved
- [ ] Security scan passed (no critical vulnerabilities)
- [ ] Environment variables configured (production Firebase config)
- [ ] BAAs signed with all third-party providers (Firebase, Daily.co)
- [ ] SSL certificate valid (Firebase Hosting handles automatically)
- [ ] Backup current production database
- [ ] Notify users of deployment window (if downtime expected)

**Deployment:**
- [ ] Merge PR to `main` branch
- [ ] CI/CD pipeline runs automatically
- [ ] Monitor deployment logs for errors
- [ ] Verify deployment success (check Firebase Hosting dashboard)

**Post-Deployment:**
- [ ] Run smoke tests (login, call initiation, FCM push notification)
- [ ] Check error logs (Sentry, Cloud Logging)
- [ ] Verify real-time features (presence updates, call notifications)
- [ ] Test from multiple devices/browsers
- [ ] Notify users deployment complete
- [ ] Update documentation if features changed

**Rollback Plan:**
- Firebase Hosting allows instant rollback to previous version
- Command: `firebase hosting:rollback` (via CLI)
- Rollback database if schema changes caused issues (restore from backup)

---

### 13.4 Monitoring & Alerting

#### 13.4.1 Metrics to Monitor
- **System Health:**
  - API response times (p50, p95, p99)
  - Error rate (5xx errors)
  - Uptime
  - Database read/write latency

- **User Behavior:**
  - Daily/weekly active users
  - Average session duration
  - Calls per day
  - Call success rate (answered vs. missed)

- **Video Quality:**
  - Average call duration
  - Connection failures
  - Packet loss / jitter
  - Resolution distribution

#### 13.4.2 Alerting Rules
- **Critical (Page On-Call):**
  - System uptime < 99.9% (1 hour window)
  - Error rate > 5% (15 min window)
  - Database latency > 2 seconds (5 min window)
  - WebRTC connection failures > 20% (30 min window)

- **Warning (Email/Slack):**
  - Error rate > 1% (30 min window)
  - FCM push notification failures > 10% (1 hour)
  - Unusual spike in traffic (3x baseline)

#### 13.4.3 Tools
- **Firebase Analytics:** User behavior, retention, funnels
- **Sentry:** Error tracking, performance monitoring
- **Cloud Logging:** Centralized logs, custom queries
- **UptimeRobot:** External uptime monitoring (free tier)

---

## 14. Cost Analysis

### 14.1 Initial Setup Costs (One-Time)

| Item | Cost | Notes |
|------|------|-------|
| Firebase Project Setup | **$0** | Free |
| Twilio Account Setup | **$0** | Free (pay-as-you-go) |
| Domain Name | **$12/year** | .com domain (optional, can use Firebase subdomain) |
| SSL Certificate | **$0** | Firebase Hosting includes free SSL |
| Development Time | **$8,000 - $15,000** | Estimate: 100-200 hours @ $80-100/hr (if hiring developer) |

**Total Initial Setup:** ~$10,000 - $15,000 (if outsourcing development)

---

### 14.2 Monthly Recurring Costs (Production)

#### 14.2.1 Firebase (Blaze Plan - Pay-as-you-go)

**Estimates based on 15 users, 100 calls/month:**

| Service | Usage | Cost/Unit | Monthly Cost |
|---------|-------|-----------|--------------|
| **Firestore** | | | |
| Document Reads | 50,000/month | $0.06 per 100K | **$0.03** |
| Document Writes | 10,000/month | $0.18 per 100K | **$0.02** |
| Storage | 1 GB | $0.18/GB | **$0.18** |
| **Realtime Database** | | | |
| Bandwidth | 5 GB/month | $1.00/GB | **$5.00** |
| Storage | 1 GB | $5.00/GB | **$5.00** |
| **Cloud Functions** | | | |
| Invocations | 10,000/month | $0.40 per 1M | **$0.01** |
| Compute Time | 10,000 GB-sec | $0.0000025/GB-sec | **$0.03** |
| **Hosting** | | | |
| Bandwidth | 10 GB/month | $0.15/GB | **$1.50** |
| Storage | 1 GB | $0.026/GB | **$0.03** |
| **Authentication** | | | |
| Users | 15 users | Free up to 50K MAU | **$0.00** |

**Firebase Total:** ~**$12/month**

---

#### 14.2.2 Firebase Cloud Messaging (FCM)

| Metric | Usage | Cost/Unit | Monthly Cost |
|--------|-------|-----------|--------------|
| Push Notifications Sent | Unlimited | $0.00 | **$0.00** |
| Device Token Storage | Included in Firestore | $0.00 | **$0.00** |

**FCM Total:** **$0/month** - Completely free and unlimited

---

#### 14.2.3 Video Service (Daily.co - Free Tier)

**Free Tier Includes:**
- 10,000 minutes/month (166 hours)
- Unlimited rooms
- Up to 20 participants per room

**Usage Estimate:**
- 100 calls/month × 10 min avg = 1,000 minutes/month

**Daily.co Total:** **$0/month** (well within free tier)

**If Exceeding Free Tier:**
- $0.004/minute after 10K minutes
- Example: 15,000 minutes = $20/month

---

#### 14.2.4 Domain & Misc

| Item | Monthly Cost |
|------|--------------|
| Domain Name | $1/month (annual payment divided) |
| Monitoring (UptimeRobot) | $0 (free tier) |
| Error Tracking (Sentry) | $0 (free tier: 5K events/month) |

**Misc Total:** ~**$1/month**

---

### 14.3 Total Monthly Cost Summary

| Category | Monthly Cost |
|----------|--------------|
| Firebase | $12 |
| FCM Push Notifications | $0 |
| Video (Daily.co) | $0 (free tier) |
| Domain & Misc | $1 |
| **TOTAL** | **~$13/month** |

**Annual Cost:** ~**$156/year**

---

### 14.4 Cost Scaling Projections

#### Scenario: 100 Users, 500 Calls/Month

| Category | Monthly Cost |
|----------|--------------|
| Firebase | $45 (increased Firestore, Realtime DB usage) |
| FCM Push Notifications | $0 |
| Video (Daily.co) | $20 (5,000 minutes, exceeding free tier) |
| Domain & Misc | $1 |
| **TOTAL** | **~$66/month** |

#### Scenario: 1,000 Users, 5,000 Calls/Month

| Category | Monthly Cost |
|----------|--------------|
| Firebase | $250 (significantly increased usage) |
| FCM Push Notifications | $0 |
| Video (Daily.co) | $200 (50,000 minutes) |
| Domain & Misc | $1 |
| **TOTAL** | **~$451/month** |

**Note:** At this scale, self-hosted WebRTC becomes cost-effective (requires TURN server, ~$50/month DigitalOcean droplet).

---

### 14.5 Cost Optimization Strategies

1. **Video:** Switch to self-hosted WebRTC if calls exceed 10K minutes/month consistently
2. **Push Notifications:** Already free with FCM - no optimization needed
3. **Firestore:** Use Firestore caching on client to reduce reads
4. **Hosting:** Enable CDN caching for static assets
5. **Monitoring:** Stick with free tiers (Sentry, UptimeRobot) until critical

---

## 15. Development Timeline

### 15.1 Phase 1: MVP (Minimum Viable Product)

**Duration:** 6-8 weeks

#### Week 1-2: Foundation & Setup
- [ ] Firebase project setup (dev, staging, production)
- [ ] Initialize React app with TypeScript, Vite, TailwindCSS
- [ ] Set up version control (GitHub repo)
- [ ] Configure CI/CD pipeline (GitHub Actions)
- [ ] Create basic routing structure
- [ ] Implement design system (colors, typography, components)

#### Week 3: Authentication & User Management
- [ ] Firebase Auth integration
- [ ] Login page (email/password)
- [ ] Password reset flow
- [ ] Admin: Create user functionality
- [ ] Admin: User list view
- [ ] Admin: Edit/delete users
- [ ] Firestore security rules (basic)

#### Week 4: Real-Time Presence & Roster
- [ ] Firestore presence collection setup
- [ ] Real-time presence tracking (online/offline)
- [ ] User roster view (list of users with status)
- [ ] Search and filter functionality
- [ ] Status dropdown (Available, Busy, Away)

#### Week 5-6: Video Calling (Daily.co Integration)
- [ ] Daily.co account setup and API integration
- [ ] Call initiation flow (create room, send invite)
- [ ] Incoming call modal with accept/decline
- [ ] Active video call interface (Daily.co iframe)
- [ ] Call state management (ringing, active, ended)
- [ ] Call document creation in Firestore
- [ ] End call functionality

#### Week 7: Push Notifications (FCM)
- [ ] Firebase Cloud Messaging setup (service worker, token management)
- [ ] Implement FCM token registration on login
- [ ] Cloud Function: Send FCM push on missed call
- [ ] Push notification template configuration
- [ ] FCM delivery status tracking
- [ ] User notification preferences page
- [ ] PWA manifest configuration for better mobile notifications

#### Week 8: Polish & Testing
- [ ] Call history view (read-only)
- [ ] Settings page (profile, notifications)
- [ ] Activity logs (basic admin view)
- [ ] E2E testing with Playwright
- [ ] Bug fixes and UI polish
- [ ] User acceptance testing (UAT)
- [ ] Production deployment

**MVP Features Included:**
- User authentication
- Admin user management
- Real-time presence tracking
- One-on-one video calling
- FCM push notifications for missed calls
- Basic call history
- PWA installation support

**MVP Features Deferred:**
- Advanced analytics dashboard
- Bulk user import
- Call quality metrics
- Post-call feedback
- MFA (2FA)

---

### 15.2 Phase 2: Enhancements

**Duration:** 4-6 weeks (start after Phase 1 complete)

#### Features:
- [ ] Admin analytics dashboard (charts, KPIs)
- [ ] Advanced call history filtering
- [ ] Call quality metrics (latency, jitter, packet loss)
- [ ] Post-call feedback (star rating, comments)
- [ ] Bulk user import (CSV)
- [ ] System configuration UI (timeouts, SMS templates)
- [ ] Email notifications (future enhancement)
- [ ] Improved error handling and user messaging
- [ ] Mobile-responsive UI improvements
- [ ] Accessibility improvements (WCAG 2.1 AA)

---

### 15.3 Phase 3: Advanced Features (Future)

**Duration:** 8-12 weeks

#### Features:
- [ ] Multi-party video calls (3+ participants)
- [ ] Screen sharing during calls
- [ ] In-call text chat
- [ ] Call recording (with consent, encrypted storage)
- [ ] Integration with EHR systems (HL7/FHIR)
- [ ] Mobile native apps (iOS, Android)
- [ ] Enhanced PWA features (background sync, offline support)
- [ ] Advanced scheduling (on-call rotation automation)
- [ ] Voice-only calling option
- [ ] File sharing during calls
- [ ] Whiteboards/annotations

---

### 15.4 Milestone Schedule

| Milestone | Target Date | Deliverables |
|-----------|-------------|--------------|
| **M1: Project Kickoff** | Week 0 | Requirements finalized, team assembled |
| **M2: Design Complete** | Week 2 | UI mockups approved, tech stack confirmed |
| **M3: Core Infrastructure** | Week 3 | Auth, database, CI/CD working |
| **M4: Video Calling Prototype** | Week 6 | First end-to-end video call successful |
| **M5: MVP Feature Complete** | Week 7 | All Phase 1 features implemented |
| **M6: UAT Complete** | Week 8 | All critical bugs fixed, stakeholders sign off |
| **M7: Production Launch** | Week 8 | MVP deployed to production, users onboarded |

---

## 16. Risk Assessment & Mitigation

### 16.1 Technical Risks

#### Risk 1: WebRTC Connection Failures
**Likelihood:** Medium  
**Impact:** High (core functionality broken)

**Mitigation:**
- Use STUN/TURN servers (Google's public STUN, Twilio TURN)
- Implement fallback to Daily.co managed service if self-hosted fails
- Display clear error messages with troubleshooting steps
- Provide network requirements documentation to users

---

#### Risk 2: Firebase Vendor Lock-In
**Likelihood:** Low  
**Impact:** Medium (hard to migrate if needed)

**Mitigation:**
- Abstract Firebase calls behind service layer (easier to swap)
- Export data regularly (weekly backups)
- Document data schema for potential migration
- Choose Firebase alternatives that support similar real-time features (e.g., Supabase, AWS AppSync)

---

#### Risk 3: FCM Push Notification Failures
**Likelihood:** Low
**Impact:** Medium (users miss urgent calls)

**Mitigation:**
- Implement automatic token refresh when tokens expire
- Track notification delivery status in Firestore
- Test notification permissions on login
- Display clear instructions if permission denied
- Fall back to in-app notifications if FCM unavailable
- Support multiple device tokens per user
- Provide troubleshooting guide for notification issues

---

#### Risk 4: Scalability Bottlenecks
**Likelihood:** Low (Phase 1: 15 users)  
**Impact:** Medium

**Mitigation:**
- Design database schema for scale from day one
- Use Firestore compound indexes for efficient queries
- Implement pagination (never load all data at once)
- Load test with simulated traffic (100+ users) before Phase 2

---

### 16.2 Security Risks

#### Risk 5: Unauthorized Access
**Likelihood:** Medium  
**Impact:** High (HIPAA violation, data breach)

**Mitigation:**
- Enforce strong password policy
- Implement MFA for admins (Phase 2: all users)
- Regular security audits (quarterly)
- Monitor for suspicious activity (unusual login locations)
- Automatic session expiration

---

#### Risk 6: Data Breach
**Likelihood:** Low  
**Impact:** Critical (legal liability, patient harm)

**Mitigation:**
- Encrypt all data (in transit: TLS, at rest: AES-256)
- Sign BAAs with all providers
- Implement role-based access control
- Regular penetration testing
- Incident response plan in place
- Maintain comprehensive audit logs

---

#### Risk 7: Denial of Service (DoS) Attack
**Likelihood:** Low  
**Impact:** High (system unavailable)

**Mitigation:**
- Use Firebase Hosting DDoS protection (built-in)
- Implement rate limiting on Cloud Functions
- Set up CloudFlare in front of Firebase (optional)
- Monitor for unusual traffic patterns

---

### 16.3 Operational Risks

#### Risk 8: Key Personnel Departure
**Likelihood:** Medium  
**Impact:** High (development stalls)

**Mitigation:**
- Comprehensive code documentation
- Pair programming for critical features
- Knowledge transfer sessions
- Maintain detailed technical documentation (this document!)

---

#### Risk 9: Third-Party Service Outage
**Likelihood:** Low  
**Impact:** High (system unavailable)

**Dependencies:**
- Firebase (99.95% SLA - includes FCM)
- Daily.co (no published SLA)

**Mitigation:**
- Choose providers with strong SLAs
- Implement graceful degradation (e.g., SMS fails → show in-app only)
- Subscribe to status pages (Firebase Status Dashboard, Twilio Status)
- Have backup providers configured (inactive, activate if primary fails)

---

#### Risk 10: Regulatory Compliance Failure
**Likelihood:** Low (if BAAs signed)  
**Impact:** Critical (fines, legal action)

**Mitigation:**
- Engage HIPAA compliance consultant for audit before launch
- Sign BAAs with all third-party providers
- Regular compliance audits (annual)
- Stay updated on HIPAA rule changes
- Document all compliance measures

---

### 16.4 Risk Matrix

| Risk | Likelihood | Impact | Priority | Mitigation Status |
|------|------------|--------|----------|-------------------|
| WebRTC Failures | Medium | High | **HIGH** | Planned (fallback to Daily.co) |
| Firebase Lock-In | Low | Medium | LOW | Planned (service abstraction) |
| SMS Failures | Low | Medium | MEDIUM | Planned (retry logic) |
| Scalability | Low | Medium | LOW | Planned (load testing Phase 2) |
| Unauthorized Access | Medium | High | **HIGH** | In Progress (MFA for admins) |
| Data Breach | Low | Critical | **HIGH** | In Progress (BAAs, encryption) |
| DoS Attack | Low | High | MEDIUM | Planned (rate limiting) |
| Key Personnel Loss | Medium | High | MEDIUM | Ongoing (documentation) |
| Service Outage | Low | High | MEDIUM | Planned (backup providers) |
| Compliance Failure | Low | Critical | **HIGH** | Planned (consultant audit) |

---

## 17. Future Enhancements

### 17.1 Short-Term Enhancements (3-6 months)

1. **Mobile Native Apps**
   - iOS and Android apps for better mobile experience
   - Push notifications for incoming calls
   - Native camera/microphone access (better quality)

2. **Advanced Analytics**
   - Predictive analytics (call volume forecasting)
   - User behavior insights (most active times, users)
   - Facility usage comparison

3. **Multi-Factor Authentication (MFA)**
   - Mandatory for all users (not just admins)
   - Support for authenticator apps (Google Authenticator, Authy)

4. **Scheduled On-Call Rotations**
   - Automatically assign supervisor on-call status
   - Integration with calendar (Google Calendar, Outlook)
   - Automatic status updates based on schedule

5. **Enhanced PWA Capabilities**
   - Offline mode with background sync
   - Advanced notification features (vibration patterns, custom sounds)
   - Home screen installation prompts

---

### 17.2 Long-Term Enhancements (6-12 months)

6. **Electronic Health Record (EHR) Integration**
   - HL7/FHIR integration with Epic, Cerner
   - Contextual patient data during calls (with consent)
   - Automatic call documentation in EHR

7. **Call Recording & Playback**
   - Encrypted storage (HIPAA-compliant)
   - Consent management
   - Searchable transcripts (speech-to-text)

8. **AI-Powered Features**
   - Real-time transcription during calls
   - Post-call summarization
   - Automatic tagging/categorization of calls
   - Sentiment analysis (detect urgent vs. routine)

9. **Telemedicine Expansion**
   - Screen sharing for reviewing images/scans
   - Collaborative whiteboard
   - File sharing (images, documents)
   - Multi-party calls (3+ participants)

10. **Advanced Notification System**
    - Escalation policies (if supervisor doesn't answer, try next)
    - Custom notification preferences per user
    - Integration with Slack, Microsoft Teams
    - SMS fallback option (for special cases requiring traditional paging)

---

### 17.3 Enterprise Features (12+ months)

11. **Multi-Tenancy**
    - Support for multiple hospital systems in one instance
    - Data isolation per tenant
    - Custom branding per tenant

12. **Advanced Reporting & Compliance**
    - Custom report builder
    - Automated compliance reports (HIPAA audit logs)
    - Integration with SIEM systems (Splunk, LogRhythm)

13. **API & SDK**
    - Public API for third-party integrations
    - JavaScript SDK for embedding video calls in other apps
    - Webhooks for external systems

14. **Global Expansion**
    - Multi-language support (Spanish, Mandarin, etc.)
    - Region-specific compliance (GDPR, PIPEDA)
    - CDN optimization for international users

15. **Offline Mode**
    - Progressive Web App (PWA) with offline capabilities
    - Sync data when connection restored
    - Offline call initiation (queued for when online)

---

## Conclusion

This Technical Design Document provides a comprehensive blueprint for building a secure, scalable, and HIPAA-compliant medical video supervision and paging system. The system leverages modern cloud technologies (Firebase, WebRTC, FCM) to deliver real-time communication capabilities tailored to the unique needs of medical facilities and on-call supervisors.

**Key Takeaways:**
- **Cost-Effective:** ~$13/month for MVP with 15 users (even lower with free FCM)
- **Rapid Development:** 6-8 weeks to MVP launch
- **Scalable Architecture:** Designed to grow from 15 to 1,000+ users
- **Security-First:** HIPAA compliance considerations built-in from day one
- **User-Centric:** Simple, intuitive interface optimized for urgent medical consultations

**Next Steps:**
1. Review and approve this TDD with stakeholders
2. Finalize vendor selection (Daily.co vs. self-hosted WebRTC)
3. Sign BAAs with all third-party providers (Firebase, Daily.co)
4. Configure FCM service worker and notification permissions
4. Assemble development team (or select development partner)
5. Begin Phase 1 development (Week 1: Foundation & Setup)

**Questions or Feedback:**
Please direct all questions, feedback, or requested changes to this document to the project owner or development team lead.

---

**Document Revision History:**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-21 | Dr. Nate | Initial draft |

---

**Approval Signatures:**

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Project Owner | Dr. Nate | _________ | _____ |
| Technical Lead | _________ | _________ | _____ |
| Compliance Officer | _________ | _________ | _____ |

---

**End of Document**