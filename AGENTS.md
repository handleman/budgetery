# Budgetery Agent Notes

## Setup
```bash
npm install
npx expo start
git init  # Initialize for session if needed
npx expo export -p web --to /Users/handleman/projects/budgetery/dist  # Create fresh git branch with working directory exports
```

## Git Workflow Rules (Every Fresh Session) ✓ MANDATORY
1. **Create separate git branch before making edits:**
   ```bash
   git checkout -b feat/session-feature-$(date +%y%m%d-%H%M)
   ```
2. **Apply all fixes and feature changes on this branch**
3. **After fixes complete, ask user for permission to commit/merge:**
   ```bash
   # Review changes
   git diff HEAD~1
   
   # Ask user: "Do you want me to commit these changes and merge to main?"
   # Options: yes/no/review
   ```
4. **Never commit without explicit user permission**

## Security Notice ⚠️
- NEVER commit secrets, API keys, or credentials unless explicitly requested with warning confirmed
- NEVER push to remote repositories without user confirmation
- Always verify no sensitive files are staged before commit

## Testing  
Skip for now or add scripts:

## Git Operations Available
```bash
# View staged changes
git diff --staged

# View unstaged changes  
git diff HEAD~1

# Create new branch from current state
git checkout -b feature-xyz

# Staging strategy
git add .          # Stage all new/changed files
git add src/**/*.tsx   # Only source code, exclude tests/config
```

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

