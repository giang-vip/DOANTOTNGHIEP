export interface RegistrationPeriod {
  id?: number;
  semesterId: number;
  semesterCode?: string;
  startDate: string;
  endDate: string;
  isOpen: boolean;
}

export interface RegistrationPeriodRequest {
  semesterId: number;
  startDate: string;
  endDate: string;
  isOpen: boolean;
}
