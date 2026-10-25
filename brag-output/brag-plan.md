# Brag Plan: Swasthya

## What is this app?
Swasthya is a pharmacy supply network (Expo app for Android, iOS and web) that connects pharmacies, distributors and admins so medicine stock is forecast, reordered and delivered before it runs out.

## The angle
Start with the human problem, not the software: a patient asks for a medicine and the shelf is empty. Then name the three root causes Swasthya's own welcome screen lists (stockouts, expiry losses, manual reordering) and walk through the working app role by role: the pharmacy's 7-day forecast, ordering from a 250-product catalog, distributor fulfilment with a delivery code, and admin oversight with an anomaly flag. Every number on screen comes from the live demo database or the ML API.

## Hook (first 2-3 seconds)
A single empty shelf slot and a stock card reading "Paracetamol 650 mg Tablet — 0 in stock", with the line "The shelf is empty." Calm, slightly uncomfortable, no music hit yet.

## Key moments (the middle)
- The pharmacy dashboard: "8 items need restocking", stat tiles counting up, then AI reorder cards arriving one by one (Mefenamic Acid + Dicyclomine URGENT, Paracetamol 650 HIGH: 26 units in 7 days, reorder 20, ₹530).
- The catalog: "250 products · 17 categories", search typing "para", category chip, tapping + until the cart bar reads the order total, "Review order".
- Distributor fulfilment: order timeline Placed → Confirmed → Shipped → Delivered, with a 4-digit delivery code.
- Admin: "Approvals waiting — 1 pharmacy · 1 distributor" and the anomaly alert "Order of 500 units is 13.0x the normal average (38 units). Recommend manual review."

## Outro / punchline
"Swasthya. Keep every shelf stocked." The empty slot from the hook is now filled.

## User flow worth showing
Pharmacy opens dashboard → sees forecast-backed reorder suggestion → orders from catalog → distributor ships with a delivery code → admin oversees network and flags an unusual order.

## Tone
- Preset: app-store
- Creative direction: calm healthcare product film; problem first, then a clear feature walkthrough with narration
- Interpretation: clean slides and wipes, feature-card structure, unhurried holds so each narrated feature is readable; warm, trustworthy, no jokes.

## Format: landscape — 1920x1080
## Duration: 60 seconds (user requested a one-minute demo; exceeds the 15-25s default on purpose)

## Visual identity (from the project)
- Background: #FAF8FC (canvas)
- Hero gradient: #292638 (ink) → #4F3D85 (lavenderDeep) → #6B55A8 (lavenderText)
- Accent: #6B55A8 (lavenderText), #8B75C9 (lavender), #F3C6D4 (blush)
- Semantic: teal #2A7A73 (healthy), amber #B45309 (attention), rose #B4234A (urgent)
- Text: #292638
- Display font: Plus Jakarta Sans; body: Inter; labels/numbers: DM Sans
- Strongest visual element: the phone-sized dashboard with gradient hero and bento stat tiles; reorder cards with urgency badges

## Share copy (draft)
Pharmacies run out of medicines because reordering is guesswork. Swasthya forecasts demand, routes orders to distributors and verifies every delivery.

## Voiceover script
Voice: Kokoro af_heart, speed 1.0. Clips generated per line.

| # | Scene | Line | Clip |
|---|---|---|---|
| 1 | Hook | A patient walks into a neighbourhood pharmacy for a medicine they need today. And the shelf is empty. | 5.82s |
| 2 | Problem | Pharmacies guess what to reorder. Stock expires without anyone noticing. And orders still go out by phone call. | 6.95s |
| 3 | Reveal | Swasthya fixes that. It connects pharmacies, distributors and admins in one supply network. | 5.82s |
| 4 | Forecast | Every morning, the pharmacy sees what needs restocking. A seven-day demand forecast flags what will run out before the next delivery, and exactly how much to reorder. | 10.22s |
| 5 | Catalog | Ordering takes seconds. Search two hundred and fifty medicines, filter by category, check price and margin, and the order goes straight to the pharmacy's distributor. | 9.90s |
| 6 | Distributor | The distributor confirms and ships, and every delivery is verified with a one-time code. | 5.31s |
| 7 | Admin | Admins approve new businesses, and unusually large orders are flagged for manual review. | 5.53s |
| 8 | Outro | Swasthya. Keep every shelf stocked. | 2.05s |

