# Thiết kế database cho hệ thống quản lý học tập trường học

Tài liệu này thiết kế database theo chuẩn 3NF (Third Normal Form), phù hợp cho backend Spring Boot và có thể mở rộng cho điểm danh OCR và chat AI sau này.

## 1. Nguyên tắc thiết kế

- Mỗi thực thể có một khóa chính duy nhất.
- Tránh lặp dữ liệu không cần thiết.
- Tách các dữ liệu phụ thuộc theo nghiệp vụ.
- Dùng bảng trung gian cho quan hệ nhiều-nhiều.
- Dữ liệu có thể mở rộng cho tính năng OCR và AI chat.

## 2. Các module chính

1. Quản lý người dùng và phân quyền
2. Quản lý khoa, môn học, lớp học
3. Quản lý sinh viên, giảng viên
4. Quản lý đăng ký học phần
5. Quản lý bài giảng, bài tập, điểm số
6. Quản lý điểm danh
7. Quản lý thông báo
8. Quản lý tài liệu và OCR
9. Quản lý chat/AI conversation

## 3. Danh sách bảng chính

### 3.1. Người dùng và phân quyền

#### users
- id: bigint PK
- username: varchar(50) unique
- password_hash: varchar(255)
- email: varchar(255) unique
- phone: varchar(20)
- full_name: varchar(255)
- avatar_url: varchar(500)
- status: varchar(20)
- created_at: timestamp
- updated_at: timestamp

#### roles
- id: bigint PK
- name: varchar(50) unique
- description: varchar(255)

#### user_roles
- user_id: bigint FK -> users.id
- role_id: bigint FK -> roles.id
- PK(user_id, role_id)

### 3.2. Cơ cấu tổ chức

#### departments
- id: bigint PK
- code: varchar(50) unique
- name: varchar(255)
- description: text

### 3.3. Học vụ

#### academic_years
- id: bigint PK
- code: varchar(50) unique
- name: varchar(100)
- start_date: date
- end_date: date
- is_active: boolean

#### semesters
- id: bigint PK
- academic_year_id: bigint FK -> academic_years.id
- code: varchar(50)
- name: varchar(100)
- start_date: date
- end_date: date
- is_active: boolean

### 3.4. Sinh viên và giảng viên

#### students
- id: bigint PK
- user_id: bigint FK -> users.id unique
- student_code: varchar(50) unique
- full_name: varchar(255)
- gender: varchar(20)
- date_of_birth: date
- address: text
- department_id: bigint FK -> departments.id
- status: varchar(20)
- created_at: timestamp

#### teachers
- id: bigint PK
- user_id: bigint FK -> users.id unique
- teacher_code: varchar(50) unique
- full_name: varchar(255)
- gender: varchar(20)
- department_id: bigint FK -> departments.id
- title: varchar(100)
- status: varchar(20)
- created_at: timestamp

### 3.5. Lớp học và môn học

#### classes
- id: bigint PK
- code: varchar(50) unique
- name: varchar(255)
- department_id: bigint FK -> departments.id
- academic_year_id: bigint FK -> academic_years.id
- semester_id: bigint FK -> semesters.id
- homeroom_teacher_id: bigint FK -> teachers.id
- status: varchar(20)

#### subjects
- id: bigint PK
- code: varchar(50) unique
- name: varchar(255)
- credits: int
- department_id: bigint FK -> departments.id
- description: text

#### class_sections
- id: bigint PK
- class_id: bigint FK -> classes.id
- subject_id: bigint FK -> subjects.id
- teacher_id: bigint FK -> teachers.id
- section_code: varchar(50) unique
- room: varchar(100)
- weekday: int
- start_time: time
- end_time: time
- start_date: date
- end_date: date
- capacity: int
- status: varchar(20)

### 3.6. Đăng ký học phần

#### enrollments
- id: bigint PK
- student_id: bigint FK -> students.id
- class_section_id: bigint FK -> class_sections.id
- enrolled_at: timestamp
- status: varchar(20)
- note: text
- unique(student_id, class_section_id)

### 3.7. Điểm danh

#### attendance_sessions
- id: bigint PK
- class_section_id: bigint FK -> class_sections.id
- session_date: date
- title: varchar(255)
- status: varchar(20)
- created_by: bigint FK -> users.id
- created_at: timestamp

