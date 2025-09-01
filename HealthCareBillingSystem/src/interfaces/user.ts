// interfaces/user.ts
export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  token: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role: string;
}

export interface RefreshTokenRequest {
  token: string;
  refreshToken: string;
}

export interface AuthResponse {
  id: number;
  username: string;
  email: string;
  role: string;
  token: string;
  refreshToken: string;
  refreshTokenExpiry: string;  
}