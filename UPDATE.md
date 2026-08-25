# Focus Flow — Project Update

Ngày cập nhật: 2026-08-23

## 1. Mục tiêu

Focus Flow là app tracking công việc có Pomodoro tích hợp. Google Sheet tiếp tục là nơi lưu dữ liệu, còn web app là giao diện sử dụng hằng ngày.

Mục tiêu:

- Quản lý task theo ngày.
- Chia task theo Sinh hoạt, Việc công ty, Xây dựng đế chế.
- Chạy Pomodoro trên từng task.
- Ghi nhận thời gian làm thực tế.
- So sánh thời gian dự kiến với thời gian thực tế.
- Theo dõi tổng thời gian tập trung trong ngày.

## 2. Trạng thái hiện tại

### Cập nhật 2026-08-24

- Đã deploy thành công bản web app trên Google Apps Script.
- Google Sheet `Tasks` đang được dùng làm nơi lưu dữ liệu thật.
- Cấu hình deploy: Execute as chủ sở hữu project; quyền truy cập theo cấu hình Web app.
- Đã chuyển sang giai đoạn dùng thử thực tế và thu feedback.
- Ngày tiếp theo cần kiểm tra các lỗi phát sinh khi sử dụng liên tục, đặc biệt là Pomodoro, End session, actual time và Insights.

Đã có:

- Demo local tại http://127.0.0.1:4173/demo.html
- Board task theo 3 nhóm.
- Tạo, sửa, xóa, hoàn thành task.
- Đổi ngày.
- Pomodoro focus screen dạng modal.
- Countdown theo duration của task.
- Pause, Resume, Skip.
- Short break 5 phút.
- Overall break 15 phút.
- End session ghi actual time và hoàn thành task.
- Tính số Pomodoro từ actual time.
- Dashboard Insights.
- Google Apps Script backend đồng bộ theo batch.

Chưa hoàn thành:

- Chưa deploy bản mới lên Google Apps Script thật.
- Chưa nối demo local vào Google Sheet thật.
- Chưa migrate sạch dữ liệu cũ.
- Chưa có notification âm thanh/browser.
- Chưa có báo cáo tuần/tháng hoàn chỉnh.

## 3. Kiến trúc

Web UI
→ local-first state
→ Pomodoro timer
→ task board
→ Insights
→ Google Apps Script adapter
→ Google Sheet / Tasks

Nguyên tắc:

- UI cập nhật trước để giảm cảm giác lag.
- Google Sheet chỉ đọc dữ liệu ban đầu và nhận các thay đổi theo batch.
- Không gọi Apps Script riêng cho từng thao tác nhỏ.
- Tasks là nguồn dữ liệu chính.

## 4. File chính

- demo.html: entry point chạy demo local.
- apps-script/web/app.js: logic task, Pomodoro và Insights.
- apps-script/web/styles.css: giao diện web.
- apps-script/Code.gs: backend Google Apps Script.
- apps-script/Index.html: shell HTML cho Apps Script.
- apps-script/App.html: frontend dùng trong Apps Script.
- apps-script/Styles.html: CSS dùng trong Apps Script.
- README.md: hướng dẫn triển khai nhanh.
- UPDATE.md: tài liệu bàn giao và cập nhật dự án.

## 5. Data model

Sheet chính: Tasks

Cột hiện tại:

- id
- date
- category
- title
- duration
- completed
- createdAt
- updatedAt
- note

Cột cần dùng cho Pomodoro:

- actualMinutes: tổng phút Focus thực tế của task.
- pomodoros: số block Pomodoro hoàn thành.
- lastPomodoroAt: thời điểm Pomodoro gần nhất.

Duration là thời gian dự kiến, ví dụ 30m, 90m hoặc 2h.

## 6. Logic Pomodoro

Khi bấm Play:

1. Mở focus screen.
2. Countdown theo duration của task.
3. Task trở thành task đang focus.

Pause và Resume:

- Pause dừng countdown.
- Resume tiếp tục từ thời gian đã chạy.
- Thời gian nghỉ không cộng vào actualMinutes.

Khi Focus hoàn tất:

- Ghi thời gian Focus thực tế.
- Tính lại pomodoros.
- Chuyển sang Short Break 5 phút.

Khi bấm End session:

- Cộng toàn bộ thời gian Focus đã chạy vào actualMinutes.
- Tính lại pomodoros.
- Đánh dấu completed = true.
- Đóng Pomodoro screen.

Ví dụ:

Task dự kiến 30 phút, làm 15 phút rồi End session:

- actualMinutes = 15
- pomodoros = 0
- completed = true