#### attendance_records
- id: bigint PK
- attendance_session_id: bigint FK -> attendance_sessions.id
- enrollment_id: bigint FK -> enrollments.id
- status: varchar(20)
- note: text
- checked_at: timestamp
- checked_by: bigint FK -> users.id
- unique(attendance_session_id, enrollment_id)

### 3.8. Bài tập và điểm số

#### assignments
- id: bigint PK
- class_section_id: bigint FK -> class_sections.id
- title: varchar(255)
- description: text
- due_at: timestamp
- max_points: decimal(5,2)
- type: enum('essay', 'quiz')
- exam_file_url: varchar(500)
- exam_file_name: varchar(255)
- exam_file_type: enum('pdf', 'image')
- question_count: int
- created_by: bigint FK -> users.id
- created_at: timestamp

#### quiz_questions
- id: bigint PK
- assignment_id: bigint FK -> assignments.id
- order_index: int
- correct_choice: enum('A', 'B', 'C', 'D')
- points: decimal(5,2)
- explanation_text: text
- question_text: text
- choice_a_text: varchar(500)
- choice_b_text: varchar(500)
- choice_c_text: varchar(500)
- choice_d_text: varchar(500)
- ocr_status: varchar(20)
- ocr_extracted_text: text

#### submissions
- id: bigint PK
- assignment_id: bigint FK -> assignments.id
- enrollment_id: bigint FK -> enrollments.id
- content: text
- file_url: varchar(500)
- submitted_at: timestamp
- score: decimal(5,2)
- feedback: text
- status: varchar(20)
- unique(assignment_id, enrollment_id)

#### quiz_answers
- id: bigint PK
- submission_id: bigint FK -> submissions.id
- question_id: bigint FK -> quiz_questions.id
- selected_choice: enum('A', 'B', 'C', 'D')
- is_correct: boolean
- unique(submission_id, question_id)

#### grades
- id: bigint PK
- enrollment_id: bigint FK -> enrollments.id
- component_name: varchar(100)
- score: decimal(5,2)
- weight: decimal(5,2)
- graded_at: timestamp
- graded_by: bigint FK -> users.id

### 3.9. Tài liệu và thông báo

#### learning_materials
- id: bigint PK
- class_section_id: bigint FK -> class_sections.id
- title: varchar(255)
- file_name: varchar(255)
- file_url: varchar(500)
- mime_type: varchar(100)
- uploaded_by: bigint FK -> users.id
- uploaded_at: timestamp

#### announcements
- id: bigint PK
- class_section_id: bigint FK -> class_sections.id
- title: varchar(255)
- content: text
- created_by: bigint FK -> users.id
- created_at: timestamp

### 3.10. OCR và AI chat (mở rộng sau)

#### documents
- id: bigint PK
- owner_type: varchar(50)
- owner_id: bigint
- file_name: varchar(255)
- storage_key: varchar(500)
- mime_type: varchar(100)
- uploaded_by: bigint FK -> users.id
- uploaded_at: timestamp
- status: varchar(20)

#### ocr_results
- id: bigint PK
- document_id: bigint FK -> documents.id
- raw_text: text
- confidence_score: decimal(5,2)
- language: varchar(50)
- created_at: timestamp

#### chat_conversations
- id: bigint PK
- user_id: bigint FK -> users.id
- title: varchar(255)
- created_at: timestamp
- updated_at: timestamp
- status: varchar(20)

#### chat_messages
- id: bigint PK
- conversation_id: bigint FK -> chat_conversations.id
- sender_id: bigint FK -> users.id
- sender_type: varchar(20)
- message_type: varchar(20)
- content: text
- created_at: timestamp

## 4. Mối quan hệ chính

- Một user có nhiều role qua user_roles.
- Một student chỉ thuộc một user.
- Một teacher chỉ thuộc một user.
- Một department có nhiều students/teachers/subjects/classes.
- Một class có nhiều class_sections.
- Một class_section thuộc một subject, một teacher, một class.
- Một student có thể đăng ký nhiều class_section thông qua enrollments.
- Một attendance_session thuộc một class_section.
- Một attendance_record thuộc một attendance_session và một enrollment.
- Một assignment thuộc một class_section.
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
