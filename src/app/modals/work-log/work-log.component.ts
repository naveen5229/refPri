import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from '../../Service/common/common.service';
import { AddComponentComponent } from '../add-component/add-component.component';

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
    component:null,
  }
  day=null;
  hour=null;
  min=null;

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
    this.workLog.total_minutes=(this.hour*60)+(this.min);
  }

  addcomponent(){
    const activeModal = this.modalService.open(AddComponentComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static' });
  }

}
