/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Student,
  Teacher,
  Department,
  Subject,
  ClassSection,
  RegistrationPeriod,
  AttendanceSession,
  AttendanceRecord,
  LearningMaterial,
  Assignment,
  Submission,
  GradeRecord,
  SystemNotification
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_TEACHERS,
  INITIAL_STUDENTS,
  INITIAL_SUBJECTS,
  INITIAL_CLASSES,
  INITIAL_REGISTRATION_PERIOD,
  INITIAL_ATTENDANCE_SESSIONS,
  INITIAL_ATTENDANCE_RECORDS,
  INITIAL_MATERIALS,
  INITIAL_ASSIGNMENTS,
  INITIAL_SUBMISSIONS,
  INITIAL_GRADES,
  INITIAL_NOTIFICATIONS
} from './mockData';

const INITIAL_DEPARTMENTS: Department[] = [
  { id: 'CNTT', name: 'Công nghệ thông tin', description: 'Khoa đào tạo về CNTT, Khoa học Máy tính và Phần mềm.' },
  { id: 'KT', name: 'Kinh tế & Quản trị', description: 'Khoa Kinh tế, Kế toán và Quản trị Kinh doanh.' },
  { id: 'NN', name: 'Ngoại ngữ', description: 'Khoa Ngôn ngữ Anh và Ngôn ngữ Nhật.' }
];

interface StoreContextType {
  users: User[];
  students: Student[];
  teachers: Teacher[];
  departments: Department[];
  subjects: Subject[];
  classes: ClassSection[];
  registrationPeriod: RegistrationPeriod;
  attendanceSessions: AttendanceSession[];
  attendanceRecords: AttendanceRecord[];
  materials: LearningMaterial[];
  assignments: Assignment[];
  submissions: Submission[];
  grades: GradeRecord[];
  notifications: SystemNotification[];

  // User Actions
  addUser: (user: User) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;

  // Student Actions
  addStudent: (student: Omit<Student, 'userId' | 'gpa' | 'totalCredits'>) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void; // Soft-delete by marking as suspended or actual delete

  // Teacher Actions
  addTeacher: (teacher: Omit<Teacher, 'userId'>) => void;
  updateTeacher: (id: string, updates: Partial<Teacher>) => void;
  deleteTeacher: (id: string) => void;

