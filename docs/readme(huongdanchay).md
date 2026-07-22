# Hướng Dẫn Vận Hành Hệ Thống & Tổng Quan Tài Liệu

Tệp tin này tóm tắt cách chạy ứng dụng ở môi trường cục bộ (local) và mô tả sơ đồ các tài liệu hướng dẫn nằm trong thư mục `docs/` để phục vụ phát triển nâng cao.

---

## 1. Hướng Dẫn Chạy Dự Án Cục Bộ (Frontend React + Vite)

### Bước 1: Di chuyển vào thư mục dự án
Mở terminal tại máy tính của bạn và chạy lệnh:
```bash
cd "d:\DO AN TRUONG HOC THONG MINH\quan-ly-va-ho-tro-hoc-tap-hung-nhan"
```

### Bước 2: Cài đặt các thư viện cần thiết (Node Modules)
Chạy lệnh cài đặt:
```bash
npm install
```
*(Nếu hệ thống báo lỗi thiếu kiểu dữ liệu `@types/react` hoặc `@types/react-dom`, hãy chạy thêm lệnh: `npm install --save-dev @types/react @types/react-dom`)*

### Bước 3: Cấu hình file môi trường
Tạo file cấu hình môi trường `.env.local` bằng lệnh:
- Trên Powershell: `Copy-Item .env.example .env.local`
- Trên Command Prompt: `copy .env.example .env.local`

Sau đó mở file `.env.local` và điền khóa API Gemini của bạn:
```env
GEMINI_API_KEY="your_gemini_api_key_here"
APP_URL="http://localhost:3000"
```

### Bước 4: Khởi động Server Phát Triển
Chạy lệnh khởi động:
```bash
npm run dev
```
Ứng dụng sẽ chạy tại địa chỉ: **[http://localhost:3000](http://localhost:3000)**.

> [!IMPORTANT]
> Nếu bạn gặp lỗi `EADDRINUSE: address already in use 0.0.0.0:3000`, tức là cổng 3000 đang được một terminal khác chạy ngầm chiếm dụng. Hãy tắt terminal cũ hoặc truy cập trực tiếp link web trên trình duyệt để kiểm tra mà không cần chạy lại.

---

## 2. Bản Đồ Thư Mục Tài Liệu (`docs/`)

Thư mục `docs/` chứa toàn bộ tài liệu đặc tả cấu trúc nghiệp vụ và thiết kế cơ sở dữ liệu để phục vụ cho việc lập trình Backend Spring Boot sau này:

1. **[database-design.md](file:///d:/DO%20AN%20TRUONG%20HOC%20THONG%20MINH/quan-ly-va-ho-tro-hoc-tap-hung-nhan/docs/database-design.md):**
   - Bản vẽ thiết kế cơ sở dữ liệu chuẩn hóa dạng 3NF.
   - Định nghĩa chi tiết các trường, kiểu dữ liệu của các bảng (người dùng, lớp học, học vụ, điểm danh, đề thi trắc nghiệm `quiz_questions`, bài làm `quiz_answers`, học liệu...).
   - Khuyến nghị các class Entity và cấu trúc package trong Spring Boot.

2. **[schema.sql](file:///d:/DO%20AN%20TRUONG%20HOC%20THONG%20MINH/quan-ly-va-ho-tro-hoc-tap-hung-nhan/docs/schema.sql):**
   - File script SQL chứa các lệnh khởi tạo bảng (`CREATE TABLE`) đầy đủ khóa ngoại, ràng buộc và chỉ mục (Index) tương thích với MySQL 8.0+ / MariaDB.
   - Có thể import trực tiếp vào cơ sở dữ liệu để chạy thử.

3. **[business-flows-admin-teacher-student.md](file:///d:/DO%20AN%20TRUONG%20HOC%20THONG%20MINH/quan-ly-va-ho-tro-hoc-tap-hung-nhan/docs/business-flows-admin-teacher-student.md):**
   - Mô tả các luồng nghiệp vụ chi tiết của 3 nhóm tác nhân chính: Admin (Quản trị viên), Teacher (Giảng viên), Student (Sinh viên).
   - Đặc tả quy trình điểm danh sinh trắc, quy trình làm bài kiểm tra trắc nghiệm 2 cột có file đề và tự động chấm điểm.

4. **[fe-be-integration-guide.md](file:///d:/DO%20AN%20TRUONG%20HOC%20THONG%20MINH/quan-ly-va-ho-tro-hoc-tap-hung-nhan/docs/fe-be-integration-guide.md):**
   - Hướng dẫn tích hợp kết nối API giữa Frontend React và Backend Spring Boot.
   - Liệt kê chi tiết các RESTful Endpoints (`GET`, `POST`...), định dạng JSON Request/Response mẫu của các chức năng (làm bài trắc nghiệm, điểm danh khuôn mặt, học liệu).
   - Ví dụ viết code Entity JPA kết nối Database bằng Java.