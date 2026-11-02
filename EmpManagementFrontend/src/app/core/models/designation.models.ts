export interface CreateDesignationRequest {
  name: string;
  description: string;
}

export interface UpdateDesignationRequest {
  name: string;
  description: string;
}

export interface UpdateDesignationStatusRequest {
  isActive: boolean;
}

export interface DesignationItem {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  employeeCount?: number;
}

export interface DesignationDetails {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  employeeCount: number;
}

export interface DesignationEmployee {
  id: number;
  name: string;
  email: string;
  departmentId?: number | null;
  teamId?: number | null;
  isActive: boolean;
}
