export interface User {
  id: string;
  username: string;
  role: 'admin' | 'teacher' | 'student';
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
}
