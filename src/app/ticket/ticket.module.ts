import { DataTablesModule } from 'angular-datatables';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeModule } from '../@theme/theme.module';
import { NbMenuModule, NbCardModule } from '@nebular/theme';
import { FormsModule } from '@angular/forms';
import { DirectiveModule } from '../directives/directives.module';

import { TicketComponent } from './ticket/ticket.component';
import { TicketProcessComponent } from './ticket-process/ticket-process.component';
import { TicketAdminComponent } from './ticket-admin/ticket-admin.component';
import { CustomDashboardComponent } from './custom-dashboard/custom-dashboard.component';

@NgModule({
  declarations: [TicketComponent, TicketProcessComponent, TicketAdminComponent, CustomDashboardComponent],
  imports: [
    CommonModule,
    ThemeModule,
    NbMenuModule,
    NbCardModule,
    FormsModule,
    DirectiveModule,
    DataTablesModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TicketModule { }
