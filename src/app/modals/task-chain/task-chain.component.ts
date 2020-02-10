import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';

@Component({
  selector: 'ngx-task-chain',
  templateUrl: './task-chain.component.html',
  styleUrls: ['./task-chain.component.scss']
})
export class TaskChainComponent implements OnInit {
  title = "Ticket Mapping";
  taskId = null;
  taskMapping = [];
  constructor(public activeModal: NgbActiveModal,
    public api: ApiService,
    public common: CommonService,
    public modalService: NgbModal) {
    console.log("task list", this.common.params);
    if (this.common.params != null) {
      this.title = this.common.params.title;
      this.taskId = this.common.params.taskId;
    }
  }

  ngOnInit() {
  }

  closeModal(response) {
    this.activeModal.close({
      response: response
    });
  }

  saveReminder(data) {
    let params = {
      task_id: this.taskId,
    };
    console.log('Params: ', params);
    this.common.loading++;
    this.api.post('AdminTask/getTaskMapping.json', params)
      .subscribe(res => {
        console.log(res);
        this.common.loading--;
        if (res['code'] > 0) {
          this.taskMapping = res['data'] || [];
        }
        this.common.showToast(res['msg']);
      }, err => {
        console.error(err);
        this.common.showError();
        this.common.loading--;
      });
  }

}
