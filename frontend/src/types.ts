export interface Group {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
}

export interface Member {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
}

export interface Role {
  id: number;
  name: string;
  description: string | null;
}

export interface Permission {
  id: number;
  code: string;
  name: string;
  description: string | null;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}
export interface User {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar: string | null;
  birthday: string | null;
  location: string | null;
  phone: string | null;
  about: string | null;
  signature: string | null;
  hired_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
}
