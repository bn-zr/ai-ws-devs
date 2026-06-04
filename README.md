# reservation-workshop-demo

Minimal TypeScript/Node.js demo repository for a workshop on AI-assisted development.

A fictional reservation system with intentionally imperfect code. 

## Stack

- TypeScript + Node.js (built-in `node:test`)
- `dayjs` for dates
- Express (minimal server for browser UI)
- No framework, no database — pure business logic

## Setup

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser to use the manual testing UI.

## Demo Scenarios

This repo is the starting point for three live workshop demos:

1. **Implement the feature** (`src/ReservationService.ts`): The 24h cancellation rule is not implemented (always returns success). Write tests and/or fix the logic.
2. **Refactor pricing** (`src/PricingService.ts`): `calculatePrice` is a long if/else-if chain. Refactor to an Object Map + lookup.
3. **TDD bug fix** (`src/ReservationService.ts`): Use the `<24h` rule as a TDD exercise.

See `tests/README.md` for the recommended test cases to implement.

## Scripts

- `npm start` — run the Express server with browser UI
- `npm test` — run tests (participants write them)
- `npm run typecheck`
- `npm run build`
- `npm run validate` — build + typecheck + test

## Endpoints (used by the UI)

- `POST /cancel` — `{ reservationDate: string }` → `{ allowed: boolean, reason: string }`
- `POST /price` — `{ type, season, discount }` → `{ price: number }`

