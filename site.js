const fmt = (value, digits = 1) =>
  Number(value || 0).toLocaleString("vi-VN", { maximumFractionDigits: digits });
const pct = (value) =>
  value === "" || value === null || Number.isNaN(Number(value))
    ? ""
    : `${(Number(value) * 100).toLocaleString("vi-VN", { maximumFractionDigits: 1 })}%`;

const cls = (ratio) => {
  const value = Number(ratio);
  if (!Number.isFinite(value)) return "";
  if (value >= 1) return "good";
  if (value >= 0.8) return "warn";
  return "bad";
};

async function loadCsv(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Cannot load ${path}`);
  const text = await response.text();
  const rows = parseCsv(text.trim());
  const [header, ...data] = rows;
  return data.map((row) =>
    Object.fromEntries(header.map((key, index) => [key, coerce(row[index])])),
  );
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"' && quoted && next === '"') {
      cell += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  row.push(cell);
  rows.push(row);
  return rows;
}

function coerce(value) {
  if (value === undefined || value === "") return "";
  const number = Number(value);
  return Number.isFinite(number) && String(value).trim() !== "" ? number : value;
}

const state = { monthly: [], units: [] };

async function init() {
  const [monthly, units] = await Promise.all([
    loadCsv("data/ptm_monthly_summary.csv"),
    loadCsv("data/ptm_unit_period_summary.csv"),
  ]);
  state.monthly = monthly;
  state.units = units;

  const unitSelect = document.getElementById("unitSelect");
  [...new Set(units.map((row) => row.unit))].sort().forEach((unit) => {
    const option = document.createElement("option");
    option.value = unit;
    option.textContent = unit;
    unitSelect.appendChild(option);
  });

  document.getElementById("periodSelect").addEventListener("change", render);
  unitSelect.addEventListener("change", render);
  render();
}

function selectedRows() {
  const period = document.getElementById("periodSelect").value;
  const unit = document.getElementById("unitSelect").value;
  return state.units.filter((row) => row.period === period && (unit === "__ALL__" || row.unit === unit));
}

function sum(rows, key) {
  return rows.reduce((total, row) => total + Number(row[key] || 0), 0);
}

function render() {
  const rows = selectedRows();
  const revenue = sum(rows, "revenue_million");
  const khTct = sum(rows, "kh_tct_revenue_million");
  const khTinh = sum(rows, "kh_tinh_revenue_million");
  const tb = sum(rows, "tb_ptm");
  const khB2 = sum(rows, "kh_b2_tb_ptm");
  const pkg = sum(rows, "sl_ptm_package");

  const metrics = [
    ["Doanh thu TH", `${fmt(revenue)} trđ`, `KH TCT: ${fmt(khTct)} trđ | KH tỉnh: ${fmt(khTinh)} trđ`, ""],
    ["% KH TCT", pct(revenue / khTct), `So với kế hoạch TCT giao`, cls(revenue / khTct)],
    ["% KH tỉnh", pct(revenue / khTinh), `So với mục tiêu tỉnh`, cls(revenue / khTinh)],
    ["% B2", pct(tb / khB2), `${fmt(tb, 0)} / ${fmt(khB2, 0)} thuê bao`, cls(tb / khB2)],
    ["B3 mua gói", pct(pkg / tb), `KH B3: 80,0% | Chênh: ${pct(pkg / tb - 0.8)}`, cls(pkg / tb)],
  ];

  document.getElementById("kpiGrid").innerHTML = metrics.map(([title, value, sub, tone]) => `
    <article class="kpi-card">
      <div class="kpi-title">${title}</div>
      <div class="kpi-value ${tone}">${value}</div>
      <div class="kpi-sub">${sub}</div>
    </article>
  `).join("");

  renderTrend();
  renderBars("revenueRank", rows, "revenue_million", (v) => fmt(v), true);
  renderBars("b2Rank", rows, "pct_b2", (v) => pct(v), false);
  renderTable(rows);
}

function renderBars(id, rows, key, formatValue, scaleToMax) {
  const sorted = [...rows].sort((a, b) => Number(b[key]) - Number(a[key]));
  const max = scaleToMax ? Math.max(...sorted.map((row) => Number(row[key]))) : 1.2;
  document.getElementById(id).innerHTML = sorted.map((row) => {
    const value = Number(row[key] || 0);
    const width = Math.max(2, Math.min(100, value / max * 100));
    return `
      <div class="bar-row">
        <strong>${row.unit}</strong>
        <div class="bar-track"><div class="bar-fill" style="width:${width}%"></div></div>
        <span class="bar-value">${formatValue(value)}</span>
      </div>
    `;
  }).join("");
}

function renderTrend() {
  const width = 1000;
  const height = 320;
  const pad = 42;
  const series = [
    ["Doanh thu TH", "revenue_million", "#075eaa"],
    ["KH TCT", "kh_tct_revenue_million", "#d98500"],
    ["KH tỉnh", "kh_tinh_revenue_million", "#008b61"],
  ];
  const max = Math.max(...state.monthly.flatMap((row) => series.map(([, key]) => Number(row[key] || 0))));
  const x = (index) => pad + index * ((width - pad * 2) / (state.monthly.length - 1));
  const y = (value) => height - pad - (Number(value) / max) * (height - pad * 2);
  const paths = series.map(([label, key, color]) => {
    const d = state.monthly.map((row, index) => `${index ? "L" : "M"}${x(index)},${y(row[key])}`).join(" ");
    return `<path d="${d}" fill="none" stroke="${color}" stroke-width="3" />`;
  }).join("");
  const labels = state.monthly.map((row, index) => `
    <text x="${x(index)}" y="${height - 12}" text-anchor="middle" font-size="12" fill="#5a6c7d">${row.month}</text>
  `).join("");
  const grid = [0, .25, .5, .75, 1].map((step) => {
    const yy = height - pad - step * (height - pad * 2);
    return `<line x1="${pad}" x2="${width - pad}" y1="${yy}" y2="${yy}" stroke="#d7e2ea" />`;
  }).join("");
  const legend = series.map(([label,, color]) => `<span><i style="background:${color}"></i>${label}</span>`).join("");
  document.getElementById("trendChart").innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Xu hướng doanh thu PTM">
      ${grid}${paths}${labels}
    </svg>
    <div class="legend">${legend}</div>
  `;
}

