-- MySQL 8.0+ schema for school management system

CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    full_name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE roles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE user_roles (
    user_id BIGINT UNSIGNED NOT NULL,
    role_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_role_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_role_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE departments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE academic_years (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE COMMENT 'VD: 2024-2025',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN NOT NULL DEFAULT FALSE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE semesters (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    academic_year_id BIGINT UNSIGNED NOT NULL,
    code VARCHAR(20) NOT NULL COMMENT 'VD: HK1, HK2, HK_HE',
    name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_semester_year FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
    UNIQUE KEY uq_semester (academic_year_id, code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE students (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL UNIQUE,
    student_code VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    gender VARCHAR(20),
    date_of_birth DATE,
    address TEXT,
    department_id BIGINT UNSIGNED,
    class_id BIGINT UNSIGNED NULL COMMENT 'FK tới classes.id — lớp hành chính của SV',
    class_code VARCHAR(50) NULL COMMENT 'Mã lớp hành chính denormalize để FE đọc nhanh',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_student_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_student_department FOREIGN KEY (department_id) REFERENCES departments(id),
    CONSTRAINT fk_students_class FOREIGN KEY (class_id) REFERENCES classes(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE teachers (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL UNIQUE,
    teacher_code VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    gender VARCHAR(20),
    department_id BIGINT UNSIGNED,
    title VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_teacher_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_teacher_department FOREIGN KEY (department_id) REFERENCES departments(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE classes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE COMMENT 'VD: K64-CNTT',
    name VARCHAR(255) NOT NULL,
    department_id BIGINT UNSIGNED,
    entry_academic_year_id BIGINT UNSIGNED COMMENT 'Năm nhập học của khoá này',
    homeroom_teacher_id BIGINT UNSIGNED COMMENT 'Giáo viên chủ nhiệm (nếu có)',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT fk_classes_department FOREIGN KEY (department_id) REFERENCES departments(id),
    CONSTRAINT fk_classes_entry_year FOREIGN KEY (entry_academic_year_id) REFERENCES academic_years(id),
    CONSTRAINT fk_classes_homeroom FOREIGN KEY (homeroom_teacher_id) REFERENCES teachers(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE subjects (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    credits INT NOT NULL,
    department_id BIGINT UNSIGNED,
    description TEXT,
    CONSTRAINT fk_subject_department FOREIGN KEY (department_id) REFERENCES departments(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE class_sections (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    class_id BIGINT UNSIGNED NOT NULL,
    subject_id BIGINT UNSIGNED NOT NULL,
    teacher_id BIGINT UNSIGNED NOT NULL,
    section_code VARCHAR(50) NOT NULL UNIQUE,
    room VARCHAR(100),
    weekday INT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    capacity INT NOT NULL DEFAULT 50,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    semester_id BIGINT UNSIGNED NULL COMMENT 'FK tới semesters.id — kỳ học mở lớp này',
    CONSTRAINT fk_class_section_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    CONSTRAINT fk_class_section_subject FOREIGN KEY (subject_id) REFERENCES subjects(id),
    CONSTRAINT fk_class_section_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id),
    CONSTRAINT fk_class_section_semester FOREIGN KEY (semester_id) REFERENCES semesters(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE enrollments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT UNSIGNED NOT NULL,
    class_section_id BIGINT UNSIGNED NOT NULL,
    enrolled_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    note TEXT,
    CONSTRAINT fk_enrollment_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_enrollment_class_section FOREIGN KEY (class_section_id) REFERENCES class_sections(id) ON DELETE CASCADE,
    UNIQUE KEY uq_enrollment_student_class (student_id, class_section_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE attendance_sessions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    class_section_id BIGINT UNSIGNED NOT NULL,
    session_date DATE NOT NULL,
    title VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    created_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_attendance_session_class_section FOREIGN KEY (class_section_id) REFERENCES class_sections(id) ON DELETE CASCADE,
    CONSTRAINT fk_attendance_session_creator FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE attendance_records (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    attendance_session_id BIGINT UNSIGNED NOT NULL,
    enrollment_id BIGINT UNSIGNED NOT NULL,
    status VARCHAR(20) NOT NULL,
    note TEXT,
    checked_at TIMESTAMP NULL,
    checked_by BIGINT UNSIGNED NULL,
    CONSTRAINT fk_attendance_record_session FOREIGN KEY (attendance_session_id) REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    CONSTRAINT fk_attendance_record_enrollment FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
    CONSTRAINT fk_attendance_record_checker FOREIGN KEY (checked_by) REFERENCES users(id),
    UNIQUE KEY uq_attendance_record (attendance_session_id, enrollment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE assignments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    class_section_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_at TIMESTAMP NOT NULL,
    max_points DECIMAL(5,2) NOT NULL DEFAULT 10.00,
    type ENUM('essay','quiz') NOT NULL DEFAULT 'essay' COMMENT 'essay=bài tự luận; quiz=trắc nghiệm theo file đề chung',
    exam_file_url VARCHAR(500) COMMENT 'File đề PDF/ảnh DUY NHẤT cho cả bài, GV upload 1 lần',
    exam_file_name VARCHAR(255),
    exam_file_type ENUM('pdf','image'),
    question_count INT COMMENT 'Tổng số câu hỏi, GV nhập tay để hệ thống tự sinh quiz_questions trống',
    created_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_assignment_class_section FOREIGN KEY (class_section_id) REFERENCES class_sections(id) ON DELETE CASCADE,
    CONSTRAINT fk_assignment_creator FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE quiz_questions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    assignment_id BIGINT UNSIGNED NOT NULL,
    order_index INT NOT NULL COMMENT 'Thứ tự câu hỏi trong đề (1, 2, 3...)',
    correct_choice ENUM('A', 'B', 'C', 'D') NOT NULL,
    points DECIMAL(5,2) NOT NULL,
    explanation_text TEXT,
    question_text TEXT,
    choice_a_text VARCHAR(500),
    choice_b_text VARCHAR(500),
    choice_c_text VARCHAR(500),
    choice_d_text VARCHAR(500),
    ocr_status VARCHAR(20) NOT NULL DEFAULT 'NOT_PROCESSED',
    ocr_extracted_text TEXT,
    CONSTRAINT fk_quiz_question_assignment FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE submissions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    assignment_id BIGINT UNSIGNED NOT NULL,
    enrollment_id BIGINT UNSIGNED NOT NULL,
    content TEXT,
    file_url VARCHAR(500),
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    score DECIMAL(5,2),
    feedback TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'SUBMITTED',
    CONSTRAINT fk_submission_assignment FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    CONSTRAINT fk_submission_enrollment FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
    UNIQUE KEY uq_submission_assignment_enrollment (assignment_id, enrollment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE quiz_answers (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    submission_id BIGINT UNSIGNED NOT NULL,
    question_id BIGINT UNSIGNED NOT NULL,
    selected_choice ENUM('A', 'B', 'C', 'D'),
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_quiz_answer_submission FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
    CONSTRAINT fk_quiz_answer_question FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE,
    UNIQUE KEY uq_quiz_answer_submission_question (submission_id, question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE grade_components (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    class_section_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(100) NOT NULL COMMENT 'Tên đầu điểm, GV tự đặt',
    weight_percent DECIMAL(5,2) NOT NULL COMMENT 'Trọng số (%) — tổng các component trong 1 lớp nên = 100',
    order_index INT NOT NULL DEFAULT 0 COMMENT 'Thứ tự hiển thị trên bảng điểm',
    CONSTRAINT fk_grade_component_class FOREIGN KEY (class_section_id) REFERENCES class_sections(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE grade_component_scores (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    enrollment_id BIGINT UNSIGNED NOT NULL,
    component_id BIGINT UNSIGNED NOT NULL,
    score DECIMAL(5,2) NOT NULL,
    CONSTRAINT fk_gcs_enrollment FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
    CONSTRAINT fk_gcs_component FOREIGN KEY (component_id) REFERENCES grade_components(id) ON DELETE CASCADE,
    UNIQUE KEY uq_grade_component_score (enrollment_id, component_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE grades (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    enrollment_id BIGINT UNSIGNED NOT NULL UNIQUE,
    final_score DECIMAL(5,2) COMMENT 'Điểm tổng kết học phần, tự tính từ grade_component_scores',
    gpa_4_scale DECIMAL(3,2) COMMENT 'Quy đổi thang điểm 4 từ final_score',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_grades_enrollment FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE learning_materials (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    class_section_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100),
    uploaded_by BIGINT UNSIGNED NOT NULL,
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_learning_material_class_section FOREIGN KEY (class_section_id) REFERENCES class_sections(id) ON DELETE CASCADE,
    CONSTRAINT fk_learning_material_uploader FOREIGN KEY (uploaded_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE announcements (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    class_section_id BIGINT UNSIGNED,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_announcement_class_section FOREIGN KEY (class_section_id) REFERENCES class_sections(id) ON DELETE CASCADE,
    CONSTRAINT fk_announcement_creator FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Bảng này CHƯA được FE sử dụng ở giai đoạn hiện tại — giữ sẵn trong schema
-- để không phải ALTER TABLE giữa chừng khi triển khai OCR đề thi / lưu lịch sử chat AI ở giai đoạn phát triển sau.
CREATE TABLE documents (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    owner_type VARCHAR(50) NOT NULL,
    owner_id BIGINT UNSIGNED NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    storage_key VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100),
    uploaded_by BIGINT UNSIGNED NOT NULL,
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'UPLOADED',
    CONSTRAINT fk_documents_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Bảng này CHƯA được FE sử dụng ở giai đoạn hiện tại — giữ sẵn trong schema
-- để không phải ALTER TABLE giữa chừng khi triển khai OCR đề thi / lưu lịch sử chat AI ở giai đoạn phát triển sau.
CREATE TABLE ocr_results (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    document_id BIGINT UNSIGNED NOT NULL,
    raw_text TEXT,
    confidence_score DECIMAL(5,2),
    language VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ocr_results_document FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Bảng này CHƯA được FE sử dụng ở giai đoạn hiện tại — giữ sẵn trong schema
-- để không phải ALTER TABLE giữa chừng khi triển khai OCR đề thi / lưu lịch sử chat AI ở giai đoạn phát triển sau.
CREATE TABLE chat_conversations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT fk_chat_conversation_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Bảng này CHƯA được FE sử dụng ở giai đoạn hiện tại — giữ sẵn trong schema
-- để không phải ALTER TABLE giữa chừng khi triển khai OCR đề thi / lưu lịch sử chat AI ở giai đoạn phát triển sau.
CREATE TABLE chat_messages (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    conversation_id BIGINT UNSIGNED NOT NULL,
    sender_id BIGINT UNSIGNED NOT NULL,
    sender_type VARCHAR(20) NOT NULL,
    message_type VARCHAR(20) NOT NULL DEFAULT 'TEXT',
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_chat_message_conversation FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE,
    CONSTRAINT fk_chat_message_sender FOREIGN KEY (sender_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

