-- Customer360 SQL Business Analysis
-- Engine: SQLite 3.x
-- Expected table: customers
-- Load data/processed/customer_churn_cleaned.csv into SQLite with its header row as column names.
-- Percentages use 100.0 and NULLIF to avoid integer division and divide-by-zero errors.

-- 1. How many customer records are in the analysis dataset?
SELECT COUNT(*) AS total_customers
FROM customers;

-- 2. How many customers churned?
SELECT SUM(CASE WHEN Churn = 'Yes' THEN 1 ELSE 0 END) AS churned_customers
FROM customers;

-- 3. What is the overall churn rate (%)?
SELECT
    ROUND(
        100.0 * SUM(CASE WHEN Churn = 'Yes' THEN 1 ELSE 0 END)
        / NULLIF(COUNT(*), 0),
        2
    ) AS overall_churn_rate_pct
FROM customers;

-- 4. What is the average monthly charge across customers?
SELECT ROUND(AVG(MonthlyCharges), 2) AS average_monthly_charges
FROM customers;

-- 5. What is the average customer tenure in months?
SELECT ROUND(AVG(tenure), 2) AS average_tenure_months
FROM customers;

-- 6. Which contract types have the highest churn rate?
SELECT
    Contract,
    COUNT(*) AS customers,
    SUM(CASE WHEN Churn = 'Yes' THEN 1 ELSE 0 END) AS churned_customers,
    ROUND(
        100.0 * SUM(CASE WHEN Churn = 'Yes' THEN 1 ELSE 0 END)
        / NULLIF(COUNT(*), 0),
        2
    ) AS churn_rate_pct
FROM customers
GROUP BY Contract
ORDER BY churn_rate_pct DESC;

-- 7. How does churn vary by payment method?
SELECT
    PaymentMethod,
    COUNT(*) AS customers,
    SUM(CASE WHEN Churn = 'Yes' THEN 1 ELSE 0 END) AS churned_customers,
    ROUND(
        100.0 * SUM(CASE WHEN Churn = 'Yes' THEN 1 ELSE 0 END)
        / NULLIF(COUNT(*), 0),
        2
    ) AS churn_rate_pct
FROM customers
GROUP BY PaymentMethod
ORDER BY churn_rate_pct DESC;

-- 8. How does churn vary by internet service?
SELECT
    InternetService,
    COUNT(*) AS customers,
    SUM(CASE WHEN Churn = 'Yes' THEN 1 ELSE 0 END) AS churned_customers,
    ROUND(
        100.0 * SUM(CASE WHEN Churn = 'Yes' THEN 1 ELSE 0 END)
        / NULLIF(COUNT(*), 0),
        2
    ) AS churn_rate_pct
FROM customers
GROUP BY InternetService
ORDER BY churn_rate_pct DESC;

-- 9. Which tenure bands have the highest churn rate?
-- Derived tenure bands: 0-12, 13-24, 25-48, and 49+ months.
WITH tenure_segments AS (
    SELECT
        CASE
            WHEN tenure <= 12 THEN '0-12 months'
            WHEN tenure <= 24 THEN '13-24 months'
            WHEN tenure <= 48 THEN '25-48 months'
            ELSE '49+ months'
        END AS tenure_group,
        Churn
    FROM customers
)
SELECT
    tenure_group,
    COUNT(*) AS customers,
    SUM(CASE WHEN Churn = 'Yes' THEN 1 ELSE 0 END) AS churned_customers,
    ROUND(
        100.0 * SUM(CASE WHEN Churn = 'Yes' THEN 1 ELSE 0 END)
        / NULLIF(COUNT(*), 0),
        2
    ) AS churn_rate_pct
FROM tenure_segments
GROUP BY tenure_group
ORDER BY CASE tenure_group
    WHEN '0-12 months' THEN 1
    WHEN '13-24 months' THEN 2
    WHEN '25-48 months' THEN 3
    ELSE 4
