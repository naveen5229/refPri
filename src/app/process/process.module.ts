import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeModule } from '../@theme/theme.module';
import { NbMenuModule, NbCardModule } from '@nebular/theme';
import { FormsModule } from '@angular/forms';
import { DirectiveModule } from '../directives/directives.module';

import { ProcessRoutingModule } from './process-routing.module';
import { ProcessListComponent } from './process-list/process-list.component';
import { MyProcessComponent } from './my-process/my-process.component';
import { ProcessAdminComponent } from './process-admin/process-admin.component';
import { PersonalisedDashboardComponent } from './personalised-dashboard/personalised-dashboard.component';
import { GraphicalReportsComponent } from './graphical-reports/graphical-reports.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { KanbanBoardComponent } from './kanban-board/kanban-board.component';
@NgModule({
  declarations: [ProcessListComponent, MyProcessComponent, ProcessAdminComponent, PersonalisedDashboardComponent, GraphicalReportsComponent, KanbanBoardComponent],
  imports: [
    CommonModule,
    ProcessRoutingModule,
    ThemeModule,
    NbMenuModule,
    NbCardModule,
    FormsModule,
    DirectiveModule,
    DragDropModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProcessModule { }
