# Customer360 Power BI Project

This folder contains the implementation plan and source-controlled reference assets for the Customer360 report. The processed CSV is the only intended data source:

`../../data/processed/customer_churn_cleaned.csv`

It has 7,043 rows and these source columns (preserved as-is):

`customerID`, `gender`, `SeniorCitizen`, `Partner`, `Dependents`, `tenure`, `PhoneService`, `MultipleLines`, `InternetService`, `OnlineSecurity`, `OnlineBackup`, `DeviceProtection`, `TechSupport`, `StreamingTV`, `StreamingMovies`, `Contract`, `PaperlessBilling`, `PaymentMethod`, `MonthlyCharges`, `TotalCharges`, `Churn`.

The processed file contains 11 blank `TotalCharges` values. Keep them blank; the average-total-charges measure uses available values, as Power BI's `AVERAGE` does. The raw CSV is not a report source and must remain unchanged.

## Current PBIP state and DAX handoff

The native `Customer360.pbip`, report folder, and semantic-model folder are present. However, the saved semantic model at `Customer360.SemanticModel/definition/model.tmdl` currently contains model metadata only; it has no `table` declarations, columns, or source partition. The on-disk PBIP therefore does not yet persist the loaded CSV table, even though the CSV columns and prior setup identify the intended table name as `customers`.

The 14 measures in `model/Customer360-measures.dax` use the intended `customers` table and verified source columns. They are ready to add, but cannot be attached safely to this saved model until Desktop saves the table definition.

In Power BI Desktop:

1. Open `Customer360.pbip` and check the Fields/Data pane for `customers`.
2. If it is absent, use **Home > Get data > Text/CSV** to load `../../data/processed/customer_churn_cleaned.csv` (select the file from the repository's `data/processed` folder). In Power Query, name the query `customers`, select **Close & Apply**, and save the PBIP.
3. Confirm `customers` appears in the model/Fields pane. Then right-click the table, choose **New measure**, and add the 14 definitions from `model/Customer360-measures.dax` one at a time. Save the PBIP again.

The measures are written with standard comma-separated DAX syntax for the model culture `en-US`. Their expressions have been checked against the persisted source-column names from the CSV and the SQL segment thresholds. Power BI Desktop is required to compile them in this project because the saved TMDL currently has no target table.

## Reference assets

- `model/Customer360-measures.dax` — the 14 requested measures to add to the `customers` table in Desktop.
- `model/Customer360-customer-value-segment.dax` — calculated columns for repeatable value bands and their display order.
- `report-design.md` — page, visual, field, and interaction specification.
- `theme/customer360-theme.json` — restrained report palette; import it through **View > Themes > Browse for themes**.

Value segments use the same explicit billing thresholds as the SQL analysis: Low `< 35`, Medium `>= 35 and < 70`, and High `>= 70` in `MonthlyCharges`. These are billing-value bands, not customer lifetime value. Churn rates are the share of customers with `Churn = "Yes"` in the current filter context. Churned and retained monthly charges are sums of current `MonthlyCharges` (recurring-charge totals), not averages or recognized accounting revenue.

PBIP, PBIR, and TMDL details follow Microsoft's [Power BI Project overview](https://learn.microsoft.com/en-us/power-bi/developer/projects/projects-overview), [report format reference](https://learn.microsoft.com/en-us/power-bi/developer/projects/projects-report), and [semantic model format reference](https://learn.microsoft.com/en-us/power-bi/developer/projects/projects-dataset).
