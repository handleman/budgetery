# Visual Testing Plan - Round 2
**Project:** Budgetery React Native Web  
**Date:** 2026-09-05  
**Server:** http://localhost:8081  
**Status:** 🟡 In Progress

---

## 🎯 **Current Application Status**

### ✅ **Working Components**
- Expo Router static site generation (6 routes)
- Metro bundler serving on port 8081
- Tab navigation functioning via expo-router
- Dark mode detection via CSS media queries
- All assets bundled (fonts, images, icons)
- Context/state management across screens

### ⚠️ **Issues Identified**
- Deprecated APIs: `Button`, `TouchableOpacity`, shadow props
- Browser MCP connection timeout (opencode-chromium requires setup)
- Input styling not fully tested on web platform

---

## 🧪 **Testing Execution Plan**

---

### **Phase 1: Navigation & Routing Tests** 🔴 HIGH PRIORITY

#### **Routes to Test:**

| Route | Endpoint | Expected Content | Test Order |
|-------|----------|------------------|------------|
| **Welcome Screen** | `/` | Tutorial prompt, month picker, "Get started!" button | 1st |
| **Tabs Layout** | `/tabs` | Tab bar navigation container | 2nd |
| **Income Tab** | `/tabs/income` | Income sources list, modal, totals display | 3rd |
| **Expenses Tab** | `/expenses` | Daily expenses, remain balance calculator | 4th |
| **Obligations Tab** | `/obligations` | Recurring obligations with percentage toggle | 5th |

#### **Test Actions per Route:**

##### Route: `/` (Welcome Screen)
1. **Initial State Check:**
   - Verify "You don't have any data yet" text visible
   - Confirm "Get started!" button rendered
   - Check input field focus states enabled
   
2. **Interaction Test:**
   - Click "Get started!" button
   - Verify month picker modal opens (or dropdown appears)
   - Select a month value
   - Enter custom period name in text input
   - Click Apply/Submit button

##### Route: `/tabs/income` 
1. **Initial State Check:**
   - Verify Income background image loaded correctly
   - Confirm header color green (`#6F888C`)
   - HelloWave animation visible initially
   
2. **Tutorial Prompt (no items):**
   - Confirm "Income Sources" title displayed
   - Check explanatory text visible
   - Verify "Get started!" button clickable

3. **Modal Flow:**
   - Click "Get started!" → Modal opens
   - Enter amount (e.g., 5000)
   - Enter label (e.g., "Salary")
   - Click Save → Verify item added to list
   - List displays date, amount, label correctly

4. **Multiple Items:**
   - Add another income item (Freelance: 2000)
   - Verify totalBudget updates incrementally
   - Check remainingBudget and dailyBudget values recalculate

5. **"Add more!" Button:**
   - Click again with items already present
   - Verify modal opens without changing tutorial state
   - Ensure existing items remain in list

##### Route: `/tabs/expenses`
1. **Initial State Verification:**
   - Confirm expenses background image (green theme)
   - Header color `#6F888C` matches design
   - "Daily expenses" title visible
   
2. **"Add one!" Modal Flow:**
   - Click → Modal opens with amount/label inputs
   - Enter 500 → Label "Groceries"
   - Submit → Item added to list

3. **List Display & Math:**
   - Verify date formatting (toISOString)
   - Amount and label displayed correctly
   - Hr separator renders between content sections
   - Remains balance updates correctly

4. **"Add more!" Test:**
   - Click with items present
   - Verify same modal opens
   - No crash or state reset

##### Route: `/tabs/obligations`
1. **Initial State Verification:**
   - Red header color (`#F43F38`) confirmed
   - Obligations background image loaded
   
2. **"Get started!" Flow:**
   - Click → Modal opens with percentage toggle visible
   - Toggle switch starts at false (amount mode)
   
3. **Toggle Switch Test:**
   - Click switch → Should change to true (percentage mode)
   - Verify thumb color changes blue → yellow
   - Text label updates accordingly

4. **Percentage Calculation:**
   - Toggle ON, amount = 1500, label = "Electricity"
   - Later add: Income = 2000, Obligation = 10% → Should display calculated value in UI
   
5. **"Add more!" Button:**
   - Click → Opens modal again with toggle persisted state
   - Existing obligation items remain in list

---

### **Phase 2: Button Interaction Tests** 🔴 HIGH PRIORITY

#### **Button Matrix (Per Screen):**

| Button | Location | Expected Action | Verify After Click |
|--------|----------|-----------------|-------------------|
| **"Get started!"** | Welcome screen | Passes tutorial flag, opens modal | modal visible, tutPassed=true |
| **"Get started!"** | Income tab (initial) | Same as above but income-specific | incomeItems populated |
| **"Get started!"** | Obligations tab | Opens modal with toggle | toggle visible, tutPassed=true |
| **"Add more!"** | All screens (post-tutorial) | Opens modal only | Tutorial state unchanged |
| **"Save"** | All modals | Submits form, dispatches add action | Item listed, onClose() called |
| **"Back"/"Cancel"** | All modals | Closes modal only | Modal hidden, same screen content visible |

