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
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { DataTablesModule } from 'angular-datatables';

import {
  NbChatModule,
  NbDatepickerModule,
  NbDialogModule,
  NbMenuModule,
  NbSidebarModule,
  NbToastrModule,
  NbWindowModule,
  NbCardComponent,
  NbSpinnerModule,
  NbRouteTabsetModule
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
import { TaskScheduleNewComponent } from './modals/task-schedule-new/task-schedule-new.component';
import { ReminderComponent } from './modals/reminder/reminder.component';
import { AddInstallerComponent } from './modals/add-installer/add-installer.component';
import { FieldIssueComponent } from './modals/field-issue/field-issue.component';
import { LocationSelectionComponent } from './modals/location-selection/location-selection.component';
import { AssignInstallerToFieldrequestComponent } from './modals/assign-installer-to-fieldrequest/assign-installer-to-fieldrequest.component';
import { ApproveFieldSupportRequestComponent } from './modals/approve-field-support-request/approve-field-support-request.component';
import { AddActivityLogsComponent } from './modals/add-activity-logs/add-activity-logs.component';
import { ShiftLogAddComponent } from './modals/shift-log-add/shift-log-add.component';
import { ShiftLogsComponent } from './pages/shift-logs/shift-logs.component';
import { ShowInstallerComponent } from './modals/show-installer/show-installer.component';
import { AttendanceMonthlySummaryComponent } from './modals/attendance-monthly-summary/attendance-monthly-summary.component';
import { InfoMatrixComponent } from './modals/info-matrix/info-matrix.component';
import { SalaryDetailComponent } from './modals/salary-detail/salary-detail.component';
import { CampaignUserMappingComponent } from './modals/campaign-user-mapping/campaign-user-mapping.component';
import { CampaignMessageComponent } from './modals/campaign-modals/campaign-message/campaign-message.component';
import { TaskScheduleMasterComponent } from './modals/task-schedule-master/task-schedule-master.component';
import { MissedCallLogsComponent } from './modals/missed-call-logs/missed-call-logs.component';
import { AddProcessComponent } from './modals/process-modals/add-process/add-process.component';
import { AddStateComponent } from './modals/process-modals/add-state/add-state.component';
import { AddFieldComponent } from './modals/process-modals/add-field/add-field.component';
import { AxestrackMappingComponent } from './modals/axestrack-mapping/axestrack-mapping.component';
import { AddActionComponent } from './modals/process-modals/add-action/add-action.component';
import { AddvehicleComponent } from './modals/addvehicle/addvehicle.component';
import { ImportbulkvehicleComponent } from './modals/importbulkvehicle/importbulkvehicle.component';
import { AssignFieldsComponent } from './modals/process-modals/assign-fields/assign-fields.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormDataComponent } from './modals/process-modals/form-data/form-data.component';
import { UserMappingComponent } from './modals/process-modals/user-mapping/user-mapping.component';
import { AddTransactionComponent } from './modals/process-modals/add-transaction/add-transaction.component';
import { AddTransactionActionComponent } from './modals/process-modals/add-transaction-action/add-transaction-action.component';
import { ChatboxComponent } from './modals/process-modals/chatbox/chatbox.component';
import { AddpartnerComponent } from './modals/addpartner/addpartner.component';
import { AddpartneruserComponent } from './modals/addpartneruser/addpartneruser.component';
import { AddcompanyComponent } from './modals/addcompany/addcompany.component';
import { AddfouserComponent } from './modals/addfouser/addfouser.component';
import { AddTransactionStateComponent } from './modals/process-modals/add-transaction-state/add-transaction-state.component';
import { AddCategoryComponent } from './modals/process-modals/add-category/add-category.component';
import { AddTransactionContactComponent } from './modals/process-modals/add-transaction-contact/add-transaction-contact.component';
import { AddDashboardFieldComponent } from './modals/process-modals/add-dashboard-field/add-dashboard-field.component';
import { ViewDashboardComponent } from './modals/process-modals/view-dashboard/view-dashboard.component';
import { FormDataTableComponent } from './modals/process-modals/form-data-table/form-data-table.component';
import { AddFieldTableComponent } from './modals/process-modals/add-field-table/add-field-table.component';
import { ApplyLeaveComponent } from './modals/apply-leave/apply-leave.component';
import { SettingsComponent } from './modals/process-modals/settings/settings.component';
import { DocumentListingComponent } from './modals/document-listing/document-listing.component';
import { TicketChatboxComponent } from './modals/ticket-modals/ticket-chatbox/ticket-chatbox.component';
import { AddExtraTimeComponent } from './modals/ticket-modals/add-extra-time/add-extra-time.component';
import { RouteMapperComponent } from './modals/route-mapper/route-mapper.component';
import { TicketClosingFormComponent } from './modals/ticket-modals/ticket-form-field/ticket-closing-form.component';
import { ImageViewComponent } from './modals/image-view/image-view.component';
import { stateActionMapping } from './modals/state-action-mapping/state-action-mapping';
import { UserEsclationComponent } from './modals/process-modals/user-esclation/user-esclation.component';
import { AddProcessPropertyComponent } from './modals/process-modals/add-process-property/add-process-property.component';
import { CalulateTravelDistanceComponent } from './modals/calulate-travel-distance/calulate-travel-distance.component';
import { MobileNoComponent } from './modals/mobile-no/mobile-no.component';
import { LocationOnSiteImageComponent } from './modals/location-on-site-image/location-on-site-image.component';
import { AddGlobalFieldComponent } from './modals/process-modals/add-global-field/add-global-field.component';
import { EntityFormComponent } from './modals/entity-form/entity-form.component';
import { PdfVersioningComponent } from './modals/process-modals/pdf-versioning/pdf-versioning.component';
import { AddentityfieldsComponent } from './modals/addentityfields/addentityfields.component';
import { AddExpectedHourComponent } from './modals/add-expected-hour/add-expected-hour.component';
import { FunctionalReportingMappingComponent } from './modals/functional-reporting-mapping/functional-reporting-mapping.component';
import { AvailableTimeSlotComponent } from './modals/available-time-slot/available-time-slot.component';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
// import { SmartDataTableComponent } from './directives/smart-data-table/smart-data-table.component';

import { AngularFireMessagingModule } from '@angular/fire/messaging';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireModule } from '@angular/fire';
import { environment } from '../environments/environment';
import { AsyncPipe } from '../../node_modules/@angular/common';
import { MessagingService } from './Service/messaging.service';
import { LocationEntityComponent } from './modals/location-entity/location-entity.component';
import { UnmappedVisitComponent } from './modals/unmapped-visit/unmapped-visit.component';
import { TicketFieldsComponent } from './modals/process-modals/ticket-fields/ticket-fields.component';
import { ApplyWFHComponent } from './modals/apply-wfh/apply-wfh.component';
import { ModalComponent } from './modals/modal/modal.component';
import { ModalContainerComponent } from './modals/modal-container/modal-container.component';
import { GeneralModalComponent } from './modals/general-modal/general-modal.component';
import { AddEmailTemplateComponent } from './modals/add-email-template/add-email-template.component';
import { CKEditorModule } from 'ckeditor4-angular';
import { NgxGenericTemplateComponent } from './modals/ngx-generic-template/ngx-generic-template.component';


