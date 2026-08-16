export interface UserAdmin {
  id?: number;
  username: string;
  email: string;
  phone?: string;
  fullName: string;
  avatarUrl?: string;
  gender?: string;
  status?: string;
  roles?: { id: number; name: string; description?: string }[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UserCreationRequest {
  username: string;
  password?: string;
  email: string;
  phone?: string;
  fullName: string;
  avatarUrl?: string;
  gender?: string;
  roles: string[];
}

export interface UserUpdateRequest {
  email?: string;
  phone?: string;
  fullName?: string;
  avatarUrl?: string;
  gender?: string;
  status?: string;
  roles?: string[];
}
