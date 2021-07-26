import { TableService } from './../../Service/Table/table.service';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { Component, Input, OnInit, Output, EventEmitter, ViewChild, OnChanges, SimpleChange, SimpleChanges } from '@angular/core';

@Component({
  selector: 'ngx-smart-data-table',
  templateUrl: './smart-data-table.component.html',
  styleUrls: ['./smart-data-table.component.scss']
})
export class SmartDataTableComponent implements OnInit,OnChanges {

   @ViewChild(DataTableDirective, {static: false})
  dtElement: any;
  // dtOptions: DataTables.Settings = {};
  dtOptions =  this.tableservice.options(10,7,'USER EXPENSES');
  dttrigger: Subject<any> = new Subject<any>();


@Input() data:any[];
@Input() SearchFilter:any;
// @Input() dtOptions:any;
// @Input() dtTrigger:any;
@Input() filterColumn:any;
@Input() renderFunction:any;
@Input() setting:any;

@Output() getData = new EventEmitter();
@Output() filter = new EventEmitter();
@Output() actionBind = new EventEmitter();
dataheading:any = [];
datavalues:any[] = [];
purifieddata:any[] = [];

constructor(public tableservice:TableService) { }


renderTable(){
this.dataheading = [];
this.datavalues = [];
this.data.map((item:any)=>{
const deleteKeysBy = (obj:any, predicate:any) =>
  Object.keys(obj)
    .forEach( (key) => {
      if(key.startsWith('_')){
       delete(obj[key]);
      }
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


ngOnInit(): void {
    this.renderTable();
  }

ngOnChanges(change:SimpleChanges): void{
    this.renderTable();
  }

ngAfterViewInit():void{
  this.renderTable();

  }

}