const PAGE_COMPONENTS = [
  TicketFieldsComponent,

  WorkLogComponent,
  TicketFieldsComponent,
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
  AddProjectComponent,
  TaskScheduleNewComponent,
  ReminderComponent,
  AddInstallerComponent,
  FieldIssueComponent,
  LocationSelectionComponent,
  AssignInstallerToFieldrequestComponent,
  ApproveFieldSupportRequestComponent,
  AddActivityLogsComponent,
  ShiftLogAddComponent,
  ShowInstallerComponent,
  AttendanceMonthlySummaryComponent,
  InfoMatrixComponent,
  SalaryDetailComponent,
  CampaignUserMappingComponent,
  CampaignMessageComponent,
  TaskScheduleMasterComponent,
  MissedCallLogsComponent,
  AddProcessComponent,
  AddStateComponent,
  AddFieldComponent,
  AxestrackMappingComponent,
  AddActionComponent,
  AddvehicleComponent,
  ImportbulkvehicleComponent,
  AssignFieldsComponent,
  FormDataComponent,
  UserMappingComponent,
  AddActionComponent,
  AddTransactionComponent,
  AddTransactionActionComponent,
  ChatboxComponent,
  AddpartnerComponent,
  AddpartneruserComponent,
  AddcompanyComponent,
  AddfouserComponent,
  AddTransactionStateComponent,
  AddCategoryComponent,
  AddTransactionContactComponent,
  AddDashboardFieldComponent,
  ViewDashboardComponent,
  FormDataTableComponent,
  AddFieldTableComponent,
  SettingsComponent,
  ApplyLeaveComponent,
  DocumentListingComponent,
  TicketChatboxComponent,
  AddExtraTimeComponent,
  RouteMapperComponent,
  TicketClosingFormComponent,
  ImageViewComponent,
  stateActionMapping,
  UserEsclationComponent,
  AddProcessPropertyComponent,
  CalulateTravelDistanceComponent,
  MobileNoComponent,
  LocationOnSiteImageComponent,
  AddGlobalFieldComponent,
  EntityFormComponent,
  PdfVersioningComponent,
  AddentityfieldsComponent,
  AddExpectedHourComponent,
  FunctionalReportingMappingComponent,
  AvailableTimeSlotComponent,
  LocationEntityComponent,
  UnmappedVisitComponent,
  ModalComponent,
  ModalContainerComponent,
  ApplyWFHComponent,
  GeneralModalComponent,
  AddEmailTemplateComponent,
  NgxGenericTemplateComponent
 ];

@NgModule({
  declarations: [AppComponent,
    LoginComponent,
    ...PAGE_COMPONENTS,
    InfoMatrixComponent,
    AxestrackMappingComponent,
    AddvehicleComponent,
    ImportbulkvehicleComponent,
    AddpartnerComponent,
    AddpartneruserComponent,
    AddcompanyComponent,
    AddfouserComponent,
    ChatboxComponent,
    stateActionMapping,
    UserEsclationComponent,
    AddProcessPropertyComponent,
    MobileNoComponent,
    TicketFieldsComponent,
    ApplyWFHComponent,
    TicketFieldsComponent,
    AddEmailTemplateComponent,
     // SmartDataTableComponent,

    // SendmessageComponent,
    // GenericModelComponent,
    // TicketCallRatingComponent,
    // AddActivityLogsComponent,
  ],
  entryComponents: [...PAGE_COMPONENTS],
  imports: [
    NgMultiSelectDropDownModule.forRoot(),
    NgxQRCodeModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    NbSpinnerModule,
    DataTablesModule,
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
    DragDropModule,
    NgxSliderModule,
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    AngularFireMessagingModule,
    AngularFireModule.initializeApp(environment.firebase),
    ReactiveFormsModule,
    CKEditorModule
  ],
  providers: [MessagingService,AsyncPipe,
    { provide: APP_BASE_HREF, useValue: '/' }
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
