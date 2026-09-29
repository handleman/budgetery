---
title: Use cases
nav_order: 1
parent: Design docs
---

# Use Cases

Format: "As a user I want to [action] and get [result]" or "I want to [action] and get [result]"

## Budget Management

- As a user I want to set my monthly budget amount and get a tracking dashboard
- As a user I want to enter income sources and see total budget calculations
- As a user I want to add expenses with amounts and dates and see how they affect remaining budget
- As a user I want to track obligations (rent, utilities) and see their impact on my budget
- As a user I want to calculate daily budget allocation automatically based on period
- As a user I want to select which month I'm budgeting for and get relevant calculations
- i want to be able to navigate between screens by bottom bar (bottom navbar)
- i want to see in the bottom navbar: income, obligations, expenses
- i want a round back button in the top-left corner of income, obligations and expenses screens leading back to the welcome screen with the tracked-months list
- on first run should be tutorial shown after that income tab
- after the tutorial passed default tab should be expenses
- if i start tracking new month, i should see tutorial one more time
- i want to be able to see list of months where i was tracking data if i have more than one month tracked

## Configuration page

- as a user i want to have configuration screen
- as a user i want to access the configuration screen from the main welcome screen
- i want to see distincitve button or menu link
- in the configuration screen i want my data synchronized with google drive to a default Budgetery folder, without having to select a folder

## Expense Tracking


- As a user I want to view all expenses for a selected period and get visual summary
- i want to be able to set expense, and label
- i want to be able to see expenses grouped by day entered, expandable card consisting expenses for the day
- i want to be able to add\edit expenses in the current day as default but may want to edit another day before today
- i want to fill the expense date via a visual calendar picker (same calendar control on iOS, Android and web), future dates are not allowed in the current month; within a selected past or future period month the whole month is selectable
- if the selected period month is not the current month (e.g. tracking February while today is in September), new income, obligation and expense entries default to the 1st of the selected period month instead of today, so the day-by-day breakdown reflects period entries instead of showing 0s
- dates entered on submit are clamped into the selected period month (up to today for the current month), so every saved entry lands in its period
- if my expense exceed dayly budget goal i want to see visual confirmation for example day card should be colored in theme's accent level as warning, for example become pale red
- the next card should be accented as well untill there is not passes as much days as daily budget overlap (big_expense/day_budget = quatity of days should be passed until overlap warning will be taken off), and i am free to enter expense
- if i enter the expenses on the next day after overlapped day with accented visual warning it should be accented untill (big_expense/day_budget = quatity of days should be passed until overlap warning will be taken off) newly added expenses should add to big_expense value
- if i enter expense after overlap days went off so day card should be usual
- if i enter expense i want to see remaining sum from allowed budget recalculated on all the related screens
- i want to see total spend summary below all day cards and remaining sum (remains) to spend in this month
- i want the day-by-day breakdown table collapsed by default and expandable on demand
- i want the breakdown "Left" column to show the running period balance (previous Left + daily budget − this day's spent), so a severe overshoot keeps following days negative until recovered, with negative rows colored red
- i want to see daily budget on the expenses page as well
- remains and total spend should be sticked as  bottom navbar

## Income Management

- As a user I want to add multiple income sources (salary, freelance, investments) and see combined total
- new income entries default to today in the current month, or to the 1st of the selected period month otherwise (same period-date rule as expenses)
- want to see here total income sum of all entered
- dayly budget
- remaing budget which is total - obligations
- remaining budget and totals should be sticked to bottom on scroll as bottom navbar

## Obligation Tracking

- As a user I want to add obligations (rent, utilities, subscriptions) and see total obligation cost
- new obligation entries default to today in the current month, or to the 1st of the selected period month otherwise (same period-date rule as expenses)
- As a user I want to mark some obligations as percentage-based and get calculated amounts from total budget
- i want to see dayly budget calculated
- i want to see remaining budget calculated here
- i want to see list od all obligations and its summary here
- i dont need to see timestamps or datetime of obligation entered
- remaining budget and other totals should be sticked to bottom on scroll as bottom navbar

## Tutorial Onboarding

- As a user I want to complete the welcome tutorial and progress through income/obligations/expenses modules
- if i already have a tracked month, opening the app skips the first-run tutorial gate and shows the tracked-months list directly

## State Management

- As a user I want my store state to persist across sessions and get consistent data when reopening
- As a user I want all budget calculations to be accurate and get correct remaining budget values
- As a user I want to see day-by-day budget breakdown and get proper daily average calculations

## Web Hosting

- As a user I want to open the app from a public web URL and get the same functionality as the local web build
- As a user I want deep links to income, obligations, expenses and configuration screens to work on the hosted version

Live: [https://budgetery.vercel.app](https://budgetery.vercel.app) (auto-deploy on `main` push; Drive-connect pending production-origin registration).

