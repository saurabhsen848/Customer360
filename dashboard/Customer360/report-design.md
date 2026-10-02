# Customer360 report design

## Report conventions

- Canvas: 16:9 widescreen with a light neutral background, deep navy headings, teal primary data color, and orange for churn emphasis.
- Use a consistent title, restrained grid, readable labels, and minimal chart borders. Avoid 3D visuals and unnecessary decoration.
- Format `Churn Rate` as a percentage with one decimal place; format charge measures as currency with two decimals; format customer counts as whole numbers and tenure as months.
- Churn rate visuals should use the `Churn Rate` measure. Do not average a precomputed row-level percentage.
- Add unobtrusive page-level slicers for Contract, InternetService, PaymentMethod, and SeniorCitizen where relevant. Use actual source names in field bindings.
- Use `Customer Value Segment` sorted by `Customer Value Segment Sort`.

## Page 1 — Executive Overview

Top row: cards for **Total Customers**, **Churned Customers**, **Churn Rate**, **Average Monthly Charges**, and **Average Tenure**.

Analysis area:

1. Horizontal bar chart — axis `Contract`, value `Churn Rate`.
2. Horizontal bar chart — axis `InternetService`, value `Churn Rate`.
3. Horizontal bar chart — axis `PaymentMethod`, value `Churn Rate`.
4. Column chart — axis `tenure group`, value `Churn Rate`. Use a model column with bands 0–12, 13–24, 25–48, and 49+ months, sorted in that order, matching the SQL analysis.

## Page 2 — Customer Segmentation

1. Cards for **Low Value Customers**, **Medium Value Customers**, and **High Value Customers**.
2. Column chart — axis `Customer Value Segment`, value `Customer Count`.
3. Column chart — axis `Customer Value Segment`, value `Churn Rate`.
4. Column chart — axis `Customer Value Segment`, value `Average Monthly Charges`.
5. Column chart — axis `Customer Value Segment`, value `Average Tenure`.

Keep segment boundaries visible in a subtitle or tooltip: Low `< 35`, Medium `35–<70`, High `>=70` monthly charges.

## Page 3 — Churn Analysis

1. Bar chart — axis `Contract`, value `Churn Rate`.
2. Line chart — axis `tenure`, value `Churn Rate`, with tenure in months and a continuous month-by-month view.
3. Bar chart — axis `PaymentMethod`, value `Churn Rate`.
4. Bar chart — axis `InternetService`, value `Churn Rate`.
5. Bar chart — axis `Senior Citizen Status` (derived from `SeniorCitizen`), value `Churn Rate`.
6. Column chart — axis `Churn`, value `Average Monthly Charges`; show **No** and **Yes** as explicit categories.

## Model columns needed for presentation

- `Customer Value Segment`, `Customer Value Segment Sort`, `Tenure Group`, `Tenure Group Sort`, and `Senior Citizen Status` are defined in `model/Customer360-customer-value-segment.dax`.
- In Desktop, set `Customer Value Segment` to **Sort by column** `Customer Value Segment Sort`, and `Tenure Group` to **Sort by column** `Tenure Group Sort`.

The source has 11 missing `TotalCharges` values. Display **Average Total Charges** only when needed (for example, a tooltip), with a note that blank totals are excluded.
