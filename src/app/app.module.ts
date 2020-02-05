/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { APP_BASE_HREF } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CoreModule } from './@core/core.module';
import { ThemeModule } from './@theme/theme.module';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { NgxQRCodeModule } from 'ngx-qrcode2';

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
import { ListOfEmployeeComponent } from './modals/list-of-employee/list-of-employee.component';
import { AddSegmentComponent } from './modals/add-segment/add-segment.component';
import { WorklogsWithResUserComponent } from './modals/worklogs-with-res-user/worklogs-with-res-user.component';
import { StackReportComponent } from './modals/stack-report/stack-report.component';
import { AddNewCampaignComponent } from './modals/campaign-modals/add-new-campaign/add-new-campaign.component';
import { TargetCampaignComponent } from './modals/campaign-modals/target-campaign/target-campaign.component';
import { CampaignTargetActionComponent } from './modals/campaign-modals/campaign-target-action/campaign-target-action.component';
import { CsvUploadComponent } from './modals/csv-upload/csv-upload.component';
import { DataMappingComponent } from './modals/campaign-modals/data-mapping/data-mapping.component';
import { LocationTargetComponent } from './modals/campaign-modals/location-target/location-target.component';
import { ErrorReportComponent } from './modals/error-report/error-report.component';
import { AddContactComponent } from './modals/campaign-modals/add-contact/add-contact.component';
import { SaveadminComponent } from './modals/saveadmin/saveadmin.component';
import { PrintPreviewComponent } from './modals/print-preview/print-preview.component';
import { SendmessageComponent } from './modals/sendmessage/sendmessage.component';
import { GenericModelComponent } from './modals/generic-model/generic-model.component';
import { TaskStatusChangeComponent } from './modals/task-status-change/task-status-change.component';
import { TaskMessageComponent } from './modals/task-message/task-message.component';
import { TicketCallRatingComponent } from './modals/ticket-call-rating/ticket-call-rating.component';
import { TaskNewComponent } from './modals/task-new/task-new.component';
import { AddProjectComponent } from './modals/add-project/add-project.component';
const PAGE_COMPONENTS = [
  WorkLogComponent,
  TaskAssignUserComponent,
  AddComponentComponent,
  TaskStatusCheckComponent,
  ConfirmComponent,
  ListOfEmployeeComponent,
  AddSegmentComponent,
  WorklogsWithResUserComponent,
  StackReportComponent,
  AddNewCampaignComponent,
  TargetCampaignComponent,
  CampaignTargetActionComponent,
  CsvUploadComponent,
  DataMappingComponent,
  LocationTargetComponent,
  ErrorReportComponent,
  AddContactComponent,
  SaveadminComponent,
  PrintPreviewComponent,
  SendmessageComponent,
  GenericModelComponent,
  TaskStatusChangeComponent,
  TaskMessageComponent,
  TicketCallRatingComponent,
  TaskNewComponent,
  AddProjectComponent
];

@NgModule({
  declarations: [AppComponent,
    LoginComponent,
    ...PAGE_COMPONENTS,
    SendmessageComponent,
    GenericModelComponent,
    TicketCallRatingComponent,

  ],
  entryComponents: [...PAGE_COMPONENTS],
  imports: [
    NgxQRCodeModule,
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
  providers: [
    { provide: APP_BASE_HREF, useValue: '/' }
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
