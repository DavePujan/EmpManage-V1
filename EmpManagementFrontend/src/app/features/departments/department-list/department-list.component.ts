import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DepartmentApiService } from '../../../api/department-api.service';
import { DepartmentEmployeeItem, DepartmentListItem } from '../../../core/models/department.models';
import { TeamListItem } from '../../../core/models/team.models';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { ToastService } from '../../../core/services/toast.service';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IconComponent,
    StatusBadgeComponent,
    AvatarComponent,
    SearchInputComponent,
    EmptyStateComponent
  ],
  template: `
    <div class="page-container">
      <!-- Page Header -->
      <div class="page-header">
        <div class="page-title-group">
          <h1 class="page-title">Departments</h1>
          <p class="page-description">Organizational structure and department divisions.</p>
        </div>

        @if (authState.isAdmin()) {
          <div class="page-actions">
            <button class="btn btn-primary" (click)="isCreateModalOpen = true">
              <app-icon name="plus" [size]="18"></app-icon>
              <span>Add Department</span>
            </button>
          </div>
        }
      </div>

      <!-- Search Toolbar -->
      <div class="toolbar">
        <div class="toolbar-search">
          <app-search-input
            placeholder="Search departments..."
            (searchChange)="onSearch($event)"
          ></app-search-input>
        </div>
      </div>

      <!-- Department Cards Grid -->
      @if (isLoading) {
        <div class="dept-grid">
          <div class="skeleton" style="height: 160px; border-radius: 16px;"></div>
          <div class="skeleton" style="height: 160px; border-radius: 16px;"></div>
          <div class="skeleton" style="height: 160px; border-radius: 16px;"></div>
        </div>
      } @else if (filteredDepartments.length === 0) {
        <app-empty-state
          icon="building"
          title="No departments found"
          description="Create your first department to organize your workforce."
          [actionLabel]="authState.isAdmin() ? 'Add Department' : ''"
          actionIcon="plus"
          (action)="isCreateModalOpen = true"
        ></app-empty-state>
      } @else {
        <div class="dept-grid">
          @for (dept of filteredDepartments; track dept.id) {
            <div class="card card-hover dept-card" (click)="openDetailModal(dept)">
              <div class="dept-card-top">
                <div class="dept-icon">
                  <app-icon name="building" [size]="24"></app-icon>
                </div>
                <app-status-badge [status]="dept.isActive"></app-status-badge>
              </div>

              <h3 class="dept-name">{{ dept.name }}</h3>
              <p class="dept-desc">{{ dept.description || 'No description provided.' }}</p>

              <div class="dept-card-stats">
                <div class="dept-stat">
                  <span class="stat-count">{{ dept.totalEmployees }}</span>
                  <span class="stat-txt">Employees</span>
                </div>
                <div class="stat-sep"></div>
                <div class="dept-stat">
                  <span class="stat-count">{{ dept.totalTeams }}</span>
                  <span class="stat-txt">Teams</span>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>

    <!-- CREATE DEPARTMENT MODAL -->
    @if (isCreateModalOpen) {
      <div class="modal-backdrop" (click)="isCreateModalOpen = false">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title">Create New Department</h3>
            <button class="btn btn-icon btn-ghost" (click)="isCreateModalOpen = false">
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>
          <form [formGroup]="createForm" (ngSubmit)="onCreateSubmit()">
            <div class="modal-body">
              <div class="form-group">
                <label for="dept-name">Department Name <span class="required">*</span></label>
                <input
                  id="dept-name"
                  type="text"
                  class="form-control"
                  formControlName="name"
                  placeholder="e.g. Software Engineering"
                />
              </div>

              <div class="form-group">
                <label for="dept-desc">Description <span class="required">*</span></label>
                <textarea
                  id="dept-desc"
                  class="form-control"
                  formControlName="description"
                  placeholder="Describe department responsibilities..."
                ></textarea>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-outline" (click)="isCreateModalOpen = false">Cancel</button>
              <button type="button" class="btn btn-primary" [disabled]="createForm.invalid || isSubmitting" (click)="onCreateSubmit()">
                @if (isSubmitting) {
                  <app-icon name="refresh" [size]="16" customClass="spin"></app-icon>
                }
                Create Department
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- DEPARTMENT DETAILS MODAL -->
    @if (isDetailModalOpen && selectedDept) {
      <div class="modal-backdrop" (click)="isDetailModalOpen = false">
        <div class="modal-dialog modal-lg" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <h3 class="modal-title">{{ selectedDept.name }}</h3>
              <p class="text-caption">{{ selectedDept.description }}</p>
            </div>
            <button class="btn btn-icon btn-ghost" (click)="isDetailModalOpen = false">
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>

          <div class="modal-body">
            <!-- Tabs -->
            <div class="modal-tabs">
              <button
                class="tab-btn"
                [class.active]="activeTab === 'teams'"
                (click)="activeTab = 'teams'"
              >
                Teams ({{ deptTeams.length }})
              </button>
              <button
                class="tab-btn"
                [class.active]="activeTab === 'employees'"
                (click)="activeTab = 'employees'"
              >
                Employees ({{ deptEmployees.length }})
              </button>
            </div>

            <!-- Teams List -->
            @if (activeTab === 'teams') {
              @if (isDetailLoading) {
                <div class="skeleton mb-2" style="height: 48px;"></div>
                <div class="skeleton" style="height: 48px;"></div>
              } @else if (deptTeams.length === 0) {
                <p class="text-muted text-center py-4">No teams in this department yet.</p>
              } @else {
                <div class="list-group">
                  @for (team of deptTeams; track team.id) {
                    <div class="list-item">
                      <div class="list-item-main">
                        <app-icon name="teams" [size]="18" customClass="text-primary"></app-icon>
                        <span class="font-medium">{{ team.name }}</span>
                      </div>
                      <div class="list-item-meta">
                        <span class="text-caption">{{ team.employeeCount }} members</span>
                        <app-status-badge [status]="team.isActive"></app-status-badge>
                      </div>
                    </div>
                  }
                </div>
              }
            }

            <!-- Employees List -->
            @if (activeTab === 'employees') {
              @if (isDetailLoading) {
                <div class="skeleton mb-2" style="height: 48px;"></div>
                <div class="skeleton" style="height: 48px;"></div>
              } @else if (deptEmployees.length === 0) {
                <p class="text-muted text-center py-4">No employees assigned to this department yet.</p>
              } @else {
                <div class="list-group">
                  @for (emp of deptEmployees; track emp.id) {
                    <div class="list-item">
                      <div class="user-cell">
                        <app-avatar [name]="emp.name || emp.email" [size]="32"></app-avatar>
                        <div class="user-details">
                          <span class="user-name">{{ emp.name }}</span>
                          <span class="user-email">{{ emp.email }}</span>
                        </div>
                      </div>
                      <div class="list-item-meta">
                        <span class="badge badge-neutral">{{ emp.designation || 'No Designation' }}</span>
                        <app-status-badge [status]="emp.isActive"></app-status-badge>
                      </div>
                    </div>
                  }
                </div>
              }
            }
          </div>

          <div class="modal-footer">
            <button class="btn btn-outline" (click)="isDetailModalOpen = false">Close</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .dept-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: var(--space-5);
    }

    .dept-card {
      cursor: pointer;
      display: flex;
      flex-direction: column;
    }

    .dept-card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--space-4);

      .dept-icon {
        width: 44px;
        height: 44px;
        border-radius: var(--radius-md);
        background-color: var(--color-primary-soft);
        color: var(--color-primary);
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    .dept-name {
      font-size: 17px;
      font-weight: 700;
      color: var(--color-text-primary);
      margin-bottom: 6px;
    }

    .dept-desc {
      font-size: 13.5px;
      color: var(--color-text-secondary);
      line-height: 1.45;
      margin-bottom: var(--space-5);
      flex: 1;
    }

    .dept-card-stats {
      display: flex;
      align-items: center;
      background-color: var(--color-bg);
      border-radius: var(--radius-md);
      padding: var(--space-3) var(--space-4);
      border: 1px solid var(--color-border);

      .dept-stat {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;

        .stat-count {
          font-size: 16px;
          font-weight: 700;
          color: var(--color-text-primary);
          font-family: 'Space Grotesk', sans-serif;
        }

        .stat-txt {
          font-size: 11.5px;
          color: var(--color-text-muted);
          text-transform: uppercase;
        }
      }

      .stat-sep {
        width: 1px;
        height: 24px;
        background-color: var(--color-border);
      }
    }

    .modal-tabs {
      display: flex;
      gap: var(--space-2);
      border-bottom: 1px solid var(--color-border);
      margin-bottom: var(--space-4);

      .tab-btn {
        padding: 8px 16px;
        font-size: 13.5px;
        font-weight: 500;
        color: var(--color-text-secondary);
        border-bottom: 2px solid transparent;
        transition: all var(--transition-fast);

        &:hover {
          color: var(--color-text-primary);
        }

        &.active {
          color: var(--color-primary);
          border-bottom-color: var(--color-primary);
          font-weight: 600;
        }
      }
    }

    .list-group {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .list-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      background-color: var(--color-bg);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      gap: var(--space-3);

      .list-item-main {
        display: flex;
        align-items: center;
        gap: var(--space-3);
      }

      .list-item-meta {
        display: flex;
        align-items: center;
        gap: var(--space-2);
      }
    }

    .spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      100% { transform: rotate(360deg); }
    }
  `]
})
export class DepartmentListComponent implements OnInit {
  private fb = inject(FormBuilder);
  private departmentApi = inject(DepartmentApiService);
  private toast = inject(ToastService);
  authState = inject(AuthStateService);

