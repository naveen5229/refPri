import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { AddSegmentComponent } from '../add-segment/add-segment.component';

@Component({
  selector: 'ngx-task-assign-user',
  templateUrl: './task-assign-user.component.html',
  styleUrls: ['./task-assign-user.component.scss']
})
export class TaskAssignUserComponent implements OnInit {
  task = {
    mName: '',
    segmentId: null,
    title: '',
    description: '',
    assigner: null,
    assignerId: null,
    assigned: [],
    assignedId: [],
    segmentName: null,
    date: new Date(),
    endDate: null,
    id: null
  }
  btn = 'Add';
  moduleName = [];
  assignedLists = [];
  assigneeLists = [];
  projectName = '';
  module = [];
  segment = '';

  constructor(public activeModal: NgbActiveModal,
    public api: ApiService,
    public common: CommonService,
    public modalService: NgbModal) {
    console.log("task list", this.common.params)
    if (this.common.params != null) {
      this.task.mName = this.common.params.ModuleName;
      this.task.segmentId = this.common.params.segmentid;
      this.task.title = this.common.params.Title;
      this.task.segmentName = this.common.params.SegmentName;
      this.task.description = this.common.params.Description;
      this.task.assigner = this.common.params.AssignerName;
      this.task.assignerId = this.common.params._assignerempid;
      this.task.id = this.common.params.id;
      this.projectName = this.common.params.ProjectName;
      this.task.date = new Date(this.common.dateFormatter(this.common.params.assign_time))
      this.btn = "Update";
      this.getAssigneeList();
    }
    this.task.endDate = new Date(new Date().setDate(new Date(this.task.date).getDate() + 1));
    this.getModuleList();
    this.assignerList();
  }

  ngOnInit() {

  }

  closeModal(response) {
    this.activeModal.close({ response: response });
  }

  getModuleList() {
    this.common.loading++;
    this.api.get('Segment/getAllSegments')
      .subscribe(res => {
        this.common.loading--;
        this.moduleName = res['data'];
      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }


  changeSegment(event) {
    this.task.segmentId = event.id;
  }

  getAssigneeList() {
    const params = {
      taskId: this.task.id
    }
    this.api.post('Task/getAssigneeWrtTask', params)
      .subscribe(res => {
        console.log("api data", res);
        this.task.assigned = res['data'].map(user => {
          return { name: user.assigneename, id: user._empid }
        });
        this.task.assignedId = res['data'].map(user => { return { assignee_id: user._empid } });
        console.log(this.task.assigned)
      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }


  assignerList() {
    this.common.loading++;
    this.api.get('Suggestion/getEmployeeList')
      .subscribe(res => {
        this.common.loading--;
        this.assigneeLists = res['data'];
      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }

  changeAssignee(event) {
    if (event && event.length) {
      this.task.assignedId = event.map(user => { return { assignee_id: user.id } });
      console.log("AssignId", this.task.assignedId);
    }

  }

  addSegment() {
    const activeModal = this.modalService.open(AddSegmentComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        this.getModuleList();
        this.assignerList();
      }
    });
  }

  changeAssigner(event) {
    this.task.assigner = event.name;
    this.task.assignerId = event.id
  }

  saveUser() {
    let startDate = this.common.dateFormatter(this.task.date);
    let endDate = this.common.dateFormatter(this.task.endDate);
    if (this.task.segmentId == null) {
      return this.common.showError("Segment name is missing")
    }
    else if (this.task.assignerId == null) {
      return this.common.showError("Assigner name is missing")

    }
    else if (this.task.assignedId == []) {
      return this.common.showError("Assigned name is missing")

    }
    else if (this.task.title == '') {
      return this.common.showError("Title is missing")
    }
    else if (this.task.id != null) {
      return this.updateData();
    }
    const params = {
      segmentId: this.task.segmentId,
      title: this.task.title,
      description: this.task.description,
      assignerEmpId: this.task.assignerId,
      assignedEmpId: JSON.stringify(this.task.assignedId),
      assignTime: startDate,
      reviewTime: endDate,
      status: 0
    }
    console.log("params", params)
    this.common.loading++;
    this.api.post('Task/addTask', params).subscribe(res => {
      this.common.loading--;
      if (res['data'][0]['y_id'] > 0) {
        this.common.showToast(res['data'][0].y_msg)
        this.closeModal(true);
      }
      else {
        this.common.showError(res['data'][0].y_msg)
      }

    },
      err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
  }

  updateData() {
    let startDate = this.common.dateFormatter(this.task.date);
    let endDate = this.common.dateFormatter(this.task.endDate);
    const params = {
      segmentId: this.task.segmentId,
      title: this.task.title,
      description: this.task.description,
      assignerEmpId: this.task.assignerId,
      assignedEmpId: JSON.stringify(this.task.assignedId),
      assign_time: startDate,
      status: 0,
      taskId: this.task.id,
      reviewTime: endDate
    }

    console.log("params", params)
    this.common.loading++;
    this.api.post('Task/updateTask', params).subscribe(res => {
      this.common.loading--;
      if (res['data'][0]['y_id'] > 0) {
        this.common.showToast(res['data'][0].y_msg)
        this.closeModal(true);
      }
      else {
        this.common.showError(res['data'][0].y_msg)
      }
    },
      err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
  }
}
