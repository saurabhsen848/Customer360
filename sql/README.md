# Customer360 SQL Business Analysis

## SQL engine

The queries in `customer360_analysis.sql` target **SQLite 3.x**. They use standard SQLite-supported `SELECT`, `CASE`, aggregate, common table expression (`WITH`), `NULLIF`, and `ROUND` syntax. Percentages multiply by `100.0` before division and use `NULLIF(denominator, 0)`, so results do not depend on integer-division behavior and a zero denominator returns `NULL` rather than raising a division error.

## Source table

The analysis expects the cleaned CSV at `data/processed/customer_churn_cleaned.csv` to be loaded into a SQLite table named `customers`, retaining source column names and the header row as column names. For example, Python's built-in SQLite driver and Pandas can create the table:

```python
import sqlite3
import pandas as pd

customers = pd.read_csv("data/processed/customer_churn_cleaned.csv")
with sqlite3.connect("customer360.db") as connection:
    customers.to_sql("customers", connection, if_exists="replace", index=False)
```

Then run the SQL file with a SQLite client connected to `customer360.db` (for example, `.read sql/customer360_analysis.sql` in the SQLite shell). The SQL only reads from the table; it does not alter the CSV or the table.

## Derived fields and business definitions

- **Tenure group:** `tenure` months are grouped into 0–12, 13–24, 25–48, and 49+ month bands using `CASE`.
- **Senior-citizen label:** `SeniorCitizen` value `1` maps to `Senior citizen`; `0` maps to `Non-senior`.
- **Revenue contribution:** `SUM(MonthlyCharges)` is treated as monthly recurring charge contribution. It is a revenue proxy for comparing contract groups, not recognized accounting revenue. `TotalCharges` is not used for this comparison because it is cumulative and has 11 missing values.
- **Top customer groups:** groups are combinations of `Contract` and `InternetService`; groups below 25 customers are excluded before ranking by average monthly charges.
- **Customer value segment:** based on `MonthlyCharges` as a transparent billing-value proxy: Low `< 35`, Medium `>= 35 and < 70`, and High `>= 70`. These are analyst-defined starting bands, not customer lifetime value tiers, and can be revisited with business input.
- **Churn rate:** churned customers (`Churn = 'Yes'`) divided by all customers in the relevant group.

## Questions covered

The SQL file includes 15 commented queries: overall customer and churn KPIs, churn rates by contract/payment/internet/tenure/senior-citizen status, monthly charges by churn, customer count and monthly-charge contribution by contract, highest-charge customer groups, and low/medium/high billing-value segments.

The cleaned dataset retains the 11 missing `TotalCharges` values as missing. No query imputes them; query 13 uses current `MonthlyCharges` instead of cumulative `TotalCharges`.
