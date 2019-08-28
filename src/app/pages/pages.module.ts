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
  ],
})
export class PagesModule {
}
