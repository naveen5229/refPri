
import { DataTablesModule } from 'angular-datatables';
import { NgModule } from '@angular/core';
import { NbMenuModule, NbCardModule } from '@nebular/theme';

import { ThemeModule } from '../@theme/theme.module';
import { PagesComponent } from './pages.component';
import { DashboardModule } from './dashboard/dashboard.module';
import { PagesRoutingModule } from './pages-routing.module';
import { UserComponent } from './user/user.component';
import { FormsModule } from '@angular/forms';
import { ProjectComponent } from './project/project.component';
import { ModulesComponent } from './modules/modules.component';
import { TaskAssignComponent } from './task-assign/task-assign.component';
import { DirectiveModule } from '../directives/directives.module';
import { WorkLogsComponent } from './work-logs/work-logs.component';
import { AddStacksComponent } from './add-stacks/add-stacks.component';
import { DistanceCalculateComponent } from './distance-calculate/distance-calculate.component';
import { SegmentComponent } from './segment/segment.component';
import { EmployeePeriodReportComponent } from './employee-period-report/employee-period-report.component';
import { EmployeeMonthlyReportComponent } from './employee-monthly-report/employee-monthly-report.component';
import { SegmentReportComponent } from './segment-report/segment-report.component';
import { ComponentReportComponent } from './component-report/component-report.component';
import { SegmentStackReportComponent } from './segment-stack-report/segment-stack-report.component';
import { ModuleReportComponent } from './module-report/module-report.component';
import { EmployeeDaywiseReportComponent } from './employee-daywise-report/employee-daywise-report.component';
import { CampaignModule } from '../campaign/campaign.module';
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
import { UserRoleComponent } from './user-role/user-role.component';
import { AddPagesComponent } from './add-pages/add-pages.component';
import { WifiLogsComponent } from './wifi-logs/wifi-logs.component';
import { ProcessModule } from '../process/process.module';
import { UserMappingComponent } from './user-mapping/user-mapping.component';
import { CompanykycComponent } from './companykyc/companykyc.component';
import { UserGroupsComponent } from './user-groups/user-groups.component';
import {TicketModule} from '../ticket/ticket.module';
import { EmployeeMonitoringComponent } from './employee-monitoring/employee-monitoring.component';
import { OnSiteImagesComponent } from './on-site-images/on-site-images.component';
import { OnSiteImagesSummaryComponent } from './on-site-images-summary/on-site-images-summary.component';
import { CustomeronboardingComponent } from './customeronboarding/customeronboarding.component';
import { EntityDeatilsComponent } from './entity-deatils/entity-deatils.component';
import { UserWiseExpensesComponent } from './user-wise-expenses/user-wise-expenses.component';
import { UserExpensesComponent } from './user-expenses/user-expenses.component';
import { TaskKanbanComponent } from './task-kanban/task-kanban.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AdminKanbanComponent } from './admin-kanban/admin-kanban.component';
import { SitesComponent } from './sites/sites.component';
import { ChartModule } from 'angular2-chartjs';
import { TmgDashboardComponent } from './tmg-dashboard/tmg-dashboard.component';
import { TmgTaskComponent } from './tmg-task/tmg-task.component';
import { SettingsComponent } from './company-setting/company-setting.component';
import { CallLogsComponent } from './call-logs/call-logs.component';
import { ContinuityReportComponent } from './continuity-report/continuity-report.component';
import { LeaveManagementComponent } from './leave-management/leave-management.component';
import { MyLeavesComponent } from './my-leaves/my-leaves.component';
import { ExpenseTypeComponent } from './expense-type/expense-type.component';
import { VisitManagementComponent } from '../pages/visit-management/visit-management.component';
import { AgmCoreModule } from '@agm/core';
@NgModule({
  imports: [
    PagesRoutingModule,
    ThemeModule,
    NbMenuModule,
    NbCardModule,
    FormsModule,
    DirectiveModule,
    DashboardModule,
    CampaignModule,
    ProcessModule,
    TicketModule,
    DragDropModule,
    ChartModule,
    DataTablesModule,
    AgmCoreModule,
 AgmCoreModule.forRoot({
 apiKey: 'AIzaSyAvcDy5ZYc2ujCS6TTtI3RYX5QmuoV8Ffw',
 libraries: ['places', 'drawing', 'geometry'],
    })
  ],
  declarations: [
    PagesComponent,
    UserComponent,
    ProjectComponent,
    ModulesComponent,
    TaskAssignComponent,
    WorkLogsComponent,
    AddStacksComponent,
    DistanceCalculateComponent,
    SegmentComponent,
    EmployeePeriodReportComponent,
    EmployeeMonthlyReportComponent,
    SegmentReportComponent,
    ComponentReportComponent,
    SegmentStackReportComponent,
    ModuleReportComponent,
    EmployeeDaywiseReportComponent,
    AdminToolComponent,
    TicketCallMappingComponent,
    DailyReportComponent,
    DailyPartnerReportComponent,
    WwToolsComponent,
    TaskComponent,
    TaskScheduledComponent,
    FutureRefComponent,
    CallKpiComponent,
    FieldIssueRequestComponent,
    InstallerComponent,
    AttendanceComponent,
    ShiftLogsComponent,
    ActivityLogsComponent,
    ActivityLogSummaryComponent,
    HolidaysComponent,
    OtManagementComponent,
    TravelDistanceComponent,
    SalaryComponent,
    UserRoleComponent,
    AddPagesComponent,
    WifiLogsComponent,
    UserMappingComponent,
    CompanykycComponent,
    UserGroupsComponent,
    EmployeeMonitoringComponent,
    OnSiteImagesComponent,
    OnSiteImagesSummaryComponent,
    CustomeronboardingComponent,
    EntityDeatilsComponent,
    UserWiseExpensesComponent,
    UserExpensesComponent,
    TaskKanbanComponent,
    AdminKanbanComponent,
    SitesComponent,
    TmgDashboardComponent,
    TmgTaskComponent,
    SettingsComponent,
    CallLogsComponent,
    ContinuityReportComponent,
    LeaveManagementComponent,
    MyLeavesComponent,
    ExpenseTypeComponent,
    VisitManagementComponent,
  ],
})
export class PagesModule {
}
