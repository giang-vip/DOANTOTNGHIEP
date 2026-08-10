export interface Department {
  id: number;
  code: string;
  name: string;
  description?: string;
}

export interface DepartmentRequest {
  code: string;
  name: string;
  description?: string;
}
