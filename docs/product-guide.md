# Using Penny
Record income and expenses in your account currency. Amounts entered in the UI are major units; the API stores integer minor units. Category suggestions use previous matching descriptions or simple merchant keywords and require your review.

Set category budgets per calendar month. Recurring plans project scheduled payments without writing transactions. Insights use recorded history and may omit payments you have not entered. Full-month comparisons can be misleading early in a month; forecasts disclose their sample gates and assumptions.

CSV import requires `date,description,amount,kind,category,note`, up to 500 rows and 250 KB. Dates use YYYY-MM-DD, amounts have at most two decimal places, and type is income or expense. Preview before confirming. The same import key safely retries an interrupted batch. A newly uploaded duplicate file is a separate batch.

Press N outside a form to add a transaction and G to return to Overview. Settings is available from the profile button on desktop and through the workspace menu on mobile. Account sessions can be revoked in Settings. Password changes revoke all sessions.

The demo uses generated sample records entirely in browser memory and resets on refresh. Importing private data requires a real account. Original legacy code is retained for migration reference and is outside the active build.
