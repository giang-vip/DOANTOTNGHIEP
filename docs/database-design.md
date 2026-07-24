# Thiết kế database cho hệ thống quản lý học tập trường học

Tài liệu này mô tả thiết kế database theo chuẩn production-ready, tập trung vào tính nhất quán dữ liệu, ràng buộc khóa ngoại và kiểm tra dữ liệu đầu vào. Mục tiêu là làm cho schema có thể dùng trực tiếp cho backend chính thức, không chỉ là mock-up demo.

## 1. Nguyên tắc thiết kế

- Mỗi thực thể có khóa chính duy nhất.
- Tránh dữ liệu lặp không cần thiết theo nguyên tắc 3NF.
- Tách rõ nghiệp vụ thành các module: người dùng, học vụ, lớp học, điểm danh, bài tập, điểm số và tài liệu mở rộng.
- Tất cả quan hệ nhiều-nhiều phải qua bảng trung gian.
- Dùng ràng buộc `CHECK`, `ENUM`, `UNIQUE`, `INDEX` để giảm sai dữ liệu và tăng hiệu năng truy vấn.
- `schema.sql` là nguồn phát triển chính; tài liệu này phải đồng bộ với SQL để mọi bên cùng thực hiện.

## 2. Các module chính

1. Người dùng và phân quyền
2. Cơ cấu tổ chức và học vụ
3. Sinh viên, giảng viên, lớp học
4. Môn học và lớp học phần
5. Đăng ký học phần, điểm danh
6. Bài tập, bài quiz, nộp bài, chấm điểm
7. Tài liệu, thông báo, OCR, chat AI mở rộng

## 3. Danh sách bảng chính

### 3.1. Người dùng và phân quyền

#### users
- `id`: bigint PK
- `username`: varchar(50) unique
- `password_hash`: varchar(255)
- `email`: varchar(255) unique
- `phone`: varchar(20)
- `full_name`: varchar(255)
- `avatar_url`: varchar(500)
- `status`: enum(`ACTIVE`, `INACTIVE`, `LOCKED`)
- `created_at`, `updated_at`: timestamp

#### roles
- `id`: bigint PK
- `name`: varchar(50) unique
- `description`: varchar(255)

#### user_roles
- `user_id`: bigint FK -> `users.id`
- `role_id`: bigint FK -> `roles.id`
- PK(`user_id`, `role_id`)

### 3.2. Cơ cấu tổ chức

#### departments
- `id`: bigint PK
- `code`: varchar(50) unique
- `name`: varchar(255)
- `description`: text

### 3.3. Học vụ

#### academic_years
- `id`: bigint PK
- `code`: varchar(20) unique
- `start_date`, `end_date`: date
- `is_current`: boolean
- Ràng buộc: `start_date <= end_date`

#### semesters
- `id`: bigint PK
- `academic_year_id`: bigint FK -> `academic_years.id`
- `code`, `name`
- `start_date`, `end_date`
- `is_current`: boolean
- Unique(`academic_year_id`, `code`)
- Ràng buộc: `start_date <= end_date`

### 3.4. Sinh viên, giảng viên và lớp

#### teachers
- `id`: bigint PK
- `user_id`: bigint FK -> `users.id` unique
- `teacher_code`: varchar(50) unique
- `full_name`
- `gender`: enum(`MALE`, `FEMALE`, `OTHER`)
- `department_id`: bigint FK -> `departments.id`
- `title`
- `status`: enum(`ACTIVE`, `INACTIVE`, `ON_LEAVE`)
- `created_at`

#### classes
- `id`: bigint PK
- `code`: varchar(50) unique
- `name`
- `department_id`: bigint FK -> `departments.id`
- `entry_academic_year_id`: bigint FK -> `academic_years.id`
- `homeroom_teacher_id`: bigint FK -> `teachers.id`
- `status`: enum(`ACTIVE`, `CLOSED`, `ARCHIVED`)
- `created_at`

#### students
- `id`: bigint PK
- `user_id`: bigint FK -> `users.id` unique
- `student_code`: varchar(50) unique
- `full_name`
- `gender`: enum(`MALE`, `FEMALE`, `OTHER`)
- `date_of_birth`
- `address`
- `department_id`: bigint FK -> `departments.id`
- `class_id`: bigint FK -> `classes.id`
- `status`: enum(`ACTIVE`, `INACTIVE`, `GRADUATED`, `DROPPED`)
- `created_at`

