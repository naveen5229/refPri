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

@NgModule({
  imports: [
    PagesRoutingModule,
    ThemeModule,
    NbMenuModule,
    DashboardModule,
    NbCardModule,
    FormsModule,
    DirectiveModule
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
  ],
})
export class PagesModule {
}
