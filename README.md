# PTM Superset Project

Project này chuẩn hóa dữ liệu PTM từ 2 workbook Excel và chuẩn bị bộ bảng để dựng dashboard trên Apache Superset.

## Mục tiêu nghiệp vụ

- Chỉ phân tích 9 đơn vị `VNPT_*`.
- Loại `TT_CSKH`, `TTVT_*`, `TTKD`.
- Doanh thu thực hiện trong file PTM là đồng, được quy đổi sang triệu đồng để so với kế hoạch.
- `B1` dùng để so doanh thu bán hàng PTM:
  - `KH TCT`: dòng `B1` không chứa `Mục tiêu tỉnh`.
  - `KH tỉnh`: dòng `B1` chứa `Mục tiêu tỉnh`.
- `B2`: thuê bao di động PTM - mục tiêu tỉnh.
- `B3`: tỷ lệ thuê bao mua gói trong tháng PTM.
- Tỷ lệ B3 thực hiện = `SL PTM có mua gói / TB PTM`.

## Cấu trúc

```text
superset_ptm_project/
  data/
    ptm_actual.csv
    ptm_plan.csv
    ptm_monthly_summary.csv
    ptm_unit_period_summary.csv
  scripts/
    build_data.mjs
  superset/
    chart_recipes.md
  sql/
    superset_views.sql
  docker-compose.yml
```

## Tạo lại dữ liệu

Chạy từ thư mục workspace:

```powershell
& 'C:\Users\thain\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' 'C:\Users\thain\Documents\Codex\Dashboard\superset_ptm_project\scripts\build_data.mjs'
```

Kết quả sẽ được ghi vào `superset_ptm_project/data/`.

## Cách dùng với Superset

1. Mở Superset.
2. Vào `Data > Upload a CSV`.
3. Upload 4 file trong thư mục `data/`.
4. Tạo dataset từ các bảng CSV.
5. Dựng biểu đồ theo hướng dẫn trong `superset/chart_recipes.md`.

Nếu dùng database riêng, có thể nạp CSV vào database rồi chạy thêm SQL trong `sql/superset_views.sql` để tạo view.

## Dashboard đề xuất

- Tổng quan doanh thu PTM theo tháng.
- So sánh doanh thu thực hiện với KH TCT và KH tỉnh.
- Xếp hạng đơn vị theo `% KH TCT`, `% KH tỉnh`, `% B2`.
- B3: tỷ lệ thuê bao mua gói thực hiện so với mục tiêu 80%.
- Bảng chi tiết theo đơn vị cho tháng 6 và lũy kế 1-6.
