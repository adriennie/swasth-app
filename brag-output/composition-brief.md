# Hyperframes Composition Brief: Swasthya

## Objective
Create a one-minute narrated product demo for Swasthya: the problem first, then each feature shown working, with voiceover in parallel.

## Output
- Composition directory: `brag-output/composition/`
- Rendered video: `brag-output/brag.mp4`
- Format: landscape — 1920x1080
- Duration: 60 seconds (user-requested; overrides the 15-25s default)

## Source Material
- Project root: `/Users/adrikapradhan/Desktop/swasth-app`
- Primary files read: `app/(auth)/login.tsx`, `app/(auth)/supplier-login.tsx`, `app/pharmacy/dashboard.tsx`, `app/pharmacy/catalog.tsx`, `app/distributor/index.tsx`, `app/admin/index.tsx`, `components/ui/kit.tsx`, `constants/Colors.ts`, `docs/ui_design_system.md`, `swasthya-api/lambda_function.py`
- Product name: Swasthya
- Tagline: "Keep every shelf stocked with the medicines your community needs."
- Key UI to recreate: pharmacy dashboard (hero + stat tiles + reorder cards), catalog (search, chips, rows, cart bar), distributor order timeline, admin overview + anomaly alert
- Copy that must appear verbatim:
  - Stockouts / Expiry losses / Manual reordering
  - Keep every shelf stocked with the medicines your community needs.
  - Today at a glance
  - Browse catalog · 250 products · 17 categories
  - Order of 500 units is 13.0x the normal average (38 units). Recommend manual review.

## Creative Direction
- Tone preset: app-store
- Creative direction: calm healthcare product film; problem first, then a clear feature walkthrough with narration
- Angle, hook, outro: see `brag-plan.md`
- Avoid: generic SaaS language, abstract filler, visual redesign of the product

## Visual Identity
- Background #FAF8FC; text #292638; hero gradient #292638 → #4F3D85 → #6B55A8
- Accent #6B55A8 / #8B75C9 / blush #F3C6D4; teal #2A7A73, amber #B45309, rose #B4234A
- Fonts (local TTFs copied from the app's node_modules): Plus Jakarta Sans (display), Inter (body), DM Sans (labels/numbers)

## Storyboard
Use `brag-plan.md` as the contract. Scene summary:
1. Empty shelf — 0.0–7.2s
2. Three problems — 7.2–15.2s
3. Reveal — 15.2–22.0s
4. Pharmacy dashboard + forecast — 22.0–33.2s
5. Catalog ordering — 33.2–44.0s
6. Distributor fulfilment — 44.0–50.0s
7. Admin oversight — 50.0–56.4s
8. Outro — 56.4–60.0s

## Audio
- Voiceover: `assets/vo/vo-01.wav` … `vo-08.wav`, one per scene, each starting ~0.4s into its scene
- Music: `assets/music/happy-beats-business-moves-vol-12-by-ende-dot-app.mp3`, ducked to ~0.13 under narration, fade in/out
- Beat cues: detect with `npx hyperframes beats`; lock reveal logo and outro logo to strong beats (±0.15s)
- Audio-reactive: subtle glow on gradient heroes; skip if extraction unavailable
- SFX: sparse, from the skill library per `sfx-analysis.md`, low HF-risk files; chosen after animation exists

## Requirements
- Show real UI from the project in every feature scene.
- Every reveal of readable text holds ≥0.3s per word.
- Run `npx hyperframes check` before render.
- Keep creation and rendering local.
