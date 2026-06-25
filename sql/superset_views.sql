-- Optional SQL views for a database-backed Superset project.
-- Load the CSV files into tables with the same names first:
--   ptm_actual
--   ptm_plan
--   ptm_monthly_summary
--   ptm_unit_period_summary

CREATE VIEW IF NOT EXISTS v_ptm_monthly_dashboard AS
SELECT
  month,
  revenue_million,
  kh_tct_revenue_million,
  pct_kh_tct,
  kh_tinh_revenue_million,
  pct_kh_tinh,
  tb_ptm,
  kh_b2_tb_ptm,
  pct_b2,
  sl_ptm_package,
  package_rate,
  kh_b3_package_rate,
  delta_b3
FROM ptm_monthly_summary;

CREATE VIEW IF NOT EXISTS v_ptm_unit_dashboard AS
SELECT
  period,
  unit,
  revenue_million,
  kh_tct_revenue_million,
  pct_kh_tct,
  kh_tinh_revenue_million,
  pct_kh_tinh,
  tb_ptm,
  kh_b2_tb_ptm,
  pct_b2,
  sl_ptm_package,
  package_rate,
  kh_b3_package_rate,
  delta_b3
FROM ptm_unit_period_summary;