### 3.5. Môn học và lớp học phần

#### subjects
- `id`: bigint PK
- `code`: varchar(50) unique
- `name`
- `credits`: int, `credits > 0`
- `department_id`: bigint FK -> `departments.id`
- `description`

#### class_sections
- `id`: bigint PK
- `class_id`: bigint FK -> `classes.id`
- `subject_id`: bigint FK -> `subjects.id`
- `teacher_id`: bigint FK -> `teachers.id`
- `section_code`: varchar(50) unique
- `room`
- `weekday`: int, `1..7`
- `start_time`, `end_time`: time
- `start_date`, `end_date`: date
- `capacity`: int, `capacity > 0`
- `status`: enum(`ACTIVE`, `CANCELLED`, `COMPLETED`)
- `semester_id`: bigint FK -> `semesters.id`
- Ràng buộc: `start_time < end_time`, `start_date <= end_date`

### 3.6. Đăng ký học phần

#### enrollments
- `id`: bigint PK
- `student_id`: bigint FK -> `students.id`
- `class_section_id`: bigint FK -> `class_sections.id`
- `enrolled_at`
- `status`: enum(`ACTIVE`, `WITHDRAWN`, `COMPLETED`)
- `note`
- Unique(`student_id`, `class_section_id`)

### 3.7. Điểm danh

#### attendance_sessions
- `id`: bigint PK
- `class_section_id`: bigint FK -> `class_sections.id`
- `session_date`
- `title`
- `status`: enum(`OPEN`, `CLOSED`, `CANCELLED`)
- `created_by`: bigint FK -> `users.id`
- `created_at`

#### attendance_records
- `id`: bigint PK
- `attendance_session_id`: bigint FK -> `attendance_sessions.id`
- `enrollment_id`: bigint FK -> `enrollments.id`
- `status`: enum(`PRESENT`, `ABSENT`, `LATE`, `EXCUSED`)
- `note`
- `checked_at`
- `checked_by`: bigint FK -> `users.id`
- Unique(`attendance_session_id`, `enrollment_id`)

### 3.8. Bài tập và điểm số

#### assignments
- `id`: bigint PK
- `class_section_id`: bigint FK -> `class_sections.id`
- `title`
- `description`
- `due_at`
- `max_points`: decimal(5,2)
- `type`: enum(`essay`, `quiz`)
- `exam_file_url`, `exam_file_name`
- `exam_file_type`: enum(`pdf`, `image`)
- `question_count`
- `created_by`: bigint FK -> `users.id`
- `created_at`

#### quiz_questions
- `id`: bigint PK
- `assignment_id`: bigint FK -> `assignments.id`
- `order_index`
- `correct_choice`: enum(`A`, `B`, `C`, `D`)
- `points`: decimal(5,2)
- `explanation_text`
- `question_text`
- `choice_a_text`, `choice_b_text`, `choice_c_text`, `choice_d_text`
- `ocr_status`: enum(`NOT_PROCESSED`, `IN_PROGRESS`, `COMPLETED`, `FAILED`)
- `ocr_extracted_text`

#### submissions
- `id`: bigint PK
- `assignment_id`: bigint FK -> `assignments.id`
- `enrollment_id`: bigint FK -> `enrollments.id`
- `content`
- `file_url`
- `submitted_at`
- `score`: decimal(5,2)
- `feedback`
- `status`: enum(`SUBMITTED`, `IN_REVIEW`, `GRADED`, `LATE`)
- Unique(`assignment_id`, `enrollment_id`)

#### quiz_answers
- `id`: bigint PK
- `submission_id`: bigint FK -> `submissions.id`
- `question_id`: bigint FK -> `quiz_questions.id`
- `selected_choice`: enum(`A`, `B`, `C`, `D`)
- `is_correct`: boolean
- Unique(`submission_id`, `question_id`)

#### grade_components
- `id`: bigint PK
- `class_section_id`: bigint FK -> `class_sections.id`
- `name`
- `weight_percent`: decimal(5,2)
- `order_index`

#### grade_component_scores
- `id`: bigint PK
- `enrollment_id`: bigint FK -> `enrollments.id`
- `component_id`: bigint FK -> `grade_components.id`
- `score`
- Unique(`enrollment_id`, `component_id`)

#### grades
- `id`: bigint PK
- `enrollment_id`: bigint FK -> `enrollments.id`
- `final_score`
- `gpa_4_scale`
- `updated_at`

