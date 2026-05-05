# Results and Discussion for Swasthya

## 1. Performance Metrics

### 1.1 Qualitative Performance Observations

- The app follows a direct screen-to-database access pattern, so the main latency comes from Supabase reads and writes rather than a separate backend hop.
- Local persistence through AsyncStorage makes some screens feel immediate, especially tracker and cart-related workflows.
- Dashboard screens perform several data fetches and profile lookups, so perceived speed depends on query count and data size.

### 1.2 Suggested Metrics to Report

- Screen load time on first open.
- Time to place an order.
- Time to render dashboard KPIs.
- Time to generate FlowBot reply.
- Time to save a cycle log.
- Frequency of validation errors in MOQ and inventory flows.

## 2. AI Accuracy Discussion

### 2.1 Current State

FlowBot is not a generative model in the current codebase. Its behavior is rule-based and deterministic, which makes it easy to explain and relatively safe for a prototype.

### 2.2 Accuracy Interpretation

Because the assistant uses pattern matching, accuracy should be discussed as rule coverage rather than model precision/recall. The key question is whether the knowledge rules capture the most common user intents and respond safely to urgent topics.

### 2.3 What Works Well

- Known health topics receive consistent answers.
- Urgent symptom messages are handled conservatively.
- The responses are easy to validate against a content checklist.

### 2.4 What Is Limited

- Responses are not deeply contextual.
- The bot cannot synthesize new medical advice beyond its rule set.
- It cannot provide true conversational memory or personalized inference beyond the local profile.

## 3. User Flow Outcomes

### 3.1 Customer Flow Outcome

The customer journey is coherent: login, browse, learn, chat, and track cycles. The strongest outcome here is continuity between product discovery and health education.

### 3.2 Admin Flow Outcome

The admin flow supports catalog governance, approvals, and order oversight. The product management screen is especially important because it controls MOQ and bulk import behavior that affects the rest of the system.

### 3.3 Distributor Flow Outcome

The distributor workflow demonstrates the intended B2B mechanics: bulk ordering, MOQ enforcement, status management, and delivery verification.

### 3.4 Pharmacy Flow Outcome

The pharmacy workflow is practical and operationally oriented. It combines inventory management, assigned distributor visibility, and order placement from a single mobile interface.

## 4. Comparison with Objectives

### 4.1 Objectives Met

- Multi-role mobile platform structure.
- Customer health tracking and education.
- B2B ordering and inventory flows.
- MOQ-aware bulk ordering.
- Basic role-based access and navigation.
- Heuristic AI assistant for menstrual-health Q&A.

### 4.2 Objectives Partially Met

- Real-time synchronization.
- Stronger enterprise-grade auth and tenant isolation.
- Rich analytics and reporting.
- More advanced AI reasoning and citations.

### 4.3 Objectives Not Yet Implemented

- External LLM integration.
- Payment gateway and invoicing stack.
- SSO/SAML.
- Comprehensive audit logging.
- Offline-first sync engine.

## 5. Discussion

The repository shows a clear prototype that is already useful as a functional multi-role platform. The most valuable design choice is the separation of concerns by role and workflow rather than forcing every user into a single generic dashboard. That said, the current implementation should be understood as a strong foundation rather than a production-grade enterprise platform.

The biggest strength is pragmatic simplicity. Supabase, AsyncStorage, and Expo Router allow the team to move quickly while still supporting realistic B2B behaviors. The biggest risk is also simplicity: as the app grows, direct client-side querying and local state persistence will need stronger guardrails to handle concurrency, permissions, and scale.

## 6. Overall Conclusion

Swasthya already demonstrates a credible mix of consumer health, educational content, and B2B supply-chain operations. The next architectural step would be to harden identity, tenant isolation, and AI safety while keeping the mobile UX lightweight.
