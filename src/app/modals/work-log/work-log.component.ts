import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from '../../Service/common/common.service';
import { AddComponentComponent } from '../add-component/add-component.component';
import { ApiService } from '../../Service/Api/api.service';

@Component({
  selector: 'ngx-work-log',
  templateUrl: './work-log.component.html',
  styleUrls: ['./work-log.component.scss']
})
export class WorkLogComponent implements OnInit {

  tasks = [];
  components = [];
  stacks = [];
  users = [];
  workLog = {
    taskId: null,
    stackId: null,
    title: '',
    date: new Date(),
    reviewUserId: null,
    remark: '',
    description: '',
    componentId: null,
    hrs: null,
    minutes: null
  };

  constructor(private activeModal: NgbActiveModal,
    public api: ApiService,
    public common: CommonService,
    public modalService: NgbModal) {
    this.common.handleModalSize('class', 'modal-lg', '1000');
    this.getTasks();
    this.getComponents();
    this.getStacks();
    this.getUsers();
  }

  ngOnInit() {
  }

  addcomponent() {
    const activeModal = this.modalService.open(AddComponentComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        this.getComponents();
      }
    });
  }

  getUsers() {
    this.common.loading++;
    this.api.get('Suggestion/getEmployeeList')
      .subscribe(res => {
        this.common.loading--;
        console.log("res", res['data']);
        this.users = res['data'];
      }, err => {
        this.common.loading--;
        console.log(err);
        this.common.showError();
      });
  }

  getStacks() {
    this.common.loading++;
    this.api.get('Projects/getAllStackChilds')
      .subscribe(res => {
        this.common.loading--;
        this.stacks = res['data'];
      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }

  getTasks() {
    this.common.loading++;
    this.api.get("Task/getTaskWrtEmp")
      .subscribe(res => {
        this.common.loading--;
        console.log("res", res['data'])
        this.tasks = res['data'] || [];
      },
        err => {
          this.common.loading--;
          this.common.showError();
          console.log('Error: ', err);
        });
  }

  getComponents() {
    this.common.loading++;
    this.api.get("Components/getAllComponents")
      .subscribe(res => {
        this.common.loading--;
        console.log("res", res['data'])
        this.components = res['data'] || [];
      },
        err => {
          this.common.loading--;
          this.common.showError();
          console.log('Error: ', err);
        });
  }

  addWorkLog() {
    let params = {
      task_id: this.workLog.taskId,
      stack_child_id: this.workLog.stackId,
      title: this.workLog.title,
      date: this.common.dateFormatter(this.workLog.date),
      review_user_id: this.workLog.reviewUserId,
      total_minutes: (this.workLog.hrs * 60) + (this.workLog.minutes),
      remark: this.workLog.remark,
      description: this.workLog.description,
      componentId: this.workLog.componentId,
    }

    console.log("workLog", this.workLog);
    this.common.loading++;
    this.api.post('WorkLogs/addWorkLogs', params)
      .subscribe(res => {
        this.common.loading--;
        console.log("res", res['data']);
        this.activeModal.close({ response: res['data'] });
      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }

  modalClose() {
    this.activeModal.close();
  }

}
