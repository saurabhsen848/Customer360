"use strict";

const DATA_URL = "data/customer_churn_cleaned.csv";
const CHART_COLORS = { blue: "#7188ef", teal: "#31b5aa", coral: "#ee817b", purple: "#997de1", navy: "#263b5b" };
const TENURE_ORDER = ["0–12 months", "13–24 months", "25–48 months", "49+ months"];
const SEGMENT_ORDER = ["Low", "Medium", "High"];
let allCustomers = [];
let charts = {};

function parseCSV(text) {
  const rows = [];
  let row = [], field = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") { row.push(field); field = ""; }
    else if (char === "\n") { row.push(field.replace(/\r$/, "")); rows.push(row); row = []; field = ""; }
    else field += char;
  }
  if (field.length || row.length) { row.push(field.replace(/\r$/, "")); rows.push(row); }
  if (!rows.length) return [];
  const headers = rows.shift().map(value => value.trim());
  return rows.filter(values => values.some(value => value.trim() !== "")).map(values => {
    const record = {};
    headers.forEach((key, i) => { record[key] = (values[i] ?? "").trim(); });
    record.tenure = Number(record.tenure);
    record.MonthlyCharges = Number(record.MonthlyCharges);
    record.TotalCharges = record.TotalCharges === "" ? null : Number(record.TotalCharges);
    return record;
  });
}

function setOptions(id, values) {
  const select = document.getElementById(id);
  values.forEach(value => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.append(option);
  });
  select.addEventListener("change", updateDashboard);
}

function getFilteredCustomers() {
  const contract = document.getElementById("contractFilter").value;
  const internet = document.getElementById("internetFilter").value;
  const payment = document.getElementById("paymentFilter").value;
  const churn = document.getElementById("churnFilter").value;
  return allCustomers.filter(customer =>
    (!contract || customer.Contract === contract) &&
    (!internet || customer.InternetService === internet) &&
    (!payment || customer.PaymentMethod === payment) &&
    (!churn || customer.Churn === churn)
  );
}

function groupChurnRate(rows, key, order) {
  const groups = new Map();
  rows.forEach(customer => {
    const label = key(customer);
    if (!groups.has(label)) groups.set(label, { count: 0, churned: 0 });
    const group = groups.get(label);
    group.count++;
    if (customer.Churn === "Yes") group.churned++;
  });
  const labels = order ? order.filter(label => groups.has(label)) : [...groups.keys()];
  return { labels, values: labels.map(label => groups.get(label).count ? groups.get(label).churned / groups.get(label).count * 100 : 0), counts: labels.map(label => groups.get(label).count) };
}

function tenureGroup(months) {
  if (months <= 12) return TENURE_ORDER[0];
  if (months <= 24) return TENURE_ORDER[1];
  if (months <= 48) return TENURE_ORDER[2];
  return TENURE_ORDER[3];
}

function segment(monthlyCharges) {
  if (monthlyCharges < 35) return "Low";
  if (monthlyCharges < 70) return "Medium";
  return "High";
}

function chartOptions(percent = false) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 350 },
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: "#172640", padding: 10, titleFont: { family: "DM Sans", size: 11 }, bodyFont: { family: "DM Sans", size: 11 }, callbacks: percent ? { label: context => ` Churn rate: ${context.parsed.y.toFixed(1)}%` } : { label: context => ` Customers: ${context.parsed.y.toLocaleString()}` } }
    },
    scales: {
      x: { grid: { display: false }, border: { display: false }, ticks: { color: "#8994a7", font: { family: "DM Sans", size: 9 }, maxRotation: 0, minRotation: 0 } },
      y: { beginAtZero: true, max: percent ? 100 : undefined, grid: { color: "#eef1f5", drawTicks: false }, border: { display: false }, ticks: { color: "#9ba5b3", font: { family: "DM Sans", size: 9 }, padding: 8, callback: value => percent ? `${value}%` : Number(value).toLocaleString(), maxTicksLimit: 5 } }
    }
  };
}

