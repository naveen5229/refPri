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
import { ShiftLogsComponent } from './shift-logs/shift-logs.component';
import { ActivityLogsComponent } from './activity-logs/activity-logs.component';
import { ActivityLogSummaryComponent } from './activity-log-summary/activity-log-summary.component';
import { HolidaysComponent } from './holidays/holidays.component';
import { OtManagementComponent } from './ot-management/ot-management.component';
import { TravelDistanceComponent } from './travel-distance/travel-distance.component';
import { SalaryComponent } from './salary/salary.component';
import { MycampaignComponent } from '../campaign/mycampaign/mycampaign.component';
import { UserRoleComponent } from './user-role/user-role.component';
import { AddPagesComponent } from './add-pages/add-pages.component';
import { RouteGuard } from '../guards/route.guard';

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
      canActivate: [AuthGuard, RouteGuard]
    },
    {
      path: 'project',
      component: ProjectComponent,
      canActivate: [AuthGuard, RouteGuard]
    },
    {
      path: 'add-stacks',
      component: AddStacksComponent,
      canActivate: [AuthGuard, RouteGuard]
    },
    {
      path: 'modules',
      component: ModulesComponent,
      canActivate: [AuthGuard, RouteGuard]
    },
    {
      path: 'segment',
      component: SegmentComponent,
      canActivate: [AuthGuard, RouteGuard]
    },
    {
      path: 'task-assign',
      component: TaskAssignComponent,
      canActivate: [AuthGuard, RouteGuard]
    },
    {
      path: 'work-logs',
      component: WorkLogsComponent,
      canActivate: [AuthGuard, RouteGuard]
    },
    {
      path: 'distance-calculate',
      component: DistanceCalculateComponent,
      canActivate: [AuthGuard, RouteGuard]
    },
    {
      path: 'employee-period-report',
      component: EmployeePeriodReportComponent,
      canActivate: [AuthGuard, RouteGuard]
    },
    {
      path: 'employee-monthly-report',
      component: EmployeeMonthlyReportComponent,
      canActivate: [AuthGuard, RouteGuard]
    },
    {
      path: 'segment-report',
      component: SegmentReportComponent,
      canActivate: [AuthGuard, RouteGuard]
    },
    {
      path: 'component-report',
      component: ComponentReportComponent,
      canActivate: [AuthGuard, RouteGuard]
    },
    {
      path: 'segment-stack-report',
      component: SegmentStackReportComponent,
      canActivate: [AuthGuard, RouteGuard]
    },
    {
      path: 'module-report',
      component: ModuleReportComponent,
      canActivate: [AuthGuard]
    },
    {
      path: 'employee-daywise-report',
      component: EmployeeDaywiseReportComponent,
      canActivate: [AuthGuard, RouteGuard]
    },

    {
      path: 'add-campaign',
      component: AddCampaignComponent,
      canActivate: [AuthGuard, RouteGuard]

    },

    {
      path: 'campaign-master-page',
      component: CampaignMasterPageComponent,
      canActivate: [AuthGuard, RouteGuard]

    },
    {
      path: 'campaign-target',
      component: CampaignTargetComponent,
      canActivate: [AuthGuard, RouteGuard]

    },
    {
      path: 'my-campaign',
      component: MycampaignComponent,
      canActivate: [AuthGuard, RouteGuard]

    },
    {
      path: 'admin-tool',
      component: AdminToolComponent,
      canActivate: [AuthGuard, RouteGuard]

    },
    {
      path: 'ticket-call-mapping',
      component: TicketCallMappingComponent,
      canActivate: [AuthGuard, RouteGuard]

    },
    {
      path: 'daily-report',
      component: DailyReportComponent,
      canActivate: [AuthGuard, RouteGuard]

    },
    {
      path: 'daily-partner-report',
      component: DailyPartnerReportComponent,
      canActivate: [AuthGuard, RouteGuard]

    },
    {
      path: 'ww-tools',
      component: WwToolsComponent,
      canActivate: [AuthGuard, RouteGuard]

    },
    {
      path: 'task',
      component: TaskComponent,
      canActivate: [AuthGuard]

    },
    {
      path: 'task-scheduled',
      component: TaskScheduledComponent,
      canActivate: [AuthGuard, RouteGuard]

    },
    {
      path: 'future-ref',
      component: FutureRefComponent,
      canActivate: [AuthGuard, RouteGuard]

    },
    {
      path: 'call-kpi',
      component: CallKpiComponent,
      canActivate: [AuthGuard, RouteGuard]

    },
    {
      path: 'field-support-request',
      component: FieldIssueRequestComponent,
      canActivate: [AuthGuard, RouteGuard]
    },
    {
      path: 'installer',
      component: InstallerComponent,
      canActivate: [AuthGuard, RouteGuard]
    },
    {
      path: 'attendance',
      component: AttendanceComponent,
      canActivate: [AuthGuard, RouteGuard]
    },
    {
      path: 'shift-logs',
      component: ShiftLogsComponent,
      canActivate: [AuthGuard, RouteGuard]
    },
    {
      path: 'activity-logs',
      component: ActivityLogsComponent,
      canActivate: [AuthGuard, RouteGuard]
    },
    {
      path: 'activity-logs-summary',
      component: ActivityLogSummaryComponent,
      canActivate: [AuthGuard, RouteGuard]
    },
    {
      path: 'holiday-calendar',
      component: HolidaysComponent,
      canActivate: [AuthGuard, RouteGuard]
    },
    {
      path: 'ot-management',
      component: OtManagementComponent,
      canActivate: [AuthGuard, RouteGuard]
    },
    {
      path: 'travel-distance',
      component: TravelDistanceComponent,
      canActivate: [AuthGuard, RouteGuard]
    },
    {
      path: 'salary',
      component: SalaryComponent,
      canActivate: [AuthGuard, RouteGuard]
    },
    {
      path: 'user-role',
      component: UserRoleComponent,
      canActivate: [AuthGuard]
    },
    {
      path: 'add-pages',
      component: AddPagesComponent,
      canActivate: [AuthGuard]
    }

  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {
}
