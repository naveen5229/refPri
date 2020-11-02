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
export class UserMappingComponent implements OnInit { // use from two page process and ticket. be carefull
  title = "Process User mapping";
  userList = [];
  userForm = {
    processId: null,
    users: []
  };
  fromPage;

  constructor(public activeModal: NgbActiveModal,
    public api: ApiService,
    public common: CommonService,
    public modalService: NgbModal,
    public userService: UserService) {
    if (this.common.params && this.common.params.process_id) {
      this.userForm.processId = this.common.params.process_id;
      this.userList = this.common.params.adminList;
      this.fromPage = this.common.params.fromPage;
      if (this.fromPage == "ticket") {
        this.title = "User mapping";
      }
    }
    this.getUsers();

  }

  ngOnInit() { }

  closeModal(res) {
    this.activeModal.close({ response: res });
  }

  getUsers() {
    const params = 'processId=' + this.userForm.processId;
    let apiName = 'Processes/getUserMapping?';
    if (this.fromPage == "ticket") {
      apiName = 'Ticket/getTpPropertyUserMapping?';
    }
    this.common.loading++;
    this.api.get(apiName + params).subscribe(res => {
      this.common.loading--;
      if (res['code'] > 0) {
        this.userForm.users = res['data'] || [];
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  changeUsers(event) {
    console.log(event);
    let userExist = this.userForm.users.map(user => { return { id: user.id, name: user.name, is_admin: user.is_admin } });
    console.log("userExist:", userExist);
    if (event && event.length) {
      this.userForm.users = event.map(user => { return { id: user.id, name: user.name, is_admin: false } });
      console.log("selected users:", this.userForm.users);
    } else {
      this.userForm.users = [];
    }

    for (let i = 0; i < this.userForm.users.length; i++) {
      let aa = userExist.find(x => { return (x.id == this.userForm.users[i].id && x.is_admin) });
      console.log("aa:", aa);
      this.userForm.users[i].is_admin = (aa) ? true : false;
    };
  }

  saveUsers() {
    let atleastOneAdmin = null;
    if (this.userForm.users) {
      atleastOneAdmin = this.userForm.users.find(x => { return x.is_admin });
    }
    // console.log("atleastOneAdmin", atleastOneAdmin);
    if (!atleastOneAdmin) {
      let eMsg = (this.fromPage == "ticket") ? "Add atleast one supervisor" : "Add atleast one admin";
      this.common.showError(eMsg);
      return false;
    }
    const params = {
      processId: this.userForm.processId,
      users: JSON.stringify(this.userForm.users),
    };
    console.log(params);
    let apiName = 'Processes/addUserMapping?';
    if (this.fromPage == "ticket") {
      apiName = 'Ticket/addTpPropertyUserMapping?';
    }
    this.common.loading++;
    this.api.post(apiName, params).subscribe(res => {
      console.log(res);
      this.common.loading--;
      if (res['code'] == 1) {
        // this.resetTask();
        if (res['data'][0]['y_id'] > 0) {
          this.common.showToast(res['data'][0].y_msg)
          this.closeModal(true);
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
