import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DepartmentApiService } from '../../../api/department-api.service';
import { EmployeeApiService } from '../../../api/employee-api.service';
import { TeamApiService } from '../../../api/team-api.service';
import { DepartmentListItem } from '../../../core/models/department.models';
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
          <p class="page-description">Manage staff profiles, department assignments, and organizational roles.</p>
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
            placeholder="Search by name, email, department..."
            (searchChange)="onSearch($event)"
          ></app-search-input>
        </div>

        <div class="toolbar-filters">
          <!-- Department Filter -->
          <select class="form-select form-select-sm" [(ngModel)]="selectedDepartmentFilter" (change)="applyFilters()">
            <option value="">All Departments</option>
            @for (dept of departments; track dept.id) {
              <option [value]="dept.name">{{ dept.name }}</option>
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
                    <td>{{ emp.department || '—' }}</td>
                    <td>{{ emp.team || '—' }}</td>
                    <td>{{ emp.designation || '—' }}</td>
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
                            (click)="toggleStatus(emp)"
                            [title]="emp.isActive ? 'Deactivate Employee' : 'Activate Employee'"
                          >
                            <app-icon [name]="emp.isActive ? 'x' : 'check'" [size]="16" [customClass]="emp.isActive ? 'text-danger' : 'text-success'"></app-icon>
                          </button>

                          <!-- Delete -->
                          <button class="btn btn-icon btn-ghost btn-icon-sm text-danger" (click)="confirmDelete(emp)" title="Delete Employee">
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

          <!-- Pagination Footer -->
          <div class="table-footer">
            <span class="table-info">
              Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, filteredEmployees.length) }} of {{ filteredEmployees.length }} employees
            </span>
            <div class="pagination">
              <button
                class="btn btn-outline btn-sm btn-icon"
                [disabled]="currentPage === 1"
                (click)="currentPage = currentPage - 1"
              >
                <app-icon name="chevron-left" [size]="16"></app-icon>
              </button>
              <span style="font-size: 13px; font-weight: 600; padding: 0 8px;">
                {{ currentPage }} / {{ totalPages }}
              </span>
              <button
                class="btn btn-outline btn-sm btn-icon"
                [disabled]="currentPage === totalPages || totalPages === 0"
                (click)="currentPage = currentPage + 1"
              >
                <app-icon name="chevron-right" [size]="16"></app-icon>
              </button>
            </div>
          </div>
        }
      </div>
    </div>

    <!-- ADD EMPLOYEE MODAL -->
    @if (isAddModalOpen) {
      <div class="modal-backdrop" (click)="isAddModalOpen = false">
        <div class="modal-dialog modal-lg" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title">Register New Employee</h3>
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
                  <input id="emp-name" type="text" class="form-control" formControlName="name" placeholder="John Doe" />
                </div>

                <!-- Username -->
                <div class="form-group">
                  <label for="emp-username">Username <span class="required">*</span></label>
                  <input id="emp-username" type="text" class="form-control" formControlName="username" placeholder="john_doe" />
                </div>

                <!-- Email -->
                <div class="form-group">
                  <label for="emp-email">Email Address <span class="required">*</span></label>
                  <input id="emp-email" type="email" class="form-control" formControlName="email" placeholder="john.doe@company.com" />
                </div>

                <!-- Role -->
                <div class="form-group">
                  <label for="emp-role">System Role <span class="required">*</span></label>
                  <select id="emp-role" class="form-select" formControlName="roleId">
                    <option [value]="1">Admin</option>
                    <option [value]="2">HR</option>
                    <option [value]="3">Manager</option>
                    <option [value]="4">Employee</option>
                  </select>
                </div>

                <!-- Department -->
                <div class="form-group">
                  <label for="emp-dept">Department</label>
                  <select id="emp-dept" class="form-select" formControlName="departmentId" (change)="onDepartmentChange($event)">
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

                <!-- Designation -->
                <div class="form-group">
                  <label for="emp-desig">Designation ID <span class="required">*</span></label>
                  <input id="emp-desig" type="number" class="form-control" formControlName="designationId" placeholder="1" />
                  <span class="form-hint">Enter the ID of the designation (e.g. 1).</span>
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
                  <select id="edit-dept" class="form-select" formControlName="departmentId">
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
                    @for (team of allTeams; track team.id) {
                      <option [ngValue]="team.id">{{ team.name }}</option>
                    }
                  </select>
                </div>

                <div class="form-group">
                  <label for="edit-desig">Designation ID <span class="required">*</span></label>
                  <input id="edit-desig" type="number" class="form-control" formControlName="designationId" />
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
                <span class="detail-val">{{ selectedEmployee.department || 'Not Assigned' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Team</span>
                <span class="detail-val">{{ selectedEmployee.team || 'Not Assigned' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Designation</span>
                <span class="detail-val">{{ selectedEmployee.designation || 'Not Assigned' }}</span>
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
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);
  authState = inject(AuthStateService);

  Math = Math;

  allEmployees: EmployeeListItem[] = [];
  filteredEmployees: EmployeeListItem[] = [];
  departments: DepartmentListItem[] = [];
  allTeams: TeamListItem[] = [];
  availableTeams: TeamListItem[] = [];

  isLoading = true;
  isSubmitting = false;

  // Search & Filter
  searchTerm = '';
  selectedDepartmentFilter = '';
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

  private cdr = inject(ChangeDetectorRef);

  loadData(): void {
    this.isLoading = true;
    forkJoin({
      employees: this.employeeApi.getAll().pipe(catchError(() => of([]))),
      departments: this.departmentApi.getAll().pipe(catchError(() => of([]))),
      teams: this.teamApi.getAll().pipe(catchError(() => of([])))
    }).subscribe({
      next: (res) => {
        this.allEmployees = res.employees;
        this.departments = res.departments;
        this.allTeams = res.teams;
        this.availableTeams = res.teams;
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

    if (this.selectedStatusFilter === 'active') {
      result = result.filter(e => e.isActive);
    } else if (this.selectedStatusFilter === 'inactive') {
      result = result.filter(e => !e.isActive);
    }

    this.filteredEmployees = result;
    this.currentPage = 1;
  }

  openAddModal(): void {
    this.addForm.reset({
      roleId: 4,
      departmentId: null,
      teamId: null,
      supervisorId: null,
      designationId: 1
    });
    this.availableTeams = this.allTeams;
    this.isAddModalOpen = true;
  }

  onDepartmentChange(event: Event): void {
    const deptId = this.addForm.value.departmentId;
    if (deptId) {
      this.departmentApi.getTeams(deptId).pipe(catchError(() => of([]))).subscribe(teams => {
        this.availableTeams = teams;
      });
    } else {
      this.availableTeams = this.allTeams;
    }
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
        this.toast.success('Employee created successfully!');
        this.loadData();
      },
      error: () => {
        this.isSubmitting = false;
      }
    });
  }

  openEditModal(emp: EmployeeListItem): void {
    this.selectedEmployee = emp;
    const dept = this.departments.find(d => d.name === emp.department);
    const team = this.allTeams.find(t => t.name === emp.team);
    const sup = this.allEmployees.find(e => e.name === emp.supervisor);

    this.editForm.patchValue({
      name: emp.name,
      email: emp.email,
      departmentId: dept ? dept.id : null,
      teamId: team ? team.id : null,
      supervisorId: sup ? sup.id : null,
      designationId: 1
    });

    this.isEditModalOpen = true;
  }

  onEditSubmit(): void {
    if (!this.selectedEmployee || this.editForm.invalid) return;

    this.isSubmitting = true;
    this.employeeApi.update(this.selectedEmployee.id, this.editForm.value).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.isEditModalOpen = false;
        this.toast.success('Employee updated successfully!');
        this.loadData();
      },
      error: () => {
        this.isSubmitting = false;
      }
    });
  }

  openViewModal(emp: EmployeeListItem): void {
    this.selectedEmployee = emp;
    this.isViewModalOpen = true;
  }

  toggleStatus(emp: EmployeeListItem): void {
    const newStatus = !emp.isActive;
    this.employeeApi.updateStatus(emp.id, { isActive: newStatus }).subscribe({
      next: () => {
        emp.isActive = newStatus;
        this.toast.success(`Employee ${newStatus ? 'activated' : 'deactivated'} successfully.`);
      }
    });
  }

  confirmDelete(emp: EmployeeListItem): void {
    this.selectedEmployee = emp;
    this.isDeleteDialogOpen = true;
  }

  onDeleteConfirmed(): void {
    if (!this.selectedEmployee) return;

    this.isSubmitting = true;
    this.employeeApi.delete(this.selectedEmployee.id).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.isDeleteDialogOpen = false;
        this.toast.success('Employee deleted successfully.');
        this.loadData();
      },
      error: () => {
        this.isSubmitting = false;
      }
    });
  }
}