function renderChart(canvasId, type, labels, values, color, percent = false) {
  const canvas = document.getElementById(canvasId);
  if (charts[canvasId]) charts[canvasId].destroy();
  charts[canvasId] = new Chart(canvas, {
    type,
    data: { labels, datasets: [{ data: values, backgroundColor: color, borderRadius: type === "bar" ? 5 : 4, borderSkipped: false, maxBarThickness: type === "bar" ? 28 : 44, hoverBackgroundColor: color }] },
    options: chartOptions(percent)
  });
}

function updateDashboard() {
  const rows = getFilteredCustomers();
  const total = rows.length;
  const churned = rows.filter(customer => customer.Churn === "Yes").length;
  const avg = (field) => total ? rows.reduce((sum, customer) => sum + customer[field], 0) / total : 0;
  document.getElementById("totalCustomers").textContent = total.toLocaleString();
  document.getElementById("churnedCustomers").textContent = churned.toLocaleString();
  document.getElementById("churnRate").textContent = `${total ? (100 * churned / total).toFixed(1) : "0.0"}%`;
  document.getElementById("avgCharges").textContent = `$${avg("MonthlyCharges").toFixed(2)}`;
  document.getElementById("avgTenure").textContent = `${avg("tenure").toFixed(2)} mo`;
  const current = ["contractFilter", "internetFilter", "paymentFilter", "churnFilter"].some(id => document.getElementById(id).value);
  document.getElementById("selectionCount").textContent = current ? `${total.toLocaleString()} customers` : "All customers";

  let grouped = groupChurnRate(rows, customer => customer.Contract, ["Month-to-month", "One year", "Two year"]);
  renderChart("contractChart", "bar", grouped.labels, grouped.values, CHART_COLORS.blue, true);
  grouped = groupChurnRate(rows, customer => customer.InternetService, ["DSL", "Fiber optic", "No"]);
  renderChart("internetChart", "bar", grouped.labels, grouped.values, CHART_COLORS.teal, true);
  grouped = groupChurnRate(rows, customer => customer.PaymentMethod, ["Electronic check", "Mailed check", "Bank transfer (automatic)", "Credit card (automatic)"]);
  renderChart("paymentChart", "bar", grouped.labels, grouped.values, CHART_COLORS.coral, true);
  grouped = groupChurnRate(rows, customer => tenureGroup(customer.tenure), TENURE_ORDER);
  renderChart("tenureChart", "bar", grouped.labels, grouped.values, CHART_COLORS.purple, true);
  const segmentCounts = new Map(SEGMENT_ORDER.map(label => [label, 0]));
  rows.forEach(customer => segmentCounts.set(segment(customer.MonthlyCharges), segmentCounts.get(segment(customer.MonthlyCharges)) + 1));
  renderChart("segmentChart", "bar", SEGMENT_ORDER, SEGMENT_ORDER.map(label => segmentCounts.get(label)), ["#5fc6bc", "#7589ef", "#e79078"]);
}

async function startDashboard() {
  const error = document.getElementById("errorMessage");
  try {
    if (typeof Chart === "undefined") throw new Error("The chart library could not load. Check your internet connection and reload.");
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error(`The cleaned dataset could not be loaded (${response.status}).`);
    const csv = await response.text();
    allCustomers = parseCSV(csv);
    if (!allCustomers.length || !allCustomers[0].customerID) throw new Error("The CSV file is empty or does not match the expected customer dataset.");
    setOptions("contractFilter", [...new Set(allCustomers.map(row => row.Contract))].sort());
    setOptions("internetFilter", [...new Set(allCustomers.map(row => row.InternetService))].sort());
    setOptions("paymentFilter", [...new Set(allCustomers.map(row => row.PaymentMethod))].sort());
    setOptions("churnFilter", [...new Set(allCustomers.map(row => row.Churn))].sort());
    document.getElementById("resetFilters").addEventListener("click", () => {
      ["contractFilter", "internetFilter", "paymentFilter", "churnFilter"].forEach(id => { document.getElementById(id).value = ""; });
      updateDashboard();
    });
    updateDashboard();
  } catch (problem) {
    error.hidden = false;
    error.textContent = `${problem.message} Ensure the data/customer_churn_cleaned.csv file is included and open the dashboard through a local web server.`;
    console.error(problem);
  }
}

document.addEventListener("DOMContentLoaded", startDashboard);
