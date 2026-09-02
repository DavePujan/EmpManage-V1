import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DepartmentApiService } from '../../../api/department-api.service';
import { DesignationApiService } from '../../../api/designation-api.service';
import { EmployeeApiService } from '../../../api/employee-api.service';
import { TeamApiService } from '../../../api/team-api.service';
import { DepartmentListItem } from '../../../core/models/department.models';
import { DesignationItem } from '../../../core/models/designation.models';
import { TeamListItem } from '../../../core/models/team.models';
import { EmployeeListItem } from '../../../core/models/user.models';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { ToastService } from '../../../core/services/toast.service';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IconComponent,
    StatusBadgeComponent,
    AvatarComponent,
    SearchInputComponent,
    EmptyStateComponent,
    ConfirmDialogComponent
  ],
  template: `
    <div class="page-container">
      <!-- Page Header -->
      <div class="page-header">
        <div class="page-title-group">
          <h1 class="page-title">Employees Directory</h1>
          <p class="page-description">Manage staff profiles, department assignments, designations, and supervisory hierarchy.</p>
        </div>

        @if (authState.isAdmin()) {
          <div class="page-actions">
            <button class="btn btn-primary" (click)="openAddModal()">
              <app-icon name="plus" [size]="18"></app-icon>
              <span>Add Employee</span>
            </button>
          </div>
        }
      </div>

      <!-- Toolbar / Filters -->
      <div class="toolbar">
        <div class="toolbar-search">
          <app-search-input
            placeholder="Search by name, email, department, designation..."
            (searchChange)="onSearch($event)"
          ></app-search-input>
        </div>

        <div class="toolbar-filters">
          <!-- Department Filter -->
          <select class="form-select form-select-sm" [(ngModel)]="selectedDepartmentFilter" (change)="onDepartmentFilterChange()">
            <option value="">All Departments ({{ departments.length }})</option>
            @for (dept of departments; track dept.id) {
              <option [value]="dept.name">{{ dept.name }}</option>
            }
          </select>

          <!-- Team Filter -->
          <select class="form-select form-select-sm" [(ngModel)]="selectedTeamFilter" (change)="applyFilters()">
            <option value="">All Teams ({{ allTeams.length }})</option>
            @for (team of filteredTeamsForFilter; track team.id) {
              <option [value]="team.name">{{ team.name }}</option>
            }
          </select>

          <!-- Designation Filter -->
          <select class="form-select form-select-sm" [(ngModel)]="selectedDesignationFilter" (change)="applyFilters()">
            <option value="">All Designations ({{ designations.length }})</option>
            @for (desig of designations; track desig.id) {
              <option [value]="desig.name">{{ desig.name }}</option>
            }
          </select>

          <!-- Status Filter -->
          <select class="form-select form-select-sm" [(ngModel)]="selectedStatusFilter" (change)="applyFilters()">
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      <!-- Quick Filter Bar / Results Counter -->
      <div class="filter-status-bar">
        <span class="results-text">
          Showing <strong>{{ filteredEmployees.length }}</strong> of <strong>{{ allEmployees.length }}</strong> employees
        </span>
        @if (hasActiveFilters()) {
          <button class="btn btn-ghost btn-xs text-primary" (click)="clearFilters()">
            <app-icon name="refresh" [size]="12"></app-icon>
            <span>Reset Filters</span>
          </button>
        }
      </div>

      <!-- Data Table Card -->
      <div class="table-container">
        @if (isLoading) {
          <div style="padding: 24px;">
            <div class="skeleton mb-4" style="height: 40px;"></div>
            <div class="skeleton mb-4" style="height: 40px;"></div>
            <div class="skeleton mb-4" style="height: 40px;"></div>
            <div class="skeleton" style="height: 40px;"></div>
          </div>
        } @else if (filteredEmployees.length === 0) {
          <div style="padding: 32px 16px;">
            <app-empty-state
              icon="users"
              title="No employees found"
              description="No employee records match your search or filter settings."
              [actionLabel]="authState.isAdmin() ? 'Add Employee' : ''"
              actionIcon="plus"
              (action)="openAddModal()"
            ></app-empty-state>
          </div>
        } @else {
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Team</th>
                  <th>Designation</th>
                  <th>Supervisor</th>
                  <th>Status</th>
                  <th style="text-align: right;">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (emp of paginatedEmployees; track emp.id) {
                  <tr>
                    <td>
                      <div class="user-cell">
                        <app-avatar [name]="emp.name || emp.email" [size]="36"></app-avatar>
                        <div class="user-details">
                          <span class="user-name">{{ emp.name || 'Unnamed Employee' }}</span>
                          <span class="user-email">{{ emp.email }}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="badge badge-dept">{{ emp.department || '—' }}</span>
                    </td>
                    <td>{{ emp.team || '—' }}</td>
                    <td>
                      <span class="font-medium text-dark">{{ emp.designation || '—' }}</span>
                    </td>
                    <td>{{ emp.supervisor || '—' }}</td>
                    <td>
                      <app-status-badge [status]="emp.isActive"></app-status-badge>
                    </td>
                    <td>
                      <div class="table-actions">
                        <!-- View Details -->
                        <button class="btn btn-icon btn-ghost btn-icon-sm" (click)="openViewModal(emp)" title="View Details">
                          <app-icon name="eye" [size]="16"></app-icon>
                        </button>

                        @if (authState.isAdmin()) {
                          <!-- Edit -->
                          <button class="btn btn-icon btn-ghost btn-icon-sm" (click)="openEditModal(emp)" title="Edit Employee">
                            <app-icon name="edit" [size]="16"></app-icon>
                          </button>

                          <!-- Toggle Status -->
                          <button
                            class="btn btn-icon btn-ghost btn-icon-sm"
                            [title]="emp.isActive ? 'Deactivate Employee' : 'Activate Employee'"
                            (click)="toggleStatus(emp)"
                          >
                            <app-icon [name]="emp.isActive ? 'lock' : 'check'" [size]="16"></app-icon>
                          </button>

                          <!-- Delete -->
                          <button class="btn btn-icon btn-ghost btn-icon-sm text-danger" (click)="openDeleteDialog(emp)" title="Delete Employee">
                            <app-icon name="trash" [size]="16"></app-icon>
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          @if (totalPages > 1) {
            <div class="pagination">
              <span class="page-info">
                Page {{ currentPage }} of {{ totalPages }} ({{ filteredEmployees.length }} records)
              </span>
              <div class="page-buttons">
                <button
                  class="btn btn-outline btn-sm"
                  [disabled]="currentPage === 1"
                  (click)="currentPage = currentPage - 1"
                >
                  Previous
                </button>
                <button
                  class="btn btn-outline btn-sm"
                  [disabled]="currentPage === totalPages"
                  (click)="currentPage = currentPage + 1"
                >
                  Next
                </button>
              </div>
            </div>
          }
        }
      </div>
    </div>

    <!-- ADD EMPLOYEE MODAL -->
    @if (isAddModalOpen) {
      <div class="modal-backdrop" (click)="isAddModalOpen = false">
        <div class="modal-dialog modal-lg" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title">Add New Employee</h3>
            <button class="btn btn-icon btn-ghost" (click)="isAddModalOpen = false">
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>
          <form [formGroup]="addForm" (ngSubmit)="onAddSubmit()">
            <div class="modal-body">
              <div class="form-grid">
                <!-- Full Name -->
                <div class="form-group">
                  <label for="emp-name">Full Name <span class="required">*</span></label>
                  <input id="emp-name" type="text" class="form-control" formControlName="name" placeholder="e.g. John Doe" />
                  @if (addForm.get('name')?.invalid && addForm.get('name')?.touched) {
                    <span class="form-error">Full name is required.</span>
                  }
                </div>

                <!-- Username -->
                <div class="form-group">
                  <label for="emp-user">Username <span class="required">*</span></label>
                  <input id="emp-user" type="text" class="form-control" formControlName="username" placeholder="e.g. jdoe" />
                  @if (addForm.get('username')?.invalid && addForm.get('username')?.touched) {
                    <span class="form-error">Username is required.</span>
                  }
                </div>

                <!-- Email -->
                <div class="form-group">
                  <label for="emp-email">Email Address <span class="required">*</span></label>
                  <input id="emp-email" type="email" class="form-control" formControlName="email" placeholder="john.doe@company.com" />
                  @if (addForm.get('email')?.invalid && addForm.get('email')?.touched) {
                    <span class="form-error">Enter a valid email address.</span>
                  }
                </div>

                <!-- System Role -->
                <div class="form-group">
                  <label for="emp-role">System Role <span class="required">*</span></label>
                  <select id="emp-role" class="form-select" formControlName="roleId">
                    <option [ngValue]="1">Admin (Full Control)</option>
                    <option [ngValue]="2">HR (HR Management)</option>
                    <option [ngValue]="3">Manager (Team Lead)</option>
                    <option [ngValue]="4">Employee (Standard Access)</option>
                  </select>
                </div>

                <!-- Department -->
                <div class="form-group">
                  <label for="emp-dept">Department</label>
                  <select id="emp-dept" class="form-select" formControlName="departmentId" (change)="onAddDeptChange()">
                    <option [ngValue]="null">Select Department</option>
                    @for (dept of departments; track dept.id) {
                      <option [ngValue]="dept.id">{{ dept.name }}</option>
                    }
                  </select>
                </div>

                <!-- Team -->
                <div class="form-group">
                  <label for="emp-team">Team</label>
                  <select id="emp-team" class="form-select" formControlName="teamId">
                    <option [ngValue]="null">Select Team</option>
                    @for (team of availableTeams; track team.id) {
                      <option [ngValue]="team.id">{{ team.name }}</option>
                    }
                  </select>
                </div>

                <!-- Designation (Dropdown) -->
                <div class="form-group">
                  <label for="emp-desig">Designation <span class="required">*</span></label>
                  <select id="emp-desig" class="form-select" formControlName="designationId">
                    @for (desig of designations; track desig.id) {
                      <option [ngValue]="desig.id">{{ desig.name }}</option>
                    }
                  </select>
                </div>

                <!-- Supervisor -->
                <div class="form-group">
                  <label for="emp-sup">Supervisor</label>
                  <select id="emp-sup" class="form-select" formControlName="supervisorId">
                    <option [ngValue]="null">None</option>
                    @for (emp of allEmployees; track emp.id) {
                      <option [ngValue]="emp.id">{{ emp.name || emp.email }}</option>
                    }
                  </select>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-outline" (click)="isAddModalOpen = false">Cancel</button>
              <button type="button" class="btn btn-primary" [disabled]="addForm.invalid || isSubmitting" (click)="onAddSubmit()">
                @if (isSubmitting) {
                  <app-icon name="refresh" [size]="16" customClass="spin"></app-icon>
                }
                Save Employee
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- EDIT EMPLOYEE MODAL -->
    @if (isEditModalOpen && selectedEmployee) {
      <div class="modal-backdrop" (click)="isEditModalOpen = false">
        <div class="modal-dialog modal-lg" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title">Edit Employee: {{ selectedEmployee.name }}</h3>
            <button class="btn btn-icon btn-ghost" (click)="isEditModalOpen = false">
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>
          <form [formGroup]="editForm" (ngSubmit)="onEditSubmit()">
            <div class="modal-body">
              <div class="form-grid">
                <div class="form-group">
                  <label for="edit-name">Full Name <span class="required">*</span></label>
                  <input id="edit-name" type="text" class="form-control" formControlName="name" />
                </div>

                <div class="form-group">
                  <label for="edit-email">Email Address <span class="required">*</span></label>
                  <input id="edit-email" type="email" class="form-control" formControlName="email" />
                </div>

                <div class="form-group">
                  <label for="edit-dept">Department</label>
                  <select id="edit-dept" class="form-select" formControlName="departmentId" (change)="onEditDeptChange()">
                    <option [ngValue]="null">None</option>
                    @for (dept of departments; track dept.id) {
                      <option [ngValue]="dept.id">{{ dept.name }}</option>
                    }
                  </select>
                </div>

                <div class="form-group">
                  <label for="edit-team">Team</label>
                  <select id="edit-team" class="form-select" formControlName="teamId">
                    <option [ngValue]="null">None</option>
                    @for (team of editAvailableTeams; track team.id) {
                      <option [ngValue]="team.id">{{ team.name }}</option>
                    }
                  </select>
                </div>

                <div class="form-group">
                  <label for="edit-desig">Designation <span class="required">*</span></label>
                  <select id="edit-desig" class="form-select" formControlName="designationId">
                    @for (desig of designations; track desig.id) {
                      <option [ngValue]="desig.id">{{ desig.name }}</option>
                    }
                  </select>
                </div>

                <div class="form-group">
                  <label for="edit-sup">Supervisor</label>
                  <select id="edit-sup" class="form-select" formControlName="supervisorId">
                    <option [ngValue]="null">None</option>
                    @for (emp of allEmployees; track emp.id) {
                      @if (emp.id !== selectedEmployee.id) {
                        <option [ngValue]="emp.id">{{ emp.name || emp.email }}</option>
                      }
                    }
                  </select>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-outline" (click)="isEditModalOpen = false">Cancel</button>
              <button type="button" class="btn btn-primary" [disabled]="editForm.invalid || isSubmitting" (click)="onEditSubmit()">
                @if (isSubmitting) {
                  <app-icon name="refresh" [size]="16" customClass="spin"></app-icon>
                }
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- VIEW EMPLOYEE DETAILS MODAL -->
    @if (isViewModalOpen && selectedEmployee) {
      <div class="modal-backdrop" (click)="isViewModalOpen = false">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title">Employee Profile</h3>
            <button class="btn btn-icon btn-ghost" (click)="isViewModalOpen = false">
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>
          <div class="modal-body">
            <div class="text-center mb-6">
              <div style="display: inline-block; margin-bottom: 12px;">
                <app-avatar [name]="selectedEmployee.name || selectedEmployee.email" [size]="64"></app-avatar>
              </div>
              <h2 style="font-size: 20px; font-weight: 700;">{{ selectedEmployee.name }}</h2>
              <p class="text-muted" style="font-size: 13.5px;">{{ selectedEmployee.email }}</p>
              <div class="mt-2">
                <app-status-badge [status]="selectedEmployee.isActive"></app-status-badge>
              </div>
            </div>

            <div class="profile-details-grid">
              <div class="detail-item">
                <span class="detail-label">Department</span>
                <span class="detail-val font-semibold">{{ selectedEmployee.department || 'Not Assigned' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Team</span>
                <span class="detail-val font-semibold">{{ selectedEmployee.team || 'Not Assigned' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Designation</span>
                <span class="detail-val text-primary font-semibold">{{ selectedEmployee.designation || 'Not Assigned' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Supervisor</span>
                <span class="detail-val">{{ selectedEmployee.supervisor || 'None' }}</span>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" (click)="isViewModalOpen = false">Close</button>
          </div>
        </div>
      </div>
    }

    <!-- CONFIRM DELETE DIALOG -->
    <app-confirm-dialog
      [isOpen]="isDeleteDialogOpen"
      title="Delete Employee Record?"
      [message]="'Are you sure you want to permanently delete ' + (selectedEmployee?.name || 'this employee') + '? This action cannot be reversed.'"
      confirmText="Delete Record"
      variant="danger"
      [isLoading]="isSubmitting"
      (confirm)="onDeleteConfirmed()"
      (cancel)="isDeleteDialogOpen = false"
    ></app-confirm-dialog>
  `,
  styles: [`
    .filter-status-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-2) var(--space-1);
      margin-bottom: var(--space-3);
      font-size: 13px;
      color: var(--color-text-secondary);
    }

    .badge-dept {
      background: var(--color-bg-secondary, #F1F5F9);
      color: var(--color-text-secondary);
      border: 1px solid var(--color-border);
      padding: 3px 8px;
      border-radius: var(--radius-sm);
      font-size: 12px;
      font-weight: 500;
    }

    .profile-details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-4);
      background-color: var(--color-bg);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: var(--space-4);
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 2px;

      .detail-label {
        font-size: 11.5px;
        text-transform: uppercase;
        color: var(--color-text-muted);
        font-weight: 600;
        letter-spacing: 0.04em;
      }

      .detail-val {
        font-size: 14px;
        font-weight: 500;
        color: var(--color-text-primary);
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
export class EmployeeListComponent implements OnInit {
  private fb = inject(FormBuilder);
  private employeeApi = inject(EmployeeApiService);
  private departmentApi = inject(DepartmentApiService);
  private teamApi = inject(TeamApiService);
  private designationApi = inject(DesignationApiService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  authState = inject(AuthStateService);

  Math = Math;

  allEmployees: EmployeeListItem[] = [];
  filteredEmployees: EmployeeListItem[] = [];
  departments: DepartmentListItem[] = [];
  designations: DesignationItem[] = [];
  allTeams: TeamListItem[] = [];
  availableTeams: TeamListItem[] = [];
  editAvailableTeams: TeamListItem[] = [];

  isLoading = true;
  isSubmitting = false;

  // Search & Filters
  searchTerm = '';
  selectedDepartmentFilter = '';
  selectedTeamFilter = '';
  selectedDesignationFilter = '';
  selectedStatusFilter = 'all';

  // Pagination
  currentPage = 1;
  pageSize = 10;

  // Modals
  isAddModalOpen = false;
  isEditModalOpen = false;
  isViewModalOpen = false;
  isDeleteDialogOpen = false;
  selectedEmployee: EmployeeListItem | null = null;

  addForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    username: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    roleId: [4, [Validators.required]],
    departmentId: [null],
    teamId: [null],
    supervisorId: [null],
    designationId: [1, [Validators.required]]
  });

  editForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    departmentId: [null],
    teamId: [null],
    supervisorId: [null],
    designationId: [1, [Validators.required]]
  });

  get filteredTeamsForFilter(): TeamListItem[] {
    if (!this.selectedDepartmentFilter) return this.allTeams;
    const dept = this.departments.find(d => d.name === this.selectedDepartmentFilter);
    if (!dept) return this.allTeams;
    return this.allTeams.filter(t => t.departmentId === dept.id);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredEmployees.length / this.pageSize);
  }

  get paginatedEmployees(): EmployeeListItem[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredEmployees.slice(start, start + this.pageSize);
  }

  ngOnInit(): void {
    this.loadData();
    this.route.queryParams.subscribe(params => {
      if (params['action'] === 'create' && this.authState.isAdmin()) {
        this.openAddModal();
      }
    });
  }

  loadData(): void {
    this.isLoading = true;
    forkJoin({
      employees: this.employeeApi.getAll().pipe(catchError(() => of([]))),
      departments: this.departmentApi.getAll().pipe(catchError(() => of([]))),
      teams: this.teamApi.getAll().pipe(catchError(() => of([]))),
      designations: this.designationApi.getAll().pipe(catchError(() => of([])))
    }).subscribe({
      next: (res) => {
        this.allEmployees = res.employees;
        this.departments = res.departments;
        this.allTeams = res.teams;
        this.availableTeams = res.teams;
        this.editAvailableTeams = res.teams;
        this.designations = res.designations;

        if (this.designations.length > 0) {
          this.addForm.patchValue({ designationId: this.designations[0].id });
        }

        this.applyFilters();
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
    this.searchTerm = term.toLowerCase().trim();
    this.applyFilters();
  }

  onDepartmentFilterChange(): void {
    this.selectedTeamFilter = '';
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return !!(this.searchTerm || this.selectedDepartmentFilter || this.selectedTeamFilter || this.selectedDesignationFilter || this.selectedStatusFilter !== 'all');
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedDepartmentFilter = '';
    this.selectedTeamFilter = '';
    this.selectedDesignationFilter = '';
    this.selectedStatusFilter = 'all';
    this.applyFilters();
  }

  applyFilters(): void {
    let result = [...this.allEmployees];

    if (this.searchTerm) {
      result = result.filter(e =>
        (e.name && e.name.toLowerCase().includes(this.searchTerm)) ||
        (e.email && e.email.toLowerCase().includes(this.searchTerm)) ||
        (e.department && e.department.toLowerCase().includes(this.searchTerm)) ||
        (e.team && e.team.toLowerCase().includes(this.searchTerm)) ||
        (e.designation && e.designation.toLowerCase().includes(this.searchTerm))
      );
    }

    if (this.selectedDepartmentFilter) {
      result = result.filter(e => e.department === this.selectedDepartmentFilter);
    }

    if (this.selectedTeamFilter) {
      result = result.filter(e => e.team === this.selectedTeamFilter);
    }

    if (this.selectedDesignationFilter) {
      result = result.filter(e => e.designation === this.selectedDesignationFilter);
    }

    if (this.selectedStatusFilter === 'active') {
      result = result.filter(e => e.isActive);
    } else if (this.selectedStatusFilter === 'inactive') {
      result = result.filter(e => !e.isActive);
    }

    this.filteredEmployees = result;
    this.currentPage = 1;
    this.cdr.markForCheck();
  }

  onAddDeptChange(): void {
    const deptId = this.addForm.get('departmentId')?.value;
    if (deptId) {
      this.availableTeams = this.allTeams.filter(t => t.departmentId === deptId);
    } else {
      this.availableTeams = this.allTeams;
    }
    this.addForm.patchValue({ teamId: null });
  }

  onEditDeptChange(): void {
    const deptId = this.editForm.get('departmentId')?.value;
    if (deptId) {
      this.editAvailableTeams = this.allTeams.filter(t => t.departmentId === deptId);
    } else {
      this.editAvailableTeams = this.allTeams;
    }
    this.editForm.patchValue({ teamId: null });
  }

  openAddModal(): void {
    this.addForm.reset({
      roleId: 4,
      departmentId: null,
      teamId: null,
      supervisorId: null,
      designationId: this.designations.length > 0 ? this.designations[0].id : 1
    });
    this.availableTeams = this.allTeams;
    this.isAddModalOpen = true;
  }

  openEditModal(emp: EmployeeListItem): void {
    this.selectedEmployee = emp;
    const dept = this.departments.find(d => d.name === emp.department);
    const team = this.allTeams.find(t => t.name === emp.team);
    const desig = this.designations.find(d => d.name === emp.designation);
    const sup = this.allEmployees.find(e => e.name === emp.supervisor);

    if (dept) {
      this.editAvailableTeams = this.allTeams.filter(t => t.departmentId === dept.id);
    } else {
      this.editAvailableTeams = this.allTeams;
    }

    this.editForm.patchValue({
      name: emp.name,
      email: emp.email,
      departmentId: dept?.id ?? null,
      teamId: team?.id ?? null,
      supervisorId: sup?.id ?? null,
      designationId: desig?.id ?? 1
    });

    this.isEditModalOpen = true;
  }

  openViewModal(emp: EmployeeListItem): void {
    this.selectedEmployee = emp;
    this.isViewModalOpen = true;
  }

  openDeleteDialog(emp: EmployeeListItem): void {
    this.selectedEmployee = emp;
    this.isDeleteDialogOpen = true;
  }

  onAddSubmit(): void {
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.employeeApi.create(this.addForm.value).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.isAddModalOpen = false;
        this.toast.success('Employee record created successfully!');
        this.loadData();
      },
      error: () => {
        this.isSubmitting = false;
      }
    });
  }

  onEditSubmit(): void {
    if (this.editForm.invalid || !this.selectedEmployee) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.employeeApi.update(this.selectedEmployee.id, this.editForm.value).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.isEditModalOpen = false;
        this.toast.success('Employee record updated successfully!');
        this.loadData();
      },
      error: () => {
        this.isSubmitting = false;
      }
    });
  }

  toggleStatus(emp: EmployeeListItem): void {
    const newStatus = !emp.isActive;
    this.employeeApi.updateStatus(emp.id, { isActive: newStatus }).subscribe({
      next: () => {
        emp.isActive = newStatus;
        this.toast.success(`Employee ${newStatus ? 'activated' : 'deactivated'} successfully!`);
        this.applyFilters();
      },
      error: () => {
        this.toast.error('Failed to update employee status.');
      }
    });
  }

  onDeleteConfirmed(): void {
    if (!this.selectedEmployee) return;

    this.isSubmitting = true;
    this.employeeApi.delete(this.selectedEmployee.id).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.isDeleteDialogOpen = false;
        this.toast.success('Employee record deleted successfully.');
        this.loadData();
      },
      error: () => {
        this.isSubmitting = false;
      }
    });
  }
}
