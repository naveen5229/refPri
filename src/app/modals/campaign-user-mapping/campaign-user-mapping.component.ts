import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { UserService } from '../../Service/user/user.service';
@Component({
  selector: 'ngx-campaign-user-mapping',
  templateUrl: './campaign-user-mapping.component.html',
  styleUrls: ['./campaign-user-mapping.component.scss']
})
export class CampaignUserMappingComponent implements OnInit {

  campaignId = null;
  userList = [];
  selectedUserList = [];


  constructor(public activeModal: NgbActiveModal,
    public api: ApiService,
    public common: CommonService,
    public modalService: NgbModal,
    public userService: UserService) { 
      if(this.common.params && this.common.params.campaignId) {
          this.campaignId = this.common.params.campaignId;
      }
      this.getAllAdmin();
      this.getUsers();

    }

  ngOnInit() {
  }

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
    console.log( event);
    if (event && event.length) {
      this.selectedUserList = event.map(user => { return { id: user.id, name: user.name } });
      console.log( this.selectedUserList);
    } else {
      this.selectedUserList = [];
    }
  }

  getUsers() {
    const params = 'campaignId=' + this.campaignId
    this.api.get("Campaigns/getCampUserMapping?" + params).subscribe(res => {
      console.log("data", res['data'])
      if (res['code'] > 0) {
        this.selectedUserList = res['data'] || [];
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
      campaignId: this.campaignId,
      users: JSON.stringify(this.selectedUserList),
    }
    this.common.loading++;
    this.api.post('Campaigns/addCampUserMapping', params).subscribe(res => {
      this.common.loading--;
      if (res['code'] == 1) {
        if (res['data'][0]['y_id'] > 0) {
          this.common.showToast(res['data'][0].y_msg)
          this.closeModal();
        } else {
          this.common.showError(res['data'][0].y_msg)
        }
      } else {
        this.common.showError(res['msg']);
      }
    },err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
  }

}
