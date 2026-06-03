# Life Autopilot

A mobile-first React Native (Expo) app that handles the non-academic life logistics
of college students — fridge, groceries, meals, laundry, supplies, subscriptions, and
reading — so they can focus on what matters.

Editorial, paper-like, tactile. A physical journal that came to life. Not a productivity app.

```
"everything's handled, priya."
```

## Stack

- **Expo SDK 56** + **expo-router** (file-based routing)
- **Zustand** + AsyncStorage (local-first, offline-capable persistence)
- **react-native-svg** for every illustrated element (tree, buddy, matcha cup, books)
- **react-native-reanimated** for subtle, physical motion
- **expo-notifications** for schedulable, app-closed reminders
- **Anthropic Claude** (`claude-sonnet-4-20250514`) for expiry prediction, recipes,
  grocery carts, and meal planning — every call has an offline heuristic fallback
- **Instacart Platform API** (shoppable links) and **Nutrislice** (Hopkins dining)
  seams, with deterministic mocks so the flows work offline

## Getting started

```bash
npm install
cp .env.example .env       # then paste your Anthropic key (optional — app works without it)
npx expo start
```

Open in the Expo Go app or a simulator. On first launch you'll go through onboarding;
after that you land on the home screen.

### The Claude API key

`EXPO_PUBLIC_ANTHROPIC_API_KEY` enables live expiry prediction, recipes, and grocery
carts. **Without it the app still works** — every Claude call falls back to a built-in
heuristic. ⚠️ Calling Anthropic directly from a client exposes the key; for production,
proxy these calls through your own backend.

### Node version note

Metro wants Node `>= 24.3.0`. On older Node 24.x you may hit
`Unexpected end of MessagePack data` during bundling — run with `--max-workers 1`
(e.g. `npx expo export --platform ios --max-workers 1`) or upgrade Node.

## The four living elements (home screen)

All driven by one **life-health score** (`lib/scoring.ts`) — fridge stocked, laundry
done this week, reading on track, supplies stocked (25% each):

1. **Your Tree** — fullness + color track the score (`needs water → growing → healthy → thriving`). Tap to see what's dragging it down.
2. **Your Buddy** — a Tamagotchi whose mood follows the score. Tap to pet. Goes disheveled if laundry slips, holds an empty bowl if the fridge runs dry.
3. **Matcha Cup** — fills 0→100% (pale → rich green) as the five daily acts get done; steam wisps when full.
4. **Fridge** — tap to swing the door open (rotateY) and reveal the interior; items glow by freshness; restocks pop in one by one.

## Project layout

```
app/                      expo-router routes
  _layout.tsx             fonts + theme + notification handler
  index.tsx               onboarding gate (waits for persisted state)
  onboarding/             8-step setup flow
  (tabs)/                 home · fridge · meals · fitness · you
  reading.tsx             reading module (pushed)
components/
  ui/                     Card, StickyNote, Type, Button, Field, TabBar, …
  living/                 Tree, Buddy (SVG)
  home/  fridge/  meals/  laundry/  reading/  supplies/  subscriptions/
stores/                   zustand stores (one per domain) + dailyStore
lib/                      claude, scoring, notifications, instacart, cart,
                          nutrislice, mealPlanner, attention, date, theme
constants/                theme.ts (tokens), typography.ts (text presets)
```

## Principles baked in

- **Never auto-purchases.** Grocery carts are assembled, never checked out — you always review.
- **Offline-first.** Every screen renders from cached state; Claude calls degrade to heuristics.
- **Ruthless triage.** The "immediate attention" note shows at most 4 things (`lib/attention.ts`).
- **Warm, calm voice.** "spinach expires today", not "URGENT: item expiring".
