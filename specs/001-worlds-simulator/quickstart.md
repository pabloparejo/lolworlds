## Quickstart Guide: League of Legends Worlds Tournament Simulator

**Purpose**: Get the development environment set up and running quickly

**Prerequisites**:
- Node.js 18+ installed
- npm or yarn package manager
- Modern web browser (Chrome, Firefox, Safari, or Edge)
- Code editor (VS Code recommended for TypeScript support)

---

## Initial Setup

### 1. Initialize React Project with Vite

```bash
# From repository root (worlds/)
npm create vite@latest . -- --template react-ts

# Answer prompts:
# - "Current directory is not empty. Remove existing files and continue? (y/N)" → N
# - This will scaffold the project structure
```

**What this does**:
- Creates `package.json` with React 18 and TypeScript
- Sets up Vite configuration
- Creates `tsconfig.json` for TypeScript
- Adds `.gitignore` for node_modules

### 2. Install Dependencies

```bash
# Core dependencies
npm install

# Install Tailwind CSS for styling
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install drag-and-drop library
npm install @dnd-kit/core @dnd-kit/utilities

# Install testing dependencies
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install -D @playwright/test
```

### 3. Configure Tailwind CSS

Update `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Custom theme colors (CSS variables)
        'bg-primary': 'var(--color-bg-primary)',
        'bg-secondary': 'var(--color-bg-secondary)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'accent': 'var(--color-accent)',
      },
    },
  },
  plugins: [],
}
```

### 4. Configure Vitest

Update `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
      ],
    },
  },
})
```

Create test setup file:

```bash
mkdir -p src/test
```

`src/test/setup.ts`:
```typescript
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});
```

### 5. Update package.json Scripts

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "format": "prettier --write \"src/**/*.{ts,tsx,css}\""
  }
}
```

### 6. Create Directory Structure

```bash
# Create Clean Architecture directory structure
mkdir -p src/domain/entities
mkdir -p src/domain/services
mkdir -p src/domain/rules
mkdir -p src/application/usecases
mkdir -p src/application/hooks
mkdir -p src/infrastructure/persistence
mkdir -p src/infrastructure/loaders
mkdir -p src/infrastructure/theme
mkdir -p src/presentation/components/swiss
mkdir -p src/presentation/components/knockout
mkdir -p src/presentation/components/shared
mkdir -p src/presentation/components/layout
mkdir -p src/presentation/pages
mkdir -p src/presentation/contexts
mkdir -p src/presentation/hooks
mkdir -p tests/unit/domain
mkdir -p tests/unit/application
mkdir -p tests/integration
mkdir -p tests/e2e
mkdir -p public
```

### 7. Create Teams Data File

Create `public/teams.json` with 16 teams:

```json
{
  "teams": [
    { "name": "T1", "region": "LCK" },
    { "name": "Gen.G", "region": "LCK" },
    { "name": "DK", "region": "LCK" },
    { "name": "KT", "region": "LCK" },
    { "name": "JDG", "region": "LPL" },
    { "name": "BLG", "region": "LPL" },
    { "name": "WBG", "region": "LPL" },
    { "name": "LNG", "region": "LPL" },
    { "name": "PSG", "region": "LCP" },
    { "name": "GAM", "region": "LCP" },
    { "name": "G2", "region": "LEC" },
    { "name": "FNC", "region": "LEC" },
    { "name": "MAD", "region": "LEC" },
    { "name": "C9", "region": "LCS" },
    { "name": "TL", "region": "LCS" },
    { "name": "FLY", "region": "LCS" }
  ]
}
```

### 8. Setup Theme System

Create `src/index.css` with theme variables:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* Light theme colors */
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f3f4f6;
  --color-text-primary: #111827;
  --color-text-secondary: #6b7280;
  --color-accent: #3b82f6;
  --color-border: #e5e7eb;
  --color-success: #10b981;
  --color-error: #ef4444;
}

[data-theme='dark'] {
  /* Dark theme colors */
  --color-bg-primary: #111827;
  --color-bg-secondary: #1f2937;
  --color-text-primary: #f9fafb;
  --color-text-secondary: #9ca3af;
  --color-accent: #60a5fa;
  --color-border: #374151;
  --color-success: #34d399;
  --color-error: #f87171;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  transition: background-color 0.2s ease, color 0.2s ease;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}
```

