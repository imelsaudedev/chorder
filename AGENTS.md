# Agent Guide (AGENTS.md)

Welcome, Agent. This document outlines the critical architecture, workflow, and testing strategies for the Chorder project.

## 🚀 Development Workflow

### 1. Branching Strategy (CRITICAL)
Direct pushes to `main` are blocked by GitHub Rulesets.
- **Rule**: Always create a feature branch for any changes.
- **Command**: `git checkout -b feature/your-feature-name`
- **Merge**: Changes must be submitted via Pull Request and pass all CI checks.

### 2. Local Development
- **Dev Server**: `yarn dev` (runs on port 3000).
- **Database**: Uses the `postgres` database in the local PostgreSQL instance.

---

## 🧪 Testing Infrastructure

We have a strict isolation strategy to allow parallel testing without data collision.

### 1. Unit & Integration Tests (Vitest)
- **Command**: `yarn test`
- **Database**: `chorder_test`
- **Schema**: `public`
- **Config**: `vitest.config.ts` and `tests/setup-env.ts`.

### 2. End-to-End Tests (Playwright)
- **Command**: `yarn test:e2e`
- **Database**: `chorder_test`
- **Schema**: `e2e`
- **Port**: 3001 (configured in `playwright.config.ts`).
- **Seeding**: Use `tests/e2e/e2e-utils.ts`. It is schema-aware and will automatically target the `e2e` schema.

### 3. Database Initialization
If you change the Prisma schema, you must initialize both schemas:
```bash
# Initialize Integration schema
npx prisma db push

# Initialize E2E schema
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/chorder_test?schema=e2e" npx prisma db push
```

**Important:** If the dev server is running when you run `prisma generate`, it will fail with EPERM (DLL locked on Windows). Stop the server first, regenerate, then restart.

---

## 🧪 Test Patterns

### ArrangementHeader (and any Popover-based header)

The component calls `useSongConfig()` directly (imported from `@/components/config/SongConfig`). Tests must mock it or the hook will throw from missing context:

```tsx
vi.mock('@/components/config/SongConfig', () => ({
  useSongConfig: () => ({ transpose: 0, setTranspose: vi.fn() }),
}));

vi.mock('@/components/config/KeyButtonSet', () => ({
  default: () => <div data-testid="key-button-set" />,
}));
```

`ArrangementSelector` only renders when `song.arrangements.length > 1` (`hasMultipleArrangements`). The mock arrangement must have **2+ arrangements** for selector-related assertions to pass:

```tsx
const mockArrangement: ClientArrangement = {
  song: {
    arrangements: [
      { id: 1, name: 'Default', key: 'G', isDefault: true, isDeleted: false, isServiceArrangement: false, originalArrangementId: null, youtubeUrl: null },
      { id: 2, name: 'Alt',     key: 'A', isDefault: false, isDeleted: false, isServiceArrangement: false, originalArrangementId: null, youtubeUrl: null },
    ]
  }
};
```

### SongPicker — clicking "add" button

`SongListEntry` uses a `<Link>` overlay covering the entire row, with `pointer-events-none` on the title. Clicking the song title does **not** trigger `onSelected`. Mock `next/link` and target the add button via its `sr-only` text:

```tsx
vi.mock('next/link', () => ({         // ← required: prevents JSDOM state update warnings
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

// In test:
const addLabels = await screen.findAllByText('Adicionar ao service');
await user.click(addLabels[0].closest('button')!);
expect(onSelected).toHaveBeenCalledTimes(1);
```

### E2E seed — ArrangementSelector visibility

`ArrangementSelector` only renders when `hasMultipleArrangements` (≥ 2 arrangements). If a visual test checks for arrangement selector text, the seed in `tests/e2e/e2e-utils.ts` **must** create a second arrangement after the default one:

```ts
await prisma.songArrangement.create({
  data: { songId: song.id, key: 'A', name: 'Alternative Arrangement', isDefault: false }
});
```

---

## 🛠 Tech Stack Quirks

- **Next.js**: Using App Router and Turbopack (`--turbopack`).
- **UI Components**: Uses **shadcn/ui**. Components are located in `components/ui/`.
- **Prisma**: The client is configured to be schema-aware via environment variables.
- **Internationalization**: Uses `next-intl`. Check `messages/` for translations.
- **Visual Regression**: We use Playwright for visual snapshots. If UI changes are intentional, update snapshots using `npx playwright test --update-snapshots`.

---

## 📦 Environment: DevContainer

The project is designed to run in a **VS Code DevContainer**.

### ⚠️ Warnings & Limitations
1.  **Playwright Deps**: If browsers are missing, run `npx playwright install --with-deps`.
2.  **Database**: A PostgreSQL instance runs inside the container on `localhost:5432`.
3.  **Port Access**:
    - `3000`: App Dev Server
    - `3001`: Test Server (E2E)
    - `9323`: Playwright HTML Report
    - `6006`: Storybook
4.  **Performance**: Running `yarn test` and `yarn dev` simultaneously can be resource-intensive. If tests time out, close the dev server.

---

## 🎨 Design & Aesthetics
- The project prioritizes a premium, clean look.
- Use **Vanilla CSS** or the established Tailwind configuration.
- Avoid placeholders; generate real assets/images if needed.

---

## 🤖 CI/CD
- **GitHub Actions**: Configured in `.github/workflows/ci.yml`.
- **Vercel**: Production deployments are gated by GitHub status checks.
