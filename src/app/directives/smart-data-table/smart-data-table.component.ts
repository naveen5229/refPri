import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { Component, Input, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';

@Component({
  selector: 'ngx-smart-data-table',
  templateUrl: './smart-data-table.component.html',
  styleUrls: ['./smart-data-table.component.scss']
})
export class SmartDataTableComponent implements OnInit {
@ViewChild(DataTableDirective, { static: false })
@Input() data:any;
@Input() SearchFilter:any;
@Input() dtOptions:any;
@Input() dtTrigger:any;
@Input() filterColumn:any;
@Input() renderFunction:any;
@Output() getData = new EventEmitter();
@Output() filter = new EventEmitter();
dataheading:any = [];
datavalues:any[] = [];
purifieddata:any[] = [];
  constructor() { }


renderTable(){
this.dataheading = [];
this.datavalues = [];
console.log('this.data: ', this.data);

console.log('data Before filter',this.data);

this.data.map((item:any)=>{
const deleteKeysBy = (obj:any, predicate:any) =>
  Object.keys(obj)
    .forEach( (key) => {
      if(key.startsWith('_')){
       delete(obj[key]);
      }
     console.log('key',key);
    });

deleteKeysBy(item, val => !val);
})

console.log('data after filter',this.data);

if(this.data.length){
this.dataheading  = Object.keys(this.data[0]);
this.data.map((item:any)=>{
this.datavalues.push(Object.values(item));
})
}
}


Filter(){
this.filter.emit();
}


 ngOnInit() {
    this.renderTable();
  }

}