#### **Edge Cases to Test:**
- Submit modal with empty amount → Current behavior: sets to 0 (may need validation)
- Rapid clicking on Save button → Should not double-add items
- Clear input field then submit → Should handle gracefully without errors

---

### **Phase 3: Input & Styling Verification** 🟡 MEDIUM PRIORITY

#### **For Each Screen:**

##### Checkpoint: Background Images
```
✓ Income background loads @ /tabs/income  
✓ Expenses background loads @ /expenses  
✓ Obligations background loads @ /obligations  
```

##### Checkpoint: Theme Colors
```css
Income tab header:  background-color: #18C521 (light) / #0E863D (dark)
Expenses tab header: background-color: #6F888C (both themes)  
Obligations header: background-color: #F43F38 (both themes)
```

##### Checkpoint: Font Loading
- SpaceMono font renders correctly from bundled asset
- Body text uses fallback fonts when needed
- No text selection issues

#### **Component-Specific Tests:**

##### ParallaxScrollView
- Header image parallax effect visible on scroll (if applicable)
- No scrolling overflow/blocked content
- Mobile tap targets still accessible with fixed headers

##### Hr Component Separator
- Renders border-bottom style correctly
- Doesn't block modal backdrops or clicks
- Empty lines don't cause layout breaks

##### Safe Area Insets  
- iPhone notch / desktop browser safe areas handled
- `env(safe-area-inset-*)` CSS functions responsive
- No visual clipping on various device sizes tested

---

### **Phase 4: State Consistency Tests** 🔴 HIGH PRIORITY

#### **Context↔Component Sync Verification:**

##### In Income Screen useEffect Hooks Test:
```javascript
// Verify these useEffect dependencies work:
[useEffect(() => {
  // setIncomes(incomeItems) syncs context state to local render
  console.log('Income items synchronized:', incomeItems.length);
}, [incomeItems, incomeTutorialPassed]);

[useEffect(() => {
  // totalBudget updates when addIncomeItem dispatched elsewhere
  console.log('Total budget recalc:', totalBudget);
}, [totalBudget]);
```

##### Test Sequence:
1. Add income item in Income tab
2. Verify items array in component re-renders immediately
3. Switch to Expenses tab → Return to Income
4. List should maintain state (persist while navigated away)
5. Add expense → Verify totalBudget and remainingBudget recalc correctly

#### **Math Verification:**
```javascript
// For each transaction type, verify calculations:

// Initial state (no items):
- incomeItems = []
- totalBudget = 0
- expenses = []  
- remainingBudget = 0 (or whatever default)

// After adding Income of 1000:
- totalBudget = 1000
- remains = remainingBudget - 0 = previousRemains + 1000

// After adding Obligation (plain): 200
- totalObligations = 200
- remainingBudget decreases by 200

// After adding Obligation (percentage): 15% of 1000 = 150
- Display shows calculated: amount=15% or actual=150?
- Verify UI displays user's intent correctly

// After adding Expense of 300:
- totalExpenses = 300
- remains = previousRemains - 300
```

---

### **Phase 5: Modal Component Tests** 🟡 MEDIUM PRIORITY

#### **AddIncomeModal:**
```
Test Cases:
✓ isVisible prop controls render (true→renders, false→hidden)
✓ Amount input: keyboardType="numeric" shows number pad on mobile browser
✓ Label input accepts free text
✓ Date auto-set to new Date() 
✓ onSave validation: amount > 0 before dispatch
✓ onCancel closes modal without submitting
✓ "Back" button closes, "Save" submits
```

#### **AddObligationModal:**  
```
Extra Tests Beyond Income Modal:
✓ Toggle switch starts false by default (amount mode)
✓ Switch thumb color blue when false (#f4f3f4)
✓ Switch thumb color yellow when true (#f5dd4b)
✓ Track colors match: false → #767577, true → #81b0ff
✓ isPercentage state persists across modal close/open?
✓ When toggle ON, UI shows "percentage" label (current shows "Amount/Percentage")
✓ Save with percentage=true stores {isPercentage: true} in item
```

#### **AddExpenseModal:**
```
Identical tests to income modal except:
- Simpler than obligations (no toggle needed)
- Same form layout as income for consistency
- Single button flow could be optimized later if adding labels optional
```

---

### **Phase 6: Web-Specific Tests** 🟡 MEDIUM PRIORITY

#### **Responsive Design Checks:**

##### Desktop View (1920px width):
- Header parallax effect works
- Text wraps properly in long content areas  
- Button sizes scale down or stay legible?

##### Mobile View (320px width simulated in desktop browser):
- Touch targets ≥ 44px height minimum
- Font sizes don't become too small
- Safe area insets visible on iPhone-sized browsers

##### Zoom Levels:
- 75% zoom → All text readable
- 100% zoom → Normal rendering
- 200% zoom → No overflow, elements scroll if needed

