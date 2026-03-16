# How to Use the Dashboard

> **Time required:** ~1 minute
> **Technical guide:** [../../docs/dev/dashboard-implementation.md](../dev/dashboard-implementation.md)

---

## What is the Dashboard?

The Dashboard gives you an at-a-glance overview of your spending. It shows summary statistics, a bar chart of your monthly spending trends, and a category breakdown so you can see where your money goes.

---

## Before You Begin

- [ ] You have opened the Expense Tracker app in your browser (http://localhost:3000)
- [ ] You have added at least one expense (the charts will appear once you have data)

---

## Step-by-Step

### Step 1 — Navigate to the Dashboard

Click the **Dashboard** tab in the top navigation bar. This is the default view when you first open the app.

*Screenshot: "Top navigation bar with 'Dashboard' tab selected"*

---

### Step 2 — Review Your Summary Cards

At the top of the Dashboard, you'll see four cards:

| Card | What It Shows |
|------|---------------|
| **Total Spending** | Your all-time total across every expense, plus total expense count |
| **This Month** | How much you've spent in the current calendar month |
| **Monthly Average** | Your average monthly spending over the last 6 months |
| **Top Category** | The category where you spend the most, with its total amount |

*Screenshot: "Four summary cards showing Total Spending, This Month, Monthly Average, and Top Category"*

---

### Step 3 — View Monthly Spending Trends

Below the summary cards, the **Monthly Spending** bar chart shows your spending for each of the last 6 months. Hover over any bar to see the exact amount.

*Screenshot: "Bar chart showing monthly spending with tooltip on hover"*

> **Tip:** If a month has no expenses, its bar will be at zero height.

---

### Step 4 — Check Category Breakdown

Next to the bar chart, the **By Category** section shows a donut chart and a legend. Each category is color-coded:

| Category | Color |
|----------|-------|
| Food | Orange |
| Transportation | Blue |
| Entertainment | Purple |
| Shopping | Pink |
| Bills | Red |
| Other | Gray |

The legend beside the chart lists categories sorted by spending (highest first) with their dollar amounts.

*Screenshot: "Donut pie chart with category legend showing Food, Transportation, etc."*

---

### Step 5 — Add an Expense from the Dashboard

Below the charts, there's an **Add Expense** form right on the Dashboard tab. Fill in the amount, category, description, and date, then click the submit button to add a new expense. The summary cards and charts will update immediately.

*Screenshot: "Expense form below the dashboard charts"*

---

## What Happens Next

After adding expenses or reviewing your data, you can:

- **Switch to the Expenses tab** to see a full list of your expenses with search and filter options
- **Edit or delete expenses** from the Expenses tab — changes will be reflected in the Dashboard immediately
- **Export to CSV** using the download button in the top-right corner of the navigation bar

---

## Common Issues

### Charts are not showing
**You see:** Only summary cards, no charts below them
**Fix:** Charts appear only when you have at least one expense. Add an expense using the form below the cards.

### "This Month" shows $0.00
**You see:** The "This Month" card displays $0.00 even though you have expenses
**Fix:** Check that your expenses have dates within the current calendar month. Expenses from previous months won't count toward this total.

### Data disappeared after clearing browser data
**You see:** All expenses and dashboard data are gone
**Fix:** The app stores all data in your browser's localStorage. Clearing browser data, cookies, or site data will remove your expenses. There is no way to recover lost data unless you previously exported a CSV.

---

## Need Help?

- Technical details: [Developer Documentation](../dev/dashboard-implementation.md)

---

*Last updated: 2026-03-15*
