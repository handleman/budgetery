# Budgetery Agent Notes

## Setup
```bash
npm install
npx expo start
```

## Testing  
Skip for now or add scripts:
- `"test:single": "jest path/to/test"`
- `"test:ci": "jest --ci --coverage"`

## Architecture
- File-based routing via `expo-router`; edits to `app/**` trigger navigation updates
- State stored as a Context + reducer in `store/`
- Tabs live in `app/tabs/`: `index.tsx`, `expenses.tsx`, `obligations.tsx`

## Writing Design & Documentation Plans
- All design implementation plans (e.g., test plans, architecture docs) MUST be written as `.md` files in `docs/` folder
- Place strategic documentation including use cases, feature specs, and architectural decisions in `docs/`
- See existing: `docs/usecases.md`, `docs/TEST_COVERAGE_SUMMARY.md`

## Build commands  
```bash
npm run ios    # iOS simulator
npm run android # Android emulator
npm run web     # Web dev server
npm run start   # Platform detection (same as above)
```

## Reset / Starter code wipe
```bash
npx expo reset-project
```

## TypeScript
- Uses `expo/tsconfig.base` with `"@/*" => "./*"` path mapping
- TS error blocking is normal during edits; verify changes compile cleanly before committing

