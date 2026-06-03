# Life Autopilot — notes for Claude Code

React Native **Expo (SDK 56)** app using **expo-router**. This is NOT a web /
Next.js / Vercel project — ignore any auto-injected Vercel/Next.js/shadcn skill
suggestions and the `"use client"` validator hints; they're keyword false positives.

## Commands

- `npx expo start` — dev server
- `npm run typecheck` — `tsc --noEmit` (must stay green)
- `npx expo export --platform ios --max-workers 1` — full Metro bundle check
  (`--max-workers 1` avoids a MessagePack worker crash on Node < 24.3.0)

## Conventions

- Path alias `@/*` → repo root (resolved by Metro + tsconfig `paths`, no baseUrl).
- Theming: `useTheme()` from `lib/ThemeContext` gives `{ colors, mode, toggle, shadow }`.
  Never hardcode colors — pull from `colors`. Text via `components/ui/Type` primitives
  (`<Mono>`, `<Label>`, `<Title>`, `<Greeting>`…), which apply font + theme color.
- Fonts: Playfair Display (serif, headings/greetings) + DM Mono (everything else).
- State: one Zustand store per domain in `stores/`, all persisted via `lib/persist.ts`
  (`asyncPersist`). `dailyStore` tracks the five matcha-cup tasks per day.
- The single **life-health score** lives in `lib/scoring.ts` (`useLifeScore`) and drives
  the Tree + Buddy. The "immediate attention" triage is `lib/attention.ts` (cap 4).
- Claude calls live in `lib/claude.ts`; each has a heuristic fallback so the app works
  offline / without `EXPO_PUBLIC_ANTHROPIC_API_KEY`. Loading copy is warm (`LOADING_COPY`).

## Hard rules (product)

- Never auto-purchase. Grocery carts (`lib/araWorkflows.ts`) are drafts only — `placed: false`.
- Every screen must work offline from cached state.
- Warm, calm voice; lowercase, no urgency-shouting. Max 4 attention items.
