import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../../Service/common/common.service';
import { ApiService } from '../../../Service/Api/api.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmComponent } from '../../confirm/confirm.component';

@Component({
  selector: 'ngx-add-contact',
  templateUrl: './add-contact.component.html',
  styleUrls: ['./add-contact.component.scss']
})
export class AddContactComponent implements OnInit {
  title = "";
  button = "Add";
  standards = [];
  targetAction = {
    name: "",
    mobile:0,
    email: '',   
    campTargetId:0
  }
  stateDataList = [];
  actionDataList = [];
  nextactionDataList = [];
  remarkDataList = [];

  campaignTargetActionData = [];
  table = {
    data: {
      headings: {},
      columns: [],
    },
    settings: {
      hideHeader: true
    }
  };
  constructor(public common: CommonService,
    public api: ApiService,
    public activeModal: NgbActiveModal,
    public modalService: NgbModal) {
    this.common.handleModalSize('class', 'modal-lg', '1300', 'px');

    this.title = this.common.params.title ? this.common.params.title : 'Add Target Campaign';
    this.button = this.common.params.button ? this.common.params.button : 'Add';
    if (this.common.params && this.common.params.targetActionData) {
      this.targetAction.campTargetId = this.common.params.targetActionData.camptargetid;
    };
  }

  closeModal() {
    this.activeModal.close({ response: false });
  }

  ngOnInit() {
  }

  unselected(variable) {
    if (this.targetAction[variable]) {
      document.getElementById(variable)['value'] = '';
      this.targetAction[variable] = null;
    }
  }


  

  saveCampaignTargetAction() {
      console.log('params',this.targetAction);
    const params = {
      campTargetId: this.targetAction.campTargetId,
      name: this.targetAction.name,
      mobileno: this.targetAction.mobile,
      email: this.targetAction.email,
     
    };

    this.common.loading++;
    this.api.post("Campaigns/addCampTargetContact ", params)
      .subscribe(res => {
        this.common.loading--;
        console.log(res);
        if (res['success'] == true) {
          this.common.showToast(res['msg']);
          this.activeModal.close({ response: true });
        } else {
          this.common.showError(res['msg']);

        }
      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }






}