#### **Performance Metrics:**
```
First Contentful Paint (FCP): < 1s expected (static HTML)  
Time to Interactive (TTI): Check bundle loading  
Initial hydration after SPA refresh: Should be fast (<500ms typical)
```

#### **Accessibility (Web Standards):**
- Meta viewport set correctly for PWA readiness
- Title tag in `<head>` for SEO  
- No broken links or missing alt text on images
- Keyboard navigation works (tab between buttons)

---

### **Phase 7: Console & Error Verification** 🔴 HIGH PRIORITY

#### **Console Warnings Checklist:**
```javascript
Should NOT see after fixing deprecations:
❌ Button is deprecated - use Pressable instead  
❌ TouchableOpacity is deprecated  
❌ accessibilityRole deprecated - use role  
❌ props.pointerEvents deprecated  
❌ shadow* props deprecated (use boxShadow)  
❌ Image style.resizeMode deprecated
```

#### **Console Errors to Check For:**
```
❌ Cannot read property of undefined (hydration mismatch errors)
❌ Missing image asset warnings from bundled assets  
❌ Metro bundler compilation errors on save  
✅ All should be clean after initial setup
```

---

## 🔧 **Fixes Required Before/After Testing**

### **Priority: BLOCKER - Fix These First:**

Replace deprecated Button components across app:

1. **Files to modify:**
   - `app/index.tsx` (line 76-80)
   - `app/tabs/index.tsx` (lines 97-100, 115-119) 
   - `app/tabs/obligations.tsx` (lines 94-97, 109-113)
   - `app/tabs/expenses.tsx` (lines 85-88, 100-104)
   - All modal files: AddIncomeModal, AddObligationModal, AddExpenseModal (line 40-47)

2. **Migration Pattern:**
```jsx
// Before (deprecated):
<Button title="Save" onPress={onSubmit} />

// After (modern web-compatible):
import { Pressable } from 'react-native';

<Pressable 
  style={({ pressed }) => pressed && styles.pressed}
  onPress={onSubmit}
>
  <ThemedText>"Save"</ThemedText>
</Pressable>

// Extract text outside or use component:
const SaveButton = () => (
  <Pressable onPress={onSubmit}>
    <ThemedText>Save</ThemedText>
  </Pressable>
);
```

3. **Shadow Style Replacement:**
```jsx
// Before: style={{ shadowColor: '#000', shadowOffset, shadowOpacity, shadowRadius, elevation }}
// After: style={{ ...props.style, ...boxShadowStyleFromContext }}, or add @source css module
```

---

## 📊 **Test Results Template**

After executing tests, document results as:

```markdown
# Test Results - [Date]

## Phase 1: Navigation ✅ PASS / ❌ FAIL  
- [/]: Button click works → State changes correctly
- [/tabs/income]: Background image loads  
- [/tabs/expenses]: Remain balance calcates on add
- [/tabs/obligations]: Toggle switch state persists

## Phase 2: Buttons ✅ PASS / ❌ FAIL
- "Get started!" modal opens each screen
- "Save" dispatches to context (no crash)
- No double-submission race conditions

## Phase 3: Styling ✅ PASS / ❌ FAIL
- All background images load  
- Header colors match design spec  
- Safe areas respected on all screen sizes

## Phase 4: State Sync ✅ PASS / ❌ FAIL
- Context updates reflected in UI immediately
- Navigation between tabs maintains state
- Calculations (total/remain/daily) correct after each add

## Deprecated Warnings 🚫 → ✅ FIXED
- [ ] Button→Pressable: N locations
- [ ] shadow → boxShadow  
etc.

## Overall Status: _________

## Screenshots Captured: 
1. Homepage initial state
2. Income tab - modal open showing added items
3. Obligations tab - toggle switch ON vs OFF modes

## Notes:
[list any issues, unexpected behavior, or UX recommendations]
```

---

## 📝 **Documentation to Create After Testing**

After executing all tests:

### Files to Generate:
1. `docs/WEB_TESTS_ROUND2_RESULTS.md` - Current testing results with pass/fail status
2. `docs/DEPRECATED_FIXES_APPLIED.md` - Log of all deprecation warnings fixed  
3. `docs/WEB_FEATURES_STATUS.md` - Summary of what web features work/not working

---

## 🚀 **Next Steps (Post-Testing)**

Based on test results:

### If All Tests Pass ✅:
1. Update package.json with proper versions if needed
2. Consider adding PWA manifest for installability  
3. Implement service workers if going PWA route
4. Add loading states for hydration
5. Create web-specific error boundaries

### If Some Tests Fail ⚠️:
- Document failures specifically (which screen, which flow)
- Debug step-by-step for console errors
- Check metro bundler output for build warnings
- Fix CSS/styling issues in +html.tsx or useColorScheme files

---

**Testing Started:** `(now)`  
**Estimated Duration:** 30-45 minutes total across all phases  

**Ready to execute when connected!** 🎯
