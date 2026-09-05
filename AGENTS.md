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

## 🧪 Testing - Real User Behavior Pattern MANDATORY

### Hybrid Approach Protocol (Recommended)

**Strategy:** Combine direct URL navigation with same-session hover+click to maximize test coverage.

#### Phase 1: Page Load via Navigation ✅
```bash
navigate("http://localhost:8081/tabs")  # or any route
browsermcp_browser_snapshot             # capture fresh refs
```

#### Phase 2: Same-Session Hover + Click ✅  
**CRITICAL:** Do NOT take intermediate snapshots between hover and click!
```bash
# Take snapshot once, get ref ID
browsermcp_browser_snapshot  # ← Get ref sXeYZ

# Hover to advance page state (ref remains valid for this session)
browsermcp_browser_hover("Income tab", "sXeYZ")

# Immediately click before next snapshot changes refs
browsermcp_browser_click("tab to switch", "sXeYZ")

# → If FAILS: Don't take new snapshot first - ref regenerated!
```

#### Phase 3: Inspect Without Breaking Session ⚠️  
Avoid `browsermcp_browser_snapshot` if already in hover+click sequence. Use browser devtools for deeper inspection instead.

#### Phase 4: Next Page Test via Navigation ✅  
When moving to different tab/route, use direct URL:
```bash
navigate("http://localhost:8081/tabs/expenses")  # fresh route = fresh ref session
browsermcp_browser_snapshot  # get new refs for this page
```

### Testing Commands Pattern
```bash
# Export and start server
npx expo export --platform web --output-dir dist
python3 -m http.server 8081

# Test Homepage
navigate("http://localhost:8081/")
browsermcp_browser_snapshot  # inspect rendered content

# Test Tabs via Navigation (Recommended)
navigate("http://localhost:8081/tabs")
browsermcp_browser_snapshot

# Same-session interaction on loaded page
browsermcp_browser_hover("Income tab", "sXeYZ")
browsermcp_browser_click("Income tab", "sXeYZ")  # Must be same session!

# Test other tabs - each via direct navigation
navigate("http://localhost:8081/tabs/expenses")
navigate("http://localhost:8081/tabs/obligations")
```

### Scenarios to Cover Per Round
- [ ] All routes load correctly via URL navigation
- [ ] Content displays: headers, forms, images, buttons  
- [ ] Styling verified: dark mode, fonts, responsive layouts
- [ ] Assets bundle check: fonts, images, icons, favicon
- [ ] Console logs for errors/warnings
- [ ] Tab switching functionality works after hydration

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

