# Additional AI Features for Swasthya

These features extend the AI roadmap (forecasting, replenishment, expiry intelligence, anomaly detection, business copilot, invoice extraction). Each one reuses the planned stack: `Qwen/Qwen2.5-7B-Instruct`, `Qwen/Qwen2.5-VL-7B-Instruct`, `sentence-transformers/all-MiniLM-L6-v2`, the shared feature pipeline, and the MLflow evaluation and promotion gates.

All features follow the existing rules: business- and role-scoped data, figures computed by server tools, cited evidence, human confirmation before any mutation, and a clear unavailable state when inference fails.

## 1. Pilot candidates

| Feature | Description | Builds on | Stage |
|---|---|---|---|
| Catalog entity resolution | Detect duplicate or inconsistent master-catalog entries by salt, strength, form, pack, and manufacturer. Suggest merges for admin approval. | Embeddings + deterministic rules | 3 |
| Strip/box photo recognition | Photograph a strip or carton to identify the product and read batch, expiry, and MRP during receiving, counts, and returns. | Qwen2.5-VL + document review flow | 5 |
| Recall and banned-drug matching | Extract regulator recall notices and banned FDC lists, then flag matching batches in inventory and open orders. | Document AI + batch tracking | 5 |
| Lapsed-reorder nudges | Alert distributors when a pharmacy is overdue for its usual SKUs. | Forecast outputs | 4 |

### Acceptance criteria

- Catalog merges are never applied without admin approval, and merged products retain their order and stock history.
- Photo recognition never fills batch or expiry values it cannot read; unreadable fields are shown as missing.
- Recall matches show the source notice, matched fields, and affected batches; matching is deterministic on batch and product identity.
- Nudges show the historical ordering pattern used and can be dismissed.

## 2. Next candidates

| Feature | Description |
|---|---|
| Customer credit risk scoring | Advisory payment-behavior score and suggested credit limit per pharmacy, with reasons. |
| Frequently-bought-together | Market-basket suggestions at checkout, clearly labeled. |
| Smart catalog search | Typo-tolerant search across brand, generic, and salt names. Displays products only; never substitutes. |
| Delivery ETA and delay risk | Predict late deliveries; feeds the copilot's overdue-delivery summaries. |
| Cycle-count prioritization | Rank SKUs for physical counts using adjustment anomalies, value, and shrinkage history. |
| Near-expiry liquidation | Suggest buyers or return-to-supplier routes; draft expiry-return claims. |
| Supplier quote comparison | Extract competing quotes and flag price changes against history. |
| GST invoice reconciliation | Match extracted purchase invoices against GSTR-2B and flag mismatches. |
| Working-capital forecast | Project procurement spend from the reorder plan and receivables. |
| Weekly AI digest | Generated summary of stockout risk, flagged orders, spend changes, and expiring stock; all figures from server tools. |
| Supplier message drafts | Turn a confirmed purchase order into a WhatsApp or email draft that the user sends. |
| Import data-quality checks | Flag invalid pack conversions, implausible prices, and missing HSN codes during imports. |
| Support ticket triage | Classify and route support requests; suggest answers from support procedures. |

## 3. Post-pilot

- Multilingual and voice ordering (Hindi, regional languages, transliteration). The pilot is English-only.
- External demand signals such as festivals and seasonal illness, adopted only if they pass the forecast WAPE promotion gate.
- Distributor pricing and margin optimization, subject to separate governance.

## 4. Out of scope

These are clinical or regulatory decisions, not business operations:

- Automatic generic substitution (equivalents may be shown for information only).
- Clinical drug-interaction checks.
- Schedule H/H1/X prescription verification.
