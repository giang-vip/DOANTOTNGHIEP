# Tổng hợp luồng nghiệp vụ của hệ thống quản lý học tập thông minh

Tài liệu này mô tả chi tiết các luồng nghiệp vụ chính của 3 vai trò người dùng trong dự án: Admin, Teacher và Student. Đây là tài liệu dành cho prototype frontend, nên tập trung vào logic nghiệp vụ, quy trình thao tác và trạng thái dữ liệu, chưa phải bản thiết kế backend hoàn chỉnh.

---

## 1. Mục tiêu của tài liệu

Mục tiêu của tài liệu là làm rõ:

- Vai trò của từng đối tượng người dùng trong hệ thống.
- Các bước thao tác chính từ khi đăng nhập cho đến khi hoàn tất nghiệp vụ.
- Các dữ liệu liên quan và trạng thái thay đổi sau mỗi thao tác.
- Mối liên kết giữa các module: người dùng, lớp học, điểm danh, bài tập, điểm số, thông báo và AI hỗ trợ học tập.

---

## 2. Tổng quan hệ thống

Hệ thống được tổ chức theo mô hình gồm 3 portal chính:

- Admin Portal: dành cho quản trị viên hệ thống.
- Teacher Portal: dành cho giảng viên.
- Student Portal: dành cho sinh viên.

Mỗi portal có các màn hình chuyên biệt, nhưng đều chia sẻ một số luồng chung như:

- Đăng nhập và xác thực người dùng.
- Lưu session người dùng.
- Điều hướng tới màn hình phù hợp theo vai trò.
- Hiển thị thông báo và trạng thái xử lý.

---

## 3. Luồng nghiệp vụ chung cho toàn hệ thống

### 3.1. Đăng nhập

Luồng chung bắt đầu khi người dùng mở ứng dụng.

1. Người dùng nhập tên đăng nhập và mật khẩu.
2. Hệ thống kiểm tra tài khoản trong danh sách người dùng.
3. Nếu tài khoản tồn tại và mật khẩu đúng:
   - hệ thống lưu session người dùng,
   - xác định vai trò của người dùng,
   - chuyển hướng vào portal tương ứng.
4. Nếu sai thông tin:
   - hệ thống báo lỗi,
   - người dùng có thể nhập lại.

### 3.2. Đăng xuất

1. Người dùng chọn nút đăng xuất.
2. Hệ thống xóa session hiện tại.
3. Chuyển về màn hình đăng nhập.

### 3.3. Quản lý thông báo toàn cục

Sau một số thao tác quan trọng, hệ thống có thể hiển thị toast thông báo như:

- đăng nhập thành công,
- thêm mới dữ liệu thành công,
- lỗi nhập liệu,
- nộp bài thành công,
- điểm danh thành công.

---

## 4. Luồng nghiệp vụ của Admin

Admin là người giữ vai trò điều hành và quản lý dữ liệu nền tảng của hệ thống.

### 4.1. Mục tiêu chính của Admin

Admin có trách nhiệm quản trị các dữ liệu sau:

- người dùng và tài khoản đăng nhập,
- khoa/ban chuyên môn,
- môn học,
- lớp học phần,
- giảng viên,
- sinh viên,
- thời gian đăng ký học phần,
- thông báo hệ thống.

### 4.2. Luồng đăng nhập và vào Dashboard

1. Admin đăng nhập thành công.
2. Hệ thống chuyển tới Dashboard admin.
3. Admin có thể nhìn tổng quan về:
   - số lượng sinh viên,
   - số lượng giảng viên,
   - số lượng lớp học,
   - số lượng môn học,
   - các thông báo gần đây.

### 4.3. Quản lý khoa

#### Mục đích
Quản lý thông tin các khoa của trường.

#### Luồng nghiệp vụ
1. Admin mở chức năng quản lý khoa.
2. Hệ thống hiển thị danh sách khoa hiện có.
3. Admin có thể:
   - thêm mới khoa,
   - chỉnh sửa thông tin khoa,
   - xóa khoa nếu chưa được dùng.
4. Sau khi lưu, hệ thống cập nhật dữ liệu và hiển thị thông báo thành công.

#### Dữ liệu quan trọng
- mã khoa,
- tên khoa,
- mô tả chuyên môn.

### 4.4. Quản lý môn học

#### Mục đích
Quản lý danh sách các môn học trong trường.

#### Luồng nghiệp vụ
1. Admin mở chức năng môn học.
2. Hệ thống hiển thị danh sách môn học.
3. Admin có thể:
   - thêm môn học mới,
   - chỉnh sửa thông tin môn học,
   - xóa môn học không còn sử dụng.
4. Hệ thống cập nhật dữ liệu và làm mới giao diện.

#### Dữ liệu quan trọng
- mã môn học,
- tên môn học,
- số tín chỉ,
- khoa phụ trách.

### 4.5. Quản lý lớp học phần

#### Mục đích
Quản lý các lớp học phần được mở trong từng học kỳ.

