export enum UserRole {
  Admin = 'Admin',
  HR = 'HR',
  Manager = 'Manager',
  Employee = 'Employee'
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface InitialAdminRequest {
  username: string;
  email: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface JwtPayload {
  nameid?: string;
  unique_name?: string;
  role?: string;
  exp?: number;
  iss?: string;
  aud?: string;
  // XML Schema URIs used by .NET Core
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'?: string;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'?: string;
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: string;
}

export interface CurrentUser {
  id: number;
  username: string;
  role: UserRole;
  token: string;
}
