import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DesignationApiService } from '../../../api/designation-api.service';
import { DesignationItem } from '../../../core/models/designation.models';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { ToastService } from '../../../core/services/toast.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';

@Component({
  selector: 'app-designation-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IconComponent,
    SearchInputComponent,
    EmptyStateComponent
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
            <button class="btn btn-primary" (click)="isCreateModalOpen = true">
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
              (action)="isCreateModalOpen = true"
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
                  <th style="width: 140px; text-align: center;">Assigned Staff</th>
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
                      <span class="staff-count-badge" [class.has-staff]="(item.employeeCount || 0) > 0">
                        {{ item.employeeCount || 0 }} {{ (item.employeeCount === 1) ? 'member' : 'members' }}
                      </span>
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
                  formControlName="description"
                  placeholder="Describe role scope and responsibilities..."
                ></textarea>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-outline" (click)="isCreateModalOpen = false">Cancel</button>
              <button type="button" class="btn btn-primary" [disabled]="createForm.invalid || isSubmitting" (click)="onCreateSubmit()">
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
  `,
  styles: [`
    .desig-badge-icon {
      width: 34px;
      height: 34px;
      border-radius: var(--radius-sm);
      background-color: var(--color-primary-soft);
      color: var(--color-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .staff-count-badge {
      display: inline-block;
      font-size: 12px;
      font-weight: 600;
      padding: 3px 10px;
      border-radius: var(--radius-full);
      background-color: var(--color-bg-secondary, #F1F5F9);
      color: var(--color-text-muted);

      &.has-staff {
        background-color: var(--color-primary-soft);
        color: var(--color-primary);
      }
    }

    .font-mono {
      font-family: monospace;
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

  createForm: FormGroup = this.fb.group({
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
      error: () => {
        this.isSubmitting = false;
      }
    });
  }
}
