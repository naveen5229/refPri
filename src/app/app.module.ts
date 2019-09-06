/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CoreModule } from './@core/core.module';
import { ThemeModule } from './@theme/theme.module';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';

import {
  NbChatModule,
  NbDatepickerModule,
  NbDialogModule,
  NbMenuModule,
  NbSidebarModule,
  NbToastrModule,
  NbWindowModule,
  NbCardComponent,
  NbSpinnerModule
} from '@nebular/theme';
import { LoginComponent } from './auth/login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AutoSuggestionComponent } from './directives/auto-suggestion/auto-suggestion.component';
import { DirectiveModule } from './directives/directives.module';
import { WorkLogComponent } from './modals/work-log/work-log.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TaskAssignUserComponent } from './modals/task-assign-user/task-assign-user.component';
import { AddComponentComponent } from './modals/add-component/add-component.component';
import { TaskStatusCheckComponent } from './modals/task-status-check/task-status-check.component';
import { ConfirmComponent } from './modals/confirm/confirm.component';

@NgModule({
  declarations: [AppComponent,
    LoginComponent,
    WorkLogComponent,
    TaskAssignUserComponent,
    AddComponentComponent,
    TaskStatusCheckComponent,
    ConfirmComponent,
  ],
  entryComponents: [
    WorkLogComponent,
    TaskAssignUserComponent,
    AddComponentComponent,
    TaskStatusCheckComponent,
    ConfirmComponent,


  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    NbSpinnerModule,
    ReactiveFormsModule,
    DirectiveModule,
    ThemeModule.forRoot(),
    NbSidebarModule.forRoot(),
    NbMenuModule.forRoot(),
    NgbModule,
    NbDatepickerModule.forRoot(),
    NbDialogModule.forRoot(),
    NbWindowModule.forRoot(),
    NbToastrModule.forRoot(),
    NbChatModule.forRoot({
      messageGoogleMapKey: 'AIzaSyA_wNuCzia92MAmdLRzmqitRGvCF7wCZPY',
    }),
    CoreModule.forRoot(),
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class AppModule {
}