## Audio direction
- Role: warm bed under narration
- Music: happy-beats-business-moves-vol-12 (117s, ~110 BPM)
- Music treatment: fade in over the hook, ducked to ~0.13 under narration, swell slightly on the reveal and outro, fade out over the last 2s
- Music cue guidance: bundled preset covers only the first ~25s; detect beats for the full minute at composition time with `hyperframes beats`. Lock the Swasthya reveal (~15.6s) and the outro logo (~56.6s) to strong beats within ±0.15s.
- Audio-reactive treatment: subtle; hero gradient glow breathes with the bed. No visualizers.
- SFX posture: sparse, motion-matched (card place for reorder cards, keyboard ticks for search typing, click for + taps, soft impact for reveal)
- Restraint rule: SFX never compete with narration; nothing louder than the voice.

## Storyboard

### Scene 1 — Empty shelf — 0.0–7.2s (7.2s)
Pharmacy shelf strip with product boxes and one empty slot; stock card "Paracetamol 650 mg Tablet · 0 in stock · Out of stock" (rose). Line: "The shelf is empty."
Sequential/interaction: boxes settle in, the gap is noticed (soft highlight).
Audio intent: quiet, uneasy. Transition: clean wipe → Scene 2

### Scene 2 — Three problems — 7.2–15.2s (8.0s)
Three problem cards arrive one by one in sync with the narration: Stockouts (guesswork reordering), Expiry losses (near-expiry stock unnoticed), Manual reordering (orders by phone).
Sequential: yes, each card held ≥2s. Audio: card place per card. Transition: slide → Scene 3

### Scene 3 — Reveal — 15.2–22.0s (6.8s)
Ink→lavender gradient. Logo + "Swasthya", tagline "Keep every shelf stocked with the medicines your community needs." Role pills Pharmacies · Distributors · Admins arrive one by one.
Audio: soft impact on logo (beat-locked). Transition: slide → Scene 4

### Scene 4 — Pharmacy dashboard + forecast — 22.0–33.2s (11.2s)
Phone recreation of "Today at a glance": stat tiles count up (8 low stock, 0 out of stock); reorder cards slide in (Mefenamic URGENT ~2 days, reorder 26; Paracetamol 650 HIGH, 7d demand 26, reorder 20, ₹530). Left caption: "7-day demand forecast".
Audio: card place per reorder card. Transition: slide → Scene 5

### Scene 5 — Catalog ordering — 33.2–44.0s (10.8s)
Phone recreation of "Browse catalog — 250 products · 17 categories": search types "para", chip "Pain & Fever" activates, list rows with price/MRP/margin, + tapped 3 times, cart bar appears "Review order". Left caption: "250 medicines. One tap to order."
Audio: key ticks, clicks. Transition: slide → Scene 6

### Scene 6 — Distributor fulfilment — 44.0–50.0s (6.0s)
Order card from Sanjeevani Medicals; timeline Placed → Confirmed → Shipped → Delivered fills step by step; delivery code chip "Code 4821 ✓ verified".
Audio: tick per step. Transition: slide → Scene 7

### Scene 7 — Admin oversight — 50.0–56.4s (6.4s)
Admin "Network overview" with approvals banner, then the anomaly alert card: "Order of 500 units is 13.0x the normal average (38 units). Recommend manual review."
Audio: one restrained alert accent. Transition: crossfade → Scene 8

### Scene 8 — Outro — 56.4–60.0s (3.6s)
Shelf from the hook, gap now filled; "Swasthya" + "Keep every shelf stocked."
Audio: beat-locked soft bell, music fades out.

**Music mood:** warm, optimistic, understated.
**Audio summary:** quiet uneasy open, warm bed lifts at the reveal, steady under the walkthrough, resolves on the filled shelf.

## Grounding notes
- "250 products · 17 categories", reorder values, stats, approvals counts: live demo database (synthetic data).
- Anomaly sentence: actual `/detect-anomaly` output from the ML API.
- Delivery code: `delivery_otp` on orders. Code digits shown are illustrative.
- No real people, emails or credentials appear; businesses are fictional demo data.
