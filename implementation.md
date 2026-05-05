# Implementation for Swasthya

## 1. Technology Stack Justification

### 1.1 React Native + Expo

The app uses React Native with Expo because it needs a single codebase for iOS, Android, and web. Expo Router also fits the app’s role-based file structure and keeps navigation simple.

### 1.2 TypeScript

TypeScript is used to keep screen-level data shapes consistent across auth, order, inventory, and profile flows. This is especially useful in a B2B app with multiple roles and table types.

### 1.3 Supabase

Supabase provides authentication, PostgreSQL storage, and optional file storage through a lightweight client model. It is a practical choice for a prototype that still needs structured business data.

### 1.4 AsyncStorage

AsyncStorage is used for session persistence and some local domain state such as cycle logs and cart data. This supports fast local interaction and limited offline-like behavior.

### 1.5 Expo Media / File Modules

Modules such as document picker, file system, image picker, and sharing are used for product import/export and media handling in admin and pharmacy flows.

## 2. Backend and Cloud Choices

### 2.1 Backend

The backend is effectively Supabase/Postgres plus Supabase Auth. Screens query the database directly rather than going through a separate custom API server.

### 2.2 Cloud Storage

Supabase Storage is used for product images. This keeps media handling consistent with the rest of the Supabase stack.

### 2.3 Why Not a Custom Server Yet

A custom backend would add more flexibility, but the current architecture benefits from lower setup cost and fewer moving parts. That tradeoff fits the current scale of the project.

## 3. Auth and Session Flow

1. Customer or supplier enters credentials on the relevant login screen.
2. Supabase Auth validates the account.
3. The app checks the relevant profile table or admin shortcut.
4. AuthContext stores the active user object in AsyncStorage.
5. ProtectedRoute redirects users to their role home.

### Notes

- `AuthContext` currently stores `id`, `email`, `role`, and `loggedInAt`.
- The route guard prevents non-auth users from entering protected areas.
- Session handling is simple and client-side, which is adequate for the current prototype but not ideal for enterprise SSO.

## 4. Module-Wise Code Walkthrough

### 4.1 App Bootstrap

- `app/_layout.tsx` wraps the app in the auth provider and loading boundary.
- It mounts the router stack and route guard after auth loading finishes.

### 4.2 Customer Entry and Discovery

- `app/(auth)/login.tsx` handles customer login.
- `app/(tabs)/learn.tsx` filters articles by user profile tags.
- `app/(tabs)/tracker.tsx` stores cycle logs and derives simple predictions.
- `app/(tabs)/flowbot.tsx` runs the knowledge-base assistant.

### 4.3 Product Detail and Consumer Add Flow

- `app/product/[id].tsx` renders the product detail view and includes a pharmacy inventory add behavior.
- The screen also demonstrates how product records can be reused across consumer and B2B contexts.

### 4.4 Admin Module

- `app/admin/management/products.tsx` handles product CRUD, MOQ editing, media upload, and spreadsheet import/export.
- `app/admin/orders.tsx` handles dual order sources, order details, status updates, and OTP-based delivery completion.
- `app/admin/management/mapping.tsx` manages pharmacy-distributor links.

### 4.5 Distributor Module

- `app/distributor/catalogue.tsx` and `app/distributor/cart.tsx` enforce MOQ-aware bulk ordering.
- `app/distributor/orders.tsx` manages pharmacy order lifecycle updates and delivery OTPs.
- `app/distributor/orders-to-admin.tsx` shows admin order history.
- `app/distributor/stock.tsx` manages stock quantities and MOQ-like fields for stock items.

### 4.6 Pharmacy Module

- `app/pharmacy/dashboard.tsx` computes operational KPIs and assigned distributor data.
- `app/pharmacy/inventory.tsx` manages stock quantity and reorder thresholds.
- `app/pharmacy/catalog.tsx` and `app/pharmacy/cart.tsx` drive ordering and distributor selection.
- `app/pharmacy/orders.tsx` fetches order history and order details.
- `app/pharmacy/add-inventory.tsx` supports bulk inventory import.

## 5. AI / ML API Usage

### 5.1 Current State

The app does not currently call a hosted LLM API such as OpenAI, Gemini, or Azure OpenAI. Instead, it uses:

