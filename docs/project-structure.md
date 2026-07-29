# Mô Tả Cấu Trúc Thư Mục Dự Án

Tài liệu này mô tả cấu trúc thư mục chính của dự án `DOANTOTNGHIEP` để giúp các lập trình viên nắm bắt nhanh kiến trúc và vị trí của các thành phần hiện có.

## 1. Thư mục gốc

- `.env`, `.env.example`: cấu hình môi trường cho ứng dụng.
- `package.json`, `package-lock.json`: quản lý dependency và scripts cho frontend.
- `tsconfig.json`: cấu hình TypeScript toàn cục.
- `vite.config.ts`: cấu hình Vite cho dự án.
- `README.md`: hướng dẫn cài đặt và chạy dự án chung.
- `server.ts`: file khởi chạy server phụ trợ nếu có xử lý API đơn giản hoặc mock.
- `docs/`: chứa tài liệu dự án.

## 2. `docs/`

- `database-design.md`: mô tả chi tiết thiết kế cơ sở dữ liệu và các bảng dữ liệu chính.
- `schema.sql`: script SQL tạo bảng và ràng buộc cho CSDL.
- `business-flows-admin-teacher-student.md`: mô tả luồng nghiệp vụ cho Admin, Giảng viên và Sinh viên.
- `project-structure.md`: tệp mô tả cấu trúc thư mục dự án (tệp hiện tại).
- `api_specification.xls`: bảng mô tả API, tham số và định nghĩa endpoint (nếu có).
- `readme(huongdanchay).md`: hướng dẫn vận hành và tài liệu cho môi trường local.

## 3. `src/`

`src/` chứa toàn bộ ứng dụng frontend chính viết bằng React + TypeScript.

### 3.1. `src/components/`

Thư mục chứa các component tái sử dụng chung toàn dự án.

- `UI/`: các component giao diện chung như `Card`, `FormInput`, `Modal`, `Badge`, `Table`.
- `charts/`: các component vẽ biểu đồ chung.
- `layout/`: các component layout như sidebar, header, navigation.
- `WeeklyTimetable`: component hiển thị lịch học theo tuần.

### 3.2. `src/features/`

Thư mục chứa các tính năng chức năng chính, chia theo vai trò người dùng.

- `admin/`: tính năng cho quản trị viên.
  - `dashboard/`: bảng điều khiển tổng quan Admin.
  - `departments/`: quản lý khoa.
  - `majors/`: quản lý ngành học.
  - `subjects/`: quản lý môn học.
  - `classes/`: quản lý lớp học.
  - `students/`: quản lý sinh viên.
  - `teachers/`: quản lý giảng viên.
  - `announcements/`: thông báo hệ thống.

- `student/`: tính năng cho sinh viên.
  - `dashboard/`: bảng điều khiển học tập của sinh viên.
  - `registration/`: đăng ký học phần.
  - `schedule/`: lịch học.
  - `study/`: học liệu, nộp bài và điểm danh.
  - `homework/`: quản lý bài tập.
  - `academic-progress/`: tiến trình học tập và điểm số.
  - `profile/`: hồ sơ cá nhân sinh viên.

- `teacher/`: tính năng cho giảng viên.
  - `assignments/`: quản lý bài tập và đề thi.
  - `attendance/`: điểm danh.
  - `grading/`: chấm điểm.
  - `materials/`: quản lý học liệu.
  - `my-classes/`: quản lý lớp môn giảng dạy.
  - `profile/`: hồ sơ giảng viên.

### 3.3. `src/hooks/`

Chứa các hook tái sử dụng trên nhiều component, ví dụ `useStudentAcademicStats.ts` để tính toán GPA và thống kê học tập.

### 3.4. `src/models/`

Chứa store toàn cục và các service dữ liệu.

- `store.tsx`: quản lý trạng thái chính, dữ liệu mẫu (mock data), và các phương thức thao tác như đăng ký, hủy lớp, nộp bài.

### 3.5. `src/utils/`

Chứa các tiện ích và helper dùng chung như:

- `gradeUtils.ts`: chuyển đổi điểm, quy đổi GPA, phân loại học lực.
- `studentClassUtils.ts`: helper thống nhất danh sách lớp học của sinh viên theo ngành.

### 3.6. `src/viewmodels/`

Chứa các logic điều khiển dữ liệu tách biệt với giao diện, giúp quản lý trạng thái và tính toán trước khi render.

### 3.7. `src/views/`

Chứa các trang chính của ứng dụng như `AdminPortal.tsx`, `StudentPortal.tsx`, `TeacherPortal.tsx`, `LoginView.tsx`.

### 3.8. `src/types.ts`

Định nghĩa các kiểu dữ liệu chung toàn bộ ứng dụng như `Student`, `ClassSection`, `Assignment`, `GradeRecord`, `LearningMaterial`, `SystemNotification`.

## 4. Cách mở rộng tính năng mới

- Luôn sử dụng các component UI hiện có trong `src/components/` để giữ nhất quán giao diện.
- Thêm logic nghiệp vụ mới trong `src/features/<role>/` tương ứng với vai trò người dùng.
- Dữ liệu mẫu và thao tác cập nhật nên bổ sung trong `src/models/store.tsx` theo cấu trúc hiện có.
- Sử dụng helper chung trong `src/utils/` khi có logic lặp lại giữa nhiều màn hình.
- Khi thêm tính năng liên quan đến ngành học, ưu tiên dùng `studentClassUtils.ts` để lọc `enrolledClasses` theo `studentProfile.majorId`.

## 5. Ghi chú quan trọng

- Không xóa các tính năng cũ khi mở rộng.
- Giữ nguyên công nghệ React + TypeScript + Vite và cấu trúc thư mục.
- Thay đổi nên tập trung vào `src/features/` và tránh can thiệp sâu vào cấu trúc `src/components/` chung.