Update `index.html` to prevent FOUC:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Worlds Tournament Simulator</title>

    <!-- Theme script to prevent FOUC -->
    <script>
      (function() {
        const theme = localStorage.getItem('theme') || 'auto';
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (theme === 'dark' || (theme === 'auto' && prefersDark)) {
          document.documentElement.classList.add('dark');
          document.documentElement.setAttribute('data-theme', 'dark');
        } else {
          document.documentElement.setAttribute('data-theme', 'light');
        }
      })();
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

## Development Workflow

### Running the Development Server

```bash
npm run dev
```

**Expected output**:
```
  VITE v5.0.0  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

Open http://localhost:5173 in your browser.

### Running Tests

**Unit and Integration Tests**:
```bash
# Run all tests once
npm test

# Watch mode (re-runs on file changes)
npm run test -- --watch

# With coverage report
npm run test:coverage

# With UI (visual test runner)
npm run test:ui
```

**E2E Tests**:
```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e -- --ui

# Run specific test file
npm run test:e2e -- tests/e2e/complete-tournament.spec.ts
```

### Building for Production

```bash
npm run build
```

This creates optimized production build in `dist/` directory.

**Preview production build**:
```bash
npm run preview
```

---

## Implementation Order

Follow this order to implement features incrementally with tests:

### Phase 1: Domain Layer (TDD)

1. **Create types** (copy from contracts/types.ts):
   ```bash
   cp specs/001-worlds-simulator/contracts/types.ts src/domain/entities/types.ts
   ```

2. **Create interfaces** (copy from contracts/interfaces.ts):
   ```bash
   cp specs/001-worlds-simulator/contracts/interfaces.ts src/domain/services/interfaces.ts
   ```

3. **Implement domain services with tests**:
   - `src/domain/services/RandomDrawStrategy.ts` + test
   - `src/domain/services/BiasedDrawStrategy.ts` + test
   - `src/domain/services/SwissMatchmaker.ts` + test
   - `src/domain/services/KnockoutSeeder.ts` + test

4. **Write business rules**:
   - `src/domain/rules/swiss-rules.ts` (qualification/elimination logic)
   - `src/domain/rules/pairing-constraints.ts` (no-repeat validation)

**Test command for this phase**:
```bash
npm test -- tests/unit/domain
```

### Phase 2: Infrastructure Layer

1. **Implement persistence**:
   - `src/infrastructure/persistence/LocalStorageAdapter.ts` + test

2. **Implement data loading**:
   - `src/infrastructure/loaders/TeamDataLoader.ts` + test

3. **Implement theme manager**:
   - `src/infrastructure/theme/ThemeManager.ts` + test

**Test command**:
```bash
npm test -- tests/unit/infrastructure
```

### Phase 3: Application Layer (Use Cases)

1. **Implement use cases** (one at a time with tests):
   - `src/application/usecases/LoadTournament.ts`
   - `src/application/usecases/SimulateRound.ts`
   - `src/application/usecases/SelectWinner.ts`
   - `src/application/usecases/SwapTeams.ts`
   - `src/application/usecases/LockMatch.ts`
   - `src/application/usecases/RedrawPhase.ts`
   - `src/application/usecases/ResetTournament.ts`

2. **Create custom hooks**:
   - `src/application/hooks/useTournament.ts`
   - `src/application/hooks/useLocalStorage.ts`

**Test command**:
```bash
npm test -- tests/unit/application
```

### Phase 4: Presentation Layer (UI Components)

1. **Create contexts**:
   - `src/presentation/contexts/TournamentContext.tsx`
   - `src/presentation/contexts/ThemeContext.tsx`

2. **Create shared components** (smallest to largest):
   - `src/presentation/components/shared/ThemeToggle.tsx` + test
   - `src/presentation/components/shared/DrawSelector.tsx` + test
   - `src/presentation/components/shared/ResetButton.tsx` + test

3. **Create Swiss stage components**:
   - `src/presentation/components/swiss/TeamCard.tsx` + test
   - `src/presentation/components/swiss/MatchCard.tsx` + test
   - `src/presentation/components/swiss/RecordBracket.tsx` + test
   - `src/presentation/components/swiss/SwissStage.tsx` + test

4. **Create Knockout stage components**:
   - `src/presentation/components/knockout/BracketMatch.tsx` + test
   - `src/presentation/components/knockout/Bracket.tsx` + test
   - `src/presentation/components/knockout/KnockoutStage.tsx` + test

5. **Create layout components**:
   - `src/presentation/components/layout/Header.tsx` + test
   - `src/presentation/components/layout/Layout.tsx` + test

6. **Create pages**:
   - `src/presentation/pages/TournamentPage.tsx` + test
   - `src/presentation/pages/ErrorPage.tsx` + test

7. **Wire up App.tsx**:
   - Connect contexts and routing

**Test command**:
```bash
npm test -- tests/unit/presentation
```

### Phase 5: Integration & E2E Tests

1. **Write integration tests**:
   - `tests/integration/tournament-flow.test.ts` (Swiss → Knockout)
   - `tests/integration/persistence.test.ts` (save/load state)

2. **Write E2E tests**:
   - `tests/e2e/complete-tournament.spec.ts` (full user journey)

**Test commands**:
```bash
npm test -- tests/integration
npm run test:e2e
```

---

## Common Development Tasks

### Add a New Component

```bash
# 1. Create component file
touch src/presentation/components/shared/MyComponent.tsx

