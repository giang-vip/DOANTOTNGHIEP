// /**
//  * @license
//  * SPDX-License-Identifier: Apache-2.0
//  */

// import { useState, useEffect, useCallback } from 'react';
// import { adminApi } from '../api/services/adminApi';
// import { Student, Teacher, Subject, ClassSection, SystemNotification, RegistrationPeriod } from '../models';

// export function useAdminViewModel() {
//   const [students, setStudents] = useState<Student[]>([]);
//   const [teachers, setTeachers] = useState<Teacher[]>([]);
//   const [classes, setClasses] = useState<ClassSection[]>([]);
//   const [subjects, setSubjects] = useState<Subject[]>([]);
//   const [notifications, setNotifications] = useState<SystemNotification[]>([]);
//   const [registrationPeriod, setRegistrationPeriod] = useState<RegistrationPeriod | null>(null);
  
//   const [loading, setLoading] = useState(false);
//   const [stats, setStats] = useState({
//     totalStudents: 0,
//     totalTeachers: 0,
//     totalClasses: 0,
//     totalSubjects: 0,
//     avgAttendanceRate: 95, // Fallback since admin API might not expose raw attendance
//     classEnrollments: [] as any[],
//     classAttendanceRates: [] as any[],
//     departmentShare: [] as any[]
//   });

//   const fetchAllData = useCallback(async () => {
//     setLoading(true);
//     try {
//       // Fetch all required data in parallel
//       const [
//         studentsRes,
//         teachersRes,
//         classesRes,
//         subjectsRes,
//         dashboardStats
//       ] = await Promise.all([
//         adminApi.getAllStudents(0, 5000), // Get a large page for UI tables
//         adminApi.getAllTeachersList(),
//         adminApi.getAllClassSectionsList(),
//         adminApi.getAllSubjectsList(),
//         adminApi.getDashboardStats().catch(() => null) // Optional dashboard stats
//       ]);

//       const studentsData = studentsRes?.content || [];
//       setStudents(studentsData);
//       setTeachers(teachersRes || []);
//       setClasses(classesRes || []);
//       setSubjects(subjectsRes || []);
      
//       // Calculate Stats
//       const totalSt = studentsData.length;
//       const totalTe = (teachersRes || []).length;
//       const totalCl = (classesRes || []).length;
//       const totalSu = (subjectsRes || []).length;
      
//       // Calculate Department Share
//       const deptCount: Record<string, number> = {};
//       studentsData.forEach(s => {
//         // Fallback for majorName if classCode isn't present
//         const major = s.majorName || s.classCode?.split('-')[1] || 'Khác';
//         deptCount[major] = (deptCount[major] || 0) + 1;
//       });

//       const departmentShare = Object.entries(deptCount).map(([name, value]) => ({
//         name,
//         value
//       }));

//       // Map class enrollments
//       const classEnrollments = (classesRes || []).map(c => ({
//         name: String(c.id || 'Unknown'),
//         subject: c.subjectName,
//         enrolled: c.enrolledCount || 0,
//         capacity: c.capacity || 50
//       }));

//       setStats({
//         totalStudents: dashboardStats?.totalStudents || totalSt,
//         totalTeachers: dashboardStats?.totalTeachers || totalTe,
//         totalClasses: dashboardStats?.totalClasses || totalCl,
//         totalSubjects: dashboardStats?.totalSubjects || totalSu,
//         avgAttendanceRate: dashboardStats?.avgAttendanceRate || 95,
//         classEnrollments: classEnrollments,
//         classAttendanceRates: [], // Needs detailed attendance API
//         departmentShare: departmentShare
//       });

//       // Try fetching notifications and registration periods
//       adminApi.getAllAnnouncements().then(res => setNotifications(res as any)).catch(console.error);
//       adminApi.getAllRegistrationPeriods().then(res => {
//         if (res && res.length > 0) setRegistrationPeriod(res[0]);
//       }).catch(console.error);

//     } catch (error) {
//       console.error("Error fetching admin data:", error);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchAllData();
//   }, [fetchAllData]);

//   // CRUD wrappers that call API and then refresh data
//   const createStudent = async (data: any) => {
//     await adminApi.createStudent(data);
//     await fetchAllData();
//   };

//   const editStudent = async (id: number, data: any) => {
//     await adminApi.updateStudent(id, data);
//     await fetchAllData();
//   };

//   const removeStudent = async (id: number) => {
//     await adminApi.deleteStudent(id);
//     await fetchAllData();
//   };

//   const createTeacher = async (data: any) => {
//     await adminApi.createTeacher(data);
//     await fetchAllData();
//   };

//   const editTeacher = async (id: number, data: any) => {
//     await adminApi.updateTeacher(id, data);
//     await fetchAllData();
//   };

//   const removeTeacher = async (id: number) => {
//     await adminApi.deleteTeacher(id);
//     await fetchAllData();
//   };

//   const createSubject = async (data: any) => {
//     await adminApi.createSubject(data);
//     await fetchAllData();
//   };

//   const editSubject = async (id: number, data: any) => {
//     await adminApi.updateSubject(id, data);
//     await fetchAllData();
//   };

//   const removeSubject = async (id: number) => {
//     await adminApi.deleteSubject(id);
//     await fetchAllData();
//   };

//   const createClass = async (data: any) => {
//     await adminApi.createClassSection(data);
//     await fetchAllData();
//   };

//   const editClass = async (id: number, data: any) => {
//     await adminApi.updateClassSection(id, data);
//     await fetchAllData();
//   };

//   const removeClass = async (id: number) => {
//     await adminApi.deleteClassSection(id);
//     await fetchAllData();
//   };

//   const setRegistrationWindow = async (startDate: string, endDate: string, isOpen: boolean) => {
//     // Basic implementation since backend might have different ID handling
//     if (registrationPeriod?.id) {
//       await adminApi.createOrUpdateRegistrationPeriod({ id: registrationPeriod.id, startDate, endDate, isOpen } as any);
//     } else {
//       await adminApi.createOrUpdateRegistrationPeriod({ startDate, endDate, isOpen } as any);
//     }
//     await fetchAllData();
//   };

//   const sendGlobalAnnouncement = async (title: string, content: string, targetGroup: 'all' | 'teachers' | 'students') => {
//     await adminApi.createAnnouncement({ title, content, targetGroup } as any);
//     await fetchAllData();
//     return true;
//   };

//   const removeAnnouncement = async (id: number) => {
//     await adminApi.deleteAnnouncement(id);
//     await fetchAllData();
//   };

//   return {
//     loading,
//     students,
//     teachers,
//     classes,
//     subjects,
//     notifications,
//     registrationPeriod,
//     stats,
//     createStudent,
//     editStudent,
//     removeStudent,
//     createTeacher,
//     editTeacher,
//     removeTeacher,
//     createSubject,
//     editSubject,
//     removeSubject,
//     createClass,
//     editClass,
//     removeClass,
//     setRegistrationWindow,
//     sendGlobalAnnouncement,
//     removeAnnouncement
//   };
// }
