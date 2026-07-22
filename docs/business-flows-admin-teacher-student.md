# Tổng hợp luồng nghiệp vụ của hệ thống quản lý học tập thông minh

Tài liệu này mô tả các luồng nghiệp vụ chính của ba vai trò người dùng trong prototype: Admin, Teacher và Student. Nội dung tập trung vào logic nghiệp vụ, trạng thái dữ liệu và các bước thao tác quan trọng, phù hợp với phiên bản frontend hiện tại và các tính năng mới như bài tập trắc nghiệm bằng ảnh và điểm danh bằng khuôn mặt.

---

## 1. Mục tiêu của tài liệu

- Làm rõ vai trò, trách nhiệm và quy trình của từng portal.
- Mô tả luồng dữ liệu từ đăng nhập, quản lý lớp học, điểm danh, bài tập, điểm số đến thông báo và trợ lý AI.
- Giữ sự nhất quán giữa thiết kế dữ liệu và trải nghiệm người dùng trong prototype.

---

## 2. Tổng quan hệ thống

Hệ thống gồm ba portal chính:

- Admin Portal: quản trị dữ liệu nền tảng, lớp học phần, thời khóa biểu, thời gian đăng ký và thông báo hệ thống.
- Teacher Portal: quản lý lớp mình phụ trách, điểm danh, tài liệu, bài tập, chấm điểm và phản hồi.
- Student Portal: đăng ký học phần, xem lịch học, theo dõi bài tập, làm bài và xem điểm số.

Các luồng chung bao gồm đăng nhập, lưu session, điều hướng theo vai trò và hiển thị toast thông báo sau mỗi thao tác quan trọng.

---

## 3. Luồng nghiệp vụ chung

### 3.1. Đăng nhập

1. Người dùng nhập tài khoản và mật khẩu.
2. Hệ thống kiểm tra thông tin trong danh sách người dùng.
3. Nếu hợp lệ, hệ thống lưu session, xác định vai trò và chuyển tới portal tương ứng.
4. Nếu không hợp lệ, hệ thống thông báo lỗi và cho phép nhập lại.

### 3.2. Đăng xuất

1. Người dùng chọn đăng xuất.
2. Hệ thống xóa session hiện tại.
3. Chuyển về màn hình đăng nhập.

### 3.3. Thông báo hệ thống

Sau các thao tác như tạo dữ liệu, nộp bài, điểm danh, lưu thông báo, hệ thống sẽ hiển thị toast để người dùng biết trạng thái thành công hay lỗi.

---

## 4. Luồng nghiệp vụ của Admin

### 4.1. Mục tiêu

Admin là người điều hành dữ liệu nền tảng của hệ thống và có trách nhiệm duy trì các thực thể vận hành chính.

### 4.2. Quản lý khoa và môn học

1. Admin mở chức năng quản lý khoa hoặc môn học.
2. Hệ thống hiển thị danh sách hiện có.
3. Admin có thể thêm, sửa hoặc xóa dữ liệu nếu phù hợp.
4. Sau khi lưu, thông tin được cập nhật ngay trong giao diện và có thể dùng cho các lớp học và sinh viên tiếp theo.

### 4.3. Quản lý lớp học phần

1. Admin mở màn hình lớp học phần.
2. Admin tạo hoặc cập nhật lớp học với các thông tin: môn học, giảng viên, phòng học, thời gian học, sức chứa.
3. Hệ thống lưu lớp học và cho phép giảng viên, sinh viên liên quan nhìn thấy lớp đó khi cần.

### 4.4. Quản lý thời gian đăng ký

1. Admin thiết lập khoảng thời gian mở/đóng đăng ký học phần.
2. Hệ thống lưu trạng thái thời gian đăng ký.
3. Khi đang mở, sinh viên có thể đăng ký; khi đã đóng, hệ thống chặn thao tác mới.

### 4.5. Quản lý thông báo

1. Admin tạo thông báo mới.
2. Admin chọn đối tượng nhận: tất cả, giảng viên, sinh viên hoặc một lớp học cụ thể.
3. Thông báo được lưu và hiển thị trong portal phù hợp.

---

## 5. Luồng nghiệp vụ của Teacher

### 5.1. Mục tiêu

Teacher là người trực tiếp giảng dạy, quản lý lớp học và theo dõi tiến độ học tập của sinh viên.

### 5.2. Quản lý lớp học của mình

1. Teacher đăng nhập và vào Teacher Portal.
2. Hệ thống hiển thị danh sách lớp học phần mà teacher phụ trách.
3. Teacher chọn một lớp để xem danh sách sinh viên, lịch học, bài tập và tài liệu liên quan.

### 5.3. Điểm danh

1. Teacher mở mục điểm danh cho một buổi học.
2. Hệ thống tạo một phiên điểm danh mới.
3. Teacher chọn trạng thái cho từng sinh viên: present, late, absent hoặc excused.
4. Nếu dùng phương thức face match, teacher có thể ghi nhận ảnh khuôn mặt đi kèm trong bản ghi điểm danh.
5. Hệ thống lưu kết quả và cập nhật lịch sử chuyên cần.

