# AI Project Manager Dashboard (Tambo Generative UI demo)

Hackathon-friendly React app scaffolded with **Vite**. The goal is to demonstrate *Generative UI*:

1. User types a natural language prompt.
2. An adapter (eventually Tambo) converts that prompt into a structured **UI plan**.
3. The app renders components based on that plan.

Right now this repo uses a tiny `MockTamboAdapter` (keyword heuristics) so we can build the UI + boundaries first.

## Getting started

```bash
npm install

# Terminal 1: backend API
npm run dev:server

# Terminal 2: frontend
npm run dev
```

Routes:

- `/login`
- `/register`
- `/dashboard`

Minimal auth API (backend):

- `POST /api/register` `{ email, password }`
- `POST /api/login` `{ email, password }`

Azure OpenAI endpoints (backend, optional):

- `POST /api/azure-openai/chat` `{ prompt }` or `{ messages }`
- `POST /api/interpret-intent` `{ input }` (also available as `POST /interpret-intent`)

If you deploy this as an SPA, make sure your host serves `index.html` for unknown routes (so refreshing `/dashboard` works).

## Configuring Tambo (optional)

By default the app uses `TamboStubProvider` (no network calls).

To run against the real Tambo API, copy `.env.example` to `.env.local` and set `VITE_TAMBO_API_KEY`.

To register more components with Tambo, add them to `src/tambo/tamboComponents.ts` with a `propsSchema`.

## Project structure

```text
server/
  src/
    routes/
    services/
    utils/
src/
  app/                 Router setup
  components/          KanbanBoard, PrioritySelector, TeamAssignmentPanel, PromptBar
  data/                Mock tasks/users
  pages/               Login, Register, Dashboard
  tambo/               Tambo adapter boundary (mock for now)
  types/               Shared TS types
  styles/              Global styles
```

## Where Tambo fits

The integration point is the adapter boundary in `src/tambo/`.

- `src/tambo/types.ts` defines `GenerativeUIAdapter` and `UIPlan`.
- `src/tambo/mockTamboAdapter.ts` simulates what Tambo will eventually do.
- `src/tambo/useGenerativeUI.ts` is the UI-facing hook.
- `src/tambo/tamboComponents.ts` registers UI components (starting with `KanbanBoard`) with the Tambo React SDK.
- `src/tambo/TamboRootProvider.tsx` wraps the app with either `TamboProvider` (when `VITE_TAMBO_API_KEY` is set) or `TamboStubProvider`.

Once we bring in the real Tambo SDK, we should be able to replace `MockTamboAdapter` with a real adapter implementation,
without refactoring the UI components.
