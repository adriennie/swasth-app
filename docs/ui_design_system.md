# Swasthya UI Design System

Swasthya uses one design system across Customer, Pharmacy, Distributor, and Admin roles. Each role gets its own visual density and motion intensity while sharing typography, icons, and components.

The customer screens (`app/(tabs)`: tracker, FlowBot, learn, and `app/onboarding/health-quiz`) are outside the B2B pilot scope but use the same system.

## 1. Style by role

| Role | Style | Card radius | Navigation |
|---|---|---|---|
| Customer | Soft Wellness Minimalism + Bento Grid, playful accents | 16–24px | Bottom tabs |
| Pharmacy | Clinical Minimalism + Enterprise SaaS | 10–14px | Role dashboard navigation |
| Distributor | Enterprise SaaS + Bento Grid | 10–14px | Role dashboard navigation |
| Admin | Clinical Minimalism + data-focused SaaS | 10–14px | Role dashboard navigation |
| FlowBot (customer) | Soft glassmorphism + minimal chat UI | 16–24px | Entry point from tabs |
| Business copilot | Clinical Minimalism chat panel | 10–14px | Panel within dashboards |

Style notes:

- **Soft Wellness Minimalism**: lavender, blush, and cream; rounded cards; gentle gradients.
- **Clinical Minimalism**: white surfaces, restrained teal accents, readable data cards, precise spacing.
- **Bento Grid**: modular cards of varied sizes for summaries and quick actions.
- **Enterprise SaaS**: structured tables, compact status badges, search filters, efficient navigation.
- **Glassmorphism**: use sparingly; text on frosted surfaces must still meet contrast requirements.
- **Dark theme**: deep navy background, muted lavender highlights, crisp charts. Optional for all roles.

## 2. Tokens

### Color

| Token | Value | Use |
|---|---|---|
| `lavender` | `#8B75C9` | Brand accent, fills, large text, icons |
| `lavenderText` | `#6B55A8` | Lavender text and links on light surfaces |
| `blush` | `#F3C6D4` | Decorative backgrounds and highlights only |
| `canvas` | `#FAF8FC` | App background |
| `teal` | `#3B9B92` | Operational accent, fills, icons |
| `tealText` | `#2A7A73` | Teal text on light surfaces |
| `ink` | `#292638` | Primary text |

`lavender` (≈3.8:1 on white) and `teal` (≈3.3:1) do not meet WCAG AA for body text, so text uses the `*Text` variants (≈6.0:1 and ≈5.1:1). `blush` is never used for text. Status colors (success, warning, error) keep their current meanings and are always paired with an icon or label.

These tokens replace the blue palette in `constants/Colors.ts`.

### Typography

| Use | Font |
|---|---|
| Headings | Plus Jakarta Sans |
| Body | Inter |
| Dashboard labels and numbers | DM Sans (tabular figures) |

### Icons

Lucide with one consistent stroke weight. React Native screens need `lucide-react-native`; the project currently depends only on `lucide-react` (web).

## 3. Motion

### Intensity by role

| Role | Personality | Intensity |
|---|---|---|
| Customer | Playful, organic, expressive | Medium |
| FlowBot | Breathing, pulsing, responsive | Low–medium |
| Pharmacy | Crisp, fast, functional | Low |
| Distributor | Smooth operational feedback | Low |
| Admin | Restrained chart and state changes | Very low |

### Signature animations (customer)

1. **Living Cycle Ring**: circular calendar that fills when switching months; the selected day expands; phase colors flow along the ring.
2. **Morphing Mood Characters**: mood options change expression and posture when selected.
3. **FlowBot Living Orb**: breathes while idle, pulses while processing, becomes three bouncing dots while preparing an answer.
4. **Blooming Check-in**: a bud opens into a flower with a checkmark after a daily check-in is saved.

Supporting interactions:

- **Liquid quiz progress**: lavender liquid fills a capsule as onboarding questions are answered.
- **Magnetic symptom chips**: chips expand on tap, settle with a spring, and change color with a ripple; light haptic feedback.

### Operational animations

- **Inventory charts**: bars grow from the baseline, trend lines draw in, stock numbers count to confirmed values.
- **Order journey**: a package icon moves between order stages as the timeline fills.
- **Dashboard reveal**: short staggered card and chart entrances after data loads.
- **Low-stock warnings**: appear immediately and clearly, without decorative motion.

### Transitions

| Transition | Duration | Easing |
|---|---|---|
| Card-to-screen expansion | 300–400ms | Spring |
| Bottom sheets (symptoms, calendar details, filters) | 250–350ms | Spring, drag to dismiss |
| Sliding navigation pill | 180–240ms | Smooth |
| Swipeable insight cards | Gesture-driven | Spring return |

### Motion rules

- Respect the system reduced-motion setting: replace movement with fades or instant changes.
- Never animate an order, payment, or stock change as confirmed before the server confirms it. Pending states look pending.
- Simulated payments keep the "Simulation — no money will be charged" label visible through every transition.
- Medical warnings, urgent symptoms, and errors use no celebratory or playful effects and are readable without waiting for an animation.
- Cycle predictions and fertile windows are labeled as estimates and are visually distinct from logged days.
- Operational screens prioritize speed: animations never delay input or hide data.

## 4. Implementation stack (Expo)

| Library | Purpose | Status |
|---|---|---|
| React Native Reanimated | Springs, counters, element transitions | Installed |
| React Native Gesture Handler | Swipes, draggable cards, selectors | Installed |
| Expo Haptics | Tactile feedback | Installed |
| Expo Router | Navigation and screen transitions | Installed |
| Lottie React Native | Blooming flower, illustrations, loading states | To add |
| React Native Skia | Cycle ring, particles, flowing shapes | To add |
| `lucide-react-native` | Native icons | To add |
| Expo Google Fonts | Plus Jakarta Sans, Inter, DM Sans | To add |

## 5. Components

Operations screens use `components/ui/kit.tsx`:

| Component | Use |
|---|---|
| `HeroHeader`, `HeroIconButton` | Ink-to-lavender gradient header with eyebrow, title and status line |
| `StatTile` | Bento metric tile with a semantic tone |
| `ActionTile` | Quick-action shortcut |
| `SectionHeader` | Section title with optional action link |
| `Card`, `Badge`, `Chip` | Surfaces, status labels, filters |
| `FadeIn` | Staggered entrance; disabled when the system requests reduced motion |

Tones (`lavender`, `teal`, `amber`, `rose`, `slate`) carry meaning: teal is healthy, amber needs attention, rose is urgent.

Screens that should be reachable but have no tab-bar button use `hiddenTab` from `constants/navigation.ts`. expo-router 58 redirects away from `href: null` screens.

## 6. Rollout

1. Replace color tokens and fonts; add accessible text variants.
2. Restyle shared components (cards, buttons, badges, tables, bottom sheets) with per-role radius and density.
3. Apply the operational style to pharmacy, distributor, and admin dashboards.
4. Apply the customer style and add the four signature animations.
5. Audit contrast, reduced motion, and screen-reader labels on Android, iOS, and web.
