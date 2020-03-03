import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';

@Component({
  selector: 'ngx-task-todo',
  templateUrl: './task-todo.component.html',
  styleUrls: ['./task-todo.component.scss']
})
export class TaskTodoComponent implements OnInit {
  minDateShow = this.common.getDate();
  taskTodoForm = {
    taskTodoId: null,
    desc: "",
    date: this.common.getDate(),
    isUrgent: false
  };
  btn = 'Save';;
  userList = [];
  taskTodoList = [];
  tableTaskTodoList = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  constructor(public activeModal: NgbActiveModal,
    public api: ApiService,
    public common: CommonService,
    public modalService: NgbModal) {
    console.log("task list", this.common.params);
    if (this.common.params != null) {

    }
  }

  ngOnInit() {
  }

  closeModal(response) {
    this.activeModal.close({ response: response });
  }

  saveTaskTodo() {
    if (this.taskTodoForm.desc == '') {
      return this.common.showError("Description is missing")
    }
    else {
      const params = {
        date: (this.taskTodoForm.date) ? this.common.dateFormatter(this.taskTodoForm.date) : null,
        desc: this.taskTodoForm.desc,
        isUrgent: this.taskTodoForm.isUrgent,
        taskTodoId: this.taskTodoForm.taskTodoId
      }
      console.log("todo params:", params);
      this.common.loading++;
      this.api.post('AdminTask/addTodoTask', params).subscribe(res => {
        console.log(res);
        this.common.loading--;
        if (res['code'] > 0) {
          this.resetTask();
          if (res['data'][0]['y_id'] > 0) {
            this.common.showToast(res['msg']);
            this.closeModal(true);
          } else {
            this.common.showError(res['msg']);
          }
        } else {
          this.common.showError(res['msg']);
        }
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
    }

  }

  resetTask() {
    this.taskTodoForm = {
      taskTodoId: null,
      desc: "",
      date: this.common.getDate(),
      isUrgent: false
    };
  }

}
