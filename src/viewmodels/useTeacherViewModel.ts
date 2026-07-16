/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useStore } from '../models/store';
import {
  ClassSection,
  Student,
  AttendanceSession,
  AttendanceRecord,
  LearningMaterial,
  Assignment,
  Submission,
  GradeRecord,
  AttendanceStatus
} from '../types';

export function useTeacherViewModel(teacherId: string) {
  const store = useStore();

  const {
    classes,
    students,
    attendanceSessions,
    attendanceRecords,
    materials,
    assignments,
    submissions,
    grades,
    addAttendanceSession,
    updateAttendanceSession,
    updateAttendanceRecords,
    addMaterial,
    deleteMaterial,
    addAssignment,
    deleteAssignment,
    gradeSubmission,
    updateGrades,
    addNotification
  } = store;

  // 1. Get classes assigned to this teacher
  const teacherClasses = classes.filter(c => c.teacherId === teacherId);

  // Get class materials
  const getClassMaterials = (classId: string) => {
    return materials.filter(m => m.classId === classId);
  };

  // Get class assignments
  const getClassAssignments = (classId: string) => {
    return assignments.filter(a => a.classId === classId);
  };

  // Get roster for a class
  const getClassRoster = (classId: string): Student[] => {
    const cls = classes.find(c => c.id === classId);
    if (!cls) return [];
    return students.filter(s => cls.studentIds.includes(s.id));
  };

  // 2. Attendance Sessions & Records
  const getClassAttendanceSessions = (classId: string) => {
    return attendanceSessions.filter(s => s.classId === classId);
  };

  const getSessionRecords = (sessionId: string) => {
    return attendanceRecords.filter(r => r.sessionId === sessionId);
  };

  const createSession = (classId: string, title: string, date: string) => {
    return addAttendanceSession({
      classId,
      title,
      date,
      status: 'open'
    });
  };

  const closeSession = (sessionId: string) => {
    updateAttendanceSession(sessionId, { status: 'closed' });
  };

  const saveAttendance = (sessionId: string, classId: string, records: { studentId: string; studentName: string; status: AttendanceStatus; noted?: string }[]) => {
    const formatted = records.map(r => ({
      sessionId,
      classId,
      studentId: r.studentId,
      studentName: r.studentName,
      status: r.status,
      noted: r.noted
    }));
    updateAttendanceRecords(formatted);
  };

  // 3. Document / Material management
  const uploadMaterial = (classId: string, title: string, type: 'pdf' | 'doc' | 'ppt' | 'video', fileName: string, fileSize: string, description?: string) => {
    addMaterial({
      classId,
      title,
      type,
      fileName,
      fileSize,
      description
    });
  };

  const removeMaterial = (materialId: string) => {
    deleteMaterial(materialId);
  };

  // 4. Assignments & Grading
  const createAssignment = (classId: string, title: string, description: string, dueDate: string, maxPoints: number) => {
    addAssignment({
      classId,
      title,
      description,
      dueDate,
      maxPoints
    });
  };

  const removeAssignment = (assignmentId: string) => {
    deleteAssignment(assignmentId);
  };

  const getAssignmentSubmissions = (assignmentId: string) => {
    return submissions.filter(s => s.assignmentId === assignmentId);
  };

  const gradeStudentSubmission = (submissionId: string, score: number, feedback: string) => {
    gradeSubmission(submissionId, score, feedback);
  };

  // 5. Gradebook (Bảng điểm)
  const getClassGrades = (classId: string): GradeRecord[] => {
    // Return or construct missing grade records
    const cls = classes.find(c => c.id === classId);
    if (!cls) return [];
    
    return grades.filter(g => g.classId === classId);
  };

  const updateClassGradebook = (classId: string, gradeUpdates: GradeRecord[]) => {
    updateGrades(gradeUpdates);
  };

  const exportGradebook = (classId: string, format: 'excel' | 'pdf') => {
    console.log(`Exporting gradebook for class ${classId} in ${format} format...`);
    // Simulated delay & trigger file download action
    return true;
  };

  // 6. Post class notice
  const postClassNotice = (classId: string, title: string, content: string) => {
    const cls = classes.find(c => c.id === classId);
    const className = cls ? cls.subjectName : 'Lớp học phần';
    addNotification({
      title: `[Lớp ${classId}] ${title}`,
      content,
      recipientGroup: 'class',
      classId,
      sender: `Giảng viên - ${className}`
    });
  };

  return {
    teacherClasses,
    getClassRoster,
    getClassMaterials,
    getClassAssignments,
    getClassAttendanceSessions,
    getSessionRecords,

    // Attendance Actions
    createSession,
    closeSession,
    saveAttendance,

    // Materials Actions
    uploadMaterial,
    removeMaterial,

    // Homework Actions
    createAssignment,
    removeAssignment,
    getAssignmentSubmissions,
    gradeStudentSubmission,

    // Gradebook Actions
    getClassGrades,
    updateClassGradebook,
    exportGradebook,

    // Notifications
    postClassNotice
  };
}
