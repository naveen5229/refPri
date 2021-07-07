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
  leaveName:any;
  lCount:number = null;
  id:any = null;
  employeeType = [];
  leaveType: any = 'Fixed';
  lNum : any = 'Monthly';
  EmpTypeList = [
    {id: 1, empType: 'General'},
    {id: 2, empType: 'Contract'},
    {id: 3, empType: 'Probation'},
    {id: 4, empType: 'Trainee'},
    {id: 5, empType: 'Intern'},
    {id: 6, empType: 'Other'},
  ];
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
   title = "Add Leave Name";
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
   this.api.get('Leave/getLeaveTypeList.json')
     .subscribe(res => {
       this.common.loading--;
       if (res['code'] !=1) { this.common.showError(res['msg']); return false; };
       this.leaveTypeList = res['data'] || [];
    //   this.renderTable();
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
    this.leaveName = item.leave_name;
    this.lCount = item.leave_days;
    let element = item.employee_type;
    let ccUsers = [];
    let ccUser = this.EmpTypeList.find(x => x.empType == element);
              if (ccUser) {
                ccUsers.push(ccUser);
              }
              console.log(ccUsers);
    this.employeeType = ccUsers;
    this.leaveType = item.leave_type;
    this.lNum = item.leave_duration;
    this.title = "Update Leave Name";
    this.btn = 'Update';
}
  
 SubmitLeaveType(){
   let empT: any[] = [];
   this.employeeType.map((item:any) => {
     empT.push(item.empType);
   });
   let params: any = {
    leaveName: this.leaveName,
    leaveDays: this.lCount,
    employeeType: empT,
    leaveType: this.leaveType,
    leaveDuration: this.lNum,
    id: this.id
   };
   console.log(params);
   this.common.loading++;
   this.api.post('Leave/SubmitLeaveType.json', params).subscribe(res => {
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
 
 resetType(){
   this.employeeType = [];
   this.leaveType = 'Fixed';
   this.lNum = 'Monthly';
   this.leaveName = '';
   this.lCount = null;
   this.id = null;
   this.btn = 'Save';
   this.title = "Add Leave Name";
 }
 
 deleteLeaveType(item?: any) {
   this.common.loading++;
   let params: any = {
     id: item.id,
   }
   this.api.post('Leave/deleteLeaveType.json', params)
     .subscribe((res: any) => {
       this.common.loading--;
       this.getLeaveTypeList();
       this.resetType();
       console.log('id',this.id);
     }, (err: any) => {
       console.error('Error: ', err);
       this.common.loading--;
     });
 }
 
   ngOnInit() {
   this.getLeaveTypeList();
   }
 
 }
 
