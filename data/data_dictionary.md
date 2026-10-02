# Data dictionary — IBM Telco Customer Churn

The raw CSV contains one row per customer. Descriptions below follow the published dataset fields; values and types should be confirmed as part of a later inspection step.

| Column | Description |
|---|---|
| `customerID` | Unique customer identifier. |
| `gender` | Customer gender (`Female` or `Male`). |
| `SeniorCitizen` | Whether the customer is a senior citizen (`0` = no, `1` = yes). |
| `Partner` | Whether the customer has a partner (`Yes` or `No`). |
| `Dependents` | Whether the customer has dependents (`Yes` or `No`). |
| `tenure` | Number of months the customer has been with the company. |
| `PhoneService` | Whether the customer subscribes to phone service. |
| `MultipleLines` | Whether the customer has multiple phone lines; may indicate no phone service. |
| `InternetService` | Internet service type (`DSL`, `Fiber optic`, or `No`). |
| `OnlineSecurity` | Whether online security is included; may indicate no internet service. |
| `OnlineBackup` | Whether online backup is included; may indicate no internet service. |
| `DeviceProtection` | Whether device protection is included; may indicate no internet service. |
| `TechSupport` | Whether tech support is included; may indicate no internet service. |
| `StreamingTV` | Whether the customer subscribes to streaming TV; may indicate no internet service. |
| `StreamingMovies` | Whether the customer subscribes to streaming movies; may indicate no internet service. |
| `Contract` | Customer contract term (`Month-to-month`, `One year`, or `Two year`). |
| `PaperlessBilling` | Whether the customer uses paperless billing. |
| `PaymentMethod` | Customer payment method. |
| `MonthlyCharges` | Customer's current monthly charges. |
| `TotalCharges` | Total charges recorded for the customer; 11 raw values are blank. |
| `Churn` | Whether the customer left within the last month (`Yes` or `No`); primary churn target. |

## Source and license

Source distribution: [scikit-learn/churn-prediction on Hugging Face](https://huggingface.co/datasets/scikit-learn/churn-prediction). The dataset card attributes the data to IBM Sample Datasets and credits Kaggle and the IBM Samples team for the dataset/card. The Hugging Face dataset page lists the dataset license as **Creative Commons Attribution 4.0 International (CC BY 4.0)**. Retain this attribution when reusing or sharing the dataset.


## `TotalCharges` missing-value review

The 11 blank source values all belong to customers with zero tenure; no positive-tenure customer has a missing total. In the source CSV, these entries are whitespace-only. The records also have non-missing monthly charges and `Churn = No`. This pattern is consistent with new customers for whom cumulative charges have not yet been recorded, although the source does not explicitly confirm that business rule.

In the cleaned CSV, `TotalCharges` is numeric and these values remain missing. They are not imputed or replaced with zero, and the customer rows are retained. Cumulative-charge summaries use available values and should disclose the 11 missing totals.
