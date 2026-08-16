import { useState, useEffect } from 'react';
import { teacherApi } from '../../../api/services/teacherApi';

/**
 * Trả về cấu hình mặc định tương ứng với 3 cột điểm trong DB.
 */
export function getDefaultColumnsConfig(n: number) {
  return [
    { key: 'attendanceScore', name: 'Chuyên Cần', weight: 0.10 },
    { key: 'midtermScore', name: 'Giữa Kỳ', weight: 0.30 },
    { key: 'finalExamScore', name: 'Cuối Kỳ', weight: 0.60 }
  ];
}

/**
 * ViewModel cho Nhập & Xuất Điểm (Teacher Grading) của Giảng viên.
 * Đồng bộ toàn bộ cấu hình trọng số và điểm số (Chuyên cần, Giữa kỳ, Cuối kỳ) của lớp học phần.
 */
export function useGradingViewModel(teacherId: string) {
  const [myClasses, setMyClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any | null>(null);
  
  // Trọng số điểm: Chuyên cần, Giữa kỳ, Cuối kỳ
  const [columnsConfig, setColumnsConfig] = useState<Array<{ key: string; name: string; weight: number }>>([]);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [numAssessments, setNumAssessments] = useState(3);
  const [tempConfig, setTempConfig] = useState<Array<{ key: string; name: string; weight: number }>>([]);

  // Bảng điểm local: { [studentId]: { [colKey]: score } }
  const [localGrades, setLocalGrades] = useState<Record<string, Record<string, number | ''>>>({});
  
  // Dữ liệu thô từ API Final Grades
  const [rawGrades, setRawGrades] = useState<any[]>([]);

  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [isLoadingGrades, setIsLoadingGrades] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const getClassId = (cls: any): number => {
    return Number(cls.id);
  };

  // 1. Fetch danh sách lớp của GV
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setIsLoadingClasses(true);
        const res: any = await teacherApi.getMyClasses();
        const items = res.content || res || [];
        setMyClasses(items);
        if (items.length > 0 && !selectedClass) {
          setSelectedClass(items[0]);
        }
      } catch (err) {
        console.error('Lỗi lấy lớp học:', err);
      } finally {
        setIsLoadingClasses(false);
      }
    };
    fetchClasses();
  }, [teacherId]);

  // 2. Load cấu hình cột (trọng số) và điểm số từ BE khi đổi lớp
  const fetchGradesData = async () => {
    if (!selectedClass) return;
    const classId = getClassId(selectedClass);

    // Cấu hình trọng số từ selectedClass (BE trả về)
    const attW = selectedClass.attendanceWeight !== null ? selectedClass.attendanceWeight : 10;
    const midW = selectedClass.midtermWeight !== null ? selectedClass.midtermWeight : 30;
    const finW = selectedClass.finalWeight !== null ? selectedClass.finalWeight : 60;

    // Load custom names from localStorage if they exist
    const storedNamesJson = localStorage.getItem(`grading_names_${classId}`);
    const customNames = storedNamesJson ? JSON.parse(storedNamesJson) : null;

    const activeCols = [
      { key: 'attendanceScore', name: customNames?.attendanceScore || 'Chuyên Cần', weight: attW / 100 },
      { key: 'midtermScore', name: customNames?.midtermScore || 'Giữa Kỳ', weight: midW / 100 },
      { key: 'finalExamScore', name: customNames?.finalExamScore || 'Cuối Kỳ', weight: finW / 100 }
    ];
    
    setColumnsConfig(activeCols);
    setNumAssessments(3);

    try {
      setIsLoadingGrades(true);
      const res: any = await teacherApi.getFinalGrades(classId);
      const items = res.content || res || [];
      setRawGrades(items);

      // Build bảng điểm cục bộ để chỉnh sửa
      const initialLocal: Record<string, Record<string, number | ''>> = {};
      items.forEach((g: any) => {
        initialLocal[String(g.studentCode)] = {
          attendanceScore: (g.attendanceScore !== null && g.attendanceScore !== undefined) ? Number(g.attendanceScore) : '',
          midtermScore: (g.midtermScore !== null && g.midtermScore !== undefined) ? Number(g.midtermScore) : '',
          finalExamScore: (g.finalExamScore !== null && g.finalExamScore !== undefined) ? Number(g.finalExamScore) : ''
        };
      });
      setLocalGrades(initialLocal);
    } catch (err) {
      console.error('Lỗi lấy bảng điểm:', err);
    } finally {
      setIsLoadingGrades(false);
    }
  };

  useEffect(() => {
    fetchGradesData();
  }, [selectedClass]);

  // Hàng dữ liệu phục vụ render bảng
  const gradeRows = rawGrades.map((g: any) => {
    const studentInputs = localGrades[String(g.studentCode)] || {};
    
    let computedFinal: number | undefined = 0;
    let allFilled = true;

    columnsConfig.forEach(col => {
      const val = studentInputs[col.key];
      if (val === undefined || val === '') {
        allFilled = false;
      } else {
        computedFinal! += (val as number) * col.weight;
      }
    });

    return {
      enrollmentId: g.enrollmentId,
      studentId: g.studentCode,
      studentName: g.studentName,
      attendance: studentInputs.attendanceScore !== '' ? Number(studentInputs.attendanceScore) : 10,
      inputs: studentInputs,
      final: allFilled ? Math.round(computedFinal! * 10) / 10 : (g.finalScore !== null ? Number(g.finalScore) : undefined),
      letterGrade: g.finalGrade || ''
    };
  });

  const updateLocalGrade = (studentCode: string, colKey: string, val: string) => {
    const numVal = val === '' ? '' : parseFloat(val);
    setLocalGrades(prev => ({
      ...prev,
      [studentCode]: {
        ...(prev[studentCode] || {}),
        [colKey]: numVal === '' ? '' : Math.max(0, Math.min(10, numVal))
      }
    }));
  };

  // Lưu bảng điểm lên server
  const handleSaveAllGrades = async (onSuccess: (msg: string) => void) => {
    if (!selectedClass) return;
    const classId = getClassId(selectedClass);

    try {
      setIsSaving(true);
      const payloads = rawGrades.map((g: any) => {
        const studentInputs = localGrades[String(g.studentCode)] || {};
        return {
          enrollmentId: Number(g.enrollmentId),
          attendanceScore: studentInputs.attendanceScore !== '' ? Number(studentInputs.attendanceScore) : undefined,
          midtermScore: studentInputs.midtermScore !== '' ? Number(studentInputs.midtermScore) : undefined,
          finalExamScore: studentInputs.finalExamScore !== '' ? Number(studentInputs.finalExamScore) : undefined
        };
      });

      await teacherApi.updateStudentGrades(classId, payloads);
      onSuccess('Lưu bảng điểm thành công!');
      fetchGradesData(); // Reload từ server
    } catch (err) {
      console.error('Lỗi khi lưu bảng điểm:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Lưu cấu hình trọng số lên server
  const handleSaveColumnsConfig = async (newConfig: Array<{ key: string; name: string; weight: number }>) => {
    if (!selectedClass) return;
    const classId = getClassId(selectedClass);

    try {
      const attW = Math.round((newConfig.find(c => c.key === 'attendanceScore')?.weight || 0.1) * 100);
      const midW = Math.round((newConfig.find(c => c.key === 'midtermScore')?.weight || 0.3) * 100);
      const finW = Math.round((newConfig.find(c => c.key === 'finalExamScore')?.weight || 0.6) * 100);

      await teacherApi.configureGradeWeights(classId, {
        attendanceWeight: attW,
        midtermWeight: midW,
        finalWeight: finW
      });

      // Save custom column names to localStorage
      const customNames = {
        attendanceScore: newConfig.find(c => c.key === 'attendanceScore')?.name || 'Chuyên Cần',
        midtermScore: newConfig.find(c => c.key === 'midtermScore')?.name || 'Giữa Kỳ',
        finalExamScore: newConfig.find(c => c.key === 'finalExamScore')?.name || 'Cuối Kỳ',
      };
      localStorage.setItem(`grading_names_${classId}`, JSON.stringify(customNames));

      // Cập nhật selectedClass trọng số cục bộ
      setSelectedClass((prev: any) => {
        if (!prev) return null;
        return {
          ...prev,
          attendanceWeight: attW,
          midtermWeight: midW,
          finalWeight: finW
        };
      });

      // Cập nhật myClasses để đồng bộ lựa chọn sau này
      setMyClasses((prevClasses: any[]) =>
        prevClasses.map((c: any) =>
          getClassId(c) === classId
            ? { ...c, attendanceWeight: attW, midtermWeight: midW, finalWeight: finW }
            : c
        )
      );

      // Reload
      fetchGradesData();
    } catch (err) {
      console.error('Lỗi khi cấu hình điểm:', err);
    }
  };

  return {
    myClasses,
    selectedClass,
    setSelectedClass,
    columnsConfig,
    isConfiguring,
    setIsConfiguring,
    numAssessments,
    setNumAssessments,
    tempConfig,
    setTempConfig,
    localGrades,
    setLocalGrades,
    updateLocalGrade,
    gradeRows,
    saveAllGrades: handleSaveAllGrades,
    saveColumnsConfig: handleSaveColumnsConfig,
    isLoading: isLoadingClasses || isLoadingGrades || isSaving
  };
}
