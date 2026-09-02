import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { LeaveApiService } from '../../../api/leave-api.service';
import { TeamApiService } from '../../../api/team-api.service';
import { LeaveResponse } from '../../../core/models/leave.models';
import { TeamListItem } from '../../../core/models/team.models';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-leave-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IconComponent,
    StatusBadgeComponent,
    SearchInputComponent,
    EmptyStateComponent,
    ConfirmDialogComponent
  ],
  template: `
    <div class="page-container">
      <!-- Page Header -->
      <div class="page-header">
        <div class="page-title-group">
          <h1 class="page-title">Leave Management</h1>
          <p class="page-description">Request time off, track application status, and process team leave approvals.</p>
        </div>

        <div class="page-actions">
          @if (authState.isEmployee()) {
            <button class="btn btn-primary" (click)="openApplyModal()">
              <app-icon name="plus" [size]="18"></app-icon>
              <span>Apply for Leave</span>
            </button>
          }
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="leave-tabs-bar">
        @if (authState.isEmployee()) {
          <button
            class="tab-link"
            [class.active]="activeTab === 'my'"
            (click)="switchTab('my')"
          >
            <app-icon name="user" [size]="16"></app-icon>
            <span>My Leaves</span>
          </button>
        }

        @if (authState.isAdmin() || authState.isHR() || authState.isManager()) {
          <button
            class="tab-link"
            [class.active]="activeTab === 'pending'"
            (click)="switchTab('pending')"
          >
            <app-icon name="clock" [size]="16"></app-icon>
            <span>Pending Approvals</span>
            @if (pendingLeavesCount > 0) {
              <span class="tab-badge">{{ pendingLeavesCount }}</span>
            }
          </button>

          <button
            class="tab-link"
            [class.active]="activeTab === 'all'"
            (click)="switchTab('all')"
          >
            <app-icon name="calendar" [size]="16"></app-icon>
            <span>All Leave History</span>
          </button>
        }

        @if (authState.isHR()) {
          <button
            class="tab-link"
            [class.active]="activeTab === 'team'"
            (click)="switchTab('team')"
          >
            <app-icon name="teams" [size]="16"></app-icon>
            <span>Team Leaves</span>
          </button>
        }
      </div>

      <!-- Toolbar -->
      <div class="toolbar">
        <div class="toolbar-search">
          <app-search-input
            placeholder="Search by employee, leave type, reason..."
            (searchChange)="onSearch($event)"
          ></app-search-input>
        </div>

        <div class="toolbar-filters">
          <select class="form-select form-select-sm" [(ngModel)]="selectedStatusFilter" (change)="applyFilters()">
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <!-- Table Container -->
      <div class="table-container">
        @if (isLoading) {
          <div style="padding: 24px;">
            <div class="skeleton mb-4" style="height: 40px;"></div>
            <div class="skeleton mb-4" style="height: 40px;"></div>
            <div class="skeleton" style="height: 40px;"></div>
          </div>
        } @else if (filteredLeaves.length === 0) {
          <div style="padding: 32px 16px;">
            <app-empty-state
              icon="calendar"
              title="No leave records found"
              [description]="activeTab === 'pending' ? 'All pending requests have been processed.' : 'No leaves match your criteria.'"
              [actionLabel]="authState.isEmployee() ? 'Apply for Leave' : ''"
              actionIcon="plus"
              (action)="openApplyModal()"
            ></app-empty-state>
          </div>
        } @else {
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  @if (activeTab !== 'my') {
                    <th>Employee</th>
                  }
                  <th>Type</th>
                  <th>Dates & Duration</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Approved / Rejected By</th>
                  <th style="text-align: right;">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (leave of filteredLeaves; track leave.id) {
                  <tr>
                    @if (activeTab !== 'my') {
                      <td>
                        <span class="font-semibold">{{ leave.employeeName || 'Employee #' + leave.employeeId }}</span>
                      </td>
                    }
                    <td>
                      <span class="badge badge-primary">{{ leave.leaveType }}</span>
                    </td>
                    <td>
                      <div class="dates-cell">
                        <span class="dates-range">
                          {{ leave.startDate | date:'MMM d' }} – {{ leave.endDate | date:'MMM d, y' }}
                        </span>
                        <span class="dates-duration">{{ calculateDays(leave.startDate, leave.endDate) }} day(s)</span>
                      </div>
                    </td>
                    <td>
                      <span class="text-secondary" style="max-width: 200px; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        {{ leave.reason }}
                      </span>
                    </td>
                    <td>
                      <app-status-badge [status]="leave.status" type="leave"></app-status-badge>
                    </td>
                    <td>
                      @if (leave.approvedByName) {
                        <div class="approver-info">
                          <span class="approver-name">{{ leave.approvedByName }}</span>
                          <span class="approver-date">{{ leave.approvedDate | date:'MMM d, y' }}</span>
                        </div>
                      } @else {
                        <span class="text-muted">—</span>
                      }
                    </td>
                    <td>
                      <div class="table-actions">
                        <!-- Employee: Cancel Pending Leave -->
                        @if (leave.status === 'Pending' && (activeTab === 'my' || authState.isEmployee())) {
                          <button class="btn btn-outline btn-sm text-danger" (click)="confirmCancelLeave(leave)" title="Cancel Leave Request">
                            <app-icon name="x" [size]="14"></app-icon>
                            <span>Cancel</span>
                          </button>
                        }

                        <!-- HR: Approve & Reject Actions -->
                        @if (leave.status === 'Pending' && authState.isHR() && activeTab === 'pending') {
                          <button class="btn btn-tertiary btn-sm" (click)="confirmApproveLeave(leave)" title="Approve Leave">
                            <app-icon name="check" [size]="14"></app-icon>
                            <span>Approve</span>
                          </button>
                          <button class="btn btn-danger btn-sm" (click)="openRejectModal(leave)" title="Reject Leave">
                            <app-icon name="x" [size]="14"></app-icon>
                            <span>Reject</span>
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

    <!-- APPLY FOR LEAVE MODAL -->
    @if (isApplyModalOpen) {
      <div class="modal-backdrop" (click)="isApplyModalOpen = false">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title">Apply for Leave</h3>
            <button class="btn btn-icon btn-ghost" (click)="isApplyModalOpen = false">
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>
          <form [formGroup]="applyForm" (ngSubmit)="onApplySubmit()">
            <div class="modal-body">
              <!-- Leave Type -->
              <div class="form-group">
                <label for="leave-type">Leave Type <span class="required">*</span></label>
                <select id="leave-type" class="form-select" formControlName="leaveType">
                  <option value="Sick">Sick Leave</option>
                  <option value="Vacation">Vacation Leave</option>
                  <option value="Casual">Casual Leave</option>
                  <option value="Maternity">Maternity Leave</option>
                  <option value="Paternity">Paternity Leave</option>
                  <option value="Unpaid">Unpaid Leave</option>
                </select>
              </div>

              <!-- Dates Row -->
              <div class="form-grid">
                <div class="form-group">
                  <label for="start-date">Start Date <span class="required">*</span></label>
                  <input id="start-date" type="date" class="form-control" formControlName="startDate" />
                </div>
                <div class="form-group">
                  <label for="end-date">End Date <span class="required">*</span></label>
                  <input id="end-date" type="date" class="form-control" formControlName="endDate" />
                </div>
              </div>

              <!-- Duration Notice -->
              @if (applyDurationDays > 0) {
                <div class="duration-pill mb-4">
                  <app-icon name="calendar" [size]="16"></app-icon>
                  <span>Total Duration: <strong>{{ applyDurationDays }} days</strong></span>
                </div>
              }

              <!-- Reason -->
              <div class="form-group">
                <label for="leave-reason">Reason <span class="required">*</span></label>
                <textarea
                  id="leave-reason"
                  class="form-control"
                  formControlName="reason"
                  placeholder="Provide brief context for the leave request..."
                ></textarea>
              </div>

              <!-- Team Leave Toggle -->
              <div class="form-group mt-2">
                <label class="checkbox-label">
                  <input type="checkbox" formControlName="isTeamLeave" />
                  <span>Mark as Team Leave</span>
                </label>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-outline" (click)="isApplyModalOpen = false">Cancel</button>
              <button type="button" class="btn btn-primary" [disabled]="applyForm.invalid || isSubmitting" (click)="onApplySubmit()">
                @if (isSubmitting) {
                  <app-icon name="refresh" [size]="16" customClass="spin"></app-icon>
                }
                Submit Application
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- REJECT LEAVE MODAL -->
    @if (isRejectModalOpen && selectedLeave) {
      <div class="modal-backdrop" (click)="isRejectModalOpen = false">
        <div class="modal-dialog modal-sm" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title text-danger">Reject Leave Request</h3>
            <button class="btn btn-icon btn-ghost" (click)="isRejectModalOpen = false">
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>
          <form [formGroup]="rejectForm" (ngSubmit)="onRejectSubmit()">
            <div class="modal-body">
              <p class="text-caption mb-3">
                Rejecting leave for <strong>{{ selectedLeave.employeeName }}</strong>. Please provide a clear explanation.
              </p>
              <div class="form-group">
                <label for="reject-reason">Rejection Reason <span class="required">*</span></label>
                <textarea
                  id="reject-reason"
                  class="form-control"
                  formControlName="reason"
                  placeholder="e.g. Critical project deadline or low team capacity."
                ></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline" (click)="isRejectModalOpen = false">Cancel</button>
              <button type="button" class="btn btn-danger" [disabled]="rejectForm.invalid || isSubmitting" (click)="onRejectSubmit()">
                Reject Leave
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- APPROVE CONFIRMATION DIALOG -->
    <app-confirm-dialog
      [isOpen]="isApproveDialogOpen"
      title="Approve Leave Request?"
      [message]="'Approve leave for ' + (selectedLeave?.employeeName || 'this employee') + ' from ' + (selectedLeave?.startDate | date:'MMM d') + ' to ' + (selectedLeave?.endDate | date:'MMM d, y') + '?'"
      confirmText="Approve Leave"
      variant="primary"
      icon="check-circle"
      [isLoading]="isSubmitting"
      (confirm)="onApproveConfirmed()"
      (cancel)="isApproveDialogOpen = false"
    ></app-confirm-dialog>

    <!-- CANCEL CONFIRMATION DIALOG -->
    <app-confirm-dialog
      [isOpen]="isCancelDialogOpen"
      title="Cancel Leave Application?"
      message="Are you sure you want to withdraw this pending leave request?"
      confirmText="Withdraw Leave"
      variant="danger"
      [isLoading]="isSubmitting"
      (confirm)="onCancelConfirmed()"
      (cancel)="isCancelDialogOpen = false"
    ></app-confirm-dialog>
  `,
  styles: [`
    .leave-tabs-bar {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      border-bottom: 1px solid var(--color-border);
      margin-bottom: var(--space-6);
      overflow-x: auto;

      .tab-link {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 10px 18px;
        font-size: 14px;
        font-weight: 500;
        color: var(--color-text-secondary);
        border-bottom: 2px solid transparent;
        transition: all var(--transition-fast);
        white-space: nowrap;

        &:hover {
          color: var(--color-text-primary);
        }

        &.active {
          color: var(--color-primary);
          border-bottom-color: var(--color-primary);
          font-weight: 600;
        }

        .tab-badge {
          background-color: var(--color-warning);
          color: #FFFFFF;
          font-size: 11px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: var(--radius-full);
        }
      }
    }

    .dates-cell {
      display: flex;
      flex-direction: column;
      gap: 2px;

      .dates-range {
        font-weight: 500;
        color: var(--color-text-primary);
      }

      .dates-duration {
        font-size: 12px;
        color: var(--color-text-muted);
      }
    }

    .approver-info {
      display: flex;
      flex-direction: column;
      gap: 2px;

      .approver-name {
        font-size: 13px;
        font-weight: 500;
        color: var(--color-text-primary);
      }

      .approver-date {
        font-size: 11.5px;
        color: var(--color-text-muted);
      }
    }

    .duration-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background-color: var(--color-primary-soft);
      color: var(--color-primary);
      border-radius: var(--radius-sm);
      font-size: 13px;
    }

    .spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      100% { transform: rotate(360deg); }
    }
  `]
})
export class LeaveManagementComponent implements OnInit {
  private fb = inject(FormBuilder);
  private leaveApi = inject(LeaveApiService);
  private teamApi = inject(TeamApiService);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);
  authState = inject(AuthStateService);

  activeTab: 'my' | 'pending' | 'all' | 'team' = 'my';
  leaves: LeaveResponse[] = [];
  filteredLeaves: LeaveResponse[] = [];
  pendingLeavesCount = 0;

  isLoading = true;
  isSubmitting = false;

  // Filters
  searchTerm = '';
  selectedStatusFilter = 'all';

  // Modals & Dialogs
  isApplyModalOpen = false;
  isRejectModalOpen = false;
  isApproveDialogOpen = false;
  isCancelDialogOpen = false;
  selectedLeave: LeaveResponse | null = null;

  applyForm: FormGroup = this.fb.group({
    leaveType: ['Sick', [Validators.required]],
    startDate: ['', [Validators.required]],
    endDate: ['', [Validators.required]],
    reason: ['', [Validators.required]],
    isTeamLeave: [false],
    teamId: [null]
  });

  rejectForm: FormGroup = this.fb.group({
    reason: ['', [Validators.required]]
  });

  get applyDurationDays(): number {
    const start = this.applyForm.value.startDate;
    const end = this.applyForm.value.endDate;
    if (!start || !end) return 0;
    return this.calculateDays(start, end);
  }

  ngOnInit(): void {
    // Default active tab based on role
    if (this.authState.isAdmin() || this.authState.isHR() || this.authState.isManager()) {
      this.activeTab = 'pending';
    } else {
      this.activeTab = 'my';
    }
    this.loadLeaves();
  }

  switchTab(tab: 'my' | 'pending' | 'all' | 'team'): void {
    this.activeTab = tab;
    this.loadLeaves();
  }

  loadLeaves(): void {
    this.isLoading = true;

    let request$;
    if (this.activeTab === 'my') {
      request$ = this.leaveApi.getMyLeaves();
    } else if (this.activeTab === 'pending') {
      request$ = this.leaveApi.getPending();
    } else if (this.activeTab === 'team') {
      request$ = this.leaveApi.getTeamLeaves();
    } else {
      request$ = this.leaveApi.getAll();
    }

    request$.subscribe({
      next: (data) => {
        this.leaves = data;
        this.filteredLeaves = data;
        if (this.activeTab === 'pending') {
          this.pendingLeavesCount = data.length;
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

  applyFilters(): void {
    let result = [...this.leaves];

    if (this.searchTerm) {
      result = result.filter(l =>
        (l.employeeName && l.employeeName.toLowerCase().includes(this.searchTerm)) ||
        (l.leaveType && l.leaveType.toLowerCase().includes(this.searchTerm)) ||
        (l.reason && l.reason.toLowerCase().includes(this.searchTerm)) ||
        (l.status && l.status.toLowerCase().includes(this.searchTerm))
      );
    }

    if (this.selectedStatusFilter !== 'all') {
      result = result.filter(l => l.status === this.selectedStatusFilter);
    }

    this.filteredLeaves = result;
  }

  calculateDays(start: string, end: string): number {
    const s = new Date(start);
    const e = new Date(end);
    const diff = e.getTime() - s.getTime();
    if (diff < 0) return 0;
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  }

  openApplyModal(): void {
    const todayStr = new Date().toISOString().split('T')[0];
    this.applyForm.reset({
      leaveType: 'Sick',
      startDate: todayStr,
      endDate: todayStr,
      isTeamLeave: false,
      teamId: null
    });
    this.isApplyModalOpen = true;
  }

  onApplySubmit(): void {
    if (this.applyForm.invalid) {
      this.applyForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const val = this.applyForm.value;
    const dto = {
      ...val,
      startDate: new Date(val.startDate).toISOString(),
      endDate: new Date(val.endDate).toISOString()
    };

    this.leaveApi.apply(dto).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.isApplyModalOpen = false;
        this.toast.success('Leave application submitted successfully!');
        this.loadLeaves();
      },
      error: () => {
        this.isSubmitting = false;
      }
    });
  }

  confirmApproveLeave(leave: LeaveResponse): void {
    this.selectedLeave = leave;
    this.isApproveDialogOpen = true;
  }

  onApproveConfirmed(): void {
    if (!this.selectedLeave) return;

    this.isSubmitting = true;
    this.leaveApi.approve(this.selectedLeave.id).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.isApproveDialogOpen = false;
        this.toast.success('Leave request approved.');
        this.loadLeaves();
      },
      error: () => {
        this.isSubmitting = false;
      }
    });
  }

  openRejectModal(leave: LeaveResponse): void {
    this.selectedLeave = leave;
    this.rejectForm.reset({ reason: '' });
    this.isRejectModalOpen = true;
  }

  onRejectSubmit(): void {
    if (!this.selectedLeave || this.rejectForm.invalid) return;

    this.isSubmitting = true;
    this.leaveApi.reject(this.selectedLeave.id, this.rejectForm.value).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.isRejectModalOpen = false;
        this.toast.success('Leave request rejected.');
        this.loadLeaves();
      },
      error: () => {
        this.isSubmitting = false;
      }
    });
  }

  confirmCancelLeave(leave: LeaveResponse): void {
    this.selectedLeave = leave;
    this.isCancelDialogOpen = true;
  }

  onCancelConfirmed(): void {
    if (!this.selectedLeave) return;

    this.isSubmitting = true;
    this.leaveApi.cancel(this.selectedLeave.id).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.isCancelDialogOpen = false;
        this.toast.success('Leave request cancelled.');
        this.loadLeaves();
      },
      error: () => {
        this.isSubmitting = false;
      }
    });
  }
}
