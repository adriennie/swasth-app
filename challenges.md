# Challenges for Swasthya

## 1. Technical Challenges

### 1.1 React Native Cross-Platform UI Inconsistencies

One challenge in this project is keeping the UI stable across iOS, Android, and web. Components such as calendars, keyboard-aware layouts, modals, shadows, and gradients often behave differently on each platform. That means a screen that looks polished on one device can shift spacing, clipping, or scroll behavior on another.

### 1.2 AI API Latency and Rate Limits

If the project later replaces FlowBot’s rule-based replies with a hosted LLM, response time and rate limits will immediately become user-facing problems. Health guidance feels most useful when it is fast, so even a good model can feel poor if replies arrive too slowly.

### 1.3 State Management Complexity at B2B Scale

The current app uses local screen state and some AsyncStorage persistence. That is manageable now, but B2B commerce flows become complicated when product lists, cart state, inventory levels, approval status, and role-specific dashboards all need to stay synchronized. A larger deployment would likely need a more structured state layer such as Redux or Zustand with clear domain boundaries.

### 1.4 Secure Token Handling and Session Management

The app currently persists a lightweight auth object locally. That is enough for a prototype, but multi-org business users need stronger session controls, token refresh handling, logout invalidation, and better protection against session leakage between roles or devices.

### 1.5 Real-Time Data Sync Tradeoffs

Order status and inventory data can change after a user leaves a screen. WebSockets would improve freshness, but polling is easier to implement and debug. The project therefore sits in a tradeoff zone between instant updates and simpler, more reliable client logic.

### 1.6 App Size Optimization with AI Assets

If large models or media assets are added later, the app bundle and runtime storage footprint become a concern. Mobile users, especially field users in pharmacy or distributor settings, may not accept a heavy app that consumes too much data or device storage.

### 1.7 Offline-First Behavior for Field Users

Pharmacy and distributor users may work in poor connectivity zones. The current implementation uses local persistence in a few places, but a true offline-first design would require queueing writes, conflict resolution, and sync-status indicators.

## 2. B2B-Specific Challenges

### 2.1 Multi-Tenancy and Organization Isolation

The app spans customers, pharmacies, distributors, and admin. That creates a multi-tenant problem: each business must only see its own orders, inventory, and mapping data. The current role model is a starting point, but enterprise-grade isolation would require stricter row-level policy design and more explicit organization IDs.

### 2.2 Enterprise SSO and SAML Integration

The repository currently uses direct sign-in and role-based profile checks. Enterprise customers often need SSO or SAML integration, which would change login flows, identity mapping, and approval logic. This is a significant architectural extension, not a small feature add-on.

### 2.3 Audit Logging and Compliance

B2B operations often require a full audit trail for approvals, order changes, stock edits, and delivery verification. The current app shows the user-facing actions, but a compliant system would need immutable logging, timestamps, and actor identifiers for sensitive events.

### 2.4 Onboarding Non-Technical Business Users

Pharmacy and distributor users may not be technical. That means the signup, approval, stock setup, and order flows must remain extremely clear. Every extra screen or unclear validation step increases the chance of abandonment.

## 3. AI Integration Challenges

### 3.1 Prompt Engineering for Consistent Outputs

A health assistant must answer consistently, especially across sensitive topics. Once a prompt-based LLM is introduced, the system must reduce style drift, avoid overconfident language, and keep outputs aligned with domain terminology.

### 3.2 Hallucination Handling and Output Validation

Generated content can sound authoritative even when wrong. In a health context, that creates a serious trust and safety issue. Any future generative AI layer should include filtering, citation checks, and fallback messaging when the output is uncertain.

### 3.3 Cost Management at Scale

LLM usage can become expensive quickly when chat usage grows across many users. For a commerce-plus-health platform, cost control is not optional; it affects whether the AI feature remains viable.

### 3.4 Response Time vs User Expectation

Users expect an assistant to reply almost instantly. Even a one- or two-second delay can feel slow in chat. That mismatch is especially visible on mobile and makes caching or lightweight fallbacks important.

### 3.5 Fine-Tuning vs RAG Tradeoffs

If the platform later needs stronger domain accuracy, the team must choose between fine-tuning and retrieval-augmented generation. Fine-tuning can improve style and consistency, while RAG helps keep answers grounded in current reference material. The right choice depends on safety, cost, and update frequency.

## 4. Process Challenges

### 4.1 Requirement Changes Mid-Sprint

The project already spans consumer and B2B use cases, so scope can expand easily. If requirements change mid-sprint, the team must renegotiate priorities carefully or risk breaking the architecture into inconsistent feature fragments.

### 4.2 Testing AI-Generated Content

AI-style responses are not deterministic, which makes unit testing harder than for pure business rules. The project needs a mix of snapshot-style checks, allowed-response sets, and safety assertions rather than only exact string matching.

### 4.3 Documentation Lag

The codebase moves quickly, and documentation can fall behind. That is why the docs in this task must be tied tightly to the actual screens and SQL scripts rather than generic product language.

## 5. Most Original Takeaways

The hardest part of this repository is not just implementing features. It is coordinating four user roles, two commerce paths, local persistence, and future-ready AI in a way that still feels simple on a phone. That combination creates a design problem: the system must be powerful enough for B2B operations but readable enough for first-time business users and health consumers.
