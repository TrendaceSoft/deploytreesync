import { TreeGridAllModule } from '@syncfusion/ej2-angular-treegrid';
import { CheckBoxModule, ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { ContextMenuModule } from '@syncfusion/ej2-angular-navigations';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { DropDownButtonModule } from '@syncfusion/ej2-angular-splitbuttons';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { ReactiveFormsModule } from '@angular/forms';



import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

import { HttpClientModule } from '@angular/common/http';


@NgModule(
  {
    declarations: [AppComponent],
    imports: [
      CommonModule,
      TreeGridAllModule,
      BrowserModule,
      CheckBoxModule,
      ButtonModule,
      ContextMenuModule,
      DialogModule,
      DropDownButtonModule,
      HttpClientModule,
      DropDownListModule,
      ReactiveFormsModule,
      DatePickerModule,
     
    ],
    providers: [],
    bootstrap: [AppComponent]
  })
export class AppModule { }
