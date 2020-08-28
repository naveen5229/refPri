import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { UserService } from '../../Service/user/user.service';

@Component({
  selector: 'ngx-apply-leave',
  templateUrl: './apply-leave.component.html',
  styleUrls: ['./apply-leave.component.scss']
})
export class ApplyLeaveComponent implements OnInit {
  title = "Apply Leave";
  isDate = "";
  userList=[];
  btn = 'Save';
  currentDate = this.common.getDate();

  LeaveArray = {
    Date: {startDate: null, endDate: null },
    Subject: '',
    To: '',
    cc:'',
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


  requesLeave(){
    console.log(this.LeaveArray,'updated')
  }
}