END;

-- 10. How does churn differ by senior-citizen status?
SELECT
    CASE SeniorCitizen
        WHEN 1 THEN 'Senior citizen'
        ELSE 'Non-senior'
    END AS senior_citizen_status,
    COUNT(*) AS customers,
    SUM(CASE WHEN Churn = 'Yes' THEN 1 ELSE 0 END) AS churned_customers,
    ROUND(
        100.0 * SUM(CASE WHEN Churn = 'Yes' THEN 1 ELSE 0 END)
        / NULLIF(COUNT(*), 0),
        2
    ) AS churn_rate_pct
FROM customers
GROUP BY SeniorCitizen
ORDER BY SeniorCitizen;

-- 11. What is the average monthly charge for churned versus retained customers?
SELECT
    Churn,
    COUNT(*) AS customers,
    ROUND(AVG(MonthlyCharges), 2) AS average_monthly_charges
FROM customers
GROUP BY Churn
ORDER BY Churn;

-- 12. How many customers are on each contract type?
SELECT
    Contract,
    COUNT(*) AS customers,
    ROUND(100.0 * COUNT(*) / NULLIF((SELECT COUNT(*) FROM customers), 0), 2)
        AS customer_share_pct
FROM customers
GROUP BY Contract
ORDER BY customers DESC;

-- 13. How much monthly recurring charge contribution comes from each contract type?
-- Revenue proxy: sum of MonthlyCharges (monthly recurring charges), not recognized accounting revenue.
SELECT
    Contract,
    COUNT(*) AS customers,
    ROUND(SUM(MonthlyCharges), 2) AS monthly_charge_contribution,
    ROUND(
        100.0 * SUM(MonthlyCharges)
        / NULLIF((SELECT SUM(MonthlyCharges) FROM customers), 0),
        2
    ) AS monthly_charge_contribution_pct
FROM customers
GROUP BY Contract
ORDER BY monthly_charge_contribution DESC;

-- 14. Which contract and internet-service groups have the highest average monthly charges?
-- Derived group: Contract x InternetService. Groups with fewer than 25 customers are excluded
-- to reduce the chance that very small groups dominate the ranking.
SELECT
    Contract,
    InternetService,
    COUNT(*) AS customers,
    ROUND(AVG(MonthlyCharges), 2) AS average_monthly_charges,
    ROUND(SUM(MonthlyCharges), 2) AS total_monthly_charges
FROM customers
GROUP BY Contract, InternetService
HAVING COUNT(*) >= 25
ORDER BY average_monthly_charges DESC, customers DESC
LIMIT 10;

-- 15. How do low-, medium-, and high-value customer segments compare?
-- Value proxy uses MonthlyCharges: Low < 35; Medium >= 35 and < 70; High >= 70.
-- These fixed billing bands are transparent starting thresholds, not a lifetime-value measure.
WITH customer_segments AS (
    SELECT
        CASE
            WHEN MonthlyCharges < 35 THEN 'Low value'
            WHEN MonthlyCharges < 70 THEN 'Medium value'
            ELSE 'High value'
        END AS value_segment,
        MonthlyCharges,
        Churn
    FROM customers
)
SELECT
    value_segment,
    COUNT(*) AS customers,
    ROUND(AVG(MonthlyCharges), 2) AS average_monthly_charges,
    SUM(CASE WHEN Churn = 'Yes' THEN 1 ELSE 0 END) AS churned_customers,
    ROUND(
        100.0 * SUM(CASE WHEN Churn = 'Yes' THEN 1 ELSE 0 END)
        / NULLIF(COUNT(*), 0),
        2
    ) AS churn_rate_pct
FROM customer_segments
GROUP BY value_segment
ORDER BY CASE value_segment
    WHEN 'Low value' THEN 1
    WHEN 'Medium value' THEN 2
    ELSE 3
END;
