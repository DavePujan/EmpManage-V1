import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DepartmentApiService } from '../../../api/department-api.service';
import { TeamApiService } from '../../../api/team-api.service';
import { DepartmentListItem } from '../../../core/models/department.models';
import { TeamDetails, TeamEmployeeItem, TeamListItem } from '../../../core/models/team.models';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { ToastService } from '../../../core/services/toast.service';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-team-list',
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
          <h1 class="page-title">Teams</h1>
          <p class="page-description">Functional workforce groups and department teams.</p>
        </div>

        @if (authState.isAdmin()) {
          <div class="page-actions">
            <button class="btn btn-primary" (click)="isCreateModalOpen = true">
              <app-icon name="plus" [size]="18"></app-icon>
              <span>Create Team</span>
            </button>
          </div>
        }
      </div>

      <!-- Toolbar -->
      <div class="toolbar">
        <div class="toolbar-search">
          <app-search-input
            placeholder="Search teams..."
            (searchChange)="onSearch($event)"
          ></app-search-input>
        </div>
      </div>

      <!-- Teams Grid -->
      @if (isLoading) {
        <div class="team-grid">
          <div class="skeleton" style="height: 150px; border-radius: 16px;"></div>
          <div class="skeleton" style="height: 150px; border-radius: 16px;"></div>
          <div class="skeleton" style="height: 150px; border-radius: 16px;"></div>
        </div>
      } @else if (filteredTeams.length === 0) {
        <app-empty-state
          icon="teams"
          title="No teams found"
          description="Create your first team to assign employees and designate team heads."
          [actionLabel]="authState.isAdmin() ? 'Create Team' : ''"
          actionIcon="plus"
          (action)="isCreateModalOpen = true"
        ></app-empty-state>
      } @else {
        <div class="team-grid">
          @for (team of filteredTeams; track team.id) {
            <div class="card card-hover team-card" (click)="openDetailModal(team)">
              <div class="team-card-top">
                <div class="team-icon">
                  <app-icon name="teams" [size]="22"></app-icon>
                </div>
                <app-status-badge [status]="team.isActive"></app-status-badge>
              </div>

              <h3 class="team-name">{{ team.name }}</h3>

              <div class="team-meta-row">
                <div class="meta-item">
                  <span class="meta-label">Team Head:</span>
                  <span class="meta-val">{{ team.teamHead || 'Not Assigned' }}</span>
                </div>
              </div>

              <div class="team-card-footer">
                <div class="team-member-count">
                  <app-icon name="users" [size]="16" customClass="text-primary"></app-icon>
                  <span>{{ team.employeeCount }} members</span>
                </div>
                <span class="view-link">
                  <span>Details</span>
                  <app-icon name="chevron-right" [size]="14"></app-icon>
                </span>
              </div>
            </div>
          }
        </div>
      }
    </div>

    <!-- CREATE TEAM MODAL -->
    @if (isCreateModalOpen) {
      <div class="modal-backdrop" (click)="isCreateModalOpen = false">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title">Create New Team</h3>
            <button class="btn btn-icon btn-ghost" (click)="isCreateModalOpen = false">
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>
          <form [formGroup]="createForm" (ngSubmit)="onCreateSubmit()">
            <div class="modal-body">
              <div class="form-group">
                <label for="team-name">Team Name <span class="required">*</span></label>
                <input
                  id="team-name"
                  type="text"
                  class="form-control"
                  formControlName="name"
                  placeholder="e.g. Core Backend Team"
                />
              </div>

              <div class="form-group">
                <label for="team-dept">Assigned Department <span class="required">*</span></label>
                <select id="team-dept" class="form-select" formControlName="departmentId">
                  <option [ngValue]="null">Select Department</option>
                  @for (dept of departments; track dept.id) {
                    <option [ngValue]="dept.id">{{ dept.name }}</option>
                  }
                </select>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-outline" (click)="isCreateModalOpen = false">Cancel</button>
              <button type="button" class="btn btn-primary" [disabled]="createForm.invalid || isSubmitting" (click)="onCreateSubmit()">
                @if (isSubmitting) {
                  <app-icon name="refresh" [size]="16" customClass="spin"></app-icon>
                }
                Create Team
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- TEAM DETAILS MODAL -->
    @if (isDetailModalOpen && selectedTeamDetails) {
      <div class="modal-backdrop" (click)="isDetailModalOpen = false">
        <div class="modal-dialog modal-lg" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <h3 class="modal-title">{{ selectedTeamDetails.name }}</h3>
              <p class="text-caption">Department: {{ selectedTeamDetails.department }}</p>
            </div>
            <button class="btn btn-icon btn-ghost" (click)="isDetailModalOpen = false">
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>

          <div class="modal-body">
            <div class="team-info-box mb-4">
              <div class="info-item">
                <span class="info-label">Team Head</span>
                <span class="info-val">{{ selectedTeamDetails.teamHead || 'Not Assigned' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Total Members</span>
                <span class="info-val">{{ selectedTeamDetails.employeeCount }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Status</span>
                <span class="info-val">
                  <app-status-badge [status]="selectedTeamDetails.isActive"></app-status-badge>
                </span>
              </div>
            </div>

            <h4 class="text-h4 mb-3">Assigned Team Members</h4>
            @if (isDetailLoading) {
              <div class="skeleton mb-2" style="height: 48px;"></div>
              <div class="skeleton" style="height: 48px;"></div>
            } @else if (teamEmployees.length === 0) {
              <p class="text-muted text-center py-4">No employees assigned to this team yet.</p>
            } @else {
              <div class="list-group">
                @for (emp of teamEmployees; track emp.id) {
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
          </div>

          <div class="modal-footer">
            <button class="btn btn-outline" (click)="isDetailModalOpen = false">Close</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .team-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: var(--space-5);
    }

    .team-card {
      cursor: pointer;
      display: flex;
      flex-direction: column;
    }

    .team-card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--space-3);

      .team-icon {
        width: 40px;
        height: 40px;
        border-radius: var(--radius-md);
        background-color: var(--color-info-bg);
        color: var(--color-info);
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    .team-name {
      font-size: 16px;
      font-weight: 700;
      color: var(--color-text-primary);
      margin-bottom: 4px;
    }

    .team-meta-row {
      margin-bottom: var(--space-4);

      .meta-item {
        font-size: 13px;
        color: var(--color-text-secondary);
        .meta-label {
          color: var(--color-text-muted);
          margin-right: 4px;
        }
        .meta-val {
          font-weight: 500;
        }
      }
    }

    .team-card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: var(--space-3);
      border-top: 1px solid var(--color-border);
      margin-top: auto;

      .team-member-count {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        font-weight: 500;
        color: var(--color-text-secondary);
      }

      .view-link {
        font-size: 13px;
        font-weight: 500;
        color: var(--color-primary);
        display: flex;
        align-items: center;
        gap: 2px;
      }
    }

    .team-info-box {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-3);
      background-color: var(--color-bg);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: var(--space-4);

      .info-item {
        display: flex;
        flex-direction: column;
        gap: 2px;

        .info-label {
          font-size: 11px;
          text-transform: uppercase;
          color: var(--color-text-muted);
          font-weight: 600;
        }

        .info-val {
          font-size: 13.5px;
          font-weight: 600;
          color: var(--color-text-primary);
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
export class TeamListComponent implements OnInit {
  private fb = inject(FormBuilder);
  private teamApi = inject(TeamApiService);
  private departmentApi = inject(DepartmentApiService);
  private toast = inject(ToastService);
  authState = inject(AuthStateService);

  teams: TeamListItem[] = [];
  filteredTeams: TeamListItem[] = [];
  departments: DepartmentListItem[] = [];

  isLoading = true;
  isSubmitting = false;

  isCreateModalOpen = false;
  isDetailModalOpen = false;
  isDetailLoading = false;
  selectedTeamDetails: TeamDetails | null = null;
  teamEmployees: TeamEmployeeItem[] = [];

  createForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    departmentId: [null, [Validators.required]]
  });

  ngOnInit(): void {
    this.loadData();
  }

  private cdr = inject(ChangeDetectorRef);

  loadData(): void {
    this.isLoading = true;
    forkJoin({
      teams: this.teamApi.getAll().pipe(catchError(() => of([]))),
      departments: this.departmentApi.getAll().pipe(catchError(() => of([])))
    }).subscribe({
      next: (res) => {
        this.teams = res.teams;
        this.filteredTeams = res.teams;
        this.departments = res.departments;
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
      this.filteredTeams = this.teams;
      return;
    }
    this.filteredTeams = this.teams.filter(t =>
      t.name.toLowerCase().includes(q) || (t.teamHead && t.teamHead.toLowerCase().includes(q))
    );
  }

  onCreateSubmit(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.teamApi.create(this.createForm.value).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.isCreateModalOpen = false;
        this.createForm.reset({ departmentId: null });
        this.toast.success('Team created successfully!');
        this.loadData();
      },
      error: () => {
        this.isSubmitting = false;
      }
    });
  }

  openDetailModal(team: TeamListItem): void {
    this.isDetailModalOpen = true;
    this.isDetailLoading = true;

    this.teamApi.getById(team.id).subscribe({
      next: (details) => {
        this.selectedTeamDetails = details;
      }
    });

    this.teamApi.getEmployees(team.id).subscribe({
      next: (emps) => {
        this.teamEmployees = emps;
        this.isDetailLoading = false;
      },
      error: () => {
        this.isDetailLoading = false;
      }
    });
  }
}
