import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DepartmentApiService } from '../../api/department-api.service';
import { DesignationApiService } from '../../api/designation-api.service';
import { EmployeeApiService } from '../../api/employee-api.service';
import { LeaveApiService } from '../../api/leave-api.service';
import { TeamApiService } from '../../api/team-api.service';
import { DepartmentListItem } from '../../core/models/department.models';
import { EmployeeListItem } from '../../core/models/user.models';
import { LeaveResponse } from '../../core/models/leave.models';
import { AuthStateService } from '../../core/services/auth-state.service';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IconComponent,
    StatCardComponent,
    StatusBadgeComponent,
    AvatarComponent,
    EmptyStateComponent
  ],
  template: `
    <div class="page-container">
      <!-- Welcome Header Banner -->
      <div class="welcome-banner">
        <div class="welcome-text">
          <div class="welcome-badge">
            <app-status-badge [status]="authState.userRole() || ''" type="role"></app-status-badge>
            <span class="welcome-date">{{ today | date:'EEEE, MMMM d, y' }}</span>
          </div>
          <h1 class="welcome-title">Welcome back, {{ authState.username() }}! 👋</h1>
          <p class="welcome-subtitle">
            Enterprise overview of your workforce hierarchy, departments, cross-functional teams, and leave activities.
          </p>
        </div>

        <!-- Quick Actions -->
        <div class="welcome-actions">
          @if (authState.isAdmin()) {
            <a routerLink="/employees" [queryParams]="{ action: 'create' }" class="btn btn-primary">
              <app-icon name="plus" [size]="16"></app-icon>
              <span>Add Employee</span>
            </a>
          }
          <a routerLink="/leaves" class="btn btn-outline">
            <app-icon name="calendar" [size]="16"></app-icon>
            <span>Leave Hub</span>
          </a>
        </div>
      </div>

      <!-- Stat Cards Grid -->
      @if (isLoading) {
        <div class="stats-grid">
          <div class="skeleton" style="height: 110px; border-radius: 16px;"></div>
          <div class="skeleton" style="height: 110px; border-radius: 16px;"></div>
          <div class="skeleton" style="height: 110px; border-radius: 16px;"></div>
          <div class="skeleton" style="height: 110px; border-radius: 16px;"></div>
        </div>
      } @else {
        <div class="stats-grid">
          <!-- Total Employees -->
          @if (authState.isAdmin() || authState.isHR()) {
            <app-stat-card
              label="Total Employees"
              [value]="stats.totalEmployees"
              icon="users"
              colorVariant="primary"
              meta="Registered workforce members"
            ></app-stat-card>

            <app-stat-card
              label="Departments"
              [value]="stats.totalDepartments"
              icon="building"
              colorVariant="dark"
              meta="Active business divisions"
            ></app-stat-card>

            <app-stat-card
              label="Teams"
              [value]="stats.totalTeams"
              icon="teams"
              colorVariant="info"
              meta="Functional squads"
            ></app-stat-card>

            <app-stat-card
              label="Designations"
              [value]="stats.totalDesignations"
              icon="award"
              colorVariant="tertiary"
              meta="Job titles & roles"
            ></app-stat-card>
          }

          <!-- Pending Leaves -->
          <app-stat-card
            [label]="(authState.isAdmin() || authState.isHR() || authState.isManager()) ? 'Pending Leaves' : 'My Active Leaves'"
            [value]="stats.pendingLeaves"
            icon="clock"
            colorVariant="warning"
            [meta]="(authState.isAdmin() || authState.isHR() || authState.isManager()) ? 'Awaiting review / action' : 'Your submitted requests'"
          ></app-stat-card>
        </div>
      }

      <!-- Department Distribution & Workforce Visualization Section (Admin / HR) -->
      @if ((authState.isAdmin() || authState.isHR()) && departments.length > 0) {
        <div class="card mt-6">
          <div class="card-header">
            <div>
              <h3 class="card-title">Department Workforce Distribution</h3>
              <p class="card-subtitle">Headcount and active teams across all organizational units</p>
            </div>
            <a routerLink="/departments" class="btn btn-ghost btn-sm">
              <span>View All Departments</span>
              <app-icon name="arrow-right" [size]="14"></app-icon>
            </a>
          </div>
          <div class="card-body">
            <div class="dept-overview-grid">
              @for (dept of departments; track dept.id) {
                <div class="dept-stat-box" [routerLink]="['/departments']">
                  <div class="dept-stat-header">
                    <span class="dept-stat-name">{{ dept.name }}</span>
                    <span class="dept-stat-badge">{{ dept.totalEmployees }} members</span>
                  </div>
                  <div class="dept-progress-track">
                    <div
                      class="dept-progress-bar"
                      [style.width.%]="getDepartmentPercentage(dept.totalEmployees)"
                    ></div>
                  </div>
                  <div class="dept-stat-footer">
                    <span class="text-xs text-muted">{{ dept.totalTeams }} Teams</span>
                    <span class="text-xs text-primary font-medium">{{ getDepartmentPercentage(dept.totalEmployees) }}% of staff</span>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      }

      <!-- Main Dashboard Grid Sections -->
      <div class="dashboard-grid mt-6">
        <!-- Left: Recent Employees (Admin/HR) -->
        @if (authState.isAdmin() || authState.isHR()) {
          <div class="card">
            <div class="card-header">
              <div>
                <h3 class="card-title">Workforce Directory</h3>
                <p class="card-subtitle">Latest registered employees & positions</p>
              </div>
              <a routerLink="/employees" class="btn btn-ghost btn-sm">
                <span>View all</span>
                <app-icon name="arrow-right" [size]="14"></app-icon>
              </a>
            </div>

            <div class="card-body">
              @if (recentEmployees.length === 0) {
                <app-empty-state
                  icon="users"
                  title="No employees registered"
                  description="Start by adding your first employee."
                  actionLabel="Add Employee"
                  actionIcon="plus"
                  (action)="navigateToAddEmployee()"
                ></app-empty-state>
              } @else {
                <div class="table-responsive">
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Department</th>
                        <th>Designation</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (emp of recentEmployees; track emp.id) {
                        <tr>
                          <td>
                            <div class="user-cell">
                              <app-avatar [name]="emp.name || emp.email" [size]="34"></app-avatar>
                              <div class="user-details">
                                <span class="user-name">{{ emp.name || 'Unnamed' }}</span>
                                <span class="user-email">{{ emp.email }}</span>
                              </div>
                            </div>
                          </td>
                          <td>{{ emp.department || '—' }}</td>
                          <td>{{ emp.designation || '—' }}</td>
                          <td>
                            <app-status-badge [status]="emp.isActive"></app-status-badge>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
            </div>
          </div>
        }

        <!-- Right: Recent Leave Requests -->
        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">
                {{ (authState.isAdmin() || authState.isHR() || authState.isManager()) ? 'Recent Leave Requests' : 'My Recent Leaves' }}
              </h3>
              <p class="card-subtitle">
                {{ (authState.isAdmin() || authState.isHR() || authState.isManager()) ? 'Leave applications awaiting review' : 'Your recent leave applications' }}
              </p>
            </div>
            <a routerLink="/leaves" class="btn btn-ghost btn-sm">
              <span>View all</span>
              <app-icon name="arrow-right" [size]="14"></app-icon>
            </a>
          </div>

          <div class="card-body">
            @if (recentLeaves.length === 0) {
              <app-empty-state
                icon="calendar"
                title="No pending leaves"
                description="All leave requests are up to date."
                [actionLabel]="authState.isEmployee() ? 'Apply for Leave' : ''"
                actionIcon="plus"
                (action)="navigateToLeaves()"
              ></app-empty-state>
            } @else {
              <div class="leaves-mini-list">
                @for (leave of recentLeaves; track leave.id) {
                  <div class="leave-mini-card">
                    <div class="leave-mini-left">
                      <div class="leave-type-icon">
                        <app-icon name="calendar" [size]="18"></app-icon>
                      </div>
                      <div class="leave-info">
                        <span class="leave-emp-name">{{ leave.employeeName || 'Employee #' + leave.employeeId }}</span>
                        <span class="leave-type-badge">{{ leave.leaveType }} Leave</span>
                        <span class="leave-dates">{{ leave.startDate | date:'MMM d' }} – {{ leave.endDate | date:'MMM d, y' }}</span>
                      </div>
                    </div>
                    <div class="leave-mini-right">
                      <app-status-badge [status]="leave.status" type="leave"></app-status-badge>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .welcome-banner {
      background: linear-gradient(135deg, #FFFFFF 0%, #FFF1F2 100%);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      padding: var(--space-6) var(--space-8);
      margin-bottom: var(--space-6);
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: var(--space-4);
      box-shadow: var(--shadow-sm);

      @media (max-width: 768px) {
        padding: var(--space-5);
      }
    }

    .welcome-text {
      max-width: 600px;
    }

    .welcome-badge {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      margin-bottom: var(--space-2);

      .welcome-date {
        font-size: 12px;
        color: var(--color-text-muted);
        font-weight: 500;
      }
    }

    .welcome-title {
      font-size: 24px;
      font-weight: 700;
      color: var(--color-text-primary);
      margin-bottom: 4px;
    }

    .welcome-subtitle {
      font-size: 14px;
      color: var(--color-text-secondary);
      line-height: 1.5;
    }

    .welcome-actions {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--space-4);
    }

    .dept-overview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: var(--space-4);
    }

    .dept-stat-box {
      padding: var(--space-4);
      background-color: var(--color-bg);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      cursor: pointer;
      transition: all var(--transition-fast);

      &:hover {
        border-color: var(--color-primary-light);
        box-shadow: var(--shadow-sm);
        transform: translateY(-2px);
      }

      .dept-stat-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--space-2);

        .dept-stat-name {
          font-size: 13.5px;
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .dept-stat-badge {
          font-size: 11px;
          font-weight: 600;
          color: var(--color-primary);
          background: var(--color-primary-soft);
          padding: 2px 8px;
          border-radius: var(--radius-full);
        }
      }

      .dept-progress-track {
        height: 6px;
        background-color: var(--color-border);
        border-radius: var(--radius-full);
        overflow: hidden;
        margin-bottom: var(--space-2);

        .dept-progress-bar {
          height: 100%;
          background: linear-gradient(90deg, var(--color-primary) 0%, #FB7185 100%);
          border-radius: var(--radius-full);
          transition: width 0.6s ease-in-out;
        }
      }

      .dept-stat-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-6);

      @media (min-width: 1024px) {
        grid-template-columns: 1.2fr 1fr;
      }
    }

    .leaves-mini-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .leave-mini-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-3) var(--space-4);
      background-color: var(--color-bg);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      gap: var(--space-3);

      .leave-mini-left {
        display: flex;
        align-items: center;
        gap: var(--space-3);

        .leave-type-icon {
          width: 38px;
          height: 38px;
          border-radius: var(--radius-sm);
          background-color: var(--color-primary-soft);
          color: var(--color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .leave-info {
          display: flex;
          flex-direction: column;

          .leave-emp-name {
            font-size: 13.5px;
            font-weight: 600;
            color: var(--color-text-primary);
          }

          .leave-type-badge {
            font-size: 12px;
            font-weight: 500;
            color: var(--color-primary);
          }

          .leave-dates {
            font-size: 11.5px;
            color: var(--color-text-muted);
          }
        }
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  authState = inject(AuthStateService);
  private employeeApi = inject(EmployeeApiService);
  private departmentApi = inject(DepartmentApiService);
  private teamApi = inject(TeamApiService);
  private designationApi = inject(DesignationApiService);
  private leaveApi = inject(LeaveApiService);
  private cdr = inject(ChangeDetectorRef);

  today = new Date();
  isLoading = true;

  stats = {
    totalEmployees: 0,
    totalDepartments: 0,
    totalTeams: 0,
    totalDesignations: 0,
    pendingLeaves: 0
  };

  departments: DepartmentListItem[] = [];
  recentEmployees: EmployeeListItem[] = [];
  recentLeaves: LeaveResponse[] = [];

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    const isElevated = this.authState.isAdmin() || this.authState.isHR();
    const isManager = this.authState.isManager();

    const empCount$ = isElevated ? this.employeeApi.getCount().pipe(catchError(() => of({ totalEmployees: 0 }))) : of({ totalEmployees: 0 });
    const deptCount$ = isElevated ? this.departmentApi.getCount().pipe(catchError(() => of({ totalDepartments: 0 }))) : of({ totalDepartments: 0 });
    const teamCount$ = isElevated ? this.teamApi.getCount().pipe(catchError(() => of({ totalTeams: 0 }))) : of({ totalTeams: 0 });
    const desigList$ = isElevated ? this.designationApi.getAll().pipe(catchError(() => of([]))) : of([]);
    const deptsList$ = isElevated ? this.departmentApi.getAll().pipe(catchError(() => of([]))) : of([]);
    
    const leaves$ = (isElevated || isManager)
      ? this.leaveApi.getPending().pipe(catchError(() => of([])))
      : this.leaveApi.getMyLeaves().pipe(catchError(() => of([])));

    const empsList$ = isElevated ? this.employeeApi.getAll().pipe(catchError(() => of([]))) : of([]);

    forkJoin({
      empCount: empCount$,
      deptCount: deptCount$,
      teamCount: teamCount$,
      designations: desigList$,
      depts: deptsList$,
      leaves: leaves$,
      employees: empsList$
    }).subscribe({
      next: (res) => {
        this.stats.totalEmployees = res.empCount?.totalEmployees ?? res.employees?.length ?? 0;
        this.stats.totalDepartments = res.deptCount?.totalDepartments ?? res.depts?.length ?? 0;
        this.stats.totalTeams = res.teamCount?.totalTeams ?? 0;
        this.stats.totalDesignations = res.designations?.length ?? 0;
        this.stats.pendingLeaves = res.leaves?.length ?? 0;

        this.departments = res.depts ?? [];
        this.recentLeaves = res.leaves?.slice(0, 6) ?? [];
        this.recentEmployees = res.employees?.slice(0, 6) ?? [];
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  getDepartmentPercentage(deptEmployees: number): number {
    if (!this.stats.totalEmployees || this.stats.totalEmployees === 0) return 0;
    return Math.round((deptEmployees / this.stats.totalEmployees) * 100);
  }

  navigateToAddEmployee(): void {
    window.location.href = '/employees?action=create';
  }

  navigateToLeaves(): void {
    window.location.href = '/leaves';
  }
}