### 3.9. Tài liệu, thông báo và AI mở rộng

#### learning_materials
- `id`: bigint PK
- `class_section_id`: bigint FK -> `class_sections.id`
- `title`
- `file_name`
- `file_url`
- `mime_type`
- `uploaded_by`: bigint FK -> `users.id`
- `uploaded_at`

#### announcements
- `id`: bigint PK
- `class_section_id`: bigint FK -> `class_sections.id`
- `title`
- `content`
- `created_by`: bigint FK -> `users.id`
- `created_at`

#### documents
- `id`: bigint PK
- `owner_type`
- `owner_id`
- `file_name`
- `storage_key`
- `mime_type`
- `uploaded_by`: bigint FK -> `users.id`
- `uploaded_at`
- `status`: enum(`UPLOADED`, `PROCESSING`, `PROCESSED`, `FAILED`)

#### ocr_results
- `id`: bigint PK
- `document_id`: bigint FK -> `documents.id`
- `raw_text`
- `confidence_score`
- `language`
- `created_at`

#### chat_conversations
- `id`: bigint PK
- `user_id`: bigint FK -> `users.id`
- `title`
- `created_at`
- `updated_at`
- `status`: enum(`ACTIVE`, `ARCHIVED`)

#### chat_messages
- `id`: bigint PK
- `conversation_id`: bigint FK -> `chat_conversations.id`
- `sender_id`: bigint FK -> `users.id`
- `sender_type`: enum(`USER`, `SYSTEM`, `AI`)
- `message_type`: enum(`TEXT`, `IMAGE`, `FILE`)
- `content`
- `created_at`

## 4. Mối quan hệ chính

- Một `user` có nhiều `role` thông qua `user_roles`.
- Một `student` chỉ thuộc một `user`.
- Một `teacher` chỉ thuộc một `user`.
- Một `department` có nhiều `students`, `teachers`, `subjects` và `classes`.
- Một `class` có nhiều `class_sections`.
- Một `class_section` thuộc một `class`, một `subject`, một `teacher` và một `semester`.
- Một `student` có thể đăng ký nhiều `class_section` thông qua `enrollments`.
- Một `attendance_session` thuộc một `class_section`, và mỗi `attendance_record` tương ứng với một `enrollment`.
- Một `assignment` thuộc một `class_section`.
- Một `submission` thuộc một `enrollment` của một `assignment`.
- Một `grade_component` thuộc một `class_section`, và mỗi `grade_component_score` thuộc một `enrollment` và một `component`.

## 5. Những điểm đã được chỉnh để phù hợp production

- Sửa thứ tự tạo bảng để tránh lỗi FK tham chiếu table chưa tồn tại.
- Đồng bộ lại mối quan hệ `students` → `classes` theo đúng phần định nghĩa trong SQL.
- Bỏ trường `class_code` denormalize trong `students` để tránh dữ liệu dư thừa.
- Thêm `CHECK` cho các trường lượng giá, thời gian, sức chứa và khoảng điểm.
- Thêm `ENUM` cho các trạng thái nghiệp vụ, giúp dữ liệu ràng buộc chặt hơn.
- Thêm `INDEX` cho các key query thường dùng như `class_id`, `section_id`, `student_id`, `assignment_id`, `status`.

- Một submission thuộc một assignment và một enrollment.
- Một grade thuộc một enrollment.

## 5. Khuyến nghị cho Spring Boot

### Entity nên dùng
- UserEntity
- RoleEntity
- DepartmentEntity
- AcademicYearEntity
- SemesterEntity
- StudentEntity
- TeacherEntity
- ClassEntity
- SubjectEntity
- ClassSectionEntity
- EnrollmentEntity
- AttendanceSessionEntity
- AttendanceRecordEntity
- AssignmentEntity
- QuizQuestionEntity
- SubmissionEntity
- QuizAnswerEntity
- GradeEntity
- LearningMaterialEntity
- AnnouncementEntity
- DocumentEntity
- OcrResultEntity
- ChatConversationEntity
- ChatMessageEntity

### Gợi ý thư viện
- Spring Boot 3.x
- Spring Data JPA
- Spring Security
- PostgreSQL hoặc MySQL
- Lombok
- Validation
- Flyway hoặc Liquibase

## 6. Gợi ý tổ chức package

- entity
- repository
- service
- controller
- dto
- mapper
- config

## 7. Mẫu SQL khởi tạo

File SQL mẫu đã được tạo tại docs/schema.sql.