### 5.4. Đăng tải tài liệu học tập

1. Teacher chọn lớp học phần.
2. Teacher tải tài liệu như slide, bài giảng hoặc giáo trình.
3. Hệ thống lưu thông tin và tạo đường dẫn tải xuống cho sinh viên.

### 5.5. Giao bài tập

1. Teacher tạo một bài tập mới cho lớp học.
2. Teacher có thể chọn loại bài tập là essay hoặc quiz.
3. Với bài tập quiz, teacher nhập các câu hỏi, gắn ảnh minh họa, chọn đáp án đúng và lưu danh sách câu hỏi.
4. Sinh viên sau đó có thể mở bài quiz từ Student Portal để trả lời.

### 5.6. Chấm điểm và phản hồi

1. Teacher mở danh sách bài nộp của một bài tập.
2. Teacher xem nội dung, câu trả lời quiz hoặc file đính kèm nếu có.
3. Teacher nhập điểm và nhận xét.
4. Hệ thống cập nhật điểm số và trạng thái bài nộp thành graded.

### 5.7. Quản lý điểm số tổng hợp

1. Teacher mở bảng điểm lớp học.
2. Teacher cập nhật điểm chuyên cần, điểm giữa kỳ, điểm cuối kỳ hoặc các thành phần điểm khác.
3. Hệ thống lưu cấu trúc điểm theo component và hỗ trợ tính toán điểm tổng kết theo thang điểm 4 hoặc thang điểm 10.

---

## 6. Luồng nghiệp vụ của Student

### 6.1. Mục tiêu

Student tham gia học tập bằng cách đăng ký lớp, xem tài liệu, làm bài tập, tham gia điểm danh và theo dõi kết quả học tập.

### 6.2. Đăng ký học phần

1. Student mở chức năng đăng ký học phần.
2. Hệ thống hiển thị các lớp đang mở đăng ký.
3. Student chọn lớp phù hợp.
4. Nếu lớp còn chỗ và thời gian đăng ký còn mở, hệ thống ghi nhận sinh viên vào lớp.
5. Nếu không hợp lệ, hệ thống báo lỗi và từ chối thao tác.

### 6.3. Xem thời khóa biểu và lịch học

1. Student mở màn hình lịch học.
2. Hệ thống hiển thị các lớp đang tham gia theo ngày và giờ.
3. Student có thể theo dõi các buổi học, bài tập và thông báo liên quan.

### 6.4. Tham gia điểm danh

1. Student mở màn hình điểm danh hoặc được giáo viên gọi tên trong buổi học.
2. Nếu hệ thống dùng phương thức face match, sinh viên có thể đăng ký mẫu ảnh khuôn mặt trước để hỗ trợ xác thực.
3. Kết quả điểm danh được lưu và có thể xem trong hồ sơ học tập.

### 6.5. Làm bài tập và nộp bài

1. Student mở danh sách bài tập của các lớp đang học.
2. Với bài tập essay, student nhập nội dung và nộp file nếu cần.
3. Với bài tập quiz, student mở giao diện trả lời câu hỏi bằng ảnh, chọn đáp án cho từng câu và nộp bài.
4. Hệ thống lưu câu trả lời, tạo submission mới và đồng bộ điểm số khi giáo viên chấm.

### 6.6. Xem điểm số và GPA

1. Student mở mục điểm số hoặc tiến độ học tập.
2. Hệ thống hiển thị điểm thành phần và điểm tổng kết.
3. Nếu có cấu trúc điểm theo component, hệ thống có thể tính điểm trung bình theo công thức phù hợp với quy định của trường, bao gồm thang điểm 4 hoặc thang điểm 10.

### 6.7. Tương tác với trợ lý AI

1. Student có thể mở giao diện AI hỗ trợ học tập từ portal của mình.
2. Trợ lý có thể trả lời câu hỏi về bài học, bài tập, lịch học, điểm số hoặc hướng dẫn cách học.
3. Tất cả các tương tác được lưu trong hội thoại để tiện theo dõi lại sau này.

---

## 7. Các dữ liệu cốt lõi và trạng thái

- User: tài khoản đăng nhập, vai trò, trạng thái hoạt động.
- Department / Subject: cấu trúc tổ chức môn học và khoa.
- Student / Teacher: hồ sơ cá nhân gắn với tài khoản.
- ClassSection / Enrollment: lớp học phần và sinh viên tham gia.
- AttendanceSession / AttendanceRecord: phiên và kết quả điểm danh.
- Assignment / QuizQuestion / QuizAnswer / Submission: bài tập và câu trả lời.
- Grade / GradeComponent / GradeComponentScore: điểm số và cách tính tổng kết.
- Announcement / Document / OCRResult: thông báo và tài liệu hỗ trợ.

Những dữ liệu này là nền tảng để hệ thống prototype hiển thị đầy đủ các luồng nghiệp vụ của Admin, Teacher và Student mà không cần triển khai backend hoàn chỉnh ngay lập tức.

#### Mục đích
Giúp sinh viên theo dõi các lớp mình đã đăng ký.