  // Department Actions
  addDepartment: (dept: Department) => void;
  updateDepartment: (id: string, updates: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;

  // Subject Actions
  addSubject: (subject: Subject) => void;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;

  // Class Actions
  addClass: (classSec: Omit<ClassSection, 'studentIds'>) => void;
  updateClass: (id: string, updates: Partial<ClassSection>) => void;
  deleteClass: (id: string) => void;
  enrollStudentInClass: (studentId: string, classId: string) => boolean;
  dropStudentFromClass: (studentId: string, classId: string) => boolean;

  // Registration Actions
  updateRegistrationPeriod: (period: RegistrationPeriod) => void;

  // Attendance Actions
  addAttendanceSession: (session: Omit<AttendanceSession, 'id' | 'createdAt'>) => AttendanceSession;
  updateAttendanceSession: (id: string, updates: Partial<AttendanceSession>) => void;
  updateAttendanceRecords: (records: Omit<AttendanceRecord, 'id' | 'updatedAt'>[]) => void;

  // Materials Actions
  addMaterial: (material: Omit<LearningMaterial, 'id' | 'uploadedAt'>) => void;
  deleteMaterial: (id: string) => void;

  // Assignments Actions
  addAssignment: (assignment: Omit<Assignment, 'id' | 'createdAt'>) => void;
  updateAssignment: (id: string, updates: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;

  // Submission Actions
  addSubmission: (submission: Omit<Submission, 'id' | 'submittedAt' | 'status'>) => void;
  gradeSubmission: (id: string, score: number, feedback: string) => void;

  // Grades Actions
  updateGrades: (grades: GradeRecord[]) => void;

  // Notifications Actions
  addNotification: (notification: Omit<SystemNotification, 'id' | 'createdAt'>) => void;
  deleteNotification: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<ClassSection[]>([]);
  const [registrationPeriod, setRegistrationPeriod] = useState<RegistrationPeriod>(INITIAL_REGISTRATION_PERIOD);
  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);

  // Load from LocalStorage or seed initial data
  useEffect(() => {
    const isInitialized = localStorage.getItem('hn_initialized') === 'true';

    if (!isInitialized) {
      localStorage.setItem('hn_users', JSON.stringify(INITIAL_USERS));
      localStorage.setItem('hn_teachers', JSON.stringify(INITIAL_TEACHERS));
      localStorage.setItem('hn_departments', JSON.stringify(INITIAL_DEPARTMENTS));
      localStorage.setItem('hn_students', JSON.stringify(INITIAL_STUDENTS));
      localStorage.setItem('hn_subjects', JSON.stringify(INITIAL_SUBJECTS));
      localStorage.setItem('hn_classes', JSON.stringify(INITIAL_CLASSES));
      localStorage.setItem('hn_registration_period', JSON.stringify(INITIAL_REGISTRATION_PERIOD));
      localStorage.setItem('hn_attendance_sessions', JSON.stringify(INITIAL_ATTENDANCE_SESSIONS));
      localStorage.setItem('hn_attendance_records', JSON.stringify(INITIAL_ATTENDANCE_RECORDS));
      localStorage.setItem('hn_materials', JSON.stringify(INITIAL_MATERIALS));
      localStorage.setItem('hn_assignments', JSON.stringify(INITIAL_ASSIGNMENTS));
      localStorage.setItem('hn_submissions', JSON.stringify(INITIAL_SUBMISSIONS));
      localStorage.setItem('hn_grades', JSON.stringify(INITIAL_GRADES));
      localStorage.setItem('hn_notifications', JSON.stringify(INITIAL_NOTIFICATIONS));
      localStorage.setItem('hn_initialized', 'true');

      setUsers(INITIAL_USERS);
      setTeachers(INITIAL_TEACHERS);
      setDepartments(INITIAL_DEPARTMENTS);
      setStudents(INITIAL_STUDENTS);
      setSubjects(INITIAL_SUBJECTS);
      setClasses(INITIAL_CLASSES);
      setRegistrationPeriod(INITIAL_REGISTRATION_PERIOD);
      setAttendanceSessions(INITIAL_ATTENDANCE_SESSIONS);
      setAttendanceRecords(INITIAL_ATTENDANCE_RECORDS);
      setMaterials(INITIAL_MATERIALS);
      setAssignments(INITIAL_ASSIGNMENTS);
      setSubmissions(INITIAL_SUBMISSIONS);
      setGrades(INITIAL_GRADES);
      setNotifications(INITIAL_NOTIFICATIONS);
    } else {
      setUsers(JSON.parse(localStorage.getItem('hn_users') || '[]'));
      setTeachers(JSON.parse(localStorage.getItem('hn_teachers') || '[]'));
      setDepartments(JSON.parse(localStorage.getItem('hn_departments') || '[]'));
      setStudents(JSON.parse(localStorage.getItem('hn_students') || '[]'));
      setSubjects(JSON.parse(localStorage.getItem('hn_subjects') || '[]'));
      setClasses(JSON.parse(localStorage.getItem('hn_classes') || '[]'));
      setRegistrationPeriod(JSON.parse(localStorage.getItem('hn_registration_period') || JSON.stringify(INITIAL_REGISTRATION_PERIOD)));
      setAttendanceSessions(JSON.parse(localStorage.getItem('hn_attendance_sessions') || '[]'));
      setAttendanceRecords(JSON.parse(localStorage.getItem('hn_attendance_records') || '[]'));
      setMaterials(JSON.parse(localStorage.getItem('hn_materials') || '[]'));
      setAssignments(JSON.parse(localStorage.getItem('hn_assignments') || '[]'));
      setSubmissions(JSON.parse(localStorage.getItem('hn_submissions') || '[]'));
      setGrades(JSON.parse(localStorage.getItem('hn_grades') || '[]'));
      setNotifications(JSON.parse(localStorage.getItem('hn_notifications') || '[]'));
    }
  }, []);

  // Helper to save data and update state
  const saveAndSet = <T,>(key: string, data: T, setter: React.Dispatch<React.SetStateAction<T>>) => {
    localStorage.setItem(key, JSON.stringify(data));
    setter(data);
  };

  // User Actions
  const addUser = (newUser: User) => {
    const updated = [...users, newUser];
    saveAndSet('hn_users', updated, setUsers);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    const updated = users.map(u => (u.id === id ? { ...u, ...updates } : u));
    saveAndSet('hn_users', updated, setUsers);
  };

  const deleteUser = (id: string) => {
    const updated = users.filter(u => u.id !== id);
    saveAndSet('hn_users', updated, setUsers);
  };

  // Student Actions
  const addStudent = (studentData: Omit<Student, 'userId' | 'gpa' | 'totalCredits'>) => {
    const userId = `USR_${studentData.id}`;
    
    // Create new login account for the student
    const newUser: User = {
      id: userId,
      username: studentData.id.toLowerCase(), // e.g. sv006
      role: 'student',
      name: studentData.name,
      email: studentData.email,
      phone: studentData.phone,
      createdAt: new Date().toISOString()
    };
    addUser(newUser);

    const newStudent: Student = {
      ...studentData,
      userId,
      gpa: 0.0,
      totalCredits: 0
    };
    const updated = [...students, newStudent];
    saveAndSet('hn_students', updated, setStudents);
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    const updated = students.map(s => (s.id === id ? { ...s, ...updates } : s));
    saveAndSet('hn_students', updated, setStudents);

    // Sync with corresponding User record if name/email/phone updated
    const student = students.find(s => s.id === id);
    if (student) {
      const userUpdates: Partial<User> = {};
      if (updates.name) userUpdates.name = updates.name;
      if (updates.email) userUpdates.email = updates.email;
      if (updates.phone) userUpdates.phone = updates.phone;
      if (Object.keys(userUpdates).length > 0) {
        updateUser(student.userId, userUpdates);
      }
    }
  };

  const deleteStudent = (id: string) => {
    // Soft delete: mark as temporarily inactive for admin-managed status control
    updateStudent(id, { status: 'on_leave' });
  };

  // Teacher Actions
  const addTeacher = (teacherData: Omit<Teacher, 'userId'>) => {
    const userId = `USR_${teacherData.id}`;

    // Create new login account for the teacher
    const newUser: User = {
      id: userId,
      username: teacherData.id.toLowerCase(), // e.g. gv004
      role: 'teacher',
      name: teacherData.name,
      email: teacherData.email,
      phone: teacherData.phone,
      createdAt: new Date().toISOString()
    };
    addUser(newUser);

    const newTeacher: Teacher = {
      ...teacherData,
      userId
    };
    const updated = [...teachers, newTeacher];
    saveAndSet('hn_teachers', updated, setTeachers);
  };

  const updateTeacher = (id: string, updates: Partial<Teacher>) => {
    const updated = teachers.map(t => (t.id === id ? { ...t, ...updates } : t));
    saveAndSet('hn_teachers', updated, setTeachers);

    // Sync user
    const teacher = teachers.find(t => t.id === id);
    if (teacher) {
      const userUpdates: Partial<User> = {};
      if (updates.name) userUpdates.name = updates.name;
      if (updates.email) userUpdates.email = updates.email;
      if (updates.phone) userUpdates.phone = updates.phone;
      if (Object.keys(userUpdates).length > 0) {
        updateUser(teacher.userId, userUpdates);
      }
    }
  };

  const deleteTeacher = (id: string) => {
    // Soft delete: mark as temporarily inactive for admin-managed status control
    updateTeacher(id, { status: 'on_leave' });
  };

  // Department Actions
  const addDepartment = (dept: Department) => {
    const updated = [...departments, dept];
    saveAndSet('hn_departments', updated, setDepartments);
  };

  const updateDepartment = (id: string, updates: Partial<Department>) => {
    const updated = departments.map(d => (d.id === id ? { ...d, ...updates } : d));
    saveAndSet('hn_departments', updated, setDepartments);
  };

  const deleteDepartment = (id: string) => {
    const updated = departments.filter(d => d.id !== id);
    saveAndSet('hn_departments', updated, setDepartments);
  };

  // Subject Actions
  const addSubject = (newSub: Subject) => {
    const updated = [...subjects, newSub];
    saveAndSet('hn_subjects', updated, setSubjects);
  };

  const updateSubject = (id: string, updates: Partial<Subject>) => {
    const updated = subjects.map(s => (s.id === id ? { ...s, ...updates } : s));
    saveAndSet('hn_subjects', updated, setSubjects);
  };

  const deleteSubject = (id: string) => {
    const updated = subjects.filter(s => s.id !== id);
    saveAndSet('hn_subjects', updated, setSubjects);
  };

  // Class Actions
  const addClass = (classData: Omit<ClassSection, 'studentIds'>) => {
    const newClass: ClassSection = {
      ...classData,
      studentIds: []
    };
    const updated = [...classes, newClass];
    saveAndSet('hn_classes', updated, setClasses);
  };

  const updateClass = (id: string, updates: Partial<ClassSection>) => {
    const updated = classes.map(c => (c.id === id ? { ...c, ...updates } : c));
    saveAndSet('hn_classes', updated, setClasses);
  };

  const deleteClass = (id: string) => {
    const updated = classes.filter(c => c.id !== id);
    saveAndSet('hn_classes', updated, setClasses);
  };

  const enrollStudentInClass = (studentId: string, classId: string): boolean => {
    const targetClass = classes.find(c => c.id === classId);
    if (!targetClass) return false;
    if (targetClass.studentIds.includes(studentId)) return false; // Already enrolled
    if (targetClass.studentIds.length >= targetClass.capacity) return false; // Class full

    const updated = classes.map(c => {
      if (c.id === classId) {
        return {
          ...c,
          studentIds: [...c.studentIds, studentId]
        };
      }
      return c;
    });
    saveAndSet('hn_classes', updated, setClasses);

    // Seed empty grade record for this student in this class
    const gradeId = `${classId}_${studentId}`;
    const studentObj = students.find(s => s.id === studentId);
    const hasGrade = grades.some(g => g.id === gradeId);
    if (!hasGrade && studentObj) {
      const newGrade: GradeRecord = {
        id: gradeId,
        classId,
        studentId,
        studentName: studentObj.name
      };
      saveAndSet('hn_grades', [...grades, newGrade], setGrades);
    }

    return true;
  };

  const dropStudentFromClass = (studentId: string, classId: string): boolean => {
    const targetClass = classes.find(c => c.id === classId);
    if (!targetClass || !targetClass.studentIds.includes(studentId)) return false;

    const updated = classes.map(c => {
      if (c.id === classId) {
        return {
          ...c,
          studentIds: c.studentIds.filter(id => id !== studentId)
        };
      }
      return c;
    });
    saveAndSet('hn_classes', updated, setClasses);

    // Optionally delete grade record
    const gradeId = `${classId}_${studentId}`;
    const filteredGrades = grades.filter(g => g.id !== gradeId);
    saveAndSet('hn_grades', filteredGrades, setGrades);

    return true;
  };

  // Registration Actions
  const updateRegistrationPeriod = (period: RegistrationPeriod) => {
    saveAndSet('hn_registration_period', period, setRegistrationPeriod);
  };

  // Attendance Actions
  const addAttendanceSession = (sessionData: Omit<AttendanceSession, 'id' | 'createdAt'>): AttendanceSession => {
    const newSessionId = `SES${Math.floor(100 + Math.random() * 900)}`;
    const newSession: AttendanceSession = {
      ...sessionData,
      id: newSessionId,
      createdAt: new Date().toISOString()
    };

    const updated = [...attendanceSessions, newSession];
    saveAndSet('hn_attendance_sessions', updated, setAttendanceSessions);

    // Automatically create empty attendance records for all students currently in that class
    const targetClass = classes.find(c => c.id === sessionData.classId);
    if (targetClass) {
      const recordsToCreate: AttendanceRecord[] = targetClass.studentIds.map((studentId, idx) => {
        const studentObj = students.find(s => s.id === studentId);
        return {
          id: `REC${Math.floor(1000 + Math.random() * 9000)}_${idx}`,
          sessionId: newSessionId,
          classId: sessionData.classId,
          studentId,
          studentName: studentObj?.name || 'Sinh viên',
          status: 'absent' as const, // defaulted to absent, teacher will edit
          updatedAt: new Date().toISOString()
        };
      });
      const newRecords = [...attendanceRecords, ...recordsToCreate];
      saveAndSet('hn_attendance_records', newRecords, setAttendanceRecords);
    }

    return newSession;
  };

  const updateAttendanceSession = (id: string, updates: Partial<AttendanceSession>) => {
    const updated = attendanceSessions.map(s => (s.id === id ? { ...s, ...updates } : s));
    saveAndSet('hn_attendance_sessions', updated, setAttendanceSessions);
  };

  const updateAttendanceRecords = (records: Omit<AttendanceRecord, 'id' | 'updatedAt'>[]) => {
    // Batch update or replace existing records
    const updatedRecords = [...attendanceRecords];
    
    records.forEach(newRec => {
      const idx = updatedRecords.findIndex(r => r.sessionId === newRec.sessionId && r.studentId === newRec.studentId);
      if (idx !== -1) {
        updatedRecords[idx] = {
          ...updatedRecords[idx],
          status: newRec.status,
          noted: newRec.noted,
          updatedAt: new Date().toISOString()
        };
      } else {
        updatedRecords.push({
          id: `REC${Math.floor(10000 + Math.random() * 90000)}`,
          ...newRec,
          updatedAt: new Date().toISOString()
        });
      }
    });

    saveAndSet('hn_attendance_records', updatedRecords, setAttendanceRecords);
  };

  // Materials Actions
  const addMaterial = (matData: Omit<LearningMaterial, 'id' | 'uploadedAt'>) => {
    const newMat: LearningMaterial = {
      ...matData,
      id: `MAT_${Math.floor(100 + Math.random() * 900)}`,
      uploadedAt: new Date().toISOString()
    };
    const updated = [...materials, newMat];
    saveAndSet('hn_materials', updated, setMaterials);
  };

  const deleteMaterial = (id: string) => {
    const updated = materials.filter(m => m.id !== id);
    saveAndSet('hn_materials', updated, setMaterials);
  };

  // Assignments Actions
  const addAssignment = (asmData: Omit<Assignment, 'id' | 'createdAt'>) => {
    const newAsm: Assignment = {
      ...asmData,
      id: `ASM_${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString()
    };
    const updated = [...assignments, newAsm];
    saveAndSet('hn_assignments', updated, setAssignments);
  };

  const updateAssignment = (id: string, updates: Partial<Assignment>) => {
    const updated = assignments.map(a => (a.id === id ? { ...a, ...updates } : a));
    saveAndSet('hn_assignments', updated, setAssignments);
  };

  const deleteAssignment = (id: string) => {
    const updated = assignments.filter(a => a.id !== id);
    saveAndSet('hn_assignments', updated, setAssignments);
  };

  // Submission Actions
  const addSubmission = (subData: Omit<Submission, 'id' | 'submittedAt' | 'status'>) => {
    const existingIdx = submissions.findIndex(
      s => s.assignmentId === subData.assignmentId && s.studentId === subData.studentId
    );
    let updated;
    if (existingIdx !== -1) {
      updated = [...submissions];
      updated[existingIdx] = {
        ...updated[existingIdx],
        ...subData,
        submittedAt: new Date().toISOString(),
        status: 'submitted'
      };
    } else {
      const newSub: Submission = {
        ...subData,
        id: `SUB_${Math.floor(100 + Math.random() * 900)}`,
        submittedAt: new Date().toISOString(),
        status: 'submitted'
      };
      updated = [...submissions, newSub];
    }
    saveAndSet('hn_submissions', updated, setSubmissions);
  };

  const gradeSubmission = (id: string, score: number, feedback: string) => {
    const updatedSubmissions = submissions.map(s => {
      if (s.id === id) {
        return {
          ...s,
          score,
          feedback,
          status: 'graded' as const
        };
      }
      return s;
    });
    saveAndSet('hn_submissions', updatedSubmissions, setSubmissions);

    // Automatically sync back to the GradeRecord for that student and class
    const sub = submissions.find(s => s.id === id);
    if (sub) {
      const gradeId = `${sub.classId}_${sub.studentId}`;
      const updatedGrades = grades.map(g => {
        if (g.id === gradeId) {
          // If assignment title or description implies it's progress or midterm, we update that
          // But normally, teacher will manually manage the final 10/30/60 grade card. Let's make sure
          // midScore/endScore are updated or just pre-populated nicely.
          return {
            ...g,
            progressScore: score // update progress/assignment score
          };
        }
        return g;
      });
      saveAndSet('hn_grades', updatedGrades, setGrades);
    }
  };

  // Grades Actions
  const updateGrades = (newGrades: GradeRecord[]) => {
    const updated = [...grades];
    newGrades.forEach(ng => {
      const idx = updated.findIndex(g => g.id === ng.id);
      if (idx !== -1) {
        updated[idx] = { ...updated[idx], ...ng };
      } else {
        updated.push(ng);
      }
    });
    saveAndSet('hn_grades', updated, setGrades);
  };

  // Notifications Actions
  const addNotification = (notifData: Omit<SystemNotification, 'id' | 'createdAt'>) => {
    const newNotif: SystemNotification = {
      ...notifData,
      id: `NTF_${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString()
    };
    const updated = [newNotif, ...notifications]; // Newest first
    saveAndSet('hn_notifications', updated, setNotifications);
  };

  const deleteNotification = (id: string) => {
    const updated = notifications.filter(n => n.id !== id);
    saveAndSet('hn_notifications', updated, setNotifications);
  };

  return (
    <StoreContext.Provider
      value={{
        users,
        students,
        teachers,
        departments,
        subjects,
        classes,
        registrationPeriod,
        attendanceSessions,
        attendanceRecords,
        materials,
        assignments,
        submissions,
        grades,
        notifications,

        addUser,
        updateUser,
        deleteUser,

        addStudent,
        updateStudent,
        deleteStudent,

        addTeacher,
        updateTeacher,
        deleteTeacher,

        addDepartment,
        updateDepartment,
        deleteDepartment,

        addSubject,
        updateSubject,
        deleteSubject,

        addClass,
        updateClass,
        deleteClass,
        enrollStudentInClass,
        dropStudentFromClass,

        updateRegistrationPeriod,

        addAttendanceSession,
        updateAttendanceSession,
        updateAttendanceRecords,

        addMaterial,
        deleteMaterial,

        addAssignment,
        updateAssignment,
        deleteAssignment,

        addSubmission,
        gradeSubmission,

        updateGrades,

        addNotification,
        deleteNotification
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
