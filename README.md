# Customer360 — Customer Behavior & Churn Analytics

An end-to-end BCA portfolio project exploring customer behavior and churn in the IBM Telco Customer Churn sample. The repository contains a Python EDA notebook, a cleaned analysis dataset, SQLite business queries, and a Power BI Project (PBIP) with report pages and semantic-model definitions.

> **Portfolio status:** Analysis artifacts and report-page definitions are present. The Power BI model currently references the cleaned CSV using an absolute path on the original authoring computer, so update the data source in Power BI Desktop after cloning. The report has three saved pages, but its screenshots are not included in this repository.

## Business problem

Customer churn reduces recurring revenue and makes retention planning harder. This project examines how churn varies across customer, service, contract, tenure, and billing groups so a business stakeholder can identify patterns worth investigating. These are descriptive associations; they do not establish why an individual customer churns or predict future churn.

## Objectives

- Inspect and prepare the supplied customer data without altering the raw source.
- Explore churn, tenure, services, contracts, and charges with Python.
- Provide reusable SQL summaries for common business questions.
- Present customer segments and churn patterns in a Power BI report.
- Document data-quality decisions and reproducible project steps.

## Dataset

The source is the IBM Telco Customer Churn sample, distributed as [`data/raw/dataset.csv`](data/raw/dataset.csv) from [scikit-learn/churn-prediction on Hugging Face](https://huggingface.co/datasets/scikit-learn/churn-prediction). It contains 7,043 customer records and 21 fields, including demographics, tenure, subscribed services, contract/payment details, monthly and cumulative charges, and the `Churn` outcome. Refer to [`data/data_dictionary.md`](data/data_dictionary.md) for the field descriptions.

The dataset card attributes the sample to IBM Sample Datasets and credits Kaggle and the IBM Samples team. The Hugging Face distribution lists the license as **Creative Commons Attribution 4.0 International (CC BY 4.0)**. Preserve attribution to IBM Sample Datasets and the distribution source when reusing or sharing the data.

## Tools and technologies

- Python, Jupyter Notebook, Pandas, NumPy, Matplotlib, and Seaborn
- SQLite 3.x for business queries
- Power BI Desktop and the Power BI Project format (PBIP/PBIR/TMDL)
- Git and GitHub for version control and portfolio sharing

Python dependencies are listed in [`requirements.txt`](requirements.txt).

## Data cleaning and preprocessing

[`notebooks/01_customer360_eda.ipynb`](notebooks/01_customer360_eda.ipynb) reads the raw CSV and works on a copy. The main preparation step trims and converts `TotalCharges` to numeric, leaving blank or invalid values missing. It retains all rows and does not overwrite the raw file. The notebook also checks duplicate rows and categorical values, then writes [`data/processed/customer_churn_cleaned.csv`](data/processed/customer_churn_cleaned.csv).

### Decision for the 11 missing `TotalCharges` values

The notebook reports that all 11 source blanks are whitespace-only values associated with zero-tenure customers; all 11 have `Churn = No`, and none of the positive-tenure rows has a missing total. The project retains those customer records and keeps their cleaned `TotalCharges` values null. It does not impute zero or another estimate because the source does not confirm the billing rule. Summaries of cumulative charges use available values and exclude the 11 nulls from that field’s calculation. This is a documented data-quality decision, not a claim about the source system’s intent.

## Exploratory data analysis

The notebook examines schema and descriptive statistics, missing values and duplicates, expected category values, churn distribution, churn rates by demographic/account groups, tenure by churn status, charge distributions, and tenure distribution. It includes calculated KPI outputs and saves the cleaned copy. It does not train a machine-learning model.

### Verified findings recorded in the notebook

- 7,043 customer records; 1,869 churned customers (26.54%).
- Average monthly charges: 64.76; average tenure: 32.37 months.
- Churn rates by contract in the notebook output: month-to-month 42.71%, one-year 11.27%, and two-year 2.83%.
- The notebook records 11 missing `TotalCharges` after numeric conversion and zero exact duplicate rows.

These figures describe this sample and are not causal conclusions. The average total-charge figure in the notebook is computed over non-missing values only.

## SQL business analysis

[`sql/customer360_analysis.sql`](sql/customer360_analysis.sql) contains 15 SQLite queries covering overall counts and churn rate, average charges and tenure, churn by contract/payment/internet/tenure/senior-citizen status, charge comparisons by churn, contract mix and monthly-charge contribution, contract/internet groups, and monthly-charge-based value segments. Definitions and loading guidance are in [`sql/README.md`](sql/README.md).

The script expects the processed CSV to be loaded into a SQLite table named `customers`. It uses current `MonthlyCharges` as a recurring-charge proxy where appropriate; this is not recognized accounting revenue. The Low/Medium/High bands (`< 35`, `35–< 70`, `>= 70`) are explicit monthly-charge bands, not customer lifetime value.

## Power BI dashboard

The PBIP project is at [`dashboard/Customer360/Customer360.pbip`](dashboard/Customer360/Customer360.pbip). Its saved report definition contains these pages:

- Executive Overview
- Customer Segmentation
- Churn Analysis

The PBIP source includes report visuals, a semantic-model table and measures, DAX reference files, a theme, and a design note. The model’s Power Query source currently contains an absolute path to `data/processed/customer_churn_cleaned.csv` on the original Windows machine. After cloning, open the PBIP in Power BI Desktop and repoint that source to the cleaned CSV in your local clone before refreshing. Power BI Desktop was not available for an interactive refresh/visual verification during this audit.

### Dashboard screenshots

The following requested exports were not present at audit time, so no images are embedded here:

- `images/executive-overview.png`
- `images/customer-segmentation.png`
- `images/churn-analysis.png`

After exporting genuine page screenshots from Power BI Desktop, place them under `images/` and add Markdown image references here.

## Project structure

```text
Customer360/
├── data/
│   ├── raw/dataset.csv
│   ├── processed/customer_churn_cleaned.csv
│   └── data_dictionary.md
├── notebooks/01_customer360_eda.ipynb
├── sql/
│   ├── customer360_analysis.sql
│   └── README.md
├── dashboard/Customer360/
│   ├── Customer360.pbip
│   ├── Customer360.Report/
│   ├── Customer360.SemanticModel/
│   ├── model/
│   ├── theme/
│   ├── README.md
│   └── report-design.md
├── images/
├── requirements.txt
├── .gitignore
└── README.md
```

## How to run/use the project

### Python notebook

From the project root, install the listed packages and launch Jupyter:

```bash
python -m pip install -r requirements.txt
python -m jupyter notebook notebooks/01_customer360_eda.ipynb
```

Run the notebook cells in order. It reads `data/raw/dataset.csv` and writes the cleaned copy to `data/processed/`; the source file is read-only in this workflow.

### SQL

Load `data/processed/customer_churn_cleaned.csv` into SQLite as a table named `customers`, then run `sql/customer360_analysis.sql` in a SQLite client. See [`sql/README.md`](sql/README.md) for a Python loading example.

### Power BI

Open `dashboard/Customer360/Customer360.pbip` in Power BI Desktop. If the source path cannot be found, edit the query source to point to this clone’s `data/processed/customer_churn_cleaned.csv`, refresh, and save the project.

## Future improvements

- Replace the machine-specific Power BI source path with a portable parameter or documented setup.
- Refresh and inspect the PBIP in Power BI Desktop on a clean clone; verify visuals and measure behavior end to end.
- Export genuine screenshots of each report page and add them to `images/`.
- Add reproducible automated checks for data assumptions and SQL outputs.
- Review segment thresholds with business context and clearly distinguish descriptive analysis from prediction or causal claims.

## Attribution

Dataset: IBM Sample Datasets, distributed via [scikit-learn/churn-prediction on Hugging Face](https://huggingface.co/datasets/scikit-learn/churn-prediction), listed under **CC BY 4.0**. The dataset card credits Kaggle and the IBM Samples team. Retain the source attribution and license notice when redistributing the dataset. See [`data/data_dictionary.md`](data/data_dictionary.md) for the project’s recorded source and license details.
