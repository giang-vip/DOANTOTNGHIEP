# Hướng dẫn Kết nối Frontend (React) và Backend (Java Spring Boot)

Tài liệu này đóng vai trò làm cẩm nang hướng dẫn (Integration Guide) giúp các lập trình viên Backend Spring Boot xây dựng đúng các đầu API cần thiết và các lập trình viên Frontend React kết nối truyền nhận dữ liệu một cách trơn tru.

---

## 1. Nguyên Tắc Kết Nối Chung

1. **Định dạng dữ liệu:** Tất cả các API trao đổi dữ liệu qua giao thức HTTP/HTTPS bằng định dạng **JSON**.
2. **Xác thực và Phân quyền:** Sử dụng **JWT (JSON Web Token)** đính kèm ở Header của mọi Request cần bảo mật dưới dạng:
   `Authorization: Bearer <your_jwt_token>`
3. **HTTP Methods chuẩn RESTful:**
   - `GET`: Lấy danh sách hoặc chi tiết dữ liệu.
   - `POST`: Tạo mới thực thể (Nộp bài, điểm danh, tạo bài tập).
   - `PUT`: Cập nhật toàn bộ thực thể.
   - `PATCH`: Cập nhật một phần thực thể (Sửa đổi điểm số, trạng thái).
   - `DELETE`: Xóa thực thể.

---

## 2. Danh Sách Các Đầu API Cốt Lõi Theo Chức Năng

### 2.1. Module Học Tập của Sinh Viên (Student Space)

#### 2.1.1. Lấy danh sách lớp học phần sinh viên đang đăng ký
- **Endpoint:** `GET /api/student/classes`
- **Response mẫu:**
```json
[
  {
    "id": "LH_CNTT_01",
    "subjectName": "Lập trình Web nâng cao",
    "teacherName": "ThS. Nguyễn Văn A",
    "room": "402-A2",
    "credits": 3,
    "startDate": "2026-01-10",
    "endDate": "2026-06-30"
  }
]
```

#### 2.1.2. Lấy kho học liệu của một lớp học phần
- **Endpoint:** `GET /api/student/classes/{classId}/materials`
- **Response mẫu:**
```json
[
  {
    "id": "mat_101",
    "classId": "LH_CNTT_01",
    "title": "Chương 1: Giới thiệu kiến trúc MVC",
    "type": "pdf",
    "url": "http://localhost:8080/uploads/materials/mvc-intro.pdf",
    "fileName": "mvc-intro.pdf",
    "fileSize": "1.8 MB",
    "uploadedAt": "2026-02-15T08:00:00Z",
    "description": "Tài liệu học tập bắt buộc cho tuần 1"
  }
]
```

#### 2.1.3. Lấy danh sách bài tập (Tự luận & Trắc nghiệm)
- **Endpoint:** `GET /api/student/classes/{classId}/assignments`
- **Response mẫu:**
```json
[
  {
    "id": "asm_tracnghiem_01",
    "classId": "LH_CNTT_01",
    "title": "Kiểm tra giữa kỳ Trắc nghiệm Web",
    "description": "Bài làm 10 phút, tự động nộp bài khi hết giờ.",
    "dueDate": "2026-07-29T23:59:00",
    "maxPoints": 10.00,
    "type": "quiz",
    "examFileUrl": "http://localhost:8080/uploads/exams/de-thi-web-gk.pdf",
    "examFileName": "de-thi-web-gk.pdf",
    "examFileType": "pdf",
    "questionCount": 5
  }
]
```

#### 2.1.4. Lấy bộ câu hỏi của đề trắc nghiệm (Dành cho làm bài trực tuyến)
- **Endpoint:** `GET /api/student/assignments/{assignmentId}/questions`
- **Response mẫu:**
```json
[
  {
    "id": "q_1",
    "assignmentId": "asm_tracnghiem_01",
    "order": 1,
    "points": 2.0,
    "questionText": "Đâu là ưu điểm cốt lõi của ReactJS?",
    "choiceAText": "Virtual DOM tăng tốc render",
    "choiceBText": "Chạy trực tiếp không cần biên dịch",
    "choiceCText": "Tích hợp sẵn hệ quản trị cơ sở dữ liệu",
    "choiceDText": "Không hỗ trợ component tái sử dụng"
  }
]
```
*(Lưu ý: Đầu API này tuyệt đối **không trả về** trường `correctChoice` cho sinh viên để tránh lộ đáp án trước khi thi).*

#### 2.1.5. Nộp bài trắc nghiệm và chấm điểm tự động
- **Endpoint:** `POST /api/student/assignments/{assignmentId}/submit-quiz`
- **Request Body:**
```json
{
  "answers": [
    { "questionId": "q_1", "selectedChoice": "A" },
    { "questionId": "q_2", "selectedChoice": "B" },
    { "questionId": "q_3", "selectedChoice": null }
  ]
}
```
- **Xử lý phía Spring Boot:** Đối chiếu các đáp án được gửi lên với cột `correct_choice` trong bảng `quiz_questions`, tính tổng điểm dựa trên số câu đúng và trọng số điểm của từng câu, lưu bài làm vào bảng `submissions` và lưu từng câu trả lời của sinh viên vào bảng `quiz_answers`. Đồng thời đồng bộ điểm thi sang bảng `grades`.
- **Response mẫu:**
```json
{
  "submissionId": "sub_999888",
  "score": 8.0,
  "feedback": "Hệ thống tự động chấm: Đúng 4/5 câu.",
  "status": "graded"
}
```

