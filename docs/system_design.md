# System Design for Swasthya

## 1. Architecture Overview

Swasthya uses a three-layer structure:

1. **Client layer**: Expo/React Native mobile and web UI.
2. **Server/data layer**: Supabase-backed PostgreSQL tables and Supabase Auth.
3. **AI layer**: lightweight heuristic and rule-based text matching for FlowBot and personalization, with optional future extension to external AI APIs.

The current implementation is mostly client-driven, with the app calling Supabase directly from screens.

## 2. Architecture Diagram

```text
[Customer / Admin / Distributor / Pharmacy App Screens]
                |
                v
     [Expo Router + AuthContext + ProtectedRoute]
                |
     +----------+-----------+
     |                      |
     v                      v
[Supabase Auth]     [Supabase Postgres / Storage]
                                |
                                v
                 [Products, Profiles, Orders, Inventory,
                  Mappings, OTP, Cycle Logs]
                |
                v
         [FlowBot + Personalization Logic]
```

## 3. Client Layer Design

### 3.1 Navigation Structure

- `app/_layout.tsx` mounts the auth provider, loading gate, root stack, and route guard.
- `app/(auth)` contains login and signup screens.
- `app/(tabs)` contains customer tabs: shop/home, tracker, FlowBot, learn, profile.
- `app/admin` contains admin dashboards and management tools.
- `app/distributor` contains distributor dashboard, catalogue, cart, orders, stock, and relationships.
- `app/pharmacy` contains pharmacy dashboard, inventory, catalog, cart, orders, and settings.

### 3.2 State Management

- Global auth state lives in `AuthContext` and is persisted through AsyncStorage.
- Screen-local state is managed with React hooks.
- Domain data is generally fetched on demand from Supabase, not cached in a centralized store.

### 3.3 UI Design Principles

- Mobile-first layouts with large cards and strong section hierarchy.
- Role-specific entry points rather than one unified dashboard.
- Error alerts and empty states provide the primary feedback mechanism.

## 4. Data Model Summary

### 4.1 Core Entities

- `products`: catalog, price, distributor price, SKU, MOQ, image.
- `orders`: pharmacy-to-admin or pharmacy-to-distributor orders.
- `order_items`: line items for pharmacy orders.
- `distributor_admin_orders`: distributor-to-admin bulk orders.
- `distributor_admin_order_items`: line items for bulk orders.
- `pharmacy_profiles`: pharmacy organization/user metadata.
- `distributor_profiles`: distributor metadata.
- `pharmacy_distributors`: mapping table for pharmacy-distributor relationships.
- `pharmacy_inventory`: stock and reorder level records.
- `delivery_otp`: OTP column on both order tables for delivery verification.

### 4.2 Conceptual Schema Notes

- The app treats `auth.users.id` as the session identity.
- Some flows use user ID directly as `pharmacy_id` or `distributor_id`.
- Certain queries join through profile tables manually rather than relying on deep relational joins.
- MOQ lives on the product record and is enforced in distributor flows.
- Reorder logic lives at the pharmacy inventory layer.

## 5. API / Data Access Design

### 5.1 Authentication APIs

- `supabase.auth.signInWithPassword`
- `supabase.auth.signUp`

### 5.2 Product APIs

- Fetch products from `products`.
- Insert/update/delete products from admin management.
- Upload product images through Supabase Storage.

### 5.3 Order APIs

- Pharmacy orders use `orders` and `order_items`.
- Distributor orders use `distributor_admin_orders` and `distributor_admin_order_items`.
- Status updates are performed with direct table updates.
- OTP generation and verification use order-table columns.

### 5.4 Inventory APIs

- Pharmacy inventory uses `pharmacy_inventory`.
- Distributor stock uses `distributor_stock_items`-style local or synced structures in the app screens.

### 5.5 Learning / AI APIs

- FlowBot is currently not backed by an external LLM API.
- It uses pattern matching against a knowledge base and returns curated static responses.
- Personalized article selection is tag-based and profile-driven.

## 6. Data Flow Descriptions

### 6.1 Auth Flow

1. User submits credentials.
2. Supabase Auth validates the login.
3. The relevant profile table is checked for role and approval status.
4. AuthContext stores the active session locally.
5. ProtectedRoute redirects the user to the correct role area.

### 6.2 Pharmacy Order Flow

1. Pharmacy user builds a cart.
2. App finds assigned distributors using `pharmacy_distributors`.
3. User chooses distributor or direct-to-admin.
4. App creates order records and line items in Supabase.
5. Order appears in pharmacy, distributor, and admin views as appropriate.

### 6.3 Distributor Bulk Order Flow

1. Distributor chooses products from catalogue.
2. MOQ is checked when adding to cart and during checkout.
3. Order is written to `distributor_admin_orders`.
4. Admin reviews and updates status.
5. OTP may be generated for delivery completion.

### 6.4 Pharmacy Inventory Flow

1. Pharmacy loads inventory data.
2. App calculates low-stock and out-of-stock states.
3. User edits stock quantity or reorder level.
4. App writes changes back to Supabase.

### 6.5 AI / Content Flow

1. User asks a question or profile-based content is requested.
2. App matches against local rules and tags.
3. The response or article set is rendered immediately.

## 7. Text Wireframes

### 7.1 Customer Home / Tabs

- Top hero area with app branding.
- Tab navigation for shop, tracker, FlowBot, learn, and profile.
- Cards for key actions and recommendations.

### 7.2 Tracker Screen

- Calendar at top.
- Summary cards for predicted cycle data.
- Modal form for log entry.

### 7.3 FlowBot Screen

- Header with assistant branding.
- Scrollable chat transcript.
- Bottom message input and send control.

### 7.4 Admin Dashboard

- KPI cards.
- Product, order, and mapping shortcuts.
- Filtered order and approval sections.

### 7.5 Distributor Dashboard

- Revenue, pending orders, and stock summary cards.
- Catalogue, orders, and stock shortcuts.

### 7.6 Pharmacy Dashboard

- Stock and revenue metrics.
- Assigned distributor cards.
- Entry points for inventory, catalog, and orders.

## 8. Design Rationale

- Direct Supabase access keeps the app simple and fast to develop.
- A role-first route structure matches the business model.
- Heuristic AI keeps the assistant predictable and low-cost for the current prototype stage.
- OTP-based verification adds an explicit delivery trust checkpoint for B2B fulfillment.
