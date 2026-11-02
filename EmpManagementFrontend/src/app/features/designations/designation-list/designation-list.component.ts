import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DesignationApiService } from '../../../api/designation-api.service';
import { DesignationItem, DesignationEmployee } from '../../../core/models/designation.models';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { ToastService } from '../../../core/services/toast.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-designation-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IconComponent,
    SearchInputComponent,
    EmptyStateComponent,
    StatusBadgeComponent,
    ConfirmDialogComponent
  ],
  template: `
    <div class="page-container">
      <!-- Page Header -->
      <div class="page-header">
        <div class="page-title-group">
          <h1 class="page-title">Designations Catalog</h1>
          <p class="page-description">Organizational job titles, role descriptions, and workforce assignments ({{ designations.length }} total titles).</p>
        </div>

        @if (authState.isAdmin()) {
          <div class="page-actions">
            <button class="btn btn-primary" (click)="openCreateModal()">
              <app-icon name="plus" [size]="18"></app-icon>
              <span>Add Designation</span>
            </button>
          </div>
        }
      </div>

      <!-- Toolbar -->
      <div class="toolbar">
        <div class="toolbar-search">
          <app-search-input
            placeholder="Search designations by title or scope..."
            (searchChange)="onSearch($event)"
          ></app-search-input>
        </div>
      </div>

      <!-- Designations Table -->
      <div class="table-container">
        @if (isLoading) {
          <div style="padding: 24px;">
            <div class="skeleton mb-4" style="height: 40px;"></div>
            <div class="skeleton mb-4" style="height: 40px;"></div>
            <div class="skeleton" style="height: 40px;"></div>
          </div>
        } @else if (filteredDesignations.length === 0) {
          <div style="padding: 32px 16px;">
            <app-empty-state
              icon="award"
              title="No designations found"
              description="No job titles match your search criteria."
              [actionLabel]="authState.isAdmin() ? 'Add Designation' : ''"
              actionIcon="plus"
              (action)="openCreateModal()"
            ></app-empty-state>
          </div>
        } @else {
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 60px;">ID</th>
                  <th>Job Title / Designation</th>
                  <th>Description</th>
                  <th style="width: 110px; text-align: center;">Status</th>
                  <th style="width: 140px; text-align: center;">Assigned Staff</th>
                  <th style="width: 180px; text-align: right;">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (item of filteredDesignations; track item.id) {
                  <tr>
                    <td class="text-muted font-mono font-medium">#{{ item.id }}</td>
                    <td>
                      <div class="flex items-center gap-3">
                        <div class="desig-badge-icon">
                          <app-icon name="award" [size]="18"></app-icon>
                        </div>
                        <div>
                          <span class="font-semibold">{{ item.name }}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="text-secondary">{{ item.description || 'Standard organizational job role.' }}</span>
                    </td>
                    <td style="text-align: center;">
                      <app-status-badge [status]="item.isActive"></app-status-badge>
                    </td>
                    <td style="text-align: center;">
                      <button
                        type="button"
                        class="staff-count-btn"
                        [class.has-staff]="(item.employeeCount || 0) > 0"
                        (click)="viewEmployees(item)"
                        title="View employees with this designation"
                      >
                        <app-icon name="users" [size]="14"></app-icon>
                        <span>{{ item.employeeCount || 0 }} {{ (item.employeeCount === 1) ? 'member' : 'members' }}</span>
                      </button>
                    </td>
                    <td style="text-align: right;">
                      <div class="action-buttons-group">
                        <button
                          type="button"
                          class="btn btn-sm btn-ghost btn-icon"
                          (click)="viewEmployees(item)"
                          title="View Assigned Employees"
                        >
                          <app-icon name="eye" [size]="16"></app-icon>
                        </button>

                        @if (authState.isAdmin()) {
                          <button
                            type="button"
                            class="btn btn-sm btn-ghost btn-icon"
                            (click)="openEditModal(item)"
                            title="Edit Designation"
                          >
                            <app-icon name="edit" [size]="16"></app-icon>
                          </button>

                          <button
                            type="button"
                            class="btn btn-sm btn-ghost btn-icon"
                            (click)="toggleStatus(item)"
                            [title]="item.isActive ? 'Deactivate Designation' : 'Activate Designation'"
                          >
                            <app-icon [name]="item.isActive ? 'lock' : 'check'" [size]="16"></app-icon>
                          </button>

                          <button
                            type="button"
                            class="btn btn-sm btn-ghost btn-icon text-danger"
                            (click)="confirmDelete(item)"
                            title="Delete Designation"
                          >
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
        }
      </div>
    </div>

    <!-- CREATE DESIGNATION MODAL -->
    @if (isCreateModalOpen) {
      <div class="modal-backdrop" (click)="isCreateModalOpen = false">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title">Create New Designation</h3>
            <button class="btn btn-icon btn-ghost" (click)="isCreateModalOpen = false">
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>
          <form [formGroup]="createForm" (ngSubmit)="onCreateSubmit()">
            <div class="modal-body">
              <div class="form-group">
                <label for="desig-name">Job Title / Designation Name <span class="required">*</span></label>
                <input
                  id="desig-name"
                  type="text"
                  class="form-control"
                  formControlName="name"
                  placeholder="e.g. Senior Cloud Architect"
                />
              </div>

              <div class="form-group">
                <label for="desig-desc">Description <span class="required">*</span></label>
                <textarea
                  id="desig-desc"
                  class="form-control"
                  rows="3"
                  formControlName="description"
                  placeholder="Describe role scope and responsibilities..."
                ></textarea>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-outline" (click)="isCreateModalOpen = false">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="createForm.invalid || isSubmitting">
                @if (isSubmitting) {
                  <app-icon name="refresh" [size]="16" customClass="spin"></app-icon>
                }
                Create Designation
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- EDIT DESIGNATION MODAL -->
    @if (isEditModalOpen && selectedItem) {
      <div class="modal-backdrop" (click)="isEditModalOpen = false">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title">Edit Designation: {{ selectedItem.name }}</h3>
            <button class="btn btn-icon btn-ghost" (click)="isEditModalOpen = false">
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>
          <form [formGroup]="editForm" (ngSubmit)="onEditSubmit()">
            <div class="modal-body">
              <div class="form-group">
                <label for="edit-desig-name">Job Title / Designation Name <span class="required">*</span></label>
                <input
                  id="edit-desig-name"
                  type="text"
                  class="form-control"
                  formControlName="name"
                  placeholder="e.g. Senior Cloud Architect"
                />
              </div>

              <div class="form-group">
                <label for="edit-desig-desc">Description <span class="required">*</span></label>
                <textarea
                  id="edit-desig-desc"
                  class="form-control"
                  rows="3"
                  formControlName="description"
                  placeholder="Describe role scope and responsibilities..."
                ></textarea>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-outline" (click)="isEditModalOpen = false">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="editForm.invalid || isSubmitting">
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

    <!-- VIEW EMPLOYEES MODAL -->
    @if (isEmployeesModalOpen && selectedItem) {
      <div class="modal-backdrop" (click)="isEmployeesModalOpen = false">
        <div class="modal-dialog modal-md" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <h3 class="modal-title">{{ selectedItem.name }}</h3>
              <p class="text-caption">Employees assigned to this title ({{ assignedEmployees.length }} total)</p>
            </div>
            <button class="btn btn-icon btn-ghost" (click)="isEmployeesModalOpen = false">
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>
          <div class="modal-body" style="max-height: 420px; overflow-y: auto;">
            @if (isLoadingEmployees) {
              <div class="p-4 text-center">
                <app-icon name="refresh" [size]="24" customClass="spin text-muted"></app-icon>
                <p class="text-caption mt-2">Loading assigned workforce...</p>
              </div>
            } @else if (assignedEmployees.length === 0) {
              <div class="p-4 text-center">
                <app-icon name="users" [size]="32" customClass="text-muted mb-2"></app-icon>
                <p class="text-secondary font-medium">No employees currently hold this title.</p>
              </div>
            } @else {
              <div class="employee-stack">
                @for (emp of assignedEmployees; track emp.id) {
                  <div class="employee-stack-item">
                    <div class="flex items-center gap-3">
                      <div class="emp-avatar-icon">
                        <app-icon name="user" [size]="16"></app-icon>
                      </div>
                      <div>
                        <div class="font-medium text-sm">{{ emp.name }}</div>
                        <div class="text-caption">{{ emp.email }}</div>
                      </div>
                    </div>
                    <app-status-badge [status]="emp.isActive"></app-status-badge>
                  </div>
                }
              </div>
            }
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline" (click)="isEmployeesModalOpen = false">Close</button>
          </div>
        </div>
      </div>
    }

    <!-- CONFIRM DELETE DIALOG -->
    <app-confirm-dialog
      [isOpen]="isDeleteConfirmOpen"
      title="Delete Designation"
      [message]="'Are you sure you want to delete ' + (selectedItem?.name || 'this designation') + '? This action cannot be undone.'"
      confirmText="Delete"
      variant="danger"
      [isLoading]="isSubmitting"
      (cancel)="isDeleteConfirmOpen = false"
      (confirm)="onDeleteSubmit()"
    ></app-confirm-dialog>
  `,
  styles: [`
    .page-container {
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: var(--space-4);

      @media (max-width: 640px) {
        flex-direction: column;
      }
    }

    .page-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--color-text-primary);
      margin-bottom: var(--space-1);
    }

    .page-description {
      color: var(--color-text-secondary);
      font-size: 0.875rem;
    }

    .toolbar {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      background-color: var(--color-surface);
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-border);
    }

    .toolbar-search {
      flex: 1;
      max-width: 480px;
    }

    .table-container {
      background-color: var(--color-surface);
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-border);
      overflow: hidden;
    }

    .table-responsive {
      overflow-x: auto;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.875rem;

      th {
        padding: var(--space-3) var(--space-4);
        background-color: var(--color-bg);
        color: var(--color-text-secondary);
        font-weight: 600;
        border-bottom: 1px solid var(--color-border);
        white-space: nowrap;
      }

      td {
        padding: var(--space-3) var(--space-4);
        border-bottom: 1px solid var(--color-border);
        color: var(--color-text-primary);
        vertical-align: middle;
      }

      tbody tr:hover {
        background-color: var(--color-surface-hover);
      }
    }

    .desig-badge-icon {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-md);
      background-color: var(--color-primary-light, #e0e7ff);
      color: var(--color-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .staff-count-btn {
      display: inline-flex;
      align-items: center;
      gap: var(--space-1);
      padding: 4px 10px;
      border-radius: var(--radius-full);
      font-size: 0.75rem;
      font-weight: 600;
      background-color: var(--color-bg);
      color: var(--color-text-muted);
      border: 1px solid var(--color-border);
      cursor: pointer;
      transition: all 0.15s ease;

      &.has-staff {
        background-color: #ecfdf5;
        color: #059669;
        border-color: #a7f3d0;

        &:hover {
          background-color: #d1fae5;
        }
      }

      &:hover {
        background-color: var(--color-surface-hover);
      }
    }

    .action-buttons-group {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: var(--space-1);
    }

    .text-danger {
      color: var(--color-danger);

      &:hover {
        background-color: rgba(239, 68, 68, 0.1) !important;
      }
    }

    .employee-stack {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .employee-stack-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-3);
      border-radius: var(--radius-md);
      background: var(--color-bg);
      border: 1px solid var(--color-border);
    }

    .emp-avatar-icon {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-full);
      background: var(--color-surface);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-text-secondary);
      border: 1px solid var(--color-border);
    }

    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: var(--space-4);
    }

    .modal-dialog {
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      width: 100%;
      max-width: 480px;
      border: 1px solid var(--color-border);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      overflow: hidden;

      &.modal-md {
        max-width: 560px;
      }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-4) var(--space-6);
      border-bottom: 1px solid var(--color-border);
    }

    .modal-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--color-text-primary);
      margin: 0;
    }

    .modal-body {
      padding: var(--space-6);
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
      padding: var(--space-4) var(--space-6);
      background: var(--color-bg);
      border-top: 1px solid var(--color-border);
    }

    .form-group {
      margin-bottom: var(--space-4);

      label {
        display: block;
        font-size: 0.875rem;
        font-weight: 500;
        margin-bottom: var(--space-1);
        color: var(--color-text-primary);
      }
    }

    .form-control {
      width: 100%;
      padding: var(--space-2) var(--space-3);
      font-size: 0.875rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background-color: var(--color-surface);
      color: var(--color-text-primary);

      &:focus {
        outline: none;
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
      }
    }

    .required {
      color: var(--color-danger);
    }

    .spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      100% { transform: rotate(360deg); }
    }
  `]
})
export class DesignationListComponent implements OnInit {
  private fb = inject(FormBuilder);
  private designationApi = inject(DesignationApiService);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);
  authState = inject(AuthStateService);

  designations: DesignationItem[] = [];
  filteredDesignations: DesignationItem[] = [];

  isLoading = true;
  isSubmitting = false;

  isCreateModalOpen = false;
  isEditModalOpen = false;
  isEmployeesModalOpen = false;
  isDeleteConfirmOpen = false;
  isLoadingEmployees = false;

  selectedItem: DesignationItem | null = null;
  assignedEmployees: DesignationEmployee[] = [];

  createForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    description: ['', [Validators.required]]
  });

  editForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    description: ['', [Validators.required]]
  });

  ngOnInit(): void {
    this.loadDesignations();
  }

  loadDesignations(): void {
    this.isLoading = true;

    this.designationApi.getAll().subscribe({
      next: (list) => {
        this.designations = list;
        this.filteredDesignations = list;
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
      this.filteredDesignations = this.designations;
      return;
    }
    this.filteredDesignations = this.designations.filter(d =>
      d.name.toLowerCase().includes(q) || (d.description && d.description.toLowerCase().includes(q))
    );
  }

  openCreateModal(): void {
    this.createForm.reset();
    this.isCreateModalOpen = true;
  }

  onCreateSubmit(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.designationApi.create(this.createForm.value).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.isCreateModalOpen = false;
        this.createForm.reset();
        this.toast.success('Designation created successfully!');
        this.loadDesignations();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.toast.error(err?.error || 'Failed to create designation.');
      }
    });
  }

  openEditModal(item: DesignationItem): void {
    this.selectedItem = item;
    this.editForm.patchValue({
      name: item.name,
      description: item.description
    });
    this.isEditModalOpen = true;
  }

  onEditSubmit(): void {
    if (this.editForm.invalid || !this.selectedItem) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.designationApi.update(this.selectedItem.id, this.editForm.value).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.isEditModalOpen = false;
        this.toast.success('Designation updated successfully!');
        this.loadDesignations();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.toast.error(err?.error || 'Failed to update designation.');
      }
    });
  }

  toggleStatus(item: DesignationItem): void {
    const targetStatus = !item.isActive;
    this.designationApi.updateStatus(item.id, targetStatus).subscribe({
      next: () => {
        item.isActive = targetStatus;
        this.toast.success(`Designation ${targetStatus ? 'activated' : 'deactivated'} successfully!`);
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.toast.error(err?.error || 'Failed to update designation status.');
      }
    });
  }

  viewEmployees(item: DesignationItem): void {
    this.selectedItem = item;
    this.assignedEmployees = [];
    this.isLoadingEmployees = true;
    this.isEmployeesModalOpen = true;

    this.designationApi.getEmployees(item.id).subscribe({
      next: (list) => {
        this.assignedEmployees = list;
        this.isLoadingEmployees = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoadingEmployees = false;
        this.cdr.markForCheck();
      }
    });
  }

  confirmDelete(item: DesignationItem): void {
    this.selectedItem = item;
    this.isDeleteConfirmOpen = true;
  }

  onDeleteSubmit(): void {
    if (!this.selectedItem) return;

    this.isSubmitting = true;
    this.designationApi.delete(this.selectedItem.id).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.isDeleteConfirmOpen = false;
        this.toast.success('Designation deleted successfully!');
        this.loadDesignations();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.toast.error(err?.error || 'Cannot delete designation. Ensure no staff are assigned.');
      }
    });
  }
}
