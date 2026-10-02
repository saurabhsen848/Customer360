# Customer360 Web Dashboard

A responsive, static customer churn analytics dashboard built with HTML, CSS, JavaScript, and Chart.js. It reads the project’s cleaned customer CSV in the browser; there is no Python backend, server-side API, build step, or npm dependency.

## Included files

```text
web-dashboard/
├── index.html
├── style.css
├── script.js
├── README.md
└── data/
    └── customer_churn_cleaned.csv
```

The CSV is a deployment-local copy of `../data/processed/customer_churn_cleaned.csv`. Keeping it inside this folder makes `web-dashboard` independently deployable. To refresh the web version after replacing the project’s cleaned dataset, copy the updated CSV to `web-dashboard/data/customer_churn_cleaned.csv` as well.

## Dashboard features

- KPI cards for total customers, churned customers, churn rate, average monthly charges, and average tenure. The initial all-customer values are calculated from the CSV.
- Interactive churn-rate charts for contract, internet service, payment method, and tenure group.
- Customer counts by monthly-charge segment: Low (`< 35`), Medium (`35 to < 70`), and High (`>= 70`). These are billing bands, not customer lifetime value.
- Filters for contract, internet service, payment method, and churn status, plus a reset control. Filters update all KPIs and charts together.
- Responsive desktop and mobile layouts.

## Run locally

Because browsers restrict `fetch()` from pages opened as `file://`, serve the folder over local HTTP. Python is only used here as a static file server; the dashboard itself has no Python backend.

From the `web-dashboard` directory, run:

```bash
python -m http.server 8000
```

Then visit <http://localhost:8000>. Chart.js and the web fonts load from CDNs, so an internet connection is needed for those assets.

## Deploy to Vercel

### Vercel CLI

Install the Vercel CLI if needed, then from the project root deploy the standalone folder:

```bash
npm install --global vercel
vercel --prod web-dashboard
```

Follow the CLI prompts. Set the project root to `web-dashboard` if prompted. The folder is plain static HTML and does not need a build command or output directory setting.

### Vercel website

1. Push the repository to GitHub when you are ready.
2. In Vercel, import that repository.
3. Set **Root Directory** to `web-dashboard`.
4. Leave the framework preset as **Other**. Do not set a build command; the output is the static folder itself.
5. Deploy. Confirm the deployed page can load `data/customer_churn_cleaned.csv`.

## Data notes

The dashboard uses the cleaned project dataset and calculates the KPIs and chart values from its rows. The 11 missing `TotalCharges` values are not used by these visuals; their project data-quality decision is documented in the repository’s main README and data dictionary. The source dataset attribution and license are documented at the project root.
