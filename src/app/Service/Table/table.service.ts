import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TableService {

  constructor() { }


options(length:number,exportnumber:number,title?:any,dom?:any){
let tableTitle = title ? title.toUpperCase(): 'Inplant Automation';
let arr:number[] = [];
let i:number = 0;
for(i = 0; i < exportnumber;i++ ){   arr.push(i); }
let exportsOptions = {
    pagingType: 'full_numbers',
    pageLength:length,
    lengthMenu: [5,10,25,50],
    processing: true,
        dom: dom || 'Blfrtip',
              buttons: [
            {
                extend: 'copy',
                text:'<i class="fa fa-clipboard" aria-hidden="true"></i>',
                titleAttr: 'Copy',
                title: tableTitle ,
                exportOptions: {
                columns: arr,
                 }
            },
            {
                extend: 'csv',
                text:'<i class="fas fa-file-csv"></i>',
                titleAttr: 'CSV',
                title: tableTitle ,
                exportOptions: {
                columns: arr,
                }
            },
            {
                extend: 'excel',
                text:'<i class="fa fa-file-excel" aria-hidden="true"></i>',
                titleAttr: 'Excel',
                title: tableTitle ,
                exportOptions: {
                columns: arr,
                }
            },
            {
                extend: 'print',
                text:'<i class="fa fa-print" aria-hidden="true"></i>',
                titleAttr: 'Print',
                title: tableTitle,
                exportOptions: {
                columns: arr,
                }
            },
         ],
}
return exportsOptions;
}


tmgoptions(length:number,exportnumber:number){
let arr:number[] = [];
let i:number = 0;
for(i = 0; i < exportnumber;i++ ){   arr.push(i); }
let exportsOptions = {
    pagingType: 'full_numbers',
    pageLength:length,
    lengthMenu: [5,10,25,50],
    processing: true,
        // dom: 'Bfrt',
          dom: '',
        buttons: [
            {
                extend: 'copy',
                text:'<i class="fa fa-clipboard" aria-hidden="true"></i>',
                exportOptions: {
                columns: arr,
              }
            },
            {
                extend: 'csv',
                text:'<i class="fas fa-file-csv"></i>',
                exportOptions: {
                columns: arr
                }
            },
            {
                extend: 'excel',
                text:'<i class="fa fa-file-excel" aria-hidden="true"></i>',
                exportOptions: {
                columns: arr
                }
            },
            {
                extend: 'print',
                text:'<i class="fa fa-print" aria-hidden="true"></i>',
                exportOptions: {
                columns: arr
                }
            },
         ],
}
return exportsOptions;
}

}
