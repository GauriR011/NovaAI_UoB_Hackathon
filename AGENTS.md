# AGENTS.md - Space42 Career Platform

## Project Overview

Space42 is a React 19 + TypeScript career platform with AI-powered job matching. The application features job browsing, applications, AI chat assistant (Nova), interview preparation, and onboarding flows.

## Tech Stack

- **Framework**: React 19 + Vite 7
- **Language**: TypeScript 5.8 (strict mode disabled)
- **Styling**: Tailwind CSS 3.4
- **Routing**: React Router DOM 7
- **i18n**: i18next
- **Backend**: Supabase (auth, database, edge functions)
- **Build**: Vite with SWC plugin

## Build/Lint/Test Commands

```bash
# Development
npm run dev           # Start dev server on port 3000

# Build
npm run build         # Production build to ./out directory

# Type Checking
npm run type-check    # TypeScript check (tsconfig.app.json)

# Linting
npm run lint          # ESLint for src/**/*.{ts,tsx}

# Preview
npm run preview       # Preview production build
```

**Note**: No test framework is configured. If adding tests, prefer Vitest for Vite compatibility.

## Project Structure

```
src/
├── App.tsx              # Root component with BrowserRouter + i18n
├── main.tsx             # Entry point
├── index.css            # Tailwind imports only
├── router/
│   ├── index.ts         # AppRoutes component, global navigate helper
│   └── config.tsx       # Route definitions (RouteObject[])
├── pages/
│   ├── home/            # Landing page with components/
│   ├── browse/          # Job listings
│   ├── job-detail/      # Single job view
│   ├── dashboard/       # User dashboard with applications/interviews
│   ├── chat/            # AI chat interface (Nova)
│   ├── interview/       # Interview prep
│   ├── briefing/        # Onboarding briefing
│   ├── onboarding/      # Onboarding flow
│   ├── register/        # Registration
│   └── NotFound.tsx     # 404 page
├── lib/
│   ├── supabase.ts      # Supabase client
│   └── chatStorage.ts   # IndexedDB for chat persistence
├── i18n/
│   ├── index.ts         # i18next config
│   └── local/           # Translation files
└── mocks/               # Sample data

supabase/
└── functions/
    └── match-resume/    # Deno edge function for resume matching
```

## Code Style Guidelines

### Imports

Auto-imports are configured via `unplugin-auto-import`. The following are available globally:

**React hooks** (no import needed):
- `useState`, `useEffect`, `useContext`, `useReducer`, `useCallback`, `useMemo`, `useRef`, `useLayoutEffect`, `useId`, `useTransition`, etc.

**React Router** (no import needed):
- `useNavigate`, `useLocation`, `useParams`, `useSearchParams`, `Link`, `NavLink`, `Navigate`, `Outlet`

**i18next** (no import needed):
- `useTranslation`, `Trans`

For other imports, use explicit imports with `@/` alias for src paths:
```typescript
import { supabase } from '@/lib/supabase';
import Component from '@/pages/home/components/Component';
```

### TypeScript

- **Strict mode is OFF** - the codebase does not enforce strict typing
- `@typescript-eslint/no-explicit-any` is disabled in ESLint
- Type interfaces are defined inline in components
- Use `interface` for object shapes, `type` for unions/aliases

```typescript
// Preferred: Interface for component props and data shapes
interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

// Preferred: Type for string literals
type TabType = 'overview' | 'applications' | 'interviews' | 'profile';
```

### Component Patterns

- **Default exports** for page components
- **Named exports** for utilities and hooks
- Function declarations for components (not arrow functions)

```typescript
// Page component pattern
export default function PageName() {
  const navigate = useNavigate();
  const [state, setState] = useState<Type>(initialValue);
  
  return (
    <div className="min-h-screen bg-white">
      {/* content */}
    </div>
  );
}
```

### Styling (Tailwind CSS)

- Use Tailwind utility classes exclusively
- Primary brand color: `#5147EF` (indigo/purple)
- Secondary: `#7C3AED`, `#9333EA`
- Common patterns:
  ```
  bg-gradient-to-br from-[#5147EF] to-[#7C3AED]  # Brand gradient
  rounded-xl, rounded-2xl                         # Rounded corners
  shadow-sm, shadow-lg, shadow-2xl               # Shadows
  hover:bg-gray-50 transition-colors cursor-pointer
  ```

- Inline styles for animations:
  ```tsx
  <style>{`
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    .animate-float {
      animation: float 3s ease-in-out infinite;
    }
  `}</style>
  ```

### Naming Conventions

- **Files**: kebab-case for pages (`job-detail/`), PascalCase for components (`HeroSection.tsx`)
- **Components**: PascalCase (`DashboardPage`, `Navigation`)
- **Functions/Variables**: camelCase (`handleSendMessage`, `isTyping`)
- **Constants**: camelCase for objects, SCREAMING_SNAKE_CASE for primitives
- **Interfaces**: PascalCase, no `I` prefix (`Message`, not `IMessage`)

### Error Handling

- Use try/catch for async operations
- Console.error for development debugging
- Graceful fallbacks in UI

```typescript
try {
  const data = await fetchData();
} catch (error) {
  console.error('Failed to fetch:', error);
  // Show fallback UI
}
```

### State Management

- Local state with `useState` and `useReducer`
- No global state library (Redux/Zustand)
- Context for cross-component state (i18n)
- IndexedDB for chat persistence (`chatStorage.ts`)
- sessionStorage for temporary context (rejection coaching)
- localStorage for user preferences

### Environment Variables

Frontend (Vite):
```
VITE_PUBLIC_SUPABASE_URL
VITE_PUBLIC_SUPABASE_ANON_KEY
```

Build-time defines (vite.config.ts):
```
__BASE_PATH__
__IS_PREVIEW__
__READDY_PROJECT_ID__
__READDY_VERSION_ID__
__READDY_AI_DOMAIN__
```

## Supabase Edge Functions

Edge functions use Deno runtime. Located in `supabase/functions/`.

```typescript
// Import from esm.sh
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// Use Deno.env for environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL');

// Handle CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  // ... handler logic
});
```

## Common Patterns

### Navigation
```typescript
const navigate = useNavigate();
navigate('/dashboard');
navigate('/chat?context=rejection');
```

### i18n (when used)
```typescript
const { t } = useTranslation();
<span>{t('common.submit')}</span>
```

### Remixicon Icons
The project uses Remixicon via CDN. Use `ri-` classes:
```tsx
<i className="ri-search-line text-xl"></i>
<i className="ri-arrow-right-line"></i>
```

## Important Notes

1. **No tests exist** - consider adding Vitest if implementing tests
2. **Strict TypeScript is disabled** - avoid `as any` anyway for maintainability
3. **Auto-imports are active** - don't import React hooks manually
4. **Chinese comments exist** - this is intentional, preserve them
5. **Mock data is inline** - `dashboard/page.tsx` contains extensive mock data
