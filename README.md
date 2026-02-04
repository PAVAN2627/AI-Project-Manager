# AI Project Manager Dashboard (Tambo Generative UI demo)

Hackathon-friendly React app scaffolded with **Vite**. The goal is to demonstrate *Generative UI*:

1. User types a natural language prompt.
2. An adapter (eventually Tambo) converts that prompt into a structured **UI plan**.
3. The app renders components based on that plan.

Right now this repo uses a tiny `MockTamboAdapter` (keyword heuristics) so we can build the UI + boundaries first.

## Getting started

```bash
npm install
npm run dev
```

## Project structure

```text
src/
  app/                 App shell + layout
  components/          KanbanBoard, PrioritySelector, TeamAssignmentPanel, PromptBar
  data/                Mock tasks/users
  tambo/               Tambo adapter boundary (mock for now)
  types/               Shared TS types
  styles/              Global styles
```

## Where Tambo fits

The integration point is the adapter boundary in `src/tambo/`.

- `src/tambo/types.ts` defines `GenerativeUIAdapter` and `UIPlan`.
- `src/tambo/mockTamboAdapter.ts` simulates what Tambo will eventually do.
- `src/tambo/useGenerativeUI.ts` is the UI-facing hook.

Once we bring in the real Tambo SDK, we should be able to replace `MockTamboAdapter` with a real adapter implementation,
without refactoring the UI components.