  departments: DepartmentListItem[] = [];
  filteredDepartments: DepartmentListItem[] = [];
  isLoading = true;
  isSubmitting = false;

  isCreateModalOpen = false;
  isDetailModalOpen = false;
  isDetailLoading = false;
  selectedDept: DepartmentListItem | null = null;
  deptTeams: TeamListItem[] = [];
  deptEmployees: DepartmentEmployeeItem[] = [];
  activeTab: 'teams' | 'employees' = 'teams';

  createForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    description: ['', [Validators.required]]
  });

  ngOnInit(): void {
    this.loadDepartments();
  }

  private cdr = inject(ChangeDetectorRef);

  loadDepartments(): void {
    this.isLoading = true;
    this.departmentApi.getAll().subscribe({
      next: (data) => {
        this.departments = data;
        this.filteredDepartments = data;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onSearch(term: string): void {
    const q = term.toLowerCase().trim();
    if (!q) {
      this.filteredDepartments = this.departments;
      return;
    }
    this.filteredDepartments = this.departments.filter(d =>
      d.name.toLowerCase().includes(q) || d.description.toLowerCase().includes(q)
    );
  }

  onCreateSubmit(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.departmentApi.create(this.createForm.value).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.isCreateModalOpen = false;
        this.createForm.reset();
        this.toast.success('Department created successfully!');
        this.loadDepartments();
      },
      error: () => {
        this.isSubmitting = false;
      }
    });
  }

  openDetailModal(dept: DepartmentListItem): void {
    this.selectedDept = dept;
    this.isDetailModalOpen = true;
    this.isDetailLoading = true;
    this.activeTab = 'teams';

    this.departmentApi.getTeams(dept.id).subscribe(teams => {
      this.deptTeams = teams;
    });

    this.departmentApi.getEmployees(dept.id).subscribe(emps => {
      this.deptEmployees = emps;
      this.isDetailLoading = false;
    });
  }
}