# 2. Create test file
touch src/presentation/components/shared/MyComponent.test.tsx

# 3. Implement component with TypeScript
# 4. Write tests using React Testing Library
# 5. Run tests: npm test -- MyComponent.test.tsx
```

### Debug a Test

```bash
# Run single test file in watch mode
npm test -- MyComponent.test.tsx --watch

# Run with debugging
npm test -- --inspect-brk MyComponent.test.tsx
```

### Check TypeScript Errors

```bash
npx tsc --noEmit
```

### Format Code

```bash
# Format all files
npm run format

# Format specific file
npx prettier --write src/domain/entities/Team.ts
```

---

## Troubleshooting

### Issue: Tests fail with "Cannot find module"

**Solution**: Ensure paths in `tsconfig.json` are correct:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### Issue: Theme not applying on initial load

**Solution**: Check that theme script in `index.html` runs before React loads:
- Script must be in `<head>` before React script
- Use `localStorage.getItem('theme')` synchronously

### Issue: Drag-and-drop not working on mobile

**Solution**: Ensure @dnd-kit touch events are enabled:

```typescript
import { TouchSensor, useSensor } from '@dnd-kit/core';

const touchSensor = useSensor(TouchSensor, {
  activationConstraint: {
    delay: 250,
    tolerance: 5,
  },
});
```

### Issue: localStorage quota exceeded

**Solution**: Tournament state should be ~50KB, well under 5MB limit. If exceeded:
- Check for circular references in state
- Ensure state is not duplicated
- Consider compressing with LZ-string if needed

---

## Next Steps

After completing setup:

1. ✅ Verify `npm run dev` starts successfully
2. ✅ Verify `npm test` runs (even if 0 tests initially)
3. ✅ Verify `public/teams.json` loads at http://localhost:5173/teams.json
4. Start implementing domain layer following TDD approach
5. Run `/speckit.tasks` to generate task breakdown when ready

---

## Resources

- **Vite Docs**: https://vitejs.dev/
- **React Docs**: https://react.dev/
- **TypeScript**: https://www.typescriptlang.org/docs/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **@dnd-kit**: https://docs.dndkit.com/
- **Vitest**: https://vitest.dev/
- **React Testing Library**: https://testing-library.com/react
- **Playwright**: https://playwright.dev/

---

## Constitution Compliance Checklist

Before proceeding to implementation, verify:

- [ ] Clean Architecture structure created (domain, application, infrastructure, presentation)
- [ ] TypeScript configured with strict mode
- [ ] Tailwind CSS configured with dark mode support
- [ ] Theme system prevents FOUC
- [ ] Testing framework setup (Vitest + RTL + Playwright)
- [ ] All dependencies align with React best practices
- [ ] No framework dependencies in domain layer
- [ ] Interfaces defined for dependency inversion

**Status**: All items must be checked before running `/speckit.tasks`

This quickstart provides everything needed to begin development following the constitution and architecture plan. Good luck!
