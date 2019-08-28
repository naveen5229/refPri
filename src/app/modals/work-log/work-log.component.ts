import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from '../../Service/common/common.service';

@Component({
  selector: 'ngx-work-log',
  templateUrl: './work-log.component.html',
  styleUrls: ['./work-log.component.scss']
})
export class WorkLogComponent implements OnInit {

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

}
