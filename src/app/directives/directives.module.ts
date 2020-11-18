import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AutoSuggestionComponent } from './auto-suggestion/auto-suggestion.component';
import { DateTimePickerComponent } from './date-time-picker/date-time-picker.component';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { MonthPickerComponent } from './month-picker/month-picker.component';
import { SmartTableComponent } from './smart-table/smart-table.component';
import { ImageViewerComponent } from './image-viewer/image-viewer.component';
import { DndDirective } from './dndDirective/dnd.directive';

@NgModule({
    imports: [CommonModule, FormsModule, ReactiveFormsModule, DateInputsModule],
    exports: [
        CommonModule,
        FormsModule,
        AutoSuggestionComponent,
        DateTimePickerComponent,
        MonthPickerComponent,
        SmartTableComponent,
        ImageViewerComponent,
        DndDirective
    ],
    declarations: [AutoSuggestionComponent, DateTimePickerComponent, MonthPickerComponent, SmartTableComponent, ImageViewerComponent, DndDirective,],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    providers: [],
})
export class DirectiveModule { }