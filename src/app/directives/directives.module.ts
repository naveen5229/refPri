import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AutoSuggestionComponent } from './auto-suggestion/auto-suggestion.component';

@NgModule({
   imports: [CommonModule, FormsModule, ReactiveFormsModule,],
   exports: [
       CommonModule,
       FormsModule,
       AutoSuggestionComponent,
  
   ],
   declarations: [AutoSuggestionComponent
   ],
   schemas: [CUSTOM_ELEMENTS_SCHEMA],
   providers: [],
})
export class DirectiveModule { }