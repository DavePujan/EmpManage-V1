export interface LeaveResponse {
  id: number;
  employeeId: number;
  employeeName: string;
  leaveType: string;
  reason: string;
  startDate: string;
  endDate: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  isTeamLeave: boolean;
  teamId: number | null;
  teamName: string;
  approvedBy: number | null;
  approvedByName: string;
  approvedDate: string | null;
  createdAt: string;
}

export interface CreateLeaveRequest {
  leaveType: string;
  reason: string;
  startDate: string;
  endDate: string;
  isTeamLeave: boolean;
  teamId: number | null;
}

export interface RejectLeaveRequest {
  reason: string;
}
