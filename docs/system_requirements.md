# ystem Requirements for Swasthya

## 1. Project Overview

Swasthya is a multi-role women's health and wellness platform built in React Native with Expo and Supabase. The system serves two broad domains:

- Consumer health and commerce features for customers.
- B2B supply-chain workflows for admin, distributors, and pharmacies.

The application also includes a lightweight AI-style health assistant, FlowBot, and personalized learning/tracking flows.

## 2. Functional Requirements

### 2.1 Customer Module

1. Users shall be able to sign up and log in as customers.
2. Users shall browse product catalog entries and open product detail pages.
3. Users shall add products to a shopping cart and manage quantities.
4. Users shall place product orders through the pharmacy-facing flow.
5. Users shall track menstrual cycles by logging daily flow, symptoms, mood, sleep, energy, focus, and lifestyle factors.
6. Users shall receive simple cycle predictions for next period and ovulation.
7. Users shall access FlowBot for menstrual-health related Q&A.

8. Users shall access educational content through FlowLearn.
9. Users shall save and reuse profile information for personalization.

### 2.2 Admin Module

1. Admin shall manage product listings, pricing, images, SKU, and MOQ.
2. Admin shall import and export product data using spreadsheet workflows.
3. Admin shall manage distributor and pharmacy approvals.
4. Admin shall view and process distributor-to-admin orders.

5. Admin shall view direct pharmacy orders.
6. Admin shall update order states such as confirmed, shipped, delivered, or cancelled.
7. Admin shall generate and verify delivery OTPs for fulfillment flows.

8. Admin shall manage distributor-pharmacy mappings.

### 2.3 Distributor Module

1. Distributors shall log in through the supplier portal.

2. Distributors shall browse the product catalogue and place bulk orders to admin.
3. Distributors shall be prevented from checkout when cart quantities violate MOQ rules.
4. Distributors shall maintain stock records.
5. Distributors shall view pharmacy orders assigned to them.

6. Distributors shall update order status and complete delivery verification using OTP.
7. Distributors shall view admin-facing order history.

### 2.4 Pharmacy Module

1. Pharmacies shall sign up and log in through the supplier portal.
2. Pharmacies shall view a dashboard with pending orders, stock alerts, and revenue summaries.
3. Pharmacies shall browse products and add them to inventory.
4. Pharmacies shall maintain stock quantity and reorder level.

5. Pharmacies shall place orders through assigned distributors or directly to admin when no distributor is available.
6. Pharmacies shall view order history and detailed line items.
7. Pharmacies shall see assigned distributors and contact details.

### 2.5 Shared Platform Requirements

1. The app shall protect routes based on role.
2. The app shall persist login state across sessions.

3. The system shall support Supabase-backed data access for products, profiles, orders, inventory, and mappings.

4. The system shall support role-specific navigation and dashboards.
5. The system shall handle offline-like local persistence for selected flows using AsyncStorage.

## 3. Non-Functional Requirements

### 3.1 Performance

- Screens shall load within acceptable mobile latency for the available dataset size.
- Dashboard queries should be efficient enough for repeated refreshes.
- The UI should remain responsive while reading/writing local storage or calling Supabase.

### 3.2 Security

- Authentication state shall not be exposed in plain UI state beyond the active session.

- Role-based route guards shall prevent cross-role access.
- Sensitive order actions such as delivery confirmation shall require OTP validation.

### 3.3 Reliability

- Data writes to orders, inventory, and auth storage shall be resilient to transient failures.
- The app should fail gracefully with alerts or empty states rather than hard crashes.

### 3.4 Usability

- The app shall support mobile-first interaction patterns.
- The UI should provide clear feedback for empty states, validation errors, and success states.
- B2B flows should be simple enough for non-technical pharmacy and distributor users.

### 3.5 Maintainability

- The codebase shall remain modular by role and feature area.
- Data access logic should remain readable and easy to map to Supabase tables.
- Documentation should mirror the implemented app structure.

### 3.6 Portability

- The system shall run on iOS, Android, and web through Expo where supported.

## 4. User Stories

### 4.1 Customer User Stories

1. As a customer, I want to sign in quickly so that I can continue shopping and tracking my health.

2. As a customer, I want to browse products so that I can compare menstrual-care items.
3. As a customer, I want to log cycle symptoms so that I can review patterns over time.
4. As a customer, I want FlowBot answers so that I can get fast guidance on common concerns.
5. As a customer, I want learning content matched to my profile so that the content feels relevant.

