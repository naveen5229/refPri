import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeModule } from '../@theme/theme.module';
import { NbMenuModule, NbCardModule } from '@nebular/theme';
import { FormsModule } from '@angular/forms';
import { DirectiveModule } from '../directives/directives.module';

import { ProcessRoutingModule } from './process-routing.module';
import { ProcessListComponent } from './process-list/process-list.component';
import { MyProcessComponent } from './my-process/my-process.component';

@NgModule({
  declarations: [ProcessListComponent, MyProcessComponent],
  imports: [
    CommonModule,
    ProcessRoutingModule,
    ThemeModule,
    NbMenuModule,
    NbCardModule,
    FormsModule,
    DirectiveModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProcessModule { }
