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
- on first run should be tutorial shown after that income tab
- after the tutorial passed default tab should be expenses
- if i start tracking new month, i should see tutorial one more time
- i want to be able to see list of months where i was tracking data if i have more than one month tracked


## Expense Tracking


- As a user I want to view all expenses for a selected period and get visual summary
- i want to be able to set expense, and label
- i want to be able to see expenses grouped by day entered, expandable card consisting expenses for the day
- i want to be able to add\edit expenses in the current day as default but may want to edit another day before today
- if my expense exceed dayly budget goal i want to see visual confirmation for example day card should be colored in theme's accent level as warning, for example become pale red
- the next card should be accented as well untill there is not passes as much days as daily budget overlap (big_expense/day_budget = quatity of days should be passed until overlap warning will be taken off), and i am free to enter expense
- if i enter the expenses on the next day after overlapped day with accented visual warning it should be accented untill (big_expense/day_budget = quatity of days should be passed until overlap warning will be taken off) newly added expenses should add to big_expense value
- if i enter expense after overlap days went off so day card should be usual
- if i enter expense i want to see remaining sum from allowed budget recalculated on all the related screens
- i want to see total spend summary below all day cards and remaining sum (remains) to spend in this month
- remains and total spend should be sticked as  bottom navbar

## Income Management

- As a user I want to add multiple income sources (salary, freelance, investments) and see combined total
- As a user I want to set salary dates and get monthly income projections
- want to see here total income sum of all entered
- dayly budget
- remaing budget which is total - obligations
- remaining budget and totals should be sticked to bottom on scroll as bottom navbar

## Obligation Tracking

- As a user I want to add recurring obligations (rent, utilities, subscriptions) and see total obligation cost
- As a user I want to mark some obligations as percentage-based and get calculated amounts from total budget
- i want to see dayly budget calculated
- i want to see remaining budget calculated here
- i want to see list od all obligations and its summary here
- i dont need to see timestamps or datetime of obligation entered
- remaining budget and other totals should be sticked to bottom on scroll as bottom navbar

## Tutorial Onboarding

- As a user I want to complete the welcome tutorial and progress through income/obligations/expenses modules
- As a user I want to track my tutorial progress with checkboxes and feel guided through app features

## State Management

- As a user I want my store state to persist across sessions and get consistent data when reopening
- As a user I want all budget calculations to be accurate and get correct remaining budget values
- As a user I want to see day-by-day budget breakdown and get proper daily average calculations

