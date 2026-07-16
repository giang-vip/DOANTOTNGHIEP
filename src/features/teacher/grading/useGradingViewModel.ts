import { useState, useEffect } from 'react';
import { useStore } from '../../../models/store';
import { ClassSection, GradeRecord, Student } from '../../../types';

export function getDefaultColumnsConfig(n: number) {
  if (n === 3) {
    return [
      { key: 'col_0', name: 'TX1', weight: 0.3 },
      { key: 'col_1', name: 'TX2', weight: 0.3 },
      { key: 'col_2', name: 'Cuối Kỳ', weight: 0.4 }
    ];
  } else if (n === 4) {
    return [
      { key: 'col_0', name: 'TX1', weight: 0.1 },
      { key: 'col_1', name: 'TX2', weight: 0.2 },
      { key: 'col_2', name: 'Giữa Kỳ', weight: 0.3 },
      { key: 'col_3', name: 'Cuối Kỳ', weight: 0.4 }
    ];
  } else if (n === 5) {
    return [
      { key: 'col_0', name: 'TX1', weight: 0.15 },
      { key: 'col_1', name: 'TX2', weight: 0.15 },
      { key: 'col_2', name: 'Giữa Kỳ', weight: 0.2 },
      { key: 'col_3', name: 'TX3', weight: 0.15 },
      { key: 'col_4', name: 'Cuối Kỳ', weight: 0.35 }
    ];
  } else {
    // General N-column formula
    const config = [];
    const lastWeight = 0.4;
    const remainingWeight = 0.6;
    const itemWeightRaw = remainingWeight / (n - 1);
    const itemWeight = Math.round(itemWeightRaw * 100) / 100;
    
    let sumWeights = 0;
    for (let i = 0; i < n - 1; i++) {
      const isLastPre = i === n - 2;
      const w = isLastPre ? Math.round((remainingWeight - sumWeights) * 100) / 100 : itemWeight;
      sumWeights += w;
      config.push({
        key: `col_${i}`,
        name: `TX${i + 1}`,
        weight: w
      });
    }
    config.push({
      key: `col_${n - 1}`,
      name: 'Cuối Kỳ',
      weight: lastWeight
    });
    return config;
  }
}