Task dự kiến 30 phút, làm 60 phút:

- actualMinutes = 60
- pomodoros = 2

## 7. Break logic

Short Break:

- Dài 5 phút.
- Dùng giữa các block Focus.
- Không cộng vào actualMinutes.

Overall Break:

- Dài 15 phút.
- Là break của toàn bộ ngày tracking, không thuộc riêng task nào.
- Tổng được tính từ actualMinutes của tất cả task trong ngày.
- Khi tổng đạt từ 90 phút trở lên, hiện nút Take 15m overall break.

Ví dụ:

- Task A: 15 phút.
- Task B: 60 phút.
- Task C: 15 phút.
- Tổng: 90 phút.

Khi đó nút nghỉ dài phải xuất hiện. Overall Break không làm tăng thời gian làm của task.

## 8. Insights dashboard

Tab Insights không hiển thị khu vực Add task.

Các chỉ số:

- Planned: tổng thời gian dự kiến.
- Actual: tổng thời gian thực tế.
- Variance: Actual trừ Planned.
- Overrun rate: tỷ lệ task có actual lớn hơn planned.
- Số task vượt dự kiến.
- Completion rate.
- Bảng variance theo từng task.
- Analyst readout của ngày.

Ví dụ:

- Planned: 2h.
- Actual: 2.5h.
- Variance: +0.5h.

## 9. Dữ liệu hiện tại

Workbook đã được cấp quyền Editor và đang dùng tab Tasks.

Các vấn đề cần xử lý:

- Một số ID cũ có dạng temp-*.
- Có task New Objective.
- Category cũ có thể không đồng nhất.
- Dữ liệu cũ chưa có 3 cột Pomodoro.

Đề xuất:

1. Không xóa dữ liệu cũ khi chưa backup.
2. Bổ sung cột Pomodoro ở cuối bảng.
3. Chuẩn hóa category trong app.
4. Dùng Tasks làm nguồn duy nhất.

## 10. Chạy demo

Từ thư mục dự án, chạy Python HTTP server ở port 4173 rồi mở:

http://127.0.0.1:4173/demo.html

Demo local dùng localStorage và không ghi vào Google Sheet thật.

## 11. Deploy Apps Script

Trong Google Sheet:

1. Mở Extensions → Apps Script.
2. Tạo HTML file tên Index.
3. Tạo HTML file tên App.
4. Tạo HTML file tên Styles.
5. Copy nội dung các file tương ứng trong thư mục apps-script.
6. Copy Code.gs vào backend.
7. Deploy thành Web app.

Backend có:

- bootstrap(): tải toàn bộ task ban đầu.
- sync(payload): đồng bộ nhiều thay đổi trong một lần.

## 12. Việc tiếp theo

Ưu tiên 1:

- Bổ sung actualMinutes, pomodoros, lastPomodoroAt vào Tasks.
- Deploy Apps Script backend.
- Test create, update, complete và delete với Sheet thật.

Ưu tiên 2:

- Hiển thị global daily tracking counter rõ hơn.
- Thêm âm thanh và browser notification.
- Cho phép đổi duration ngay trong Pomodoro screen.

Ưu tiên 3:

- Báo cáo tuần/tháng.
- Heatmap thời gian tập trung.
- Phân tích category thường estimate thiếu.
- Export báo cáo.

## 13. Quyết định sản phẩm

- Google Sheet là data store.
- Web app là giao diện chính.
- Apps Script là adapter/API.
- Actual time được ưu tiên khi phân tích hiệu suất.
- Break time không tính vào work time.
- Task completion và Pomodoro tracking là hai trạng thái riêng.
- End session hiện được thiết kế để kết thúc phiên và hoàn thành task.

## 14. Chuyển sang standalone web app — 2026-08-25

Sau khi test thực tế, Apps Script được giữ lại làm lớp data adapter, không còn làm giao diện chính.

Kiến trúc mới:

```text
Vercel Web App
  -> /api/sheets
  -> Google Sheets API
  -> Google Sheet / Tasks
```

Frontend standalone nằm trong thư mục `standalone/`. Pomodoro chạy hoàn toàn trên trình duyệt và chỉ sync dữ liệu về Sheet sau các thay đổi. API nằm ở `api/sheets.js` và dùng service account qua biến môi trường, không commit file credentials lên Git.

Các file mới:

- `standalone/index.html`
- `standalone/app.js`
- `standalone/styles.css`
- `api/sheets.js`
- `package.json`
- `vercel.json`
- `.env.example`

Bản Apps Script cũ vẫn giữ trong `apps-script/` để backup và rollback.
