# Focus Flow 2

Bản dựng mới cho app tracking công việc, dùng Google Sheet làm data store nhưng xử lý theo hướng local-first để thao tác không bị chờ Apps Script.

## Cách dùng

1. Trong Google Sheet, mở **Extensions → Apps Script**.
2. Tạo file `Code.gs`, copy `apps-script/Code.gs` vào đó.
3. Tạo 3 file HTML tên `Index`, `Styles`, `App`, rồi copy nội dung từ `apps-script/Index.html`, `apps-script/Styles.html`, `apps-script/App.html` tương ứng.
4. Deploy → New deployment → Web app → Execute as Me → quyền truy cập theo nhu cầu.

App đọc toàn bộ task một lần khi mở, cập nhật giao diện trước, rồi gom thay đổi vào một lần `sync`. Các cột `actualMinutes`, `pomodoros`, `lastPomodoroAt` đã được chuẩn bị cho Pomodoro.

## Chẩn đoán dữ liệu hiện tại

- `Daily` là dữ liệu cũ dạng 5 cột; `Tasks` là dữ liệu app hiện tại dạng 9 cột và có 209 dòng.
- Có nhiều ID tạm `temp-*`, task mặc định `New Objective`, và category viết không đồng nhất.
- Không nên tiếp tục duy trì hai nguồn dữ liệu. Bản mới dùng `Tasks` làm nguồn chính; `Daily` chỉ nên giữ làm archive/import.
