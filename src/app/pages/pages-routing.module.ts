import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { PagesComponent } from './pages.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UserComponent } from './user/user.component';
import { ProjectComponent } from './project/project.component';
import { ModulesComponent } from './modules/modules.component';
import { TaskAssignComponent } from './task-assign/task-assign.component';
import { WorkLogsComponent } from './work-logs/work-logs.component';
import { AddStacksComponent } from './add-stacks/add-stacks.component';
import { AuthGuard } from '../guards/auth.guard';
import { DistanceCalculateComponent } from './distance-calculate/distance-calculate.component';
import { SegmentComponent } from './segment/segment.component';
import { EmployeeMonthlyReportComponent } from './employee-monthly-report/employee-monthly-report.component';
const routes: Routes = [{
  path: '',
  component: PagesComponent,
  children: [
    {
      path: 'dashboard',
      component: DashboardComponent,
    },
    {
      path: 'user',
      component: UserComponent,
      canActivate: [AuthGuard]
    },
    {
      path: 'project',
      component: ProjectComponent,
      canActivate: [AuthGuard]
    },
    {
      path: 'add-stacks',
      component: AddStacksComponent,
      canActivate: [AuthGuard]
    },
    {
      path: 'modules',
      component: ModulesComponent,
      canActivate: [AuthGuard]
    },
    {
      path: 'segment',
      component: SegmentComponent,
      canActivate: [AuthGuard]
    },
    {
      path: 'task-assign',
      component: TaskAssignComponent,
      canActivate: [AuthGuard]
    },
    {
      path: 'work-logs',
      component: WorkLogsComponent,
      canActivate: [AuthGuard]
    },
    {
      path: 'distance-calculate',
      component: DistanceCalculateComponent,
      canActivate: [AuthGuard]
    },
    {
      path: 'employee-monthly-report',
      component: EmployeeMonthlyReportComponent,
      canActivate: [AuthGuard]
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {
}
