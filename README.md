# Swasthya: Multi-Role Women's Health Platform with AI-Driven Content Personalization

**A capstone Data Science & AI project demonstrating applied machine learning, heuristic reasoning, and production-grade mobile systems design.**

---

## 📋 Executive Summary

Swasthya is a full-stack React Native + Supabase platform serving women's reproductive health and B2B pharmaceutical supply chains. The core data science contribution is a **rule-based personalization engine** that filters educational content using semantic tagging and user profile heuristics, combined with a **cycle prediction algorithm** that derives menstrual patterns from sparse self-reported logs.

The project demonstrates:
- **Applied AI/ML methodology** in a real-world domain (health)
- **Reproducible research design** with documented evaluation criteria
- **Production-ready architecture** with TypeScript, role-based access control, and Supabase persistence
- **Multi-stakeholder system thinking** across consumer and B2B workflows

**Repository**: [GitHub Link](#)  
**Live Demo**: Available on request  
**Evaluation Docs**: See `files` for system design, implementation, testing, and technical challenges.

---

## 🎯 Problem Statement

**Why this matters:**  
Women in India face gaps in accessible health information and fragmented supply chains for menstrual-wellness products. A unified platform combining personalized health education with B2B inventory management can improve health literacy while enabling small pharmacies and distributors to operate efficiently.

**Technical problem:**  
How can we deliver personalized health content and cycle insights on-device, without relying on costly generative APIs, while maintaining safety, explainability, and compliance in a health domain?

---

## 🧠 Data Science & AI Components

### 1. Content Personalization Engine (Rule-Based)

**Objective**: Recommend relevant educational articles based on user health profile.

**Methodology**:
- User profiles store discrete health tags (e.g., `high_flow`, `irregular_cycle`, `pcos`, `heavy_period_pain`).
- Article metadata includes semantic tags and target conditions.
- Relevance score is computed as tag intersection cardinality.
- Articles ranked by relevance and content publication date.

**Why heuristic?**  
- Deterministic and fully auditable (critical for health apps).
- Zero LLM cost (sustainable for student/prototype stage).
- No hallucination risk in medical guidance.
- User tags are explicit and updatable.

**Validation**:
- Test coverage in `TESTING.md` (TC-08): Verify personalized articles match user tags.
- Manual review of curated knowledge base for safety and accuracy.
- Future work: User feedback loop to validate relevance.

```typescript
// Pseudocode: Content Personalization
function recommendArticles(userTags: string[], articles: Article[]): Article[] {
  const relevanceScores = articles.map(article => ({
    article,
    score: userTags.filter(tag => article.tags.includes(tag)).length
  }));
  return relevanceScores
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || b.article.publishedAt - a.article.publishedAt)
    .slice(0, ARTICLE_DISPLAY_LIMIT)
    .map(item => item.article);
}
```

**Metrics**:  
- Relevance coverage: % of user profile tags matched in returned articles.
- Serendipity: % of recommended articles outside direct profile tags (related health conditions).

### 2. Menstrual Cycle Prediction (Heuristic)

**Objective**: Predict next period and ovulation window from sparse user-logged cycle data.

**Methodology**:
- User logs daily flow intensity (light/medium/heavy) and symptoms.
- Cycle length is inferred as the interval between consecutive medium/heavy flow logs.
- Multi-cycle average stabilizes the prediction; single cycles use default (28 days).
- Ovulation estimated at cycle day 14 (standard population assumption).

**Why simple averaging?**  
- Typical cycle log data is sparse (1–2 months available at start).
- Simple averages are more robust to outliers than polynomial fitting on small samples.
- Output is intuitive for user communication.
- Transparent to users and healthcare providers.

**Validation** (see `TESTING.md` TC-04, TC-05):
- Edge case: Sparse logs (1 cycle) → default 28 days applied.
- Edge case: Outlier cycles (e.g., 12 days) → averaging includes all observed cycles; app shows range.
- User feedback: Predicted vs. actual cycle onset correlation (future work with user consent).

```typescript
// Pseudocode: Cycle Prediction
function predictNextPeriod(cycleLogs: CycleLog[]): Prediction {
  const periods = cycleLogs
    .sort((a, b) => a.date - b.date)
    .filter(log => log.flow === 'medium' || log.flow === 'heavy')
    .map(log => log.date);
  
  if (periods.length < 2) return { cycleLengthDays: 28, confidence: 'low' };
  
  const intervals = [];
  for (let i = 1; i < periods.length; i++) {
    intervals.push((periods[i] - periods[i-1]) / (1000 * 60 * 60 * 24)); // days
  }
  
  const avgCycleLength = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const nextPeriod = new Date(periods[periods.length - 1].getTime() + avgCycleLength * 24 * 60 * 60 * 1000);
  
  return { 
    nextPeriod, 
    ovulation: new Date(nextPeriod.getTime() - 14 * 24 * 60 * 60 * 1000),
    cycleLengthDays: Math.round(avgCycleLength),
    confidence: periods.length > 3 ? 'medium' : 'low'
  };
}
```

**Limitations**:
- Assumes regular cycles; does not detect PCOS, pregnancy, or hormonal contraceptive effects.
- No statistical confidence intervals (user education opportunity).
- Future work: Bayesian online updating, anomaly detection.

### 3. FlowBot Health Assistant (Pattern Matching)

**Objective**: Answer menstrual-health Q&A safely and consistently without generative models.

**Methodology**:
- Curated knowledge base: symptom → medical guidance (domain-reviewed).
- Multi-pattern matching: keyword detection → urgency classification → response selection.
- Urgent keywords (e.g., "severe hemorrhage", "syncope", "fever") → escalation to medical help.
- Fallback: Generic supportive response if no match found.

**Safety Design**:
- No hallucination (deterministic output).
- Transparent confidence: app indicates when answer is general vs. specific to symptom.
- Escalation on serious keywords (see `CHALLENGES.md` 3.2 for validation design).

**Validation**:
- Test coverage (TC-06, TC-07): Known-pattern responses verified; emergency keywords tested.
- Manual review: 5–10 health professionals validate response accuracy pre-deployment.
- Future work: User confidence ratings after responses (implicit feedback).

```typescript
// Pseudocode: FlowBot Pattern Matching
function answerQuery(userMessage: string, knowledgeBase: KnowledgeRule[]): Response {
  // Check urgent symptoms first
  if (urgentKeywords.some(kw => userMessage.toLowerCase().includes(kw))) {
    return { type: 'emergency', text: 'Please contact emergency services...', escalate: true };
  }
  
  // Match against knowledge base rules
  for (const rule of knowledgeBase) {
    const patterns = rule.patterns.map(p => new RegExp(p, 'i'));
    if (patterns.some(p => p.test(userMessage))) {
      return { type: 'answer', text: rule.response, confidence: rule.confidence };
    }
  }
  
  // Fallback
  return { type: 'fallback', text: 'I\'m not sure about that. Please consult a healthcare provider.' };
}
```

**Metrics**:
- Coverage: % of unique user queries matched (from logs).
- Safety: % of urgent symptoms correctly routed to escalation.
- User satisfaction: Post-response feedback (optional, in-app survey).

---

## 🏗️ System Architecture

### Three-Layer Design

```
┌─────────────────────────────────────┐
│  Client Layer (React Native + Expo) │
│  • Role-based navigation            │
│  • Local state (AsyncStorage)       │
│  • AI: Personalization + Cycle pred │
└──────────────┬──────────────────────┘
               │
┌──────────────v──────────────────────┐
│  Data Layer (Supabase)              │
│  • PostgreSQL: Products, Orders,    │
│    Inventory, Profiles, Cycle Logs  │
│  • Auth: Email/Password             │
│  • Storage: Product images          │
└──────────────┬──────────────────────┘
               │
┌──────────────v──────────────────────┐
│  AI/Reasoning Layer                 │
│  • FlowBot (keyword matching)       │
│  • Personalization (tag filtering)  │
│  • Prediction (heuristic averaging) │
└─────────────────────────────────────┘
```

### Data Model

**Core entities** (10+ tables):
- `products` — SKU, pricing, MOQ, distributor markup
- `cycle_logs` — User-logged menstrual data (flow, symptoms, mood, sleep, energy, focus, lifestyle)
- `articles` — Educational content with semantic tags
- `user_health_profiles` — Health tags, personalization state
- `orders` — Pharmacy and distributor commerce
- `pharmacy_inventory` — Stock levels, reorder thresholds
- `pharmacy_distributors` — Many-to-many network mapping
- `delivery_otp` — OTP-based fulfillment verification

**Why direct-query architecture?**  
- Simpler than a REST API server for MVP stage.
- Faster iteration on data schema.
- Suitable for <100k concurrent users.

**Future:** API gateway layer for production scale and stricter access control.

---

## 🧪 Evaluation & Testing Strategy

### Methodological Approach

**Four-layer testing**:

1. **Unit Tests** (Business Logic)
   - Cycle prediction edge cases (sparse logs, outliers, single cycle).
   - MOQ validation (quantities below/equal/above threshold).
   - Content personalization (tag matching, ranking order).
   - FlowBot response classification.

2. **Integration Tests** (Role-Specific Flows)
   - Auth flow: credentials → profile → session persistence.
   - Order lifecycle: add items → route (distributor vs. admin) → create records → appear in views.
   - Inventory updates: edit stock → recalculate thresholds → update UI.

3. **UAT** (User Scenarios)
   - 4 roles × 5 workflows = 20 end-to-end scenarios (see `TESTING.md`).
   - Test cases mapped to GitHub issues for traceability.

4. **AI Output Validation** (Content & Safety)
   - Regression test suite for FlowBot: known queries → expected intent category.
   - Allowed-response sets for health guidance (prevent hallucination).
   - Manual review process for urgent-symptom escalation.

### Validation Metrics

| Component | Metric | Target | Notes |
|-----------|--------|--------|-------|
| Cycle Prediction | Prediction accuracy (future: user feedback loop) | ≥70% | Current data insufficient for statistical eval. |
| Personalization | Coverage (% user tags matched in results) | ≥80% | Automated test. |
| FlowBot | Emergency routing accuracy | 100% | Manual review + regex test. |
| MOQ Validation | False negatives (invalid orders slip through) | 0% | Automated test. |
| Latency (Mobile) | Dashboard load time | <2s | Measured on Pixel 6, 4G. |

### Test Results Summary

**Current status**: 16+ test cases defined; infrastructure ready for execution pre-deployment.  
**See** `TESTING.md` for complete test case table, expected results, and validation methodology.

---

## 📊 Technical Stack Justification

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | React Native + Expo | Cross-platform iOS/Android/web; fast iteration; Expo Router for role-based navigation. |
| **Language** | TypeScript | Type safety reduces cross-role data leakage bugs; easier maintainability. |
| **State** | React Hooks + AsyncStorage | Lightweight local persistence for offline-like UX; sufficient for current scale. |
| **Backend** | Supabase (PostgreSQL) | Structured relational queries; built-in auth; no server ops. |
| **AI** | Heuristic (not LLM-based) | Explainability, determinism, and cost control critical for health domain. |

**Trade-offs documented in** `CHALLENGES.md` — covers state management scaling, SSO integration, real-time sync, and offline-first design as future work.

---

## 🚀 Getting Started

### Prerequisites
- Node.js v16+
- Expo CLI: `npm install -g expo-cli`
- Supabase account (free tier: supabase.com)

### Installation & Setup

1. **Clone and install**
   ```bash
   git clone https://github.com/yourusername/swasthya.git
   cd swasthya
   npm install
   ```

2. **Configure environment** (`.env.local`)
   ```env
   EXPO_PUBLIC_SUPABASE_URL=<your-url>
   EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-key>
   ```

3. **Initialize Supabase**
   - Create tables from schema (`docs/schema.sql`).
   - Enable Row-Level Security (RLS) policies.
   - Upload sample product images to `products` bucket.

4. **Run locally**
   ```bash
   npm start
   # Press 'i' for iOS, 'a' for Android, 'w' for web
   ```

5. **Run test suite** (when implemented)
   ```bash
   npm test
   ```

---

## 📁 Repository Structure

```
swasthya/
├── app/                    # Expo Router screens
│   ├── (auth)/             # Login, signup
│   ├── (tabs)/             # Customer: home, tracker, flowbot, learn, profile
│   ├── admin/              # Product mgmt, order oversight, approvals
│   ├── distributor/        # Bulk ordering, inventory, pharmacy network
│   ├── pharmacy/           # Dashboard, stock, ordering, fulfillment
│   └── _layout.tsx         # Root auth provider + route guard
├── context/                # AuthContext + session management
├── lib/                    # Business logic (algorithms, Supabase client)
├── components/             # Shared UI components
├── docs/                   # Technical documentation (see below)
└── app.json                # Expo config
```

### Documentation

| Document | Purpose |
|----------|---------|
| `SYSTEM_DESIGN.md` | Architecture, data model, three-layer design, API flows. |
| `SYSTEM_REQUIREMENTS.md` | Functional & non-functional requirements, user stories, use cases. |
| `IMPLEMENTATION.md` | Tech stack, module walkthrough, eight core algorithms with pseudocode. |
| `TESTING.md` | Test strategy, 16+ test cases, validation methodology (unit, integration, UAT, AI safety). |
| `CHALLENGES.md` | Technical (state mgmt, real-time sync), B2B (multi-tenancy, SSO), AI (hallucination, cost), and process challenges. |

---

## 🧬 Core Algorithms (8 Implementations)

1. **Cycle Prediction** — Heuristic averaging of logged periods.
2. **Content Personalization** — Tag-based article filtering and ranking.
3. **MOQ Validation** — Enforce minimum order quantities for bulk orders.
4. **Inventory Thresholds** — Flag low/out-of-stock states.
5. **Order Routing** — Smart distributor vs. direct-to-admin routing.
6. **FlowBot Matching** — Pattern-based Q&A with urgent symptom escalation.
7. **Dashboard KPIs** — Compute operational metrics from orders/inventory.
8. **Distributor-Pharmacy Mapping** — Manage B2B network relationships.

**Full pseudocode & implementation details**: See `IMPLEMENTATION.md` Section 7.

---

## 🔬 Research Contributions & Learnings

### Key Insights

1. **Heuristic AI for Health**: Rule-based systems are often preferable to generative models in regulated domains because they are auditable, cost-effective, and safe.

2. **Sparse Data Challenge**: Menstrual cycle prediction from 1–2 months of self-reported logs requires robust fallback heuristics; statistical models need >6 months of data.

3. **Multi-Stakeholder Design**: B2B platforms (pharmacies, distributors) and consumer platforms (health tracking, education) have conflicting UI/UX needs; role-first architecture mitigates conflict.

4. **Explainability Matters**: Health users want to understand why content is recommended and how cycle predictions are computed; opaque ML models reduce trust.

### Future Research Directions

- **Bayesian online updating**: Improve cycle prediction with confidence intervals.
- **Anomaly detection**: Flag unusual cycle patterns (e.g., early/late periods, PCOS indicators).
- **Causal inference**: Understand how lifestyle factors (sleep, stress, exercise) impact cycle regularity.
- **Generative + RAG hybrid**: Combine FlowBot determinism with retrieval-augmented generation for nuanced answers with citations.
- **Fairness audits**: Ensure personalization and prediction algorithms don't embed biases against marginalized health conditions.

---

## 🔐 Security & Compliance Status

### Implemented
✅ Supabase Auth with email/password  
✅ Role-based route protection  
✅ OTP-based order delivery verification  
✅ AsyncStorage session persistence  
✅ TypeScript for type-safe data flows  

### Not Yet Implemented (Documented for Future Work)
⚠️ Row-Level Security (RLS) policies  
⚠️ Comprehensive audit logging  
⚠️ Enterprise SSO/SAML  
⚠️ Encryption for sensitive health data  
⚠️ HIPAA/GDPR compliance framework  

---

## 📦 Deployment

### Build for Production (EAS)

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build -p android --profile production
```

APK output accessible via EAS Dashboard or GitHub Releases.

### Backend Deployment
- Supabase migrations via Dashboard.
- Webhooks configurable for order notifications.
- Automated backups in production settings.

---

## 📈 Metrics & Monitoring (Roadmap)

**Key metrics to track**:
- Screen load times (target: <2s).
- Order placement time (target: <10s).
- FlowBot response time (target: <500ms).
- API error rates (target: <0.5%).
- User retention by role.

**Suggested tools**: Supabase Analytics, Expo Analytics, LogRocket (optional).

---

## 📝 Known Limitations & Future Work

### Current Limitations
- No real-time sync (orders/inventory eventually consistent).
- Heuristic AI only (no generative models yet).
- No payment integration (orders created but not billed).
- Direct client queries (works to ~100k users; needs API gateway at scale).

### Roadmap
- [ ] Real-time WebSocket sync for order status.
- [ ] Payment gateway (Stripe/Razorpay) integration.
- [ ] SMS/WhatsApp notifications.
- [ ] Bayesian cycle prediction with confidence intervals.
- [ ] Offline-first sync with conflict resolution.
- [ ] RAG-enhanced FlowBot with medical citations.

---

## 🧪 Reproducibility

**For evaluators**:
1. Clone repo and install dependencies (see Getting Started).
2. Create Supabase project and populate schema (`docs/schema.sql`).
3. Load test fixtures from `docs/fixtures/` (sample products, users, cycle logs).
4. Run test suite: `npm test`.
5. Start app: `npm start`.
6. Test flows documented in `TESTING.md` (16+ UAT scenarios).

**Data and seeds**: Sample datasets available in `/docs/fixtures/` for reproducible testing.

---

## 👤 About the Author

**Adrika Pradhan**  
Final-year B.Tech (AI & ML), UPES Dehradun | Expected graduation June 2026  
CGPA: 7.73/10 | S7 SGPA: 9.18 (upward trajectory)

**Relevant Experience**:
- **Google Cloud GenAI Internship** — Production ML systems, prompt engineering.
- **Astronomical Object Detection Research** — IoU improvement from 0.51 → 0.69 via ensemble methods.
- **AI Solutions Architecture** — Career goal; target role post-MSc in DACH region (EU Blue Card pathway).

**Contact**: adrika2607@gmail.com

---

## 📄 License

MIT License — See LICENSE file for details.

---

## 🙏 Acknowledgments

- **Framework**: Expo, React Native, Supabase.
- **Inspiration**: Women's health equity, accessible supply-chain technology, applied AI in healthcare.

---

## 📊 Project Stats

- **Codebase**: ~5,000+ lines (React Native + TypeScript).
- **Supported Roles**: 4 (Customer, Pharmacy, Distributor, Admin).
- **Data Entities**: 10+ (Products, Orders, Inventory, Profiles, Mappings, Cycle Logs).
- **Core Algorithms**: 8 (all with pseudocode and validation design).
- **Test Cases**: 16+ (unit, integration, UAT, AI validation).
- **Documentation**: 5 detailed technical documents.

---

**Last Updated**: May 2026  
**Status**: MVP + Capstone Portfolio Project  
**Target Audience**: MSc Data Science & AI Program Evaluators

---

## 🔗 Quick Links

| Resource | Link |
|----------|------|
| **System Design** | [system_design.md](system_design.md) |
| **Test Strategy** | [testing.md](testing.md) |
| **Implementation** | [implementation.md](implementation.md) |
| **Technical Challenges** | [challenges.md](challenges.md) |
| **Requirements** | [system_requirements.md](system_requirements.md) |
| **GitHub** | [repo-link](https://github.com/adriennie/swasth-app) |
| **Live Demo** | [available on request] |

**Last Updated**: May 2026  
**Status**: MVP Development completed
