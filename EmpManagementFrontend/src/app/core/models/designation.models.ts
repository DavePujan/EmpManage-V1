export interface CreateDesignationRequest {
  name: string;
  description: string;
}

export interface DesignationItem {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  employeeCount?: number;
}
