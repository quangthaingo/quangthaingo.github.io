import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const projectRoot = "C:/Users/thain/Documents/Codex/Dashboard/superset_ptm_project";
const actualPath = "C:/Users/thain/OneDrive/Desktop/Phân tích Doanh thu PTM.xlsx";
const planPath = "C:/Users/thain/Documents/Codex/Dashboard/202606 - VNPT KV - Kế hoạch_v2.xlsx";
const dataDir = path.join(projectRoot, "data");

const months = ["202601", "202602", "202603", "202604", "202605", "202606"];
const planMonthNames = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6"];

function normUnit(value) {
  return String(value || "").replaceAll("_", " ").trim();
}

function num(value) {
  return Number(value || 0);
}

function csvEscape(value) {
  if (value === null || value === undefined) return "";
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

async function writeCsv(fileName, rows) {
  const content = rows.map((row) => row.map(csvEscape).join(",")).join("\n") + "\n";
  await fs.writeFile(path.join(dataDir, fileName), content, "utf8");
}

function sum(rows, getter) {
  return rows.reduce((total, row) => total + getter(row), 0);
}

function ratio(numerator, denominator) {
  return denominator ? numerator / denominator : "";
}

await fs.mkdir(dataDir, { recursive: true });

const actualInput = await FileBlob.load(actualPath);
const actualWb = await SpreadsheetFile.importXlsx(actualInput);
const actualRowsRaw = actualWb.worksheets.getItemAt(0).getRange("A3:H91").values;
const actual = actualRowsRaw
  .slice(1)
  .filter((row) => row[0] && row[0] !== "Grand Total" && row[1])
  .filter((row) => String(row[0]).startsWith("VNPT_"))
  .map((row) => ({
    unit: normUnit(row[0]),
    month: String(row[1]),
    revenue_million: num(row[2]) / 1_000_000,
    tb_ptm: num(row[3]),
    ckn: num(row[4]),
    ckd_3t: num(row[5]),
    ckd_6t: num(row[6]),
    ckd_12t: num(row[7]),
    sl_ptm_package: num(row[4]) + num(row[5]) + num(row[6]) + num(row[7]),
  }));

const planInput = await FileBlob.load(planPath);
const planWb = await SpreadsheetFile.importXlsx(planInput);
const planValues = planWb.worksheets.getItemAt(0).getRange("A1:Q244").values;
const planHeader = planValues[0].map((v) => String(v || ""));
const planMonthCols = Object.fromEntries(planHeader.map((h, i) => [h, i]));
const plan = [];

for (const row of planValues.slice(1)) {
  const unit = normUnit(row[0]);
  const code = String(row[1] || "");
  const kpi = String(row[2] || "");
  if (!unit.startsWith("VNPT ") || !["B1", "B2", "B3"].includes(code)) continue;

  let targetType = "";
  if (code === "B1" && kpi.includes("Mục tiêu tỉnh")) targetType = "KH tỉnh - Doanh thu";
  if (code === "B1" && !kpi.includes("Mục tiêu tỉnh")) targetType = "KH TCT - Doanh thu";
  if (code === "B2") targetType = "KH tỉnh - TB PTM";
  if (code === "B3") targetType = "KH tỉnh - Tỷ lệ mua gói";

  for (const monthName of planMonthNames) {
    plan.push({
      unit,
      code,
      kpi,
      target_type: targetType,
      month: monthName.replace("Tháng ", "20260"),
      plan_value: num(row[planMonthCols[monthName]]),
    });
  }
}

const units = [...new Set(actual.map((row) => row.unit))].sort((a, b) => a.localeCompare(b));

function actualFor(unit, month) {
  return actual.filter((row) => row.unit === unit && (!month || row.month === month));
}

function planValue(unit, month, targetType) {
  return sum(
    plan.filter((row) => row.unit === unit && row.month === month && row.target_type === targetType),
    (row) => row.plan_value,
  );
}

function planValueRange(unit, targetType) {
  return sum(
    plan.filter((row) => row.unit === unit && months.includes(row.month) && row.target_type === targetType),
    (row) => row.plan_value,
  );
}

const monthly = months.map((month) => {
  const rows = actual.filter((row) => row.month === month);
  const revenue = sum(rows, (row) => row.revenue_million);
  const tb = sum(rows, (row) => row.tb_ptm);
  const pkg = sum(rows, (row) => row.sl_ptm_package);
  const tct = sum(units, (unit) => planValue(unit, month, "KH TCT - Doanh thu"));
  const province = sum(units, (unit) => planValue(unit, month, "KH tỉnh - Doanh thu"));
  const b2 = sum(units, (unit) => planValue(unit, month, "KH tỉnh - TB PTM"));
  const b3 = sum(units, (unit) => planValue(unit, month, "KH tỉnh - Tỷ lệ mua gói")) / units.length / 100;
  return {
    month,
    revenue_million: revenue,
    kh_tct_revenue_million: tct,
    pct_kh_tct: ratio(revenue, tct),
    kh_tinh_revenue_million: province,
    pct_kh_tinh: ratio(revenue, province),
    tb_ptm: tb,
    kh_b2_tb_ptm: b2,
    pct_b2: ratio(tb, b2),
    sl_ptm_package: pkg,
    package_rate: ratio(pkg, tb),
    kh_b3_package_rate: b3,
    delta_b3: ratio(pkg, tb) === "" ? "" : ratio(pkg, tb) - b3,
  };
});

function unitCompare(period) {
  const isYtd = period === "LK_1_6";
  return units.map((unit) => {
    const rows = isYtd ? actualFor(unit) : actualFor(unit, "202606");
    const selectedMonths = isYtd ? months : ["202606"];
    const revenue = sum(rows, (row) => row.revenue_million);
    const tb = sum(rows, (row) => row.tb_ptm);
    const pkg = sum(rows, (row) => row.sl_ptm_package);
    const tct = isYtd
      ? planValueRange(unit, "KH TCT - Doanh thu")
      : planValue(unit, "202606", "KH TCT - Doanh thu");
    const province = isYtd
      ? planValueRange(unit, "KH tỉnh - Doanh thu")
      : planValue(unit, "202606", "KH tỉnh - Doanh thu");
    const b2 = isYtd
      ? planValueRange(unit, "KH tỉnh - TB PTM")
      : planValue(unit, "202606", "KH tỉnh - TB PTM");
    const b3 = sum(
      plan.filter((row) => row.unit === unit && selectedMonths.includes(row.month) && row.target_type === "KH tỉnh - Tỷ lệ mua gói"),
      (row) => row.plan_value,
    ) / selectedMonths.length / 100;
    return {
      period,
      unit,
      revenue_million: revenue,
      kh_tct_revenue_million: tct,
      pct_kh_tct: ratio(revenue, tct),
      kh_tinh_revenue_million: province,
      pct_kh_tinh: ratio(revenue, province),
      tb_ptm: tb,
      kh_b2_tb_ptm: b2,
      pct_b2: ratio(tb, b2),
      sl_ptm_package: pkg,
      package_rate: ratio(pkg, tb),
      kh_b3_package_rate: b3,
      delta_b3: ratio(pkg, tb) === "" ? "" : ratio(pkg, tb) - b3,
    };
  });
}

const unitPeriod = [...unitCompare("T6_2026"), ...unitCompare("LK_1_6")];

await writeCsv("ptm_actual.csv", [
  ["unit", "month", "revenue_million", "tb_ptm", "ckn", "ckd_3t", "ckd_6t", "ckd_12t", "sl_ptm_package"],
  ...actual.map((row) => Object.values(row)),
]);
await writeCsv("ptm_plan.csv", [
  ["unit", "code", "kpi", "target_type", "month", "plan_value"],
  ...plan.map((row) => Object.values(row)),
]);
await writeCsv("ptm_monthly_summary.csv", [
  ["month", "revenue_million", "kh_tct_revenue_million", "pct_kh_tct", "kh_tinh_revenue_million", "pct_kh_tinh", "tb_ptm", "kh_b2_tb_ptm", "pct_b2", "sl_ptm_package", "package_rate", "kh_b3_package_rate", "delta_b3"],
  ...monthly.map((row) => Object.values(row)),
]);
await writeCsv("ptm_unit_period_summary.csv", [
  ["period", "unit", "revenue_million", "kh_tct_revenue_million", "pct_kh_tct", "kh_tinh_revenue_million", "pct_kh_tinh", "tb_ptm", "kh_b2_tb_ptm", "pct_b2", "sl_ptm_package", "package_rate", "kh_b3_package_rate", "delta_b3"],
  ...unitPeriod.map((row) => Object.values(row)),
]);

console.log(JSON.stringify({
  actual_rows: actual.length,
  plan_rows: plan.length,
  monthly_rows: monthly.length,
  unit_period_rows: unitPeriod.length,
  units,
}, null, 2));
