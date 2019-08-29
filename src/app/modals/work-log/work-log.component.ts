import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from '../../Service/common/common.service';

@Component({
  selector: 'ngx-work-log',
  templateUrl: './work-log.component.html',
  styleUrls: ['./work-log.component.scss']
})
export class WorkLogComponent implements OnInit {

  stackId=null;
  workLog={
    task_id:null,
    stack_child_id:null,
    title:null,
    date:new Date(),
    review_user_id:null,
    total_minutes:null,
    remark:null,
    description:null,
  }
  day:number=0;
  hour:number=0;
  min:number=0;

  constructor(private activeModal: NgbActiveModal,
    public common:CommonService,
    public modalService:NgbModal) {
      this.common.handleModalSize('class', 'modal-lg', '1000');
     }

  ngOnInit() {
  }

  dismiss(){
    this.activeModal.close();
  }

  modalClose(){
    this.activeModal.close();
  }

  addWorkLog(){
    this.workLog.total_minutes=(this.day*1440)+(this.hour*60)+(this.min)
  }

}
