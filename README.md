# Focus Flow · Task Tracker + Pomodoro

Web app tracking công việc với Pomodoro. Google Sheet chỉ làm nơi lưu dữ liệu; giao diện chạy độc lập trên web/Vercel để thao tác nhanh hơn Apps Script.

## Trạng thái hiện tại

- Frontend standalone: `standalone/index.html`, `standalone/app.js`, `standalone/styles.css`.
- API serverless đọc/ghi Google Sheet: `api/sheets.js`.
- Vercel dùng `index.html` ở thư mục gốc làm entrypoint.
- Apps Script cũ vẫn được giữ trong `apps-script/` để tham khảo/backup, không phải frontend chính.
- Sheet chính: tab `Tasks`.

## Tính năng đã làm

- Tạo, sửa, hoàn thành và xóa task.
- Phân nhóm Life, Company, Empire.
- Theo dõi thời gian thực tế và số Pomodoro theo task.
- Bấm Play mở giao diện Pomodoro đầy đủ: Pause, Skip, End session.
- Focus đầu tiên chạy theo thời lượng task.
- Hết focus tự ghi nhận actual time và Pomodoro, sau đó chuyển sang nghỉ ngắn 5 phút.
- Sau nghỉ ngắn có ô `Next focus` để nhập thời lượng riêng cho vòng tiếp theo; không còn cố định theo thời lượng setup ban đầu.
- Khi tổng thời gian làm việc trong ngày của tất cả task đạt từ 90 phút, hiện nút `Take 15m overall break`.
- End session ghi nhận phần thời gian focus đã chạy và đóng task theo luồng hiện tại.
- Màn Insights so sánh Planned, Actual, Variance và Overrun rate.
- Local-first UI: giao diện cập nhật ngay, sau đó đồng bộ về Sheet qua API.

## Cấu trúc dữ liệu Google Sheet

Tab `Tasks` dùng các cột:

```text
id, date, category, title, duration, completed, createdAt, updatedAt,
note, actualMinutes, pomodoros, lastPomodoroAt
```

Không commit file service-account JSON hoặc API key vào Git. Các file nhạy cảm đã nằm trong `.gitignore`.

## Chạy local

Có thể mở bản demo tĩnh tại `standalone/index.html`. Để test API đầy đủ, chạy một static/server development server tại thư mục project rồi mở trang web qua `http://localhost/...`; không mở bằng `file://`.

Frontend gọi:

```text
GET  /api/sheets?action=bootstrap
POST /api/sheets
```

## Cấu hình Vercel

Trong đúng project Vercel của repo `promodoro`, thêm các Environment Variables cho Production, Preview và Development:

```text
GOOGLE_SHEET_ID=15sTt-jyrlzkmv0EKwD3mZNUk-zDY8N5lH0iPnlOIOy8
GOOGLE_CLIENT_EMAIL=google-sheet-api@flash-spot-478110-u3.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=<giá trị private_key trong JSON service account>
```

`GOOGLE_CLIENT_EMAIL` dùng Config; `GOOGLE_PRIVATE_KEY` dùng Secret. Đây là cách khuyến nghị để tránh lỗi dán cả JSON vào một biến. Service account phải được chia sẻ quyền **Editor** trên Google Sheet. Sau khi đổi biến môi trường, cần Redeploy.

## Cách kiểm tra kết nối

1. Mở web và kiểm tra trạng thái trên header là `SYNCED`.
2. Tạo một task mới trên web.
3. Mở tab `Tasks` trong Google Sheet và kiểm tra task mới.
4. Chạy một focus ngắn, bấm `End session`.
5. Kiểm tra `actualMinutes`, `pomodoros` và `completed` được cập nhật.

Nếu app hiện `OFFLINE`, mở endpoint `/api/sheets?action=bootstrap` trên domain Vercel. JSON `500` thường là lỗi Environment Variables hoặc quyền chia sẻ Sheet; `404` nghĩa là deployment chưa chứa thư mục `api/`.

## Git / deploy

Branch deploy hiện tại là `master`. Vercel được kết nối với GitHub repo:

```text
https://github.com/pforrest777-hub/promodoro
```

Push lên `master` sẽ tạo deployment mới trên Vercel.

## Lưu ý phát triển

Pomodoro dùng `focusMinutes` cho từng vòng. Không đổi logic này về `mins(task.duration)` trong các hàm cuối file, vì JavaScript sẽ dùng định nghĩa hàm xuất hiện sau cùng và có thể vô tình ghi đè logic tùy chỉnh của vòng tiếp theo.
