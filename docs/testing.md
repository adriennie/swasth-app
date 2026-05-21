# Testing for Swasthya

## 1. Test Strategy

Testing for Swasthya should cover four layers:

1. **Unit tests** for business rules and helper logic.
2. **Integration tests** for role-specific data flows.
3. **UAT** for end-to-end business scenarios across roles.
4. **AI output validation** for FlowBot and personalization logic.

The current codebase has many screen-level flows and heuristic behaviors, so a test plan should explicitly cover UI behavior, Supabase writes, and local storage persistence.

## 2. Unit Testing Scope

### Candidate Unit Targets

- Cycle prediction logic.
- FlowBot keyword matching.
- MOQ validation checks.
- Inventory low-stock classification.
- Personalized article filtering.
- Order total calculation.

### Example Assertions

- A 28-day default cycle is used when there are not enough logs.
- Items below MOQ are blocked from checkout.
- Low stock is flagged when stock quantity is at or below reorder level.
- Urgent symptom phrases route to emergency guidance.

## 3. Integration Testing Scope

### 3.1 Auth and Route Protection

- Verify that unauthenticated users are redirected to login.
- Verify that authenticated users land in the correct role dashboard.
- Verify that supplier login checks the correct profile table.

### 3.2 Order Lifecycle

- Create a pharmacy order and confirm it appears in pharmacy history.
- Verify distributor assignment when mapping exists.
- Verify direct-to-admin routing when no mapping exists.
- Verify OTP generation and delivery status update.

### 3.3 Inventory Lifecycle

- Load inventory for a pharmacy user.
- Update stock quantity and reorder level.
- Confirm low-stock state changes after edit.

### 3.4 Content and AI Flow

- Ensure FlowBot responds to known patterns.
- Ensure personalized content changes when profile tags are present.

## 4. UAT Scenarios

### 4.1 Customer UAT

1. Sign in as customer.
2. Browse products.
3. Open FlowBot and ask a menstrual health question.
4. Add a cycle log.
5. Confirm the prediction summary updates.

### 4.2 Admin UAT

1. Sign in as admin.
2. Update a product MOQ.
3. Import product data from a spreadsheet.
4. Review a distributor order.
5. Generate and verify delivery OTP.

### 4.3 Distributor UAT

1. Sign in as distributor.
2. Add products to cart.
3. Trigger MOQ validation.
4. Submit a valid bulk order.
5. Update order status and complete OTP verification.

### 4.4 Pharmacy UAT

1. Sign in as pharmacy.
2. View dashboard KPIs.
3. Add stock or adjust inventory.
4. Place an order through an assigned distributor.
5. Review order details and assigned distributor information.

## 5. AI Output Validation

AI output validation should not rely on exact free-text responses alone. Instead it should verify:

- Matching of expected intent categories.
- Presence of safety messaging for urgent symptoms.
- Inclusion of citations where expected.
- Consistency of fallback behavior.
- No harmful or misleading medical claims.

### Suggested Validation Methods

- Regex-based response classification.
- Allowed-response sets for common prompts.
- Manual review for sensitive health answers.
- Safety keyword filters for emergency cases.

## 6. Test Case Table

| ID    | Area               | Scenario                                     | Expected Result                            | Result  |
| ----- | ------------------ | -------------------------------------------- | ------------------------------------------ | ------- |
| TC-01 | Auth               | Customer login with valid credentials        | Customer enters app and session is saved   | Pending |
| TC-02 | Auth               | Supplier login as approved pharmacy          | Pharmacy dashboard opens                   | Pending |
| TC-03 | Auth               | Supplier login with pending approval         | Access denied message is shown             | Pending |
| TC-04 | Tracker            | Save a cycle log for a date                  | Log persists in AsyncStorage               | Pending |
| TC-05 | Tracker            | Generate prediction with sparse logs         | Default 28-day prediction is used          | Pending |
| TC-06 | FlowBot            | Ask about cramps                             | Medical guidance response is returned      | Pending |
| TC-07 | FlowBot            | Ask urgent symptom question                  | Emergency guidance is shown                | Pending |
| TC-08 | Learn              | Open personalized learning with profile tags | Relevant articles are filtered             | Pending |
| TC-09 | Admin Products     | Update MOQ for a product                     | Product record updates in Supabase         | Pending |
| TC-10 | Admin Products     | Import product CSV                           | Products are inserted successfully         | Pending |
| TC-11 | Distributor Cart   | Add item below MOQ                           | Checkout is blocked                        | Pending |
| TC-12 | Distributor Cart   | Add item meeting MOQ                         | Checkout proceeds                          | Pending |
| TC-13 | Pharmacy Inventory | Edit stock quantity                          | Inventory record updates                   | Pending |
| TC-14 | Pharmacy Dashboard | Load assigned distributors                   | Distributor cards appear                   | Pending |
| TC-15 | Order Flow         | Place pharmacy order with distributor        | Order and items are created                | Pending |
| TC-16 | Order Flow         | Generate delivery OTP                        | OTP is stored and verification modal opens | Pending |

## 7. Results Recording Template

For each test run, record:

- Build/version.
- Device or emulator.
- Role used.
- Pass/fail status.
- Screens or tables impacted.
- Notes on unexpected UI or network behavior.

## 8. Known Testing Limitations

- No automated test suite is currently visible in the repo.
- Several flows depend on live Supabase data or mock local storage state.
- AI outputs are mostly deterministic today, but future LLM integration will require broader validation methods.
