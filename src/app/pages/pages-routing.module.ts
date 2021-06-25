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
import { CampaignSummaryComponent } from '../campaign/campaign-summary/campaign-summary.component';
import { WifiLogsComponent } from './wifi-logs/wifi-logs.component';
import { ProcessListComponent } from '../process/process-list/process-list.component';
import { MyProcessComponent } from '../process/my-process/my-process.component';
import { UserMappingComponent } from './user-mapping/user-mapping.component';
import { CompanykycComponent } from './companykyc/companykyc.component';
import { UserGroupsComponent } from './user-groups/user-groups.component';
import { ProcessAdminComponent } from '../process/process-admin/process-admin.component';
import { PersonalisedDashboardComponent } from '../process/personalised-dashboard/personalised-dashboard.component';
import { GraphicalReportsComponent } from '../process/graphical-reports/graphical-reports.component';
import { TicketComponent } from '../ticket/ticket/ticket.component';
import { TicketProcessComponent } from '../ticket/ticket-process/ticket-process.component';
import { EmployeeMonitoringComponent } from './employee-monitoring/employee-monitoring.component';
import { OnSiteImagesComponent } from './on-site-images/on-site-images.component';
import { OnSiteImagesSummaryComponent } from './on-site-images-summary/on-site-images-summary.component';
import { CustomeronboardingComponent } from './customeronboarding/customeronboarding.component';
import { TicketAdminComponent } from '../ticket/ticket-admin/ticket-admin.component';
import { CustomDashboardComponent } from '../ticket/custom-dashboard/custom-dashboard.component';
import { EntityDeatilsComponent } from './entity-deatils/entity-deatils.component';
import { UserWiseExpensesComponent } from './user-wise-expenses/user-wise-expenses.component';
import { UserExpensesComponent } from './user-expenses/user-expenses.component';
import { KanbanBoardComponent } from '../process/kanban-board/kanban-board.component';
import { TaskKanbanComponent } from './task-kanban/task-kanban.component';
import { AdminKanbanComponent } from './admin-kanban/admin-kanban.component';
import { SitesComponent } from './sites/sites.component';
import { TmgDashboardComponent } from './tmg-dashboard/tmg-dashboard.component';
import { SettingsComponent } from './company-setting/company-setting.component';
import { CallLogsComponent } from './call-logs/call-logs.component';
import { ContinuityReportComponent } from './continuity-report/continuity-report.component';
import { LeaveManagementComponent } from './leave-management/leave-management.component';

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
      canActivate: [AuthGuard, RouteGuard]
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
      canActivate: [AuthGuard, RouteGuard]

    },
    {
      path: 'user-mapping',
      component: UserMappingComponent,
      canActivate: [AuthGuard, RouteGuard]

    },
    {
      path: 'customeronboarding',
      component: CustomeronboardingComponent,
      canActivate: [AuthGuard, RouteGuard]

    },
    {
      path: 'companykyc',
      component: CompanykycComponent,
      canActivate: [AuthGuard, RouteGuard]
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
      path: 'wifi-logs',
      component: WifiLogsComponent,
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
      canActivate: [AuthGuard, RouteGuard]
    },
    {
      path: 'add-pages',
      component: AddPagesComponent,
      canActivate: [AuthGuard, RouteGuard]
    },
    {
      path: 'campaign-summary',
      component: CampaignSummaryComponent,
      canActivate: [AuthGuard, RouteGuard]
    },
    {
      path: 'process-list',
      component: ProcessListComponent,
      canActivate: [AuthGuard, RouteGuard]
    },
    {
      path: 'my-process',
      component: MyProcessComponent,
      canActivate: [AuthGuard, RouteGuard]
    },
    {
      path: 'process-admin',
      component: ProcessAdminComponent,
      canActivate: [AuthGuard, RouteGuard]
    },
    {
      path: 'personalised-dashboard',
      component: PersonalisedDashboardComponent,
      canActivate: [AuthGuard, RouteGuard]
    }, {
      path: 'graphical-reports',
      component: GraphicalReportsComponent,
      canActivate: [AuthGuard, RouteGuard]
    },
    {
      path: 'user-groups',
      component: UserGroupsComponent,
      canActivate: [AuthGuard, RouteGuard]
    },
    {
      path: 'ticket',
      component: TicketComponent,
      canActivate: [AuthGuard, RouteGuard]
    },
    {
      path: 'ticket-process',
      component: TicketProcessComponent,
      canActivate: [AuthGuard, RouteGuard]
    },
    {
      path: 'ticket-admin',
      component: TicketAdminComponent,
      canActivate: [AuthGuard, RouteGuard]
    },
    {
      path: 'custom-dashboard',
      component: CustomDashboardComponent,
      canActivate: [AuthGuard, RouteGuard]
    },
    {
      path: 'employee-monitoring',
      component: EmployeeMonitoringComponent,
      canActivate: [AuthGuard, RouteGuard]
    },
    {
      path: 'on-site-images',
      component: OnSiteImagesComponent,
      canActivate: [AuthGuard, RouteGuard]
    },
    {
      path: 'on-site-images-summary',
      component: OnSiteImagesSummaryComponent,
      canActivate: [AuthGuard, RouteGuard]
    },
    {
      path: 'entity-details',
      component: EntityDeatilsComponent,
      canActivate: [AuthGuard, RouteGuard]
    },
    {
      path: 'user-wise-expenses',
      component: UserWiseExpensesComponent,
      canActivate: [AuthGuard, RouteGuard]
    },
    {
      path: 'user-expenses',
      component: UserExpensesComponent,
      canActivate: [AuthGuard, RouteGuard]
    },
    {
      path: 'kanban-board',
      component: KanbanBoardComponent,
      canActivate: [AuthGuard, RouteGuard]
    },
    {
      path: 'task-kanban',
      component: TaskKanbanComponent,
      canActivate: [AuthGuard, RouteGuard]
    },
    {
      path: 'admin-kanban',
      component: AdminKanbanComponent,
      canActivate: [AuthGuard, RouteGuard]
    },
    {
      path: 'site',
      component: SitesComponent,
      canActivate: [AuthGuard, RouteGuard]
    },
    {
      path: 'tmg-dashboard',
      component: TmgDashboardComponent,
      canActivate: [AuthGuard, RouteGuard]
    },
    {
      path: 'settings',
      component: SettingsComponent,
      canActivate: [AuthGuard, RouteGuard]
    },
    {
      path: 'call-logs',
      component: CallLogsComponent,
      canActivate: [AuthGuard, RouteGuard]
    },
    {
      path: 'continuity-report',
      component: ContinuityReportComponent,
      canActivate: [AuthGuard, RouteGuard]
    },
    {
      path: 'leave-management',
      component: LeaveManagementComponent,
      canActivate: [AuthGuard, RouteGuard]
    }

  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {
}