#### Luồng nghiệp vụ
1. Student mở chức năng lịch học.
2. Hệ thống lấy danh sách lớp đã đăng ký và hiển thị theo thời gian.
3. Student có thể xem thông tin: môn học, giảng viên, phòng học, giờ học.

### 6.5. Học tập qua tài liệu

#### Mục đích
Sinh viên xem và tải tài liệu học tập từ giảng viên.

#### Luồng nghiệp vụ
1. Student chọn một lớp học.
2. Hệ thống hiện danh sách tài liệu học tập của lớp đó.
3. Student có thể:
   - xem trước tài liệu,
   - tải xuống,
   - đọc nội dung.

### 6.6. Tham gia điểm danh

#### Mục đích
Xác nhận sinh viên có mặt trong buổi học.

#### Luồng nghiệp vụ
1. Teacher mở phiên điểm danh cho lớp.
2. Student vào mục điểm danh.
3. Hệ thống hiển thị phiên điểm danh đang mở.
4. Student chọn phương thức điểm danh:
   - GPS,
   - Face ID hoặc hình thức giả lập.
5. Nếu thành công, hệ thống ghi nhận sinh viên là có mặt.
6. Nếu đã điểm danh rồi, hệ thống báo đã điểm danh trước đó.

### 6.7. Làm bài tập và nộp bài

#### Mục đích
Thu thập kết quả học tập từ sinh viên.

#### Luồng nghiệp vụ
1. Student mở bài tập của một lớp.
2. Nếu là bài tự luận:
   - student nhập câu trả lời,
   - nhấn nộp bài.
3. Nếu là bài trắc nghiệm:
   - student làm bài trong thời gian quy định,
   - hệ thống tự động chấm hoặc chấm sau khi nộp.
4. Hệ thống lưu bài nộp và cập nhật trạng thái thành chờ chấm hoặc đã chấm.

#### Trạng thái bài nộp
- chưa nộp,
- đã nộp chờ chấm,
- đã chấm điểm.

### 6.8. Xem kết quả học tập

#### Mục đích
Cho phép sinh viên theo dõi tiến độ và điểm số.

#### Luồng nghiệp vụ
1. Student mở mục điểm số hoặc tiến độ học tập.
2. Hệ thống hiển thị điểm số của các lớp đã đăng ký.
3. Student có thể xem:
   - điểm chuyên cần,
   - điểm giữa kỳ,
   - điểm cuối kỳ,
   - điểm tổng hợp.

### 6.9. Tương tác với AI Study Buddy

#### Mục đích
Hỗ trợ sinh viên giải đáp câu hỏi học tập nhanh chóng.

#### Luồng nghiệp vụ
1. Student nhập câu hỏi vào khung chat AI.
2. Hệ thống gửi câu hỏi đến API AI.
3. AI trả lời bằng tiếng Việt, theo ngữ cảnh môn học và hướng dẫn học tập.
4. Student có thể dùng kết quả để hiểu bài, luyện tập hoặc tìm cách giải quyết vấn đề.

### 6.10. Cập nhật hồ sơ cá nhân

#### Mục đích
Cập nhật thông tin cá nhân của sinh viên.

#### Luồng nghiệp vụ
1. Student mở mục hồ sơ.
2. Student chỉnh sửa thông tin như email, số điện thoại, tên hiển thị.
3. Hệ thống cập nhật lại hồ sơ và phản ánh trên giao diện.

---

## 7. Các luồng liên quan chéo giữa 3 vai trò

### 7.1. Luồng thông báo

- Admin có thể gửi thông báo tới toàn trường hoặc một lớp học.
- Teacher có thể gửi thông báo tới lớp mình phụ trách.
- Student nhận thông báo và xem trong giao diện hệ thống.

### 7.2. Luồng dữ liệu học tập

- Admin tạo lớp học và gán giảng viên.
- Teacher đăng tài liệu và giao bài tập cho lớp.
- Student tham gia lớp và thực hiện các hoạt động học tập.

### 7.3. Luồng điểm số

- Teacher chấm bài và nhập điểm.
- Student xem lại điểm.
- Admin có thể theo dõi tổng thể dữ liệu học vụ.

---

## 8. Các trạng thái nghiệp vụ chính

Một số trạng thái thường xuyên xuất hiện trong hệ thống:

- User status: active / suspended
- Registration period: open / closed
- Class status: active / completed / cancelled
- Attendance session: open / closed
- Attendance record: present / late / absent
- Assignment status: pending / submitted / graded
- Submission status: submitted / graded
- Notification status: active / archived

---

## 9. Kết luận

Hệ thống này có thể được hiểu như một nền tảng mô phỏng quy trình quản lý học tập trong trường đại học, với 3 vai trò chính:

- Admin: điều phối và quản trị dữ liệu chung.
- Teacher: triển khai giảng dạy và quản lý lớp học.
- Student: tham gia học tập, nộp bài và theo dõi kết quả.

Đây là một prototype phù hợp để minh họa nghiệp vụ, kiểm thử trải nghiệm người dùng và chuẩn bị cho việc triển khai backend sau này.
