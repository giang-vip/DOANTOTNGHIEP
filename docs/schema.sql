-- MySQL 8.0+ schema for school management system (production-ready)
-- Chạy file này trên MySQL Workbench / MySQL CLI bằng lệnh:
-- source docs/schema.sql

DROP DATABASE IF EXISTS school_management;
CREATE DATABASE school_management
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
USE school_management;

SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    full_name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    status ENUM('ACTIVE', 'INACTIVE', 'LOCKED') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_status (status)
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
    CONSTRAINT fk_user_role_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    INDEX idx_user_roles_role_id (role_id)
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
    is_current BOOLEAN NOT NULL DEFAULT FALSE,
    CHECK (start_date <= end_date)
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
    UNIQUE KEY uq_semester (academic_year_id, code),
    CHECK (start_date <= end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE teachers (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL UNIQUE,
    teacher_code VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    gender ENUM('MALE', 'FEMALE', 'OTHER') DEFAULT NULL,
    department_id BIGINT UNSIGNED,
    title VARCHAR(100),
    status ENUM('ACTIVE', 'INACTIVE', 'ON_LEAVE') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_teacher_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_teacher_department FOREIGN KEY (department_id) REFERENCES departments(id),
    INDEX idx_teachers_department_id (department_id),
    INDEX idx_teachers_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE classes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE COMMENT 'VD: K64-CNTT',
    name VARCHAR(255) NOT NULL,
    department_id BIGINT UNSIGNED,
    entry_academic_year_id BIGINT UNSIGNED COMMENT 'Năm nhập học của khoá này',
    homeroom_teacher_id BIGINT UNSIGNED COMMENT 'Giáo viên chủ nhiệm (nếu có)',
    status ENUM('ACTIVE', 'CLOSED', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_classes_department FOREIGN KEY (department_id) REFERENCES departments(id),
    CONSTRAINT fk_classes_entry_year FOREIGN KEY (entry_academic_year_id) REFERENCES academic_years(id),
    CONSTRAINT fk_classes_homeroom FOREIGN KEY (homeroom_teacher_id) REFERENCES teachers(id),
    INDEX idx_classes_department_id (department_id),
    INDEX idx_classes_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE students (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL UNIQUE,
    student_code VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    gender ENUM('MALE', 'FEMALE', 'OTHER') DEFAULT NULL,
    date_of_birth DATE,
    address TEXT,
    department_id BIGINT UNSIGNED,
    class_id BIGINT UNSIGNED NULL COMMENT 'Lớp hành chính của sinh viên',
    status ENUM('ACTIVE', 'INACTIVE', 'GRADUATED', 'DROPPED') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_student_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_student_department FOREIGN KEY (department_id) REFERENCES departments(id),
    CONSTRAINT fk_students_class FOREIGN KEY (class_id) REFERENCES classes(id),
    INDEX idx_students_class_id (class_id),
    INDEX idx_students_department_id (department_id),
    INDEX idx_students_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE subjects (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    credits INT NOT NULL CHECK (credits > 0),
    department_id BIGINT UNSIGNED,
    description TEXT,
    CONSTRAINT fk_subject_department FOREIGN KEY (department_id) REFERENCES departments(id),
    INDEX idx_subjects_department_id (department_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE class_sections (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    class_id BIGINT UNSIGNED NOT NULL,
    subject_id BIGINT UNSIGNED NOT NULL,
    teacher_id BIGINT UNSIGNED NOT NULL,
    section_code VARCHAR(50) NOT NULL UNIQUE,
    room VARCHAR(100),
    weekday INT NOT NULL CHECK (weekday BETWEEN 1 AND 7),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    capacity INT NOT NULL DEFAULT 50 CHECK (capacity > 0),
    status ENUM('ACTIVE', 'CANCELLED', 'COMPLETED') NOT NULL DEFAULT 'ACTIVE',
    semester_id BIGINT UNSIGNED NULL COMMENT 'FK tới semesters.id — kỳ học mở lớp này',
    CONSTRAINT fk_class_section_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    CONSTRAINT fk_class_section_subject FOREIGN KEY (subject_id) REFERENCES subjects(id),
    CONSTRAINT fk_class_section_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id),
    CONSTRAINT fk_class_section_semester FOREIGN KEY (semester_id) REFERENCES semesters(id),
    CHECK (start_time < end_time),
    CHECK (start_date <= end_date),
    INDEX idx_class_sections_class_id (class_id),
    INDEX idx_class_sections_subject_id (subject_id),
    INDEX idx_class_sections_teacher_id (teacher_id),
    INDEX idx_class_sections_semester_id (semester_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE enrollments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT UNSIGNED NOT NULL,
    class_section_id BIGINT UNSIGNED NOT NULL,
    enrolled_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status ENUM('ACTIVE', 'WITHDRAWN', 'COMPLETED') NOT NULL DEFAULT 'ACTIVE',
    note TEXT,
    CONSTRAINT fk_enrollment_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_enrollment_class_section FOREIGN KEY (class_section_id) REFERENCES class_sections(id) ON DELETE CASCADE,
    UNIQUE KEY uq_enrollment_student_class (student_id, class_section_id),
    INDEX idx_enrollments_student_id (student_id),
    INDEX idx_enrollments_section_id (class_section_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE attendance_sessions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    class_section_id BIGINT UNSIGNED NOT NULL,
    session_date DATE NOT NULL,
    title VARCHAR(255),
    status ENUM('OPEN', 'CLOSED', 'CANCELLED') NOT NULL DEFAULT 'OPEN',
    created_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_attendance_session_class_section FOREIGN KEY (class_section_id) REFERENCES class_sections(id) ON DELETE CASCADE,
    CONSTRAINT fk_attendance_session_creator FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_attendance_sessions_class_section_id (class_section_id),
    INDEX idx_attendance_sessions_date (session_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE attendance_records (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    attendance_session_id BIGINT UNSIGNED NOT NULL,
    enrollment_id BIGINT UNSIGNED NOT NULL,
    status ENUM('PRESENT', 'ABSENT', 'LATE', 'EXCUSED') NOT NULL,
    note TEXT,
    checked_at TIMESTAMP NULL,
    checked_by BIGINT UNSIGNED NULL,
    CONSTRAINT fk_attendance_record_session FOREIGN KEY (attendance_session_id) REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    CONSTRAINT fk_attendance_record_enrollment FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
    CONSTRAINT fk_attendance_record_checker FOREIGN KEY (checked_by) REFERENCES users(id),
    UNIQUE KEY uq_attendance_record (attendance_session_id, enrollment_id),
    INDEX idx_attendance_records_enrollment_id (enrollment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE assignments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    class_section_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_at TIMESTAMP NOT NULL,
    max_points DECIMAL(5,2) NOT NULL DEFAULT 10.00 CHECK (max_points >= 0),
    type ENUM('essay', 'quiz') NOT NULL DEFAULT 'essay',
    exam_file_url VARCHAR(500),
    exam_file_name VARCHAR(255),
    exam_file_type ENUM('pdf', 'image'),
    question_count INT COMMENT 'Số câu hỏi nếu dạng quiz',
    created_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_assignment_class_section FOREIGN KEY (class_section_id) REFERENCES class_sections(id) ON DELETE CASCADE,
    CONSTRAINT fk_assignment_creator FOREIGN KEY (created_by) REFERENCES users(id),
    CHECK (question_count IS NULL OR question_count >= 0),
    INDEX idx_assignments_class_section_id (class_section_id),
    INDEX idx_assignments_due_at (due_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE quiz_questions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    assignment_id BIGINT UNSIGNED NOT NULL,
    order_index INT NOT NULL COMMENT 'Thứ tự câu hỏi trong đề (1, 2, 3...)',
    correct_choice ENUM('A', 'B', 'C', 'D') NOT NULL,
    points DECIMAL(5,2) NOT NULL CHECK (points >= 0),
    explanation_text TEXT,
    question_text TEXT NOT NULL,
    choice_a_text VARCHAR(500),
    choice_b_text VARCHAR(500),
    choice_c_text VARCHAR(500),
    choice_d_text VARCHAR(500),
    ocr_status ENUM('NOT_PROCESSED', 'IN_PROGRESS', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'NOT_PROCESSED',
    ocr_extracted_text TEXT,
    CONSTRAINT fk_quiz_question_assignment FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    CHECK (order_index >= 1),
    INDEX idx_quiz_questions_assignment_id (assignment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE submissions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    assignment_id BIGINT UNSIGNED NOT NULL,
    enrollment_id BIGINT UNSIGNED NOT NULL,
    content TEXT,
    file_url VARCHAR(500),
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    score DECIMAL(5,2) CHECK (score >= 0),
    feedback TEXT,
    status ENUM('SUBMITTED', 'IN_REVIEW', 'GRADED', 'LATE') NOT NULL DEFAULT 'SUBMITTED',
    CONSTRAINT fk_submission_assignment FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    CONSTRAINT fk_submission_enrollment FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
    UNIQUE KEY uq_submission_assignment_enrollment (assignment_id, enrollment_id),
    INDEX idx_submissions_assignment_id (assignment_id),
    INDEX idx_submissions_enrollment_id (enrollment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE quiz_answers (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    submission_id BIGINT UNSIGNED NOT NULL,
    question_id BIGINT UNSIGNED NOT NULL,
    selected_choice ENUM('A', 'B', 'C', 'D'),
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_quiz_answer_submission FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
    CONSTRAINT fk_quiz_answer_question FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE,
    UNIQUE KEY uq_quiz_answer_submission_question (submission_id, question_id),
    INDEX idx_quiz_answers_question_id (question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE grade_components (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    class_section_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(100) NOT NULL COMMENT 'Tên đầu điểm, GV tự đặt',
    weight_percent DECIMAL(5,2) NOT NULL COMMENT 'Trọng số (%) — tổng các component trong 1 lớp nên = 100',
    order_index INT NOT NULL DEFAULT 0 COMMENT 'Thứ tự hiển thị trên bảng điểm',
    CONSTRAINT fk_grade_component_class FOREIGN KEY (class_section_id) REFERENCES class_sections(id) ON DELETE CASCADE,
    CHECK (weight_percent BETWEEN 0 AND 100),
    CHECK (order_index >= 0),
    INDEX idx_grade_components_class_section_id (class_section_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE grade_component_scores (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    enrollment_id BIGINT UNSIGNED NOT NULL,
    component_id BIGINT UNSIGNED NOT NULL,
    score DECIMAL(5,2) NOT NULL CHECK (score >= 0),
    CONSTRAINT fk_gcs_enrollment FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
    CONSTRAINT fk_gcs_component FOREIGN KEY (component_id) REFERENCES grade_components(id) ON DELETE CASCADE,
    UNIQUE KEY uq_grade_component_score (enrollment_id, component_id),
    INDEX idx_gcs_component_id (component_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE grades (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    enrollment_id BIGINT UNSIGNED NOT NULL UNIQUE,
    final_score DECIMAL(5,2) COMMENT 'Điểm tổng kết học phần, tự tính từ grade_component_scores',
    gpa_4_scale DECIMAL(3,2) COMMENT 'Quy đổi thang điểm 4 từ final_score',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_grades_enrollment FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
    CHECK (final_score >= 0),
    CHECK (gpa_4_scale BETWEEN 0 AND 4)
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
    CONSTRAINT fk_learning_material_uploader FOREIGN KEY (uploaded_by) REFERENCES users(id),
    INDEX idx_learning_materials_class_section_id (class_section_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE announcements (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    class_section_id BIGINT UNSIGNED,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_announcement_class_section FOREIGN KEY (class_section_id) REFERENCES class_sections(id) ON DELETE CASCADE,
    CONSTRAINT fk_announcement_creator FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_announcements_class_section_id (class_section_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE documents (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    owner_type VARCHAR(50) NOT NULL,
    owner_id BIGINT UNSIGNED NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    storage_key VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100),
    uploaded_by BIGINT UNSIGNED NOT NULL,
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status ENUM('UPLOADED', 'PROCESSING', 'PROCESSED', 'FAILED') NOT NULL DEFAULT 'UPLOADED',
    CONSTRAINT fk_documents_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES users(id),
    INDEX idx_documents_owner (owner_type, owner_id),
    INDEX idx_documents_uploaded_by (uploaded_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE ocr_results (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    document_id BIGINT UNSIGNED NOT NULL,
    raw_text TEXT,
    confidence_score DECIMAL(5,2) CHECK (confidence_score BETWEEN 0 AND 100),
    language VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ocr_results_document FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    INDEX idx_ocr_results_document_id (document_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE chat_conversations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status ENUM('ACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT fk_chat_conversation_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_chat_conversations_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE chat_messages (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    conversation_id BIGINT UNSIGNED NOT NULL,
    sender_id BIGINT UNSIGNED NOT NULL,
    sender_type ENUM('USER', 'SYSTEM', 'AI') NOT NULL,
    message_type ENUM('TEXT', 'IMAGE', 'FILE') NOT NULL DEFAULT 'TEXT',
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_chat_message_conversation FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE,
    CONSTRAINT fk_chat_message_sender FOREIGN KEY (sender_id) REFERENCES users(id),
    INDEX idx_chat_messages_conversation_id (conversation_id),
    INDEX idx_chat_messages_sender_id (sender_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;