- Regex and keyword matching for FlowBot.
- Rule-based health triage for urgent symptom keywords.
- Tag-based personalization for content recommendations.
- Simple heuristic predictions for menstrual cycle tracking.

### 5.2 Why This Approach

- It is deterministic and easy to test.
- It avoids token and inference costs.
- It is suitable for a student/prototype stage where safety and explainability matter.

### 5.3 Future AI Extension Path

If the project later adopts an external AI API, the best integration point is FlowBot, followed by content summarization and recommendation ranking. A future version could combine retrieval-augmented generation with citation validation.

## 6. B2B-Specific Logic

### 6.1 Roles

- `customer`
- `pharmacy`
- `distributor`
- `admin`

### 6.2 Organization Model

- Pharmacies and distributors are represented by profile tables.
- `pharmacy_distributors` creates the many-to-many network.
- Orders use profile/user IDs to connect business entities.

### 6.3 Billing / Commerce Logic

- The current app supports order creation, order status, and total amount calculation.
- It does not yet include a full billing ledger, tax engine, invoice PDF pipeline, or payment reconciliation workflow.
- Those should be documented as future extensions rather than current functionality.

## 7. Eight Algorithms with Pseudocode

### 7.1 Cycle Tracking and Prediction

**Purpose:** derive next period and ovulation estimates from local logs.

```text
input: cycle logs by date
sort logs by date
collect dates where flow is medium or heavy
if at least two tracked periods exist:
    compute differences between consecutive tracked periods
    average the valid cycle lengths
else:
    use default cycle length of 28 days
nextPeriod = today + average cycle length
ovulation = today + 14 days
return nextPeriod, ovulation, average cycle length
```

### 7.2 Content Personalization

**Purpose:** rank educational content using profile tags.

```text
input: user conditions, symptoms, article tags
if profile is empty:
    return first curated articles
build relevantTags from conditions and symptoms
for each article:
    if any article tag contains any relevant tag:
        include article
return top articles up to display limit
```

### 7.3 MOQ Validation

**Purpose:** prevent distributors from submitting undersized bulk orders.

```text
input: cart items, product MOQ values
for each cart item:
    if quantity < product MOQ:
        mark item invalid
if any item invalid:
    block checkout and show validation message
else:
    allow checkout
```

### 7.4 Distributor-Pharmacy Mapping

**Purpose:** connect pharmacies to one or more distributors.

```text
input: pharmacy profile, distributor profile list
admin selects pharmacy and distributor links
store links in pharmacy_distributors table
when pharmacy opens dashboard or checkout:
    query mappings for its pharmacy_id
    return assigned distributor profiles
```

### 7.5 Order Statistics

**Purpose:** compute dashboard KPIs from orders and inventory.

```text
input: orders, inventory rows, current date
pendingOrders = count orders with pending status
revenueToday = sum totals for orders dated today
lowStock = count inventory rows where stock_quantity <= reorder_level and > 0
outOfStock = count inventory rows where stock_quantity == 0
return KPI summary
```

### 7.6 FlowBot Query Matching

**Purpose:** answer health questions with predictable curated replies.

```text
input: user message
if message contains urgent symptom keywords:
    return emergency guidance
else if message matches a known regex pattern:
    return matching knowledge-base response
else if message matches a compound symptom rule:
    return compound symptom guidance
else:
    return default help message
```

### 7.7 Inventory Thresholds

**Purpose:** flag stock that needs replenishment.

```text
input: stock_quantity, reorder_level
if stock_quantity == 0:
    mark as out of stock
else if stock_quantity <= reorder_level:
    mark as low stock
else:
    mark as healthy stock
show alert state in UI
```

### 7.8 Order Routing and Checkout Logic

**Purpose:** route pharmacy orders through distributor or admin paths.

```text
input: pharmacy cart, assigned distributors
fetch pharmacy profile and mapped distributors
if at least one distributor exists:
    let user choose distributor
else:
    route as direct-to-admin order
calculate total amount
create order record with chosen route
create line items
clear cart and navigate to order history
```

## 8. Screenshots Placeholder Plan

Because the current task is documentation-only, the implementation doc should include placeholder sections for screenshots such as:

- Customer home and tracker
- FlowBot chat screen
- Admin product management
- Distributor cart and MOQ warning
- Pharmacy dashboard and inventory

Each placeholder should specify the intended image and caption, not a fabricated capture.
