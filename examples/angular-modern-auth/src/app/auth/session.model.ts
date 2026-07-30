export interface SessionUser {
  id: string;
  name: string;
  email: string;
  roles: string[];
  accessExpiresAt: number;
}

export interface SessionResponse {
  authenticated: boolean;
  user?: SessionUser;
  reason?: string;
  note?: string;
}