#### 2.1.6. Điểm danh vị trí (GPS) và nhận dạng khuôn mặt (Face ID)
- **Endpoint:** `POST /api/student/attendance/sessions/{sessionId}/check-in`
- **Request Body:**
```json
{
  "method": "gps",
  "latitude": 20.9782,
  "longitude": 105.7891,
  "faceImageBase64": null 
}
```
- **Xử lý phía Spring Boot:** 
  - Với phương thức `gps`: Kiểm tra xem khoảng cách toạ độ của sinh viên so với phòng học có nằm trong bán kính cho phép (Ví dụ: 100m) hay không.
  - Với phương thức `face`: Spring Boot nhận ảnh Base64, chuyển đến AI Model/OCR Server để so khớp khuôn mặt với dữ liệu khuôn mặt đã đăng ký của sinh viên, trả về mức độ tin cậy (Confidence).
  - Cập nhật trạng thái điểm danh trong bảng `attendance_records`.

---

### 2.2. Module Giảng Viên (Teacher Space)

#### 2.2.1. Giảng viên soạn đề thi trắc nghiệm (Upload đề + Khung đáp án)
- **Bước 1: Tạo thông tin bài tập chính**
  - **Endpoint:** `POST /api/teacher/assignments`
  - **Request Body:**
    ```json
    {
      "classSectionId": 102,
      "title": "Kiểm tra trắc nghiệm 15 phút",
      "description": "Đọc kỹ đề file đính kèm và chọn đáp án đúng.",
      "dueAt": "2026-07-28T09:00:00Z",
      "maxPoints": 10.00,
      "type": "quiz",
      "questionCount": 10
    }
    ```
- **Bước 2: Upload file đề thi độc quyền (PDF/Ảnh) & Lưu danh sách đáp án đúng A/B/C/D**
  - **Endpoint:** `POST /api/teacher/assignments/{assignmentId}/configure-quiz`
  - **Request (Multipart Form Data):**
    - `file`: Tệp tin đề thi chính thức (PDF/Ảnh)
    - `questionsJson`: Chuỗi JSON định nghĩa bộ đáp án chuẩn:
      ```json
      [
        { "order": 1, "correctChoice": "A", "points": 1.0, "explanationText": "Vì A là giải pháp tối ưu nhất.", "questionText": "Câu hỏi số 1" },
        { "order": 2, "correctChoice": "C", "points": 1.0, "explanationText": "Bắt buộc chọn C.", "questionText": "Câu hỏi số 2" }
      ]
      ```

---

## 3. Bản Đồ Ánh Xạ Giữa Frontend Model Và DTO/Entity Backend

| Đối tượng dữ liệu (FE Model) | Bảng Cơ sở dữ liệu tương ứng | Tên Class Spring Boot gợi ý |
| :--- | :--- | :--- |
| `Student` | `students` | `StudentEntity.java` |
| `ClassSection` | `class_sections` | `ClassSectionEntity.java` |
| `LearningMaterial` | `learning_materials` | `LearningMaterialEntity.java` |
| `Assignment` | `assignments` | `AssignmentEntity.java` |
| `QuizQuestion` | `quiz_questions` | `QuizQuestionEntity.java` |
| `Submission` | `submissions` | `SubmissionEntity.java` |
| `QuizAnswer` | `quiz_answers` | `QuizAnswerEntity.java` |
| `AttendanceSession` | `attendance_sessions` | `AttendanceSessionEntity.java` |
| `AttendanceRecord` | `attendance_records` | `AttendanceRecordEntity.java` |

---

## 4. Gợi ý cấu trúc Class kết nối cơ sở dữ liệu trên Spring Boot (JPA)

### Ví dụ: `QuizQuestionEntity.java`
```java
package com.hungnhan.smartschool.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Entity
@Table(name = "quiz_questions")
@Getter
@Setter
public class QuizQuestionEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id", nullable = false)
    private AssignmentEntity assignment;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    @Enumerated(EnumType.STRING)
    @Column(name = "correct_choice", nullable = false)
    private Choice correctChoice; // ENUM: A, B, C, D

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal points;

    @Column(name = "explanation_text", columnDefinition = "TEXT")
    private String explanationText;

    @Column(name = "question_text", columnDefinition = "TEXT")
    private String questionText;

    @Column(name = "choice_a_text", length = 500)
    private String choiceAText;

    @Column(name = "choice_b_text", length = 500)
    private String choiceBText;

    @Column(name = "choice_c_text", length = 500)
    private String choiceCText;

    @Column(name = "choice_d_text", length = 500)
    private String choiceDText;

    @Column(name = "ocr_status", length = 20, nullable = false)
    private String ocrStatus = "NOT_PROCESSED";

    @Column(name = "ocr_extracted_text", columnDefinition = "TEXT")
    private String ocrExtractedText;

    public enum Choice {
        A, B, C, D
    }
}
```
