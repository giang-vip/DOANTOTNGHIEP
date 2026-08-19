import { useState } from 'react';
import { ClassSection } from '../../../models/ClassSection';

export type AdminClassDetailTab = 'info' | 'grades';

export function useAdminClassDetailViewModel(initialClass: ClassSection) {
  const [activeTab, setActiveTab] = useState<AdminClassDetailTab>('info');
  const [classSection, setClassSection] = useState<ClassSection>(initialClass);

  return {
    activeTab,
    setActiveTab,
    classSection,
    setClassSection
  };
}