### 4.2 Admin User Stories

1. As an admin, I want to create and update product records so that the catalog stays current.
2. As an admin, I want to set MOQ values so that bulk ordering rules are enforced.
3. As an admin, I want to review approval requests so that only verified business users get access.
4. As an admin, I want to track orders and OTP flows so that delivery can be verified.

5. As an admin, I want to manage distributor-pharmacy links so that supply routes are controlled.

### 4.3 Distributor User Stories

1. As a distributor, I want to place bulk orders so that I can replenish stock.
2. As a distributor, I want MOQ checks so that invalid orders are stopped before submission.
3. As a distributor, I want to see my pharmacy network so that I can fulfill orders efficiently.
4. As a distributor, I want to manage order status so that I can track the fulfillment lifecycle.

### 4.4 Pharmacy User Stories

1. As a pharmacy, I want to manage my inventory so that I can track what is in stock.
2. As a pharmacy, I want to see reorder warnings so that I can restock in time.
3. As a pharmacy, I want to place orders through my distributor so that replenishment is simple.
4. As a pharmacy, I want direct-to-admin ordering when needed so that I am not blocked by missing distributor coverage.
5. As a pharmacy, I want to see order history so that I can reconcile purchases.

## 5. Use Case Descriptions

### Use Case 1: Customer Cycle Tracking

- **Primary actor:** Customer
- **Preconditions:** User is logged in.
- **Trigger:** User opens the tracker screen.
- **Main flow:**
  1. User selects a date.
  2. User logs flow intensity, symptoms, and related factors.
  3. System stores the log locally.

  4. System computes a simple prediction summary and calendar highlights.

- **Postconditions:** Cycle history is persisted in AsyncStorage.
- **Alternative flow:** If required data is missing, the system prompts the user to complete the entry.

### Use Case 2: AI Health Question Answering

- **Primary actor:** Customer
- **Preconditions:** User is on FlowBot screen.
- **Trigger:** User submits a health question.
- **Main flow:**
  1. User enters a question.

  2. System matches the message against knowledge patterns.
  3. System returns a curated response.
  4. System shows citations where available.

- **Postconditions:** Conversation history appears in the chat view.
- **Alternative flow:** For urgent symptom keywords, the bot returns an emergency guidance message.

### Use Case 3: Admin Product Management

- **Primary actor:** Admin
- **Preconditions:** Admin is authenticated.
- **Trigger:** Admin opens product management.
- **Main flow:**
  1. Admin views product records.

  2. Admin creates or updates SKU, prices, image, and MOQ.
  3. System stores the record in Supabase.
  4. Admin may import/export spreadsheet data.

- **Postconditions:** Product catalog is updated.

### Use Case 4: Distributor Bulk Ordering

- **Primary actor:** Distributor
- **Preconditions:** Distributor is logged in and has access to products.
- **Trigger:** Distributor adds products to cart.

- **Main flow:**
  1. System checks MOQ.
  2. Cart is updated.
  3. User proceeds to checkout.
  4. System validates all quantities again.
  5. Order is stored as a distributor-to-admin order.
- **Postconditions:** Order appears in distributor and admin order views.

### Use Case 5: Pharmacy Inventory Replenishment

- **Primary actor:** Pharmacy user

- **Preconditions:** Pharmacy is logged in.
- **Trigger:** User opens pharmacy inventory.
- **Main flow:**
  1. System shows current stock and reorder level.
  2. User edits values or adds products.
  3. System saves updates in Supabase.
  4. Low-stock indicators are recalculated.
- **Postconditions:** Inventory state is updated.

### Use Case 6: Pharmacy Order Placement

- **Primary actor:** Pharmacy user
- **Preconditions:** Pharmacy has a cart and a known profile.
- **Trigger:** User taps checkout.
- **Main flow:**
  1. System identifies assigned distributors.
  2. User selects one or chooses direct-to-admin.
  3. System writes the order and order items.
  4. Cart is cleared.
- **Postconditions:** The order appears in pharmacy order history.

## 6. Scope Boundaries

- The current codebase does not implement a full payment gateway, invoicing stack, SSO/SAML, or external LLM API integration.
- The documentation should therefore describe those as future-ready considerations only if needed.
