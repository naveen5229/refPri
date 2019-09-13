import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from '../../Service/common/common.service';

@Component({
  selector: 'ngx-task-status-check',
  templateUrl: './task-status-check.component.html',
  styleUrls: ['./task-status-check.component.scss']
})
export class TaskStatusCheckComponent implements OnInit {
  taskStatus=0;
  constructor(public activeModal:NgbActiveModal,
    public common:CommonService) {
  
   }

  ngOnInit() {
  }

  closeModal(response) {
    this.activeModal.close({response:response});
  }
}
