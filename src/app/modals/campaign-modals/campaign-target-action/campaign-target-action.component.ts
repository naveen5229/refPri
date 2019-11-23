import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../../Service/common/common.service';
import { ApiService } from '../../../Service/Api/api.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'ngx-campaign-target-action',
  templateUrl: './campaign-target-action.component.html',
  styleUrls: ['./campaign-target-action.component.scss']
})
export class CampaignTargetActionComponent implements OnInit {
  title = "";
  button = "Add";
  targetAction = {
    rowId: null,
    campaignId: null,
    campaignName: "",
    name: "",
    mobile: null,
    locationId: null,
    locationName: "",
    stateId: null,
    actionId: null,
    nextActionId: null,
    standardRemarkId: [],
    remark: null,
    targetTime: new Date()
  }
  stateDataList = [];
  actionDataList = [];
  remarkDataList = [];
  constructor(public common: CommonService,
    public api: ApiService,
    public activeModal: NgbActiveModal) {
    this.common.handleModalSize('class', 'modal-lg', '1200', 'px');
    this.getStateList();
    this.getActionList();
    this.getRemarkList();
    this.title = this.common.params.title ? this.common.params.title : 'Add Target Campaign';
    this.button = this.common.params.button ? this.common.params.button : 'Add';
    if (this.common.params && this.common.params.targetActionData) {
      this.targetAction.rowId = this.common.params.targetActionData.rowId ? this.common.params.targetActionData.rowId : null;
      this.targetAction.campaignId = this.common.params.targetActionData.campaignId ? this.common.params.targetActionData.campaignId : null;
      this.targetAction.campaignName = this.common.params.targetActionData.campaignName;
      this.targetAction.name = this.common.params.targetActionData.name;
      this.targetAction.mobile = this.common.params.targetActionData.mobile;
      this.targetAction.locationId = this.common.params.targetActionData.locationId;
      this.targetAction.locationName = this.common.params.targetActionData.locationName;

    }
  }

  closeModal() {
    this.activeModal.close({ response: false });
  }

  ngOnInit() {
  }

  getStateList() {
    this.api.get("CampaignSuggestion/getStateList").subscribe(res => {
      this.stateDataList = res['data'];
    },
      err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
  }

  getActionList() {
    this.api.get("CampaignSuggestion/getActionList").subscribe(res => {
      this.actionDataList = res['data'];
    },
      err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
  }


  getRemarkList() {
    this.api.get("CampaignSuggestion/getRemarkList").subscribe(res => {
      this.remarkDataList = res['data'];
    },
      err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
  }


  selectStandardRemarks(event) {
    console.log("event", event);
    if (event && event.length) {
      this.targetAction.standardRemarkId = event.map(user => { return { assignee_id: user.id } });
      console.log("ID", this.targetAction.standardRemarkId);
    }

  }

  saveCampaignTargetAction() {

    let targetTime = this.common.dateFormatter(this.targetAction.targetTime);
    const params = {
      campTargetId: this.targetAction.rowId,
      stateId: this.targetAction.stateId,
      actionId: this.targetAction.actionId,
      nextActId: this.targetAction.nextActionId,
      nextActTarTime: targetTime,
      remark: this.targetAction.remark,
      remarkIdList: this.targetAction.standardRemarkId,
      userCallLogId: null
    };

    this.common.loading++;
    this.api.post("Campaigns/addCampTargetAction ", params)
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
