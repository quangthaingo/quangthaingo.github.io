# Superset Chart Recipes

Các biểu đồ dưới đây dùng 2 dataset chính:

- `ptm_monthly_summary.csv`: tổng hợp theo tháng.
- `ptm_unit_period_summary.csv`: so sánh theo đơn vị, có 2 kỳ `T6_2026` và `LK_1_6`.

## 1. KPI doanh thu tháng 6

- Dataset: `ptm_unit_period_summary`
- Chart type: `Big Number`
- Filter: `period = T6_2026`
- Metric: `SUM(revenue_million)`
- Number format: `,.1f`
- Title: `Doanh thu PTM T6 (triệu đồng)`

## 2. KPI % KH TCT tháng 6

- Dataset: `ptm_unit_period_summary`
- Chart type: `Big Number`
- Filter: `period = T6_2026`
- Metric: `SUM(revenue_million) / SUM(kh_tct_revenue_million)`
- Number format: `.1%`
- Title: `% KH TCT T6`

## 3. KPI % KH tỉnh tháng 6

- Dataset: `ptm_unit_period_summary`
- Chart type: `Big Number`
- Filter: `period = T6_2026`
- Metric: `SUM(revenue_million) / SUM(kh_tinh_revenue_million)`
- Number format: `.1%`
- Title: `% KH tỉnh T6`

## 4. KPI % B2 tháng 6

- Dataset: `ptm_unit_period_summary`
- Chart type: `Big Number`
- Filter: `period = T6_2026`
- Metric: `SUM(tb_ptm) / SUM(kh_b2_tb_ptm)`
- Number format: `.1%`
- Title: `% B2 T6`

## 5. KPI B3 tháng 6

- Dataset: `ptm_unit_period_summary`
- Chart type: `Big Number`
- Filter: `period = T6_2026`
- Metric: `SUM(sl_ptm_package) / SUM(tb_ptm)`
- Number format: `.1%`
- Title: `B3 thực hiện T6`

## 6. Doanh thu thực hiện vs kế hoạch theo tháng

- Dataset: `ptm_monthly_summary`
- Chart type: `Line Chart`
- X-axis: `month`
- Metrics:
  - `SUM(revenue_million)`
  - `SUM(kh_tct_revenue_million)`
  - `SUM(kh_tinh_revenue_million)`
- Title: `Doanh thu PTM: thực hiện vs kế hoạch`

## 7. Xếp hạng doanh thu tháng 6 theo đơn vị

- Dataset: `ptm_unit_period_summary`
- Chart type: `Bar Chart`
- Filter: `period = T6_2026`
- Dimension: `unit`
- Metric: `SUM(revenue_million)`
- Sort: descending by metric
- Title: `Doanh thu PTM T6 theo đơn vị`

## 8. % KH TCT tháng 6 theo đơn vị

- Dataset: `ptm_unit_period_summary`
- Chart type: `Bar Chart`
- Filter: `period = T6_2026`
- Dimension: `unit`
- Metric: `SUM(revenue_million) / SUM(kh_tct_revenue_million)`
- Number format: `.1%`
- Sort: descending by metric
- Title: `% KH TCT T6 theo đơn vị`

## 9. % KH tỉnh tháng 6 theo đơn vị

- Dataset: `ptm_unit_period_summary`
- Chart type: `Bar Chart`
- Filter: `period = T6_2026`
- Dimension: `unit`
- Metric: `SUM(revenue_million) / SUM(kh_tinh_revenue_million)`
- Number format: `.1%`
- Sort: descending by metric
- Title: `% KH tỉnh T6 theo đơn vị`

## 10. % B2 tháng 6 theo đơn vị

- Dataset: `ptm_unit_period_summary`
- Chart type: `Bar Chart`
- Filter: `period = T6_2026`
- Dimension: `unit`
- Metric: `SUM(tb_ptm) / SUM(kh_b2_tb_ptm)`
- Number format: `.1%`
- Sort: descending by metric
- Title: `% B2 T6 theo đơn vị`

## 11. B3 thực hiện vs kế hoạch theo đơn vị

- Dataset: `ptm_unit_period_summary`
- Chart type: `Bar Chart`
- Filter: `period = T6_2026`
- Dimension: `unit`
- Metrics:
  - `SUM(sl_ptm_package) / SUM(tb_ptm)`
  - `AVG(kh_b3_package_rate)`
- Number format: `.1%`
- Title: `B3 T6: thực hiện vs kế hoạch`

## 12. Bảng điều hành đơn vị

- Dataset: `ptm_unit_period_summary`
- Chart type: `Table`
- Filter: `period IN (T6_2026, LK_1_6)`
- Columns:
  - `period`
  - `unit`
  - `revenue_million`
  - `kh_tct_revenue_million`
  - `pct_kh_tct`
  - `kh_tinh_revenue_million`
  - `pct_kh_tinh`
  - `tb_ptm`
  - `kh_b2_tb_ptm`
  - `pct_b2`
  - `package_rate`
  - `kh_b3_package_rate`
  - `delta_b3`
- Title: `Chi tiết thực hiện PTM theo đơn vị`
