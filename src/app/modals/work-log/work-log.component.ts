import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from '../../Service/common/common.service';
import { AddComponentComponent } from '../add-component/add-component.component';
import { ApiService } from '../../Service/Api/api.service';
import { TaskAssignUserComponent } from '../task-assign-user/task-assign-user.component';

@Component({
  selector: 'ngx-work-log',
  templateUrl: './work-log.component.html',
  styleUrls: ['./work-log.component.scss']
})
export class WorkLogComponent implements OnInit {

  tasks = [];
  taskname = null;
  components = [];
  componentName=null;
  stacks = [];
  users = [];
  isFormSubmit = false;
  rowId=null;
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
    minutes: null,
  };
  stackName='';
  stackChildName='';
  reviewedBy=null;

  constructor(private activeModal: NgbActiveModal,
    public api: ApiService,
    public common: CommonService,
    public modalService: NgbModal) {
    this.common.handleModalSize('class', 'modal-lg', '1000');
    this.getTasks();
    this.getComponents();
    this.getStacks();
    this.getUsers();

    if (this.common.params.workLogs) {
      this.workLog = {
        taskId: this.common.params.workLogs.task_id,
        stackId: this.common.params.workLogs.stack_child_id,
        title: this.common.params.workLogs.Title,
        date: new Date(this.common.params.workLogs.date),
        reviewUserId: this.common.params.workLogs.review_user_id,
        remark: this.common.params.workLogs.add_remark,
        description: this.common.params.workLogs.Description,
        componentId: this.common.params.workLogs.component_id,
        hrs: this.common.params.workLogs.total_minutes.split(":")[0],
        minutes: this.common.params.workLogs.total_minutes.split(":")[1],
      };
      this.stackName=this.common.params.workLogs.stack_parent_name;
      this.stackChildName=this.common.params.workLogs.stack_child_name;
      this.rowId=this.common.params.workLogs.id,
      this.taskname = this.common.params.workLogs.TaskName;
      this.reviewedBy=this.common.params.workLogs.ReviewerName;
      this.componentName=this.common.params.workLogs.component_name;
      console.log("TaskName",this.taskname);
    }
    console.log("worklogs", this.common.params);
  }

  ngOnInit() {
  }

  addcomponent() {
    const activeModal = this.modalService.open(AddComponentComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data) {
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
    console.log("min+>",(parseInt(this.workLog.hrs) * 60) + parseInt(this.workLog.minutes))
    let params = {
      task_id: this.workLog.taskId,
      stack_child_id: this.workLog.stackId,
      title: this.workLog.title,
      date: this.common.dateFormatter(this.workLog.date),
      review_user_id: this.workLog.reviewUserId,
      total_minutes: (parseInt(this.workLog.hrs) * 60) + parseInt(this.workLog.minutes),
      remark: this.workLog.remark,
      description: this.workLog.description,
      componentId: this.workLog.componentId,
      workLogId:this.rowId
    }

    console.log("workLog", params);
    this.common.loading++;
    this.api.post('WorkLogs/addAndUpdateWorkLogs', params)
      .subscribe(res => {
        this.common.loading--;
        console.log("res", res['data']);
        this.activeModal.close({ response: res['data'] });
      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }

  assignTask() {
    this.common.params = null;
    const activeModal = this.modalService.open(TaskAssignUserComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        this.getTasks();
      }
    });
  }

  modalClose() {
    this.activeModal.close();
  }

}