#### Luồng nghiệp vụ
1. Admin mở chức năng lớp học.
2. Hệ thống hiển thị danh sách các lớp học phần.
3. Admin có thể tạo lớp học mới với các thông tin:
   - mã lớp,
   - môn học,
   - giảng viên phụ trách,
   - phòng học,
   - thời gian học,
   - sức chứa lớp.
4. Admin có thể chỉnh sửa thông tin lớp hoặc xóa lớp nếu cần.
5. Sau khi lưu, hệ thống cập nhật danh sách lớp học và có thể ảnh hưởng đến việc sinh viên đăng ký.

#### Dữ liệu quan trọng
- mã lớp,
- môn học,
- giảng viên,
- lịch học,
- phòng học,
- số lượng tối đa sinh viên.

### 4.6. Quản lý giảng viên

#### Mục đích
Quản lý hồ sơ giảng viên và tài khoản đăng nhập liên kết.

#### Luồng nghiệp vụ
1. Admin mở mục quản lý giảng viên.
2. Hệ thống hiển thị danh sách giảng viên.
3. Admin có thể:
   - thêm giảng viên mới,
   - cập nhật thông tin cá nhân,
   - xóa hoặc khóa tài khoản giảng viên bằng thao tác vô hiệu hóa (soft delete),
   - đổi trạng thái hoạt động trực tiếp từ giao diện quản trị bằng các giá trị: Đang làm, Tạm nghỉ,
   - gắn giảng viên vào khoa và lớp học tương ứng.
4. Khi thêm mới giảng viên, hệ thống đồng thời tạo tài khoản đăng nhập cho họ.

#### Dữ liệu quan trọng
- mã giảng viên,
- tên,
- email,
- số điện thoại,
- khoa,
- trạng thái hoạt động.

### 4.7. Quản lý sinh viên

#### Mục đích
Quản lý hồ sơ sinh viên và tài khoản đăng nhập.

#### Luồng nghiệp vụ
1. Admin mở mục quản lý sinh viên.
2. Hệ thống hiển thị danh sách sinh viên.
3. Admin có thể:
   - thêm sinh viên mới,
   - cập nhật thông tin cá nhân,
   - xóa hoặc khóa tài khoản sinh viên bằng thao tác vô hiệu hóa (soft delete),
   - thay đổi trạng thái hoạt động trực tiếp từ giao diện quản trị bằng các giá trị: Đang học, Tạm nghỉ, Thôi học, Đã tốt nghiệp,
   - gắn sinh viên vào lớp học hoặc khóa học phù hợp.
4. Khi sinh viên được tạo mới, hệ thống tạo tài khoản đăng nhập riêng cho họ.

#### Dữ liệu quan trọng
- mã sinh viên,
- tên,
- email,
- lớp, khóa học,
- trạng thái hoạt động.

### 4.8. Quản lý thời gian đăng ký học phần

#### Mục đích
Kiểm soát thời gian mà sinh viên được phép đăng ký lớp học.

#### Luồng nghiệp vụ
1. Admin mở chức năng đăng ký học phần.
2. Admin thiết lập khoảng thời gian mở/đóng đăng ký.
3. Hệ thống lưu trạng thái thời gian đăng ký.
4. Khi đến thời điểm mở, sinh viên có thể đăng ký lớp.
5. Khi kết thúc, hệ thống chặn đăng ký mới.

### 4.9. Quản lý thông báo hệ thống

#### Mục đích
Gửi thông báo chung tới đối tượng phù hợp.

#### Luồng nghiệp vụ
1. Admin tạo thông báo mới.
2. Admin chọn đối tượng nhận:
   - tất cả,
   - giảng viên,
   - sinh viên,
   - một lớp học cụ thể.
3. Hệ thống lưu thông báo và hiển thị cho người dùng liên quan.

---

## 5. Luồng nghiệp vụ của Teacher

Teacher là người trực tiếp tham gia giảng dạy và quản lý lớp học.

### 5.1. Mục tiêu chính của Teacher

Teacher có trách nhiệm:

- xem các lớp mình phụ trách,
- quản lý điểm danh,
- đăng tải tài liệu học tập,
- giao bài tập,
- chấm điểm và phản hồi,
- cập nhật hồ sơ cá nhân.

### 5.2. Luồng đăng nhập và vào Teacher Portal

1. Teacher đăng nhập thành công.
2. Hệ thống chuyển tới Teacher Portal.
3. Teacher nhìn thấy các lớp học phần mà mình phụ trách.

### 5.3. Quản lý lớp học của mình

#### Mục đích
Teacher theo dõi và quản lý các lớp mình giảng dạy.

#### Luồng nghiệp vụ
1. Teacher chọn một lớp học.
2. Hệ thống hiển thị danh sách sinh viên trong lớp.
3. Teacher có thể xem thông tin lớp, lịch học, phòng học và các hoạt động liên quan.
4. Teacher có thể chọn chuyển sang các chức năng khác như điểm danh, bài tập, tài liệu, điểm số.

### 5.4. Quản lý điểm danh

