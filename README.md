# Swasthya

**A multi-role women's health and commerce platform built with React Native, Expo, and Supabase.**

Swasthya is a comprehensive mobile and web application that combines consumer health tracking and education with B2B supply-chain operations for menstrual-wellness products. The platform serves four distinct user roles—**customers**, **pharmacies**, **distributors**, and **admins**—through a unified codebase with role-based navigation and tailored workflows.

---

## 🌟 Key Features

### For Customers

- **Cycle Tracking & Prediction** — Log menstrual flow, symptoms, mood, sleep, and lifestyle factors with simple statistical predictions
- **FlowBot Health Assistant** — Rule-based AI assistant for menstrual-health Q&A with safety-first urgent symptom handling
- **Personalized Learning** — Tag-based educational content filtered by user profile and health concerns
- **Product Discovery** — Browse and order menstrual-care products through the integrated marketplace

### For Pharmacies

- **Inventory Management** — Track stock quantity, reorder levels, and low-stock alerts
- **Smart Ordering** — Order through assigned distributors or directly to admin with automatic route selection
- **Dashboard & KPIs** — Real-time view of pending orders, stock status, and revenue summaries
- **Order History** — Detailed order tracking with line-item visibility

### For Distributors

- **Bulk Catalog Access** — Browse products with MOQ-aware cart validation
- **B2B Ordering** — Place bulk orders to admin with enforced minimum order quantities
- **Pharmacy Network** — Manage assigned pharmacies and fulfill orders with OTP delivery verification
- **Stock Management** — Track distributor inventory and order history

### For Admins

- **Product Management** — Create, update, and manage product records with SKU, pricing, MOQ, and image uploads
- **Spreadsheet Import/Export** — Bulk product operations via CSV workflows
- **Order Oversight** — Monitor pharmacy and distributor orders across the entire supply chain
- **Approvals & Mapping** — Manage distributor-pharmacy relationships and supplier account approvals
- **Delivery Verification** — Generate and track OTP-based order completion

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |

|-------|-----------|---------|
| **Frontend** | React Native + Expo | Cross-platform iOS, Android, and web |
| **Navigation** | Expo Router | File-based routing with role-based protection |
| **State** | React Hooks + AsyncStorage | Local state and session persistence |
| **Backend** | Supabase (PostgreSQL + Auth) | Database, authentication, and file storage |
| **Language** | TypeScript | Type-safe screens and data flows |
| **Media** | Expo Media Libraries | Image picker, document picker, file system |

---

## 🏗️ Architecture

### Three-Layer Model

```bash
┌─────────────────────────────────────┐
│   Client Layer (React Native)        │
│  - Role-Based Navigation             │
│  - AuthContext + ProtectedRoute      │
│  - Local Persistence (AsyncStorage)  │
└──────────────┬──────────────────────┘
               │
┌──────────────v──────────────────────┐
│   Data Layer (Supabase)              │
│  - PostgreSQL Tables                 │
│  - Supabase Auth                     │
│  - Cloud Storage (Images)            │
└──────────────┬──────────────────────┘
               │
┌──────────────v──────────────────────┐
│   AI Layer (Rule-Based)              │
│  - FlowBot Pattern Matching          │
│  - Heuristic Cycle Prediction        │
│  - Tag-Based Personalization         │
└─────────────────────────────────────┘
```

### Data Model (Core Entities)

- **products** — Catalog with SKU, MOQ, pricing, and distributor markup
- **orders** — Pharmacy orders (direct or via distributor)
- **distributor_admin_orders** — Bulk orders from distributors to admin
- **pharmacy_inventory** — Stock tracking with reorder thresholds
- **pharmacy_distributors** — Many-to-many relationships
- **delivery_otp** — OTP-based delivery verification
- **cycle_logs** — User-submitted menstrual tracking data

---

## 🚀 Getting Started

### Prerequisites

