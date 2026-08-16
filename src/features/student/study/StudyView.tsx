import React, { useState } from 'react';
import { Student, ClassSection } from '../../../models';
import { ClassSelectionView } from './class-selection/ClassSelectionView';
import { ClassDetailView } from './class-detail/ClassDetailView';

export interface StudyViewProps {
  studentProfile: Student;
  triggerToast: (msg: string, type: 'success' | 'danger') => void;
}

export function StudyView({ studentProfile, triggerToast }: StudyViewProps) {
  const [selectedClass, setSelectedClass] = useState<ClassSection | null>(null);

  // We keep a simple flag to re-render or bubble up updates 
  // if ClassDetailView does something that affects ClassSelectionView
  const [updateTick, setUpdateTick] = useState(0);

  const handlePendingUpdate = () => {
    setUpdateTick(prev => prev + 1);
  };

  return (
    <div className="w-full">
      {!selectedClass ? (
        <ClassSelectionView 
          key={updateTick} // Force re-render/re-fetch when coming back
          studentProfile={studentProfile} 
          onSelectClass={setSelectedClass} 
        />
      ) : (
        <ClassDetailView
          studentProfile={studentProfile}
          selectedClass={selectedClass}
          onBack={() => setSelectedClass(null)}
          triggerToast={triggerToast}
          onPendingUpdate={handlePendingUpdate}
        />
      )}
    </div>
  );
}
