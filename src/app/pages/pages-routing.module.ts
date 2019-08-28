import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { PagesComponent } from './pages.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UserComponent } from './user/user.component';
import { ProjectComponent } from './project/project.component';
import { ModulesComponent } from './modules/modules.component';
import { TaskAssignComponent } from './task-assign/task-assign.component';
import { WorkLogsComponent } from './work-logs/work-logs.component';
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
    },
    {
      path: 'project',
      component: ProjectComponent,
    },
    {
      path: 'modules',
      component: ModulesComponent,
    },
    {
      path: 'task-assign',
      component: TaskAssignComponent,
    },
    {
      path: 'work-logs',
      component: WorkLogsComponent,
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {
}