- Node.js v16+
- Expo CLI: `npm install -g expo-cli`
- A Supabase project (free tier available at [supabase.com](https://supabase.com))

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/swasthya.git
   cd swasthya
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env.local` file in the root:

   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**

   ```bash
   npm start
   ```

   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Press `w` for web

### Supabase Setup

1. Create tables using the SQL schema (see `docs/schema.sql`)
2. Enable Row-Level Security (RLS) policies for multi-tenancy
3. Set up Supabase Auth with email/password provider
4. Upload product images to Storage bucket `products`

---

## 📁 Project Structure

```bash
swasthya/
├── app/
│   ├── _layout.tsx              # Root layout with auth provider
│   ├── (auth)/                  # Login and signup screens
│   ├── (tabs)/                  # Customer tabs (shop, tracker, flowbot, learn, profile)
│   ├── admin/                   # Admin dashboards and management
│   ├── distributor/             # Distributor workflows
│   ├── pharmacy/                # Pharmacy dashboards and ordering
│   └── product/                 # Shared product detail screen
├── context/
│   └── AuthContext.tsx          # Global auth state and session
├── types/
│   └── index.ts                 # TypeScript definitions
├── lib/
│   ├── supabase.ts              # Supabase client setup
│   └── algorithms.ts            # Core business logic
├── components/                  # Reusable UI components
├── docs/                        # Technical documentation
│   ├── SYSTEM_DESIGN.md
│   ├── IMPLEMENTATION.md
│   ├── SYSTEM_REQUIREMENTS.md
│   ├── TESTING.md
│   └── CHALLENGES.md
└── app.json                     # Expo configuration
```

---

## 👥 Role-Based Workflows

### Customer Journey

1. Sign up → Browse products → Track cycles → Chat with FlowBot → Access personalized articles

### Pharmacy Journey

1. Sign up (pending admin approval) → View dashboard → Manage inventory → Place orders → Track fulfillment

### Distributor Journey

1. Sign up (pending admin approval) → Browse catalog → Add to cart (MOQ enforced) → Submit bulk order → Manage assigned pharmacies

### Admin Journey

1. Manage products (CRUD, import/export) → Approve suppliers → Monitor orders → Route pharmacy orders → Generate delivery OTPs

---

## 🧠 Core Algorithms

The system implements eight key algorithms:

| Algorithm | Purpose | Location |

|-----------|---------|----------|
| **Cycle Prediction** | Estimate next period and ovulation from historical logs | `app/(tabs)/tracker.tsx` |
| **Content Personalization** | Filter articles by user health tags | `app/(tabs)/learn.tsx` |
| **MOQ Validation** | Enforce minimum order quantities for distributors | `app/distributor/cart.tsx` |
| **Inventory Thresholds** | Flag low/out-of-stock items | `app/pharmacy/inventory.tsx` |
| **Order Routing** | Route pharmacy orders through distributor or admin | `app/pharmacy/cart.tsx` |
| **FlowBot Matching** | Pattern-based health Q&A with urgent symptom handling | `app/(tabs)/flowbot.tsx` |
| **Dashboard KPIs** | Compute operational metrics from orders and inventory | `app/[role]/dashboard.tsx` |
| **Distributor-Pharmacy Mapping** | Manage many-to-many network relationships | `app/admin/management/mapping.tsx` |

See [`IMPLEMENTATION.md`](docs/IMPLEMENTATION.md) for detailed pseudocode.

---

## 🧪 Testing Strategy

The project follows a four-layer testing approach:

1. **Unit Tests** — Business logic: cycle prediction, MOQ validation, inventory thresholds
2. **Integration Tests** — Role-specific data flows: auth, order lifecycle, inventory updates
3. **UAT Scenarios** — End-to-end workflows for each role
4. **AI Output Validation** — FlowBot response classification and safety checks

### Running Tests

```bash
npm test
```

For detailed test cases and coverage, see [`TESTING.md`](docs/TESTING.md).

---

## 🎯 Performance & Design Rationale

### Strengths

✅ **Role-first architecture** — Each user type gets tailored workflows, not forced into one dashboard  
✅ **Pragmatic simplicity** — Direct Supabase queries keep the app fast to develop and deploy  
✅ **Local persistence** — AsyncStorage enables offline-like behavior for critical flows  
✅ **Type safety** — TypeScript prevents cross-role data leakage

### Current Limitations

⚠️ **No real-time sync** — Orders and inventory are eventually consistent, not live  
⚠️ **Heuristic AI only** — FlowBot uses pattern matching, not generative models  
⚠️ **No payment integration** — Orders are created but not yet billed  
⚠️ **Single-server scale** — Direct client queries work now but need API gateway at 100k+ users

For a detailed discussion, see [`CHALLENGES.md`](docs/CHALLENGES.md).

---

## 📊 AI & Future Extensions

### Current AI Approach

- **FlowBot** uses regex-based keyword matching against a curated knowledge base
- **Personalization** uses tag-based filtering (not collaborative filtering)
- **Predictions** use heuristic cycle averaging (not statistical models)

### Why This Approach

✓ Deterministic and fully explainable (critical for health)  
✓ Zero LLM cost (important for early-stage sustainability)  
✓ Safe to deploy without hallucination guardrails

### Future AI Roadmap

- **RAG Integration** — Feed FlowBot with retrieval-augmented generation for medical citations
- **Recommendation Engine** — Personalized product and article recommendations
- **Anomaly Detection** — Flag unusual cycle patterns for user awareness
- **Generative Content** — Summarize articles and generate personalized health tips

---

## 🔐 Security & Compliance

### Current Implementation

- ✅ Supabase Auth for session management
- ✅ Role-based route protection via `ProtectedRoute`
- ✅ OTP-based delivery verification for B2B orders
- ✅ AsyncStorage for local session persistence

### Not Yet Implemented

- ⚠️ Row-level security (RLS) policies
- ⚠️ Comprehensive audit logging
- ⚠️ Enterprise SSO/SAML
- ⚠️ Encryption for sensitive health data

See [`SYSTEM_DESIGN.md`](docs/SYSTEM_DESIGN.md) for security architecture details.

---

## 📚 Documentation

| Document | Purpose |

|----------|---------|
| [SYSTEM_DESIGN.md](docs/SYSTEM_DESIGN.md) | Architecture, data model, and design decisions |
| [SYSTEM_REQUIREMENTS.md](docs/SYSTEM_REQUIREMENTS.md) | Functional/non-functional requirements and use cases |
| [IMPLEMENTATION.md](docs/IMPLEMENTATION.md) | Tech stack, module walkthrough, algorithms with pseudocode |
| [TESTING.md](docs/TESTING.md) | Test strategy, test cases, and validation methods |
| [CHALLENGES.md](docs/CHALLENGES.md) | Technical, B2B, AI, and process challenges |

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository** and create a feature branch

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Keep TypeScript strict** — No `any` types without justification
3. **Follow role boundaries** — Isolate changes to role-specific folders when possible
4. **Add test cases** — See [`TESTING.md`](docs/TESTING.md) for test structure
5. **Update docs** — If you change architecture or add algorithms, update the relevant doc
6. **Create a Pull Request** with a clear description of changes

---

## 📦 Deployment

### Build for Production (EAS Build)

1. **Install EAS CLI**

   ```bash
   npm install -g eas-cli
   ```

2. **Login to your Expo account**

   ```bash
   eas login
   ```

   (If you don't have an account, create one at [expo.dev](https://expo.dev))

3. **Configure EAS Build** (one-time setup)

   ```bash
   eas build:configure
   ```

   This generates `eas.json` in your project root with build profiles.

4. **Build APK for Android**

   ```bash
   eas build -p android --profile production
   ```

   The build will:
   - Compile your React Native code into an APK
   - Sign it with your credentials
   - Store it on EAS servers (accessible from dashboard)

5. **Download Your APK**

   After the build completes:
   - **Option A (via CLI):**

     ```bash
     eas build:list
     eas build:download <build-id>
     ```

   - **Option B (via Web Dashboard):**
     1. Visit [expo.dev](https://expo.dev) → Your Project → Builds
     2. Find your completed build
     3. Click the download icon to get the `.apk` file

6. **Release to GitHub Releases** (Optional)

   Once you have the APK:

   ```bash
   # Create a GitHub release
   gh release create v1.0.0 swasthya-v1.0.0.apk --title "Swasthya v1.0.0" --notes "First stable release"
   ```

   Or manually:
   1. Go to your GitHub repo → Releases → "Draft a new release"
   2. Create a tag (e.g., `v1.0.0`)
   3. Upload the `.apk` file
   4. Add release notes and publish

### Build Configuration (eas.json)

Your `eas.json` should look like:

```json
{
  "build": {
    "production": {
      "android": {
        "release_channel": "production",
        "buildType": "apk"
      },
      "ios": {
        "buildType": "ipa"
      }
    },
    "preview": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

### Deploy Backend (Supabase)

- Migrations are managed through Supabase Dashboard
- Set up webhooks for order notifications if needed
- Enable backups in production settings

---

## � Installing from APK

To install Swasthya on an Android device using the APK file:

1. **Download the APK** — Get the latest `.apk` file from:
   - **EAS Dashboard:** [expo.dev](https://expo.dev) → Your Project → Builds
   - **GitHub Releases:** [Releases page](https://github.com/yourusername/swasthya/releases)

2. **Enable Unknown Sources** (if needed)
   - Go to `Settings → Security → Unknown Sources`
   - Toggle on "Allow installation from unknown sources"

3. **Install the APK**
   - Transfer the `.apk` file to your Android device
   - Open the file with your file manager or directly from Downloads
   - Tap "Install" and wait for the installation to complete

4. **Launch the App**
   - Once installation finishes, tap "Open" or find Swasthya in your app drawer
   - On first launch, grant necessary permissions (camera, location, contacts as needed)

### APK Release Versions

| Version | Date     | Status | Download                                                                                          |
| ------- | -------- | ------ | ------------------------------------------------------------------------------------------------- |
| v1.0.0  | May 2026 | Latest | [Download](https://github.com/yourusername/swasthya/releases/download/v1.0.0/swasthya-v1.0.0.apk) |

**Note:** APK files will be uploaded to the GitHub Releases page. Check back for the latest stable build.

---

## �📈 Metrics & Monitoring

### Key Metrics to Track

- Screen load times (target: <2s)
- Order placement time (target: <10s)
- FlowBot response time (target: <500ms)
- API error rates (target: <0.5%)
- User retention by role (customer vs. pharmacy vs. distributor)

### Suggested Tools

- **Supabase Analytics** for database query performance
- **Expo Analytics** for app crash reporting
- **LogRocket** (optional) for session replay

---

## 🐛 Known Issues & Roadmap

### Current Issues

- iOS keyboard sometimes overlaps input fields on small devices
- Offline mode is limited to AsyncStorage (no queueing)
- Product import CSV parser expects exact column headers

### Roadmap

- [ ] Real-time order status via WebSockets
- [ ] Payment gateway integration (Stripe/Razorpay)
- [ ] SMS/WhatsApp notifications for order updates
- [ ] Advanced inventory forecasting
- [ ] Mobile-native notification support
- [ ] Offline-first sync engine with conflict resolution

---

## 📞 Support & Contact

- **Issues & Bugs** — Open a GitHub issue with steps to reproduce
- **Feature Requests** — Use GitHub Discussions or open a feature issue
- **Security Concerns** — Email privately to [your-email@example.com](mailto:your-email@example.com) (do not open public issues)

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev) and [React Native](https://reactnative.dev)
- Backend powered by [Supabase](https://supabase.com)
- Inspired by women's health equity and accessible supply-chain technology

---

## 📊 Project Stats

- **Lines of Code**: ~5,000+ (React Native + TypeScript)
- **Supported Roles**: 4 (Customer, Pharmacy, Distributor, Admin)
- **Data Entities**: 10+ (Products, Orders, Inventory, Profiles, Mappings)
- **Core Algorithms**: 8 (Prediction, Personalization, Routing, Validation)
- **Test Cases**: 16+ (Auth, Tracker, FlowBot, Inventory, Orders)

---

**Last Updated**: May 2026  
**Status**: Active Development — Ready for MSc Applications & Intern Showcase
