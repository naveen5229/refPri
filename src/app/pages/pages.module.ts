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
    AttendanceComponent
  ],
})
export class PagesModule {
}
