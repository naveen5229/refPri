import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { UserService } from '../../Service/user/user.service';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'ngx-apply-leave',
  templateUrl: './apply-leave.component.html',
  styleUrls: ['./apply-leave.component.scss']
})
export class ApplyLeaveComponent implements OnInit {
  title = "Apply Leave";
  isDate = "";
  userList=[];
  btn = 'Apply';
  currentDate = this.common.getDate();
  nextDate = this.common.getDate(1);

  LeaveArray = {
    startDate: null,
    endDate: null,
    Subject: '',
    To: null,
    cc:[],
    reason:'',
  }

  constructor(public activeModal: NgbActiveModal,
    public api: ApiService,
    public common: CommonService,
    public modalService: NgbModal,
    public userService: UserService) { 

      this.userList = this.common.params.userList;
    }

  ngOnInit() {
  }

  closeModal(response) {
    this.activeModal.close({ response: response });
  }

  datereset(){
    this.LeaveArray.startDate = null;
    this.LeaveArray.endDate = null;
  }

  requestLeave(){
    let startDate =null;
    let endDate =null;
    if(!this.isDate){
        startDate = this.LeaveArray.startDate;
        endDate = this.LeaveArray.startDate;
    }else{
        startDate = this.LeaveArray.startDate;
        endDate = this.LeaveArray.endDate;
    }

    let Datato=null;
    if(this.LeaveArray.To){
    Datato = this.LeaveArray.To.id;
    console.log(this.LeaveArray.To,'objetc')
    }

    let CC=[];
    if(this.LeaveArray.cc){
    this.LeaveArray.cc.map(ele => {
      CC.push({user_id:ele.id});
    })
    }

    let params ={
      startDate:this.common.dateFormatter1(startDate),
      endDate:this.common.dateFormatter1(endDate),
      to:Datato,
      cc:JSON.stringify(CC),
      subject:this.LeaveArray.Subject,
      reason:this.LeaveArray.reason
    }

    this.common.loading++;
    this.api.post('AdminTask/addLeaveRequest',params).subscribe(res =>{
      console.log(res);
      this.common.loading--;
      if(res['code'] === 1){
        if (res['data'][0]['y_id'] > 0) {
          // this.resetTask();
          this.common.showToast(res['data'][0].y_msg);
          this.closeModal(true);
        } else {
          this.common.showError(res['data'][0].y_msg);
        }
      }else{
        this.common.showError(res['msg'])
      }
    },err=>{
      this.common.loading--;
      this.common.showError();
    })
    console.log(this.LeaveArray)
    console.log(params,'updated')
  }
}
