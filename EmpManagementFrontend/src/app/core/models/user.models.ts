export interface EmployeeListItem {
  id: number;
  name: string;
  email: string;
  department: string;
  team: string;
  designation: string;
  supervisor: string;
  isActive: boolean;
}

export interface CreateEmployeeRequest {
  username: string;
  email: string;
  name: string;
  roleId: number;
  departmentId: number | null;
  teamId: number | null;
  supervisorId: number | null;
  designationId: number;
}

export interface UpdateEmployeeRequest {
  email: string;
  name: string;
  departmentId: number | null;
  teamId: number | null;
  supervisorId: number | null;
  designationId: number;
}

export interface UpdateEmployeeStatusRequest {
  isActive: boolean;
}

export interface UpdateMyProfileRequest {
  name: string;
  email: string;
}

export interface EmployeeCountResponse {
  totalEmployees: number;
}
