# Đặc Tả Toàn Bộ API Hệ Thống (Authentication, Admin, Teacher, Student)

Tài liệu này tổng hợp **toàn bộ 59 API cốt lõi** cần xây dựng cho dự án. Bạn có thể mở file [api_specification.csv](file:///d:/DO%20AN%20TRUONG%20HOC%20THONG%20MINH/quan-ly-va-ho-tro-hoc-tap-hung-nhan/docs/api_specification.csv) trực tiếp trong Microsoft Excel để xem dạng bảng tính (lưu ý đóng Excel trước khi chạy cập nhật).

---

## 1. Phân Hệ Xác Thực & Tài Khoản (Common Auth)

| Mã API | Chức năng | Method | Endpoint | Dữ liệu đầu vào (Payload) | Dữ liệu đầu ra (Response) | Ràng buộc & Validate | Phân quyền |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **API_AUTH_01** | Đăng nhập hệ thống | `POST` | `/api/auth/login` | `{"username": "...", "password": "..."}` | `{"token": "JWT_TOKEN", "role": "...", ...}` | Không được để trống. So khớp password hash. | Tự do |
| **API_AUTH_02** | Đăng xuất | `POST` | `/api/auth/logout` | *Headers: Authorization* | `{"success": true}` | Đưa JWT token hiện tại vào blacklist phía server. | Tất cả |
| **API_AUTH_03** | Lấy thông tin cá nhân | `GET` | `/api/auth/me` | *Headers: Authorization* | `{"id": 1, "username": "...", "email": "..."}` | Giải mã token để lấy thông tin. | Tất cả |
| **API_AUTH_04** | Đổi mật khẩu | `PUT` | `/api/auth/change-password` | `{"oldPassword": "...", "newPassword": "..."}` | `{"success": true}` | Mật khẩu cũ phải khớp. Mật khẩu mới tối thiểu 6 ký tự. | Tất cả |

---

## 2. Phân Hệ Admin (Quản Trị Viên)

| Mã API | Chức năng | Method | Endpoint | Dữ liệu đầu vào (Payload) | Dữ liệu đầu ra (Response) | Ràng buộc & Validate | Phân quyền |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **API_AD_01** | Danh sách người dùng | `GET` | `/api/admin/users` | *Query params: ?page=0&size=10&search=keyword* | `{"content": [...], "totalElements": 200}` | Hỗ trợ phân trang, tìm kiếm theo tên/email. | `ADMIN` |
| **API_AD_02** | Chi tiết người dùng | `GET` | `/api/admin/users/{id}` | *Headers: Authorization* | `{"id": 1, "username": "...", "fullName": "..."}` | ID người dùng phải tồn tại thực tế. | `ADMIN` |
| **API_AD_03** | Tạo tài khoản mới | `POST` | `/api/admin/users` | `{"username": "...", "email": "...", "fullName": "..."}` | `{"id": 1, "username": "...", "status": "ACTIVE"}` | Username và Email không trùng lặp (Unique). | `ADMIN` |
| **API_AD_04** | Cập nhật thông tin User | `PUT` | `/api/admin/users/{id}` | `{"fullName": "...", "phone": "...", "status": "ACTIVE"}` | `{"id": 1, "fullName": "...", "status": "ACTIVE"}` | ID người dùng phải tồn tại thực tế. | `ADMIN` |
| **API_AD_05** | Khóa / Xóa tài khoản | `DELETE` | `/api/admin/users/{id}` | *Headers: Authorization* | `{"success": true}` | Không cho phép Admin tự khóa chính mình. | `ADMIN` |
| **API_AD_06** | Danh sách vai trò (Roles) | `GET` | `/api/admin/roles` | *Headers: Authorization* | `[{"id": 1, "name": "ADMIN"}, ...]` | Trả về danh sách vai trò tĩnh trong hệ thống. | `ADMIN` |
| **API_AD_07** | Danh sách khoa hành chính | `GET` | `/api/admin/departments` | *Query params: ?page=0&size=10* | `{"content": [...], "totalElements": 8}` | Phân trang và tìm kiếm theo tên khoa. | `ADMIN` |
| **API_AD_08** | Tạo mới khoa | `POST` | `/api/admin/departments` | `{"code": "CNTT", "name": "Khoa CNTT"}` | `{"id": 1, "code": "CNTT", "name": "Khoa CNTT"}` | Mã khoa (code) là duy nhất. | `ADMIN` |
| **API_AD_09** | Sửa khoa hành chính | `PUT` | `/api/admin/departments/{id}` | `{"name": "...", "description": "..."}` | `{"id": 1, "name": "..."}` | ID khoa phải hợp lệ. | `ADMIN` |
| **API_AD_10** | Xóa khoa hành chính | `DELETE` | `/api/admin/departments/{id}` | *Headers: Authorization* | `{"success": true}` | Chỉ xóa được khi không có sinh viên/lớp thuộc khoa. | `ADMIN` |
| **API_AD_11** | Danh sách năm học | `GET` | `/api/admin/academic-years` | *Headers: Authorization* | `[{"id": 1, "code": "2025-2026", ...}]` | Hiển thị toàn bộ các năm học trong hệ thống. | `ADMIN` |
| **API_AD_12** | Tạo năm học mới | `POST` | `/api/admin/academic-years` | `{"code": "2025-2026", "startDate": "...", ...}` | `{"id": 1, "code": "2025-2026"}` | Mã năm học unique. startDate trước endDate. | `ADMIN` |
| **API_AD_13** | Danh sách học kỳ | `GET` | `/api/admin/semesters` | *Query params: ?academicYearId=1* | `[{"id": 10, "code": "HK1", ...}]` | Lọc danh sách kỳ học theo năm học. | `ADMIN` |
| **API_AD_14** | Tạo học kỳ mới | `POST` | `/api/admin/semesters` | `{"academicYearId": 1, "code": "HK1", "name": "..."}` | `{"id": 10, "code": "HK1"}` | Cặp (academicYearId, code) unique. | `ADMIN` |
| **API_AD_15** | Danh sách sinh viên | `GET` | `/api/admin/students` | *Query params: ?page=0&size=10&search=keyword* | `{"content": [...], "totalElements": 500}` | Hỗ trợ tìm kiếm theo mã SV, tên SV. | `ADMIN` |
| **API_AD_16** | Tạo sinh viên mới | `POST` | `/api/admin/students` | `{"userId": 2, "studentCode": "SV001", "fullName": "..."}` | `{"id": 1, "studentCode": "SV001"}` | studentCode unique. userId và departmentId hợp lệ. | `ADMIN` |
| **API_AD_17** | Danh sách giảng viên | `GET` | `/api/admin/teachers` | *Query params: ?page=0&size=10* | `{"content": [...], "totalElements": 80}` | Hỗ trợ tìm kiếm giảng viên theo mã, tên. | `ADMIN` |
| **API_AD_18** | Tạo giảng viên mới | `POST` | `/api/admin/teachers` | `{"userId": 5, "teacherCode": "GV001", "fullName": "..."}` | `{"id": 1, "teacherCode": "GV001"}` | teacherCode unique. userId và departmentId hợp lệ. | `ADMIN` |
| **API_AD_19** | Danh sách lớp hành chính | `GET` | `/api/admin/classes` | *Query params: ?page=0&size=10* | `{"content": [...], "totalElements": 20}` | Phân trang lớp hành chính. | `ADMIN` |
| **API_AD_20** | Tạo lớp hành chính | `POST` | `/api/admin/classes` | `{"code": "K64-CNTT", "name": "Lớp K64 CNTT", ...}` | `{"id": 1, "code": "K64-CNTT"}` | Mã lớp (code) unique. Khoa và GV chủ nhiệm hợp lệ. | `ADMIN` |
| **API_AD_21** | Danh sách môn học | `GET` | `/api/admin/subjects` | *Query params: ?page=0&size=10* | `{"content": [...], "totalElements": 120}` | Tìm kiếm môn theo mã, tên môn học. | `ADMIN` |
| **API_AD_22** | Tạo môn học mới | `POST` | `/api/admin/subjects` | `{"code": "WEB101", "name": "Lập trình Web", "credits": 3}` | `{"id": 1, "code": "WEB101"}` | Mã môn unique. Số tín chỉ >= 1. | `ADMIN` |
| **API_AD_23** | Danh sách lớp học phần | `GET` | `/api/admin/class-sections` | *Query params: ?semesterId=1* | `{"content": [...], "totalElements": 40}` | Lọc lớp học phần theo kỳ học. | `ADMIN` |
| **API_AD_24** | Mở lớp học phần mới | `POST` | `/api/admin/class-sections` | `{"classId": 1, "subjectId": 1, "sectionCode": "...", ...}` | `{"id": 101, "sectionCode": "..."}` | sectionCode unique. Khớp phòng học và giờ học. | `ADMIN` |
| **API_AD_25** | Đăng ký lớp học phần | `POST` | `/api/admin/enrollments` | `{"studentId": 1, "classSectionId": 101}` | `{"id": 501, "status": "ACTIVE"}` | Tránh đăng ký trùng. Không vượt sĩ số lớp. | `ADMIN` |

---

## 3. Phân Hệ Teacher (Giảng Viên)

| Mã API | Chức năng | Method | Endpoint | Dữ liệu đầu vào (Payload) | Dữ liệu đầu ra (Response) | Ràng buộc & Validate | Phân quyền |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **API_TC_01** | Xem lớp học phần giảng dạy | `GET` | `/api/teacher/classes` | *Headers: Authorization* | `[{"id": 101, "sectionCode": "LHP_WEB_01", ...}]` | Lọc lớp theo ID của giảng viên đăng nhập. | `TEACHER` |
| **API_TC_02** | Xem danh sách SV trong lớp HP | `GET` | `/api/teacher/classes/{classSectionId}/students` | *Headers: Authorization* | `[{"studentId": 1, "studentCode": "SV001", ...}]` | Lớp học phần phải do giảng viên đang dạy quản lý. | `TEACHER` |
| **API_TC_03** | Xem các phiên điểm danh | `GET` | `/api/teacher/classes/{classSectionId}/attendance-sessions` | *Headers: Authorization* | `[{"id": 10, "sessionDate": "...", ...}]` | Chỉ xem được của lớp mình đang trực tiếp giảng dạy. | `TEACHER` |
| **API_TC_04** | Mở phiên điểm danh mới | `POST` | `/api/teacher/classes/{classSectionId}/attendance-sessions` | `{"sessionDate": "2026-07-22", "title": "Buổi 1"}` | `{"id": 10, "title": "Buổi 1", "status": "OPEN"}` | Tối đa 1 phiên điểm danh/ngày/lớp học phần. | `TEACHER` |
| **API_TC_05** | Bảng điểm danh của buổi học | `GET` | `/api/teacher/attendance-sessions/{sessionId}/records` | *Headers: Authorization* | `[{"recordId": 201, "studentName": "...", ...}]` | Phiên điểm danh phải thuộc lớp giảng viên dạy. | `TEACHER` |
| **API_TC_06** | Lưu điểm danh thủ công | `PATCH` | `/api/teacher/attendance-records/{recordId}` | `{"status": "PRESENT/LATE/ABSENT"}` | `{"id": 201, "status": "PRESENT"}` | Bản ghi phải thuộc lớp do GV phụ trách giảng dạy. | `TEACHER` |
| **API_TC_07** | Danh sách học liệu đã đăng | `GET` | `/api/teacher/classes/{classSectionId}/materials` | *Headers: Authorization* | `[{"id": 55, "title": "Chương 1", ...}]` | Chỉ xem học liệu của lớp do chính mình dạy. | `TEACHER` |
| **API_TC_08** | Đăng tải học liệu môn học | `POST` | `/api/teacher/materials` | *Multipart: file, title, classSectionId* | `{"id": 55, "fileName": "...", "fileUrl": "..."}` | File tối đa 50MB. Hỗ trợ pdf, ppt, doc, video. | `TEACHER` |
| **API_TC_09** | Xóa học liệu | `DELETE` | `/api/teacher/materials/{id}` | *Headers: Authorization* | `{"success": true}` | Giảng viên chỉ xóa được tài liệu do chính mình đăng. | `TEACHER` |
| **API_TC_10** | Danh sách thông báo lớp HP | `GET` | `/api/teacher/classes/{classSectionId}/announcements` | *Headers: Authorization* | `[{"id": 33, "title": "...", "content": "..."}]` | Chỉ hiển thị thông báo của lớp giảng viên dạy. | `TEACHER` |
| **API_TC_11** | Đăng thông báo mới | `POST` | `/api/teacher/announcements` | `{"classSectionId": 101, "title": "...", "content": "..."}` | `{"id": 33, "title": "..."}` | Tiêu đề và Nội dung không được để trống. | `TEACHER` |
| **API_TC_12** | Xem danh sách bài tập đã giao | `GET` | `/api/teacher/classes/{classSectionId}/assignments` | *Headers: Authorization* | `[{"id": 77, "title": "Bài tập lớn 1", ...}]` | Xem bài tập của lớp do mình phụ trách. | `TEACHER` |
| **API_TC_13** | Tạo bài tập mới (Luận/Trắc nghiệm) | `POST` | `/api/teacher/assignments` | `{"title": "...", "dueAt": "...", "type": "essay/quiz"}` | `{"id": 77, "title": "...", "type": "quiz"}` | Hạn nộp bài (dueAt) phải lớn hơn thời gian hiện tại. | `TEACHER` |
| **API_TC_14** | Cập nhật bài tập | `PUT` | `/api/teacher/assignments/{id}` | `{"title": "...", "description": "...", "dueAt": "..."}` | `{"id": 77, "title": "..."}` | Chỉ chỉnh sửa được bài tập do chính mình tạo ra. | `TEACHER` |
| **API_TC_15** | Xóa bài tập | `DELETE` | `/api/teacher/assignments/{id}` | *Headers: Authorization* | `{"success": true}` | Hệ thống tự động xóa tất cả submissions đi kèm. | `TEACHER` |
| **API_TC_16** | Cấu hình đề & đáp án trắc nghiệm | `POST` | `/api/teacher/assignments/{id}/configure-quiz` | *Multipart: file đề, questionsJson* | `{"success": true}` | Bài tập phải có kiểu dữ liệu là quiz. | `TEACHER` |
| **API_TC_17** | Xem bài nộp của sinh viên | `GET` | `/api/teacher/assignments/{id}/submissions` | *Headers: Authorization* | `[{"id": 801, "studentName": "...", "status": "..."}]` | Trả về bài nộp của SV thuộc lớp GV phụ trách. | `TEACHER` |
| **API_TC_18** | Chấm điểm bài giải tự luận | `PATCH` | `/api/teacher/submissions/{id}/grade` | `{"score": 9.5, "feedback": "Bài làm tốt"}` | `{"id": 801, "score": 9.5, "status": "GRADED"}` | Điểm số phải từ 0 đến maxPoints bài tập. | `TEACHER` |
| **API_TC_19** | Xem bảng điểm tổng kết lớp | `GET` | `/api/teacher/classes/{classSectionId}/grades` | *Headers: Authorization* | `[{"studentId": 1, "studentName": "...", ...}]` | Trả về bảng điểm tổng kết của lớp học phần. | `TEACHER` |
| **API_TC_20** | Thiết lập trọng số môn học | `PUT` | `/api/teacher/classes/{classSectionId}/grade-components` | `[{"name": "Chuyên cần", "weightPercent": 10}, ...]` | `{"success": true}` | Tổng trọng số của tất cả các cột điểm phải = 100%. | `TEACHER` |

---

## 4. Phân Hệ Student (Sinh Viên)

| Mã API | Chức năng | Method | Endpoint | Dữ liệu đầu vào (Payload) | Dữ liệu đầu ra (Response) | Ràng buộc & Validate | Phân quyền |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **API_ST_01** | Xem lớp học phần đang học | `GET` | `/api/student/classes` | *Headers: Authorization* | `[{"id": 101, "subjectName": "...", ...}]` | Lọc các lớp sinh viên thực tế có tên trong học phần. | `STUDENT` |
| **API_ST_02** | Xem & Tải tệp học liệu | `GET` | `/api/student/classes/{id}/materials` | *Headers: Authorization* | `[{"id": 55, "title": "Bài giảng 1", ...}]` | Sinh viên phải có đăng ký lớp này mới được xem. | `STUDENT` |
| **API_ST_03** | Xem danh sách thông báo môn | `GET` | `/api/student/classes/{id}/announcements` | *Headers: Authorization* | `[{"id": 33, "title": "Nghỉ học", ...}]` | Lọc thông báo theo lớp học phần. | `STUDENT` |
| **API_ST_04** | Xem danh sách bài tập được giao | `GET` | `/api/student/classes/{id}/assignments` | *Headers: Authorization* | `[{"id": 77, "title": "...", "dueDate": "..."}]` | Lọc các bài tập thuộc lớp sinh viên đang tham gia. | `STUDENT` |
| **API_ST_05** | Lấy đề thi trắc nghiệm (Làm bài) | `GET` | `/api/student/assignments/{id}/questions` | *Headers: Authorization* | `[{"id": "q1", "questionText": "...", ...}]` | **Ẩn cột correctChoice** để tránh gian lận lộ đáp án. | `STUDENT` |
| **API_ST_06** | Nộp bài thi trắc nghiệm trực tuyến | `POST` | `/api/student/assignments/{id}/submit-quiz` | `{"answers": [{"questionId": "q1", "selectedChoice": "A"}]}` | `{"submissionId": 805, "score": 8.0, ...}` | Chỉ được nộp 1 lần. BE tự động so đáp án để tính điểm. | `STUDENT` |
| **API_ST_07** | Nộp lời giải bài tập tự luận | `POST` | `/api/student/assignments/{id}/submit-essay` | `{"content": "...", "fileUrl": "..."}` | `{"id": 806, "status": "SUBMITTED"}` | Cho phép nộp đè bài mới trước hạn chót. | `STUDENT` |
| **API_ST_08** | Điểm danh Face ID và vị trí GPS | `POST` | `/api/student/attendance/sessions/{id}/check-in` | `{"method": "gps", "latitude": 20.97, ...}` | `{"success": true, "status": "PRESENT"}` | Phiên đang mở (OPEN). GPS < 100m, Face ID khớp > 85%. | `STUDENT` |
| **API_ST_09** | Xem lịch sử điểm danh của môn | `GET` | `/api/student/classes/{id}/attendance-history` | *Headers: Authorization* | `[{"sessionTitle": "Buổi 1", "status": "..."}]` | Chỉ hiển thị lịch sử của sinh viên đang đăng nhập. | `STUDENT` |
| **API_ST_10** | Xem bảng điểm chi tiết học phần | `GET` | `/api/student/classes/{id}/grades` | *Headers: Authorization* | `{"components": [...], "finalScore": 8.6}` | Tự động tính điểm tổng kết finalScore theo trọng số. | `STUDENT` |
