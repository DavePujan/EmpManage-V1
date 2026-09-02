export interface DepartmentListItem {
  id: number;
  name: string;
  description: string;
  totalEmployees: number;
  totalTeams: number;
  isActive: boolean;
}

export interface CreateDepartmentRequest {
  name: string;
  description: string;
}

export interface DepartmentEmployeeItem {
  id: number;
  name: string;
  email: string;
  designation: string;
  team: string;
  isActive: boolean;
}

export interface DepartmentCountResponse {
  totalDepartments: number;
}