#### Mục đích
Theo dõi trạng thái có mặt hoặc vắng mặt của sinh viên trong buổi học.

#### Luồng nghiệp vụ
1. Teacher mở chức năng điểm danh cho một lớp.
2. Hệ thống tạo một phiên điểm danh mới.
3. Teacher chọn trạng thái cho từng sinh viên:
   - có mặt,
   - muộn,
   - vắng mặt.
4. Sau khi lưu, hệ thống ghi nhận kết quả vào lịch sử điểm danh.
5. Kết quả này có thể được dùng để thống kê chuyên cần.

#### Trạng thái nghiệp vụ
- phiên điểm danh đang mở,
- phiên điểm danh đã đóng,
- sinh viên đã điểm danh,
- sinh viên vắng mặt.

### 5.5. Đăng tải tài liệu học tập

#### Mục đích
Cung cấp tài liệu cho sinh viên trong lớp.

#### Luồng nghiệp vụ
1. Teacher chọn lớp học phần.
2. Teacher tải lên tài liệu như slide, bài giảng, giáo trình hoặc file hỗ trợ.
3. Hệ thống lưu thông tin tài liệu và gắn với lớp học đó.
4. Sinh viên trong lớp có thể xem hoặc tải tài liệu.

#### Dữ liệu quan trọng
- tên tài liệu,
- loại file,
- mô tả,
- thời gian đăng tải,
- lớp học liên quan.

### 5.6. Giao bài tập

#### Mục đích
Giao nhiệm vụ học tập cho sinh viên.

#### Luồng nghiệp vụ
1. Teacher chọn lớp học.
2. Teacher tạo bài tập mới với các thông tin:
   - tiêu đề,
   - mô tả yêu cầu,
   - hạn nộp,
   - thang điểm.
3. Hệ thống lưu bài tập và hiển thị cho sinh viên thuộc lớp.
4. Sinh viên có thể xem và làm bài.

### 5.7. Chấm điểm và phản hồi

#### Mục đích
Theo dõi kết quả làm bài của sinh viên.

#### Luồng nghiệp vụ
1. Teacher mở danh sách bài nộp của một bài tập.
2. Teacher xem nội dung bài làm của từng sinh viên.
3. Teacher nhập điểm và nhận xét.
4. Hệ thống lưu điểm và cập nhật trạng thái bài nộp thành đã chấm.
5. Sinh viên có thể xem kết quả và nhận xét từ giảng viên.

### 5.8. Quản lý điểm số tổng hợp

#### Mục đích
Theo dõi điểm thành phần và tổng kết học phần.

#### Luồng nghiệp vụ
1. Teacher xem bảng điểm cho lớp học.
2. Teacher cập nhật điểm chuyên cần, điểm giữa kỳ, điểm cuối kỳ hoặc điểm thành phần khác.
3. Hệ thống lưu các điểm này và cho phép truy xuất lại khi cần.

### 5.9. Cập nhật hồ sơ cá nhân

#### Mục đích
Cập nhật thông tin cá nhân của giảng viên.

#### Luồng nghiệp vụ
1. Teacher mở phần hồ sơ.
2. Teacher chỉnh sửa thông tin như email, số điện thoại, tên hiển thị.
3. Hệ thống cập nhật dữ liệu và phản ánh lại trong tài khoản.

---

## 6. Luồng nghiệp vụ của Student

Student là người dùng trực tiếp tham gia quá trình học tập.

### 6.1. Mục tiêu chính của Student

Student có trách nhiệm:

- đăng nhập vào hệ thống,
- đăng ký học phần,
- xem thời khóa biểu và lịch học,
- xem tài liệu học tập,
- tham gia điểm danh,
- làm bài tập và nộp bài,
- xem điểm số,
- tương tác với trợ lý AI học tập.

### 6.2. Luồng đăng nhập và vào Student Portal

1. Student đăng nhập thành công.
2. Hệ thống chuyển tới Student Portal.
3. Student nhìn thấy màn hình tổng quan và danh sách lớp học đang tham gia.

### 6.3. Đăng ký học phần

#### Mục đích
Cho phép sinh viên chọn lớp học phù hợp trong kỳ học.

#### Luồng nghiệp vụ
1. Student vào chức năng đăng ký học phần.
2. Hệ thống hiển thị các lớp học đang mở đăng ký.
3. Student chọn lớp phù hợp.
4. Hệ thống kiểm tra:
   - lớp còn chỗ,
   - thời gian đăng ký còn mở,
   - sinh viên chưa đăng ký lớp này.
5. Nếu hợp lệ, hệ thống ghi nhận sinh viên vào lớp.
6. Nếu không hợp lệ, hệ thống báo lỗi hoặc từ chối đăng ký.

#### Kết quả sau khi đăng ký
- sinh viên xuất hiện trong danh sách học viên của lớp,
- hệ thống tạo dữ liệu liên quan như lịch học, điểm danh và bài tập cho lớp.

### 6.4. Xem thời khóa biểu và lịch học

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
