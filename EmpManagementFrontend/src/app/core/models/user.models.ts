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

export interface EmployeeFilter {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  departmentId?: number | null;
  teamId?: number | null;
  designationId?: number | null;
  supervisorId?: number | null;
  sortBy?: string;
  sortDescending?: boolean;
}

export interface EmployeePagedResult {
  employees: EmployeeListItem[];
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

export interface EmployeeSubordinate {
  id: number;
  name: string;
  email: string;
  department: string;
  team: string;
  designation: string;
  isActive: boolean;
}

export interface EmployeeSupervisor {
  id: number;
  name: string;
  email: string;
  department: string;
  team: string;
  designation: string;
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

export interface UpdateEmployeeDepartmentRequest {
  departmentId: number | null;
}

export interface UpdateEmployeeTeamRequest {
  teamId: number | null;
}

export interface UpdateEmployeeSupervisorRequest {
  supervisorId: number | null;
}

export interface UpdateEmployeeDesignationRequest {
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
