export interface Group {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}
