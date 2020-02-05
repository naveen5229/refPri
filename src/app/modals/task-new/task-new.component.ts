import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { NormalTask } from '../../classes/normal-task';

@Component({
  selector: 'ngx-task-new',
  templateUrl: './task-new.component.html',
  styleUrls: ['./task-new.component.scss']
})
export class TaskNewComponent implements OnInit {
  normalTask = new NormalTask('', new Date(), '', false, null, null);
  btn = 'Save';
  userId = null;
  isProject = "";

  constructor(public activeModal: NgbActiveModal,
    public api: ApiService,
    public common: CommonService,
    public modalService: NgbModal) {
    console.log("task list", this.common.params)
  }

  ngOnInit() {

  }

  closeModal(response) {
    this.activeModal.close({ response: response });
  }

  selectedNormalUser(event) {
    // console.log(event);
    this.userId = event.id;
    this.normalTask.userName = event.name;
  }

  selectedProject(event) {
    console.log("selectedProject:", event);
    this.normalTask.projectId = event.id;
  }

  changeCCUsers(event) {
    console.log("changeCCUsers:", event);
    if (event && event.length) {
      this.normalTask.ccUsers = event.map(user => { return { user_id: user.id } });
      console.log("ccUsers", this.normalTask.ccUsers);
    }
  }

  saveUser() {
    if (this.normalTask.userName == '') {
      return this.common.showError("User Name is missing")
    }
    else if (this.normalTask.task == '') {
      return this.common.showError("Task  is missing")
    }
    else {
      const params = {
        userId: this.userId,
        date: this.common.dateFormatter(this.normalTask.date),
        task: this.normalTask.task,
        isUrgent: this.normalTask.isUrgent,
        projectId: this.normalTask.projectId,
        ccUsers: JSON.stringify(this.normalTask.ccUsers),
      }
      this.common.loading++;
      this.api.post('AdminTask/createNormalTask', params).subscribe(res => {
        console.log(res);
        this.common.loading--;
        this.normalTask = new NormalTask('', new Date(), '', false, null, null)
        this.common.showToast("Task Created Successfully..!")
        this.closeModal(true);
      },
        err => {
          this.common.loading--;
          this.common.showError();
          console.log('Error: ', err);
        });
    }

  }
}