export function useGradingViewModel(teacherId: string) {
  const {
    classes,
    students,
    grades,
    attendanceSessions,
    attendanceRecords,
    updateGrades
  } = useStore();

  const myClasses = classes.filter(c => c.teacherId === teacherId);

  const [selectedClass, setSelectedClass] = useState<ClassSection | null>(null);
  
  // Columns configurations
  const [columnsConfig, setColumnsConfig] = useState<Array<{ key: string; name: string; weight: number }>>([]);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [numAssessments, setNumAssessments] = useState(4);
  const [tempConfig, setTempConfig] = useState<Array<{ key: string; name: string; weight: number }>>([]);

  // Local unsaved grades state: { [studentId]: { [colKey]: number | '' } }
  const [localGrades, setLocalGrades] = useState<Record<string, Record<string, number | ''>>>({});

  // Set default class
  useEffect(() => {
    if (myClasses.length > 0 && !selectedClass) {
      setSelectedClass(myClasses[0]);
    }
  }, [classes]);

  // Load columns configuration and students grades when selected class changes
  useEffect(() => {
    if (!selectedClass) return;

    // Load columns config
    const savedConfig = localStorage.getItem(`hn_grade_cols_config_${selectedClass.id}`);
    let activeCols = savedConfig ? JSON.parse(savedConfig) : getDefaultColumnsConfig(4);
    setColumnsConfig(activeCols);
    setNumAssessments(activeCols.length);

    // Filter students
    const classStudents = students.filter(s => selectedClass.studentIds.includes(s.id) && s.status === 'active');
    
    // Build initial local grades from global state
    const initialLocal: Record<string, Record<string, number | ''>> = {};
    classStudents.forEach(student => {
      const gradeId = `${selectedClass.id}_${student.id}`;
      const rec = grades.find(g => g.id === gradeId);
      
      const recordScores: Record<string, number | ''> = {};
      
      activeCols.forEach((col: any) => {
        // Read from scores dictionary
        if (rec?.scores && rec.scores[col.key] !== undefined) {
          recordScores[col.key] = rec.scores[col.key];
        } else {
          // Backward compatibility map
          if (col.key === 'col_0' && rec?.progressScore !== undefined) {
            recordScores[col.key] = rec.progressScore;
          } else if (col.key === 'col_1' && (rec as any)?.tx2Score !== undefined) {
            recordScores[col.key] = (rec as any).tx2Score;
          } else if (col.key === 'col_2' && rec?.midScore !== undefined) {
            recordScores[col.key] = rec.midScore;
          } else if (col.key === 'col_3' && rec?.endScore !== undefined) {
            recordScores[col.key] = rec.endScore;
          } else {
            recordScores[col.key] = '';
          }
        }
      });
      
      initialLocal[student.id] = recordScores;
    });
    
    setLocalGrades(initialLocal);
  }, [selectedClass, grades, students]);

  const classStudents = selectedClass
    ? students.filter(s => selectedClass.studentIds.includes(s.id) && s.status === 'active')
    : [];

  const classSessions = selectedClass
    ? attendanceSessions.filter(s => s.classId === selectedClass.id)
    : [];

  // Calculate student attendance score (0-10)
  const getAttendanceBonus = (studentId: string): number => {
    const classSessionIds = classSessions.map(s => s.id);
    const records = attendanceRecords.filter(
      r => r.classId === selectedClass?.id && r.studentId === studentId && classSessionIds.includes(r.sessionId)
    );
    
    if (records.length === 0) return 10; // Default max score
    
    const present = records.filter(r => r.status === 'present').length;
    const late = records.filter(r => r.status === 'late').length;
    
    // Present is 1.0, late is 0.5, absent is 0
    const score = ((present + late * 0.5) / records.length) * 10;
    return Math.round(score * 10) / 10;
  };

  // Build rows for rendering in table
  const gradeRows = classStudents.map(student => {
    const studentInputs = localGrades[student.id] || {};
    const attScore = getAttendanceBonus(student.id);

    // Calculate dynamic final
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
      studentId: student.id,
      studentName: student.name,
      attendance: attScore,
      inputs: studentInputs,
      final: allFilled ? Math.round(computedFinal! * 10) / 10 : undefined
    };
  });

  const updateLocalGrade = (studentId: string, colKey: string, val: string) => {
    const numVal = val === '' ? '' : parseFloat(val);
    setLocalGrades(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [colKey]: numVal === '' ? '' : Math.max(0, Math.min(10, numVal))
      }
    }));
  };

  const handleSaveAllGrades = (onSuccess: (msg: string) => void) => {
    if (!selectedClass) return;

    // Convert localGrades into global store payloads
    const payloads: GradeRecord[] = classStudents.map(student => {
      const studentInputs = localGrades[student.id] || {};
      const gradeId = `${selectedClass.id}_${student.id}`;
      
      const scoreObj: Record<string, number> = {};
      columnsConfig.forEach(col => {
        const val = studentInputs[col.key];
        if (val !== undefined && val !== '') {
          scoreObj[col.key] = val as number;
        }
      });

      // Maintain backward compatibility properties in store
      const progressScore = studentInputs['col_0'] !== undefined && studentInputs['col_0'] !== '' ? (studentInputs['col_0'] as number) : undefined;
      const tx2Score = studentInputs['col_1'] !== undefined && studentInputs['col_1'] !== '' ? (studentInputs['col_1'] as number) : undefined;
      const midScore = studentInputs['col_2'] !== undefined && studentInputs['col_2'] !== '' ? (studentInputs['col_2'] as number) : undefined;
      const endScore = studentInputs['col_3'] !== undefined && studentInputs['col_3'] !== '' ? (studentInputs['col_3'] as number) : undefined;

      return {
        id: gradeId,
        classId: selectedClass.id,
        studentId: student.id,
        studentName: student.name,
        progressScore,
        midScore,
        endScore,
        tx2Score, // stored on payload dynamically
        scores: scoreObj
      } as any;
    });

    updateGrades(payloads);
    onSuccess('Lưu điểm thành công!');
  };

  const handleSaveColumnsConfig = (newConfig: Array<{ key: string; name: string; weight: number }>) => {
    if (!selectedClass) return;
    localStorage.setItem(`hn_grade_cols_config_${selectedClass.id}`, JSON.stringify(newConfig));
    setColumnsConfig(newConfig);

    // Reset local grades with new config columns
    setLocalGrades(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(studentId => {
        const studentRow = { ...updated[studentId] };
        newConfig.forEach(col => {
          if (studentRow[col.key] === undefined) {
            studentRow[col.key] = '';
          }
        });
        updated[studentId] = studentRow;
      });
      return updated;
    });
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
    updateLocalGrade,
    gradeRows,
    saveAllGrades: handleSaveAllGrades,
    saveColumnsConfig: handleSaveColumnsConfig
  };
}
