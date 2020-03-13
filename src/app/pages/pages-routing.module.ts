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
import { EmployeePeriodReportComponent } from './employee-period-report/employee-period-report.component';
import { EmployeeMonthlyReportComponent } from './employee-monthly-report/employee-monthly-report.component';
import { SegmentReportComponent } from './segment-report/segment-report.component';
import { ComponentReportComponent } from './component-report/component-report.component';
import { SegmentStackReportComponent } from './segment-stack-report/segment-stack-report.component';
import { ModuleReportComponent } from './module-report/module-report.component';
import { EmployeeDaywiseReportComponent } from './employee-daywise-report/employee-daywise-report.component';
import { AddCampaignComponent } from '../campaign/add-campaign/add-campaign.component';
import { CampaignMasterPageComponent } from '../campaign/campaign-master-page/campaign-master-page.component';
import { CampaignTargetComponent } from '../campaign/campaign-target/campaign-target.component';
import { AdminToolComponent } from './admin-tool/admin-tool.component';
import { TicketCallMappingComponent } from './ticket-call-mapping/ticket-call-mapping.component';
import { DailyReportComponent } from './daily-report/daily-report.component';
import { DailyPartnerReportComponent } from './daily-partner-report/daily-partner-report.component';
import { WwToolsComponent } from './ww-tools/ww-tools.component';
import { TaskComponent } from './task/task.component';
import { TaskScheduledComponent } from './task-scheduled/task-scheduled.component';
import { FutureRefComponent } from './future-ref/future-ref.component';
import { CallKpiComponent } from './call-kpi/call-kpi.component';
import { FieldIssueRequestComponent } from './field-issue-request/field-issue-request.component';
import { InstallerComponent } from './installer/installer.component';
import { AttendanceComponent } from './attendance/attendance.component';

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
      path: 'employee-period-report',
      component: EmployeePeriodReportComponent,
      canActivate: [AuthGuard]
    },
    {
      path: 'employee-monthly-report',
      component: EmployeeMonthlyReportComponent,
      canActivate: [AuthGuard]
    },
    {
      path: 'segment-report',
      component: SegmentReportComponent,
      canActivate: [AuthGuard]
    },
    {
      path: 'component-report',
      component: ComponentReportComponent,
      canActivate: [AuthGuard]
    },
    {
      path: 'segment-stack-report',
      component: SegmentStackReportComponent,
      canActivate: [AuthGuard]
    },
    {
      path: 'module-report',
      component: ModuleReportComponent,
      canActivate: [AuthGuard]
    },
    {
      path: 'employee-daywise-report',
      component: EmployeeDaywiseReportComponent,
      canActivate: [AuthGuard]
    },

    {
      path: 'add-campaign',
      component: AddCampaignComponent,
    },

    {
      path: 'campaign-master-page',
      component: CampaignMasterPageComponent
    },
    {
      path: 'campaign-target',
      component: CampaignTargetComponent
    },
    {
      path: 'admin-tool',
      component: AdminToolComponent
    },
    {
      path: 'ticket-call-mapping',
      component: TicketCallMappingComponent
    },
    {
      path: 'daily-report',
      component: DailyReportComponent
    },
    {
      path: 'daily-partner-report',
      component: DailyPartnerReportComponent
    },
    {
      path: 'ww-tools',
      component: WwToolsComponent
    },
    {
      path: 'task',
      component: TaskComponent
    },
    {
      path: 'task-scheduled',
      component: TaskScheduledComponent
    },
    {
      path: 'future-ref',
      component: FutureRefComponent
    },
    {
      path: 'call-kpi',
      component: CallKpiComponent
    },
    {
      path: 'field-support-request',
      component: FieldIssueRequestComponent
    },
    {
      path: 'installer',
      component: InstallerComponent
    },
    {
      path: 'attendance',
      component: AttendanceComponent
    }

  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {
}
