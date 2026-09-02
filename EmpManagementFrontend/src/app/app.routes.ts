import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { roleGuard } from './core/guards/role.guard';
import { UserRole } from './core/models/auth.models';
import { ShellComponent } from './layout/shell/shell.component';

export const routes: Routes = [
  // Public Login Route
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },

  // Authenticated App Shell Routes
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'employees',
        canActivate: [roleGuard],
        data: { roles: [UserRole.Admin, UserRole.HR] },
        loadComponent: () => import('./features/employees/employee-list/employee-list.component').then(m => m.EmployeeListComponent)
      },
      {
        path: 'departments',
        canActivate: [roleGuard],
        data: { roles: [UserRole.Admin, UserRole.HR] },
        loadComponent: () => import('./features/departments/department-list/department-list.component').then(m => m.DepartmentListComponent)
      },
      {
        path: 'teams',
        canActivate: [roleGuard],
        data: { roles: [UserRole.Admin, UserRole.HR] },
        loadComponent: () => import('./features/teams/team-list/team-list.component').then(m => m.TeamListComponent)
      },
      {
        path: 'designations',
        canActivate: [roleGuard],
        data: { roles: [UserRole.Admin] },
        loadComponent: () => import('./features/designations/designation-list/designation-list.component').then(m => m.DesignationListComponent)
      },
      {
        path: 'leaves',
        loadComponent: () => import('./features/leaves/leave-management/leave-management.component').then(m => m.LeaveManagementComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
      }
    ]
  },

  // Error Routes
  {
    path: '403',
    loadComponent: () => import('./features/errors/forbidden/forbidden.component').then(m => m.ForbiddenComponent)
  },
  {
    path: '**',
    loadComponent: () => import('./features/errors/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
