export interface TeamListItem {
  id: number;
  name: string;
  departmentId?: number;
  department?: string;
  employeeCount: number;
  teamHead: string;
  isActive: boolean;
}

export interface TeamDetails {
  id: number;
  name: string;
  departmentId: number;
  department: string;
  teamHeadEmployeeId: number | null;
  teamHead: string;
  employeeCount: number;
  isActive: boolean;
}

export interface CreateTeamRequest {
  name: string;
  departmentId: number;
}

export interface TeamEmployeeItem {
  id: number;
  name: string;
  email: string;
  designation: string;
  isActive: boolean;
}

export interface TeamCountResponse {
  totalTeams: number;
}
