import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { MapService } from '../../Service/map/map.service';

@Component({
  selector: 'ngx-leave-type-management',
  templateUrl: './leave-type-management.component.html',
  styleUrls: ['./leave-type-management.component.scss']
})
export class LeaveTypeManagementComponent implements OnInit {
  startDate = new Date();
  endDate = new Date();
  expensdetail:any;
  lCount:number = null;
  id:any = null;
  leaveType: any = '';
  @ViewChild(DataTableDirective, { static: false })
   dtElement: any;
   dtTrigger: any = new Subject();
   leaveTypeList:any[] = [];
   dtOptions: any = {
     pagingType: 'full_numbers',
     pageLength: 5,
     lengthMenu: [5, 10, 25],
     processing: true,
   }
   title = "Add Leave Type";
   btn = "Save";

 ngAfterViewInit() {
     this.dtTrigger.next();
     this.getLeaveTypeList();

   }

  ngOnDestroy(): void {
     this.dtTrigger.unsubscribe();
   }

    renderTable() {
     this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
           dtInstance.destroy();
           this.dtTrigger.next();

     });

   }

   constructor(public common:CommonService, public mapService:MapService,
     public api: ApiService,
     public modalService: NgbModal) {

   }

 filterColumn(){
 this.dtTrigger.next();
 this.renderTable();
 }

 getLeaveTypeList(){
   this.leaveTypeList = [];

   this.common.loading++;
   this.api.get('LeavePolicy/getLeaveTypeList.json')
     .subscribe(res => {
       this.common.loading--;
       if (res['code'] !=1) { this.common.showError(res['msg']); return false; };
       this.leaveTypeList = res['data'] || [];
       this.renderTable();
       console.log(this.leaveTypeList);
     }, err => {
       this.common.loading--;
       this.common.showError();
       console.log(err);
     });
 }
emT:string[] = [];

 editLeaveType(item?:any) {
  this.resetType();
  console.log('item',item);
    this.id = item.id;
    this.lCount = item.leave_days;
    this.leaveType = item.leave_type;
    this.title = "Update Leave Type";
    this.btn = 'Update';
}

 SubmitLeaveType(){
   let empT: any[] = [];
   let params: any = {
    leaveDays: this.lCount,
    leaveType: this.leaveType,
    id: this.id
   };
   console.log(params);
   this.common.loading++;
   this.api.post('LeavePolicy/SubmitLeaveType.json', params).subscribe(res => {
     this.common.loading--;
     if (res['code'] == 1) {
       this.common.showToast(res['msg']);
       this.getLeaveTypeList();
       this.resetType();
     } else {
       this.common.showError(res['msg']);
     }
   }, err => {
     this.common.loading--;
     this.common.showError();
     console.log("error:", err);
   }

   );

 }

  viewDetails(row?: any) {
    this.common.params = { details: [row], title: 'info' }
   console.log('row',row);
 //   const activeModal = this.modalService.open(ViewDetailsComponent, { size: 'lg' });

  }

 selectedUser(event:any){

 }

 getImageUrl(imageId) {
  return `https://picsum.photos/100?image=${imageId}`;
}

 resetType(){
   this.leaveType = '';
   this.lCount = null;
   this.id = null;
   this.btn = 'Save';
   this.title = "Add Leave Type";
 }

 deleteLeaveType(item?: any) {
   this.common.loading++;
   let params: any = {
     id: item.id,
   }
   this.api.post('LeavePolicy/deleteLeaveType.json', params)
     .subscribe((res: any) => {
      if (res['code'] == 1) {
        this.common.showToast(res['msg']);
        this.getLeaveTypeList();
        this.resetType();
      } else {
        this.common.showError(res['msg']);
      }
     }, (err: any) => {
       console.error('Error: ', err);
       this.common.loading--;
     });
 }

   ngOnInit() {
   this.getLeaveTypeList();
   }

 }

