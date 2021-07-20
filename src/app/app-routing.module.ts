import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import {
  NbAuthComponent,
  NbLoginComponent,
  NbLogoutComponent,
  NbRegisterComponent,
  NbRequestPasswordComponent,
  NbResetPasswordComponent,
} from '@nebular/auth';
import { LoginComponent } from './auth/login/login.component';
import { AdminToolComponent } from './pages/admin-tool/admin-tool.component';
import { AuthGuard } from './guards/auth.guard';
import { ModalContainerComponent } from './modals/modal-container/modal-container.component';
import { UserService } from './Service/user/user.service';

const routes: Routes = [

  {
    path: 'pages',
    loadChildren: () => import('../app/pages/pages.module')
      .then(m => m.PagesModule),
  },
  {
    path: 'campaign',
    loadChildren: () => import('../app/campaign/campaign.module')
      .then(m => m.CampaignModule),
  },
  {
    path: 'auth',
    component: NbAuthComponent,
    children: [
      {
        path: '',
        component: LoginComponent,
      },
      {
        path: 'login',
        component: LoginComponent,
      },
      {
        path: 'login/:type',
        component: LoginComponent,
      },
      {
        path: 'register',
        component: NbRegisterComponent,
      },
      {
        path: 'logout',
        component: NbLogoutComponent,
      },
      {
        path: 'request-password',
        component: NbRequestPasswordComponent,
      },
      {
        path: 'reset-password',
        component: NbResetPasswordComponent,
      },
    ],
  },
  {
    path: 'process',
    loadChildren: () => import('../app/process/process.module')
      .then(m => m.ProcessModule),
  },{
    path: 'tickets',
    loadChildren: () => import('../app/ticket/ticket.module')
      .then(m => m.TicketModule),
  },
  { path: 'pages/leave-type-management/:id', component: ModalContainerComponent },


  { path: '', redirectTo: 'pages/task', pathMatch: 'full' },
  { path: '**', redirectTo: 'pages/task' },
];

const config: ExtraOptions = {
  useHash: true,
};

@NgModule({
  imports: [RouterModule.forRoot(routes, config)],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
