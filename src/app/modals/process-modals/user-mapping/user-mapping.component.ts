import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../../Service/Api/api.service';
import { UserService } from '../../../Service/user/user.service';
import { CommonService } from '../../../Service/common/common.service';

@Component({
  selector: 'ngx-user-mapping',
  templateUrl: './user-mapping.component.html',
  styleUrls: ['./user-mapping.component.scss']
})
export class UserMappingComponent implements OnInit {
  userList = [];
  userForm = {
    processId: null,
    users: []
  };

  constructor(public activeModal: NgbActiveModal,
    public api: ApiService,
    public common: CommonService,
    public modalService: NgbModal,
    public userService: UserService) {
    if (this.common.params && this.common.params.process_id) {
      this.userForm.processId = this.common.params.process_id;
      this.userList = this.common.params.adminList;
    }
    // this.getAllAdmin();
    this.getUsers();

  }

  ngOnInit() { }

  getAllAdmin() {
    this.api.get("Admin/getAllAdmin.json").subscribe(res => {
      console.log("data", res['data'])
      if (res['code'] > 0) {
        this.userList = res['data'] || [];
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  closeModal() {
    this.activeModal.close();
  }

  changeUsers(event) {
    console.log(event);
    if (event && event.length) {
      this.userForm.users = event.map(user => { return { id: user.id, name: user.name, is_admin: false } });
      console.log(this.userForm.users);
    } else {
      this.userForm.users = [];
    }
  }

  getUsers() {
    const params = 'processId=' + this.userForm.processId;
    this.api.get("Processes/getUserMapping?" + params).subscribe(res => {
      console.log("data", res['data'])
      if (res['code'] > 0) {
        this.userForm.users = res['data'] || [];
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  saveUsers() {
    const params = {
      processId: this.userForm.processId,
      users: JSON.stringify(this.userForm.users),
    };
    console.log(params);
    this.common.loading++;
    this.api.post('Processes/addUserMapping', params).subscribe(res => {
      console.log(res);
      this.common.loading--;
      if (res['code'] == 1) {
        // this.resetTask();
        if (res['data'][0]['y_id'] > 0) {
          this.common.showToast(res['data'][0].y_msg)
          this.closeModal();
        } else {
          this.common.showError(res['data'][0].y_msg)
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