function renderTable(rows) {
  const sorted = [...rows].sort((a, b) => Number(b.revenue_million) - Number(a.revenue_million));
  document.getElementById("detailTable").innerHTML = `
    <thead>
      <tr>
        <th>Đơn vị</th>
        <th>Doanh thu TH</th>
        <th>% KH TCT</th>
        <th>% KH tỉnh</th>
        <th>TB PTM</th>
        <th>% B2</th>
        <th>B3 TH</th>
        <th>Chênh B3</th>
      </tr>
    </thead>
    <tbody>
      ${sorted.map((row) => `
        <tr>
          <td>${row.unit}</td>
          <td>${fmt(row.revenue_million)}</td>
          <td class="${cls(row.pct_kh_tct)}">${pct(row.pct_kh_tct)}</td>
          <td class="${cls(row.pct_kh_tinh)}">${pct(row.pct_kh_tinh)}</td>
          <td>${fmt(row.tb_ptm, 0)}</td>
          <td class="${cls(row.pct_b2)}">${pct(row.pct_b2)}</td>
          <td>${pct(row.package_rate)}</td>
          <td>${pct(row.delta_b3)}</td>
        </tr>
      `).join("")}
    </tbody>
  `;
}

init().catch((error) => {
  document.body.innerHTML = `<main class="shell"><section class="panel"><h2>Không tải được dữ liệu</h2><p>${error.message}</p></section></main>`;
});
