import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../../Service/common/common.service';
import { ApiService } from '../../../Service/Api/api.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmComponent } from '../../confirm/confirm.component';

@Component({
  selector: 'ngx-campaign-target-action',
  templateUrl: './campaign-target-action.component.html',
  styleUrls: ['./campaign-target-action.component.scss']
})
export class CampaignTargetActionComponent implements OnInit {
  title = "";
  button = "Add";
  standards = [];
  targetAction = {
    rowId: null,
    campaign: { id: null, name: "" },
    // campaignName: "",
    name: "",
    mobile: null,
    locationId: null,
    locationName: "",
    state: { id: null, name: "" },
    action: { id: null, name: "" },
    nextAction: { id: null, name: "" },
    standardRemarkId: [],
    remark: null,
    targetTime: new Date(),
    campTargetId: 0
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
    // this.common.handleModalSize('class', 'modal-lg', '1300', 'px');

    this.title = this.common.params.title ? this.common.params.title : 'Add Target Campaign';
    this.button = this.common.params.button ? this.common.params.button : 'Add';
    if (this.common.params && this.common.params.targetActionData) {
      this.targetAction.rowId = this.common.params.targetActionData.rowId ? this.common.params.targetActionData.rowId : null;
      this.targetAction.campaign.id = this.common.params.targetActionData.campaignId ? this.common.params.targetActionData.campaignId : null;
      this.targetAction.campaign.name = this.common.params.targetActionData.campaignName;
      this.targetAction.name = this.common.params.targetActionData.name;
      this.targetAction.mobile = this.common.params.targetActionData.mobile;
      this.targetAction.locationId = this.common.params.targetActionData.locationId;
      this.targetAction.locationName = this.common.params.targetActionData.locationName;
      this.targetAction.campTargetId = this.common.params.targetActionData.camptargetid;

    };
    if (this.common.params && this.common.params.stateDataList) {
      this.stateDataList = this.common.params.stateDataList;
    } else {
      this.getStateList();
    }
    if (this.common.params && this.common.params.actionDataList) {
      this.actionDataList = this.common.params.actionDataList;
    } else {
      this.getActionList();
    }
    if (this.common.params && this.common.params.nextactionDataList) {
      this.nextactionDataList = this.common.params.nextactionDataList;
    } else {
      this.getnextActionList();
    }
    this.getRemarkList();
    this.getTargetActionData();
  }

  closeModal() {
    this.activeModal.close({ response: false });
  }

  ngOnInit() {
  }

  getStateList() {
    this.common.loading++;
    this.api.get("CampaignSuggestion/getStateList?campaignId=" + this.targetAction.campaign.id).subscribe(res => {
      this.common.loading--;
      if(res['code']===0) { this.common.showError(res['msg']); return false;};
      this.stateDataList = res['data'];
    },err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  getActionList() {
    this.common.loading++;
    this.api.get("CampaignSuggestion/getActionList?campaignId=" + this.targetAction.campaign.id).subscribe(res => {
      this.common.loading--;
      if(res['code']===0) { this.common.showError(res['msg']); return false;};
      this.actionDataList = res['data'];
    },err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
  }
  getnextActionList() {
    this.common.loading++;
    this.api.get("CampaignSuggestion/getActionList").subscribe(res => {
      this.common.loading--;
      if(res['code']===0) { this.common.showError(res['msg']); return false;};
      this.nextactionDataList = res['data'];
    },err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
  }


  getRemarkList() {
    this.common.loading++;
    this.api.get("CampaignSuggestion/getRemarkList").subscribe(res => {
      this.common.loading--;
      if(res['code']===0) { this.common.showError(res['msg']); return false;};
      this.remarkDataList = res['data'];
    },err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  unselected(variable) {
    if (this.targetAction[variable].id) {
      document.getElementById(variable)['value'] = '';
      this.targetAction[variable].id = null;
    }
  }

  onselectNextAction(nextActionId) {
    if (nextActionId == 16) {
      this.targetAction.targetTime = null;
    } else {
      this.targetAction.targetTime = new Date();
    }
  }

  selectStandardRemarks(event) {
    console.log("event", event);
    if (event && event.length) {
      this.targetAction.standardRemarkId = event.map(remark => { return { remarkId: remark.id } });
      console.log("ID", this.targetAction.standardRemarkId);
    }

  }

  saveCampaignTargetAction() {
    if (this.targetAction.state.id == null || this.targetAction.action.id == null || this.targetAction.nextAction.id == null) {
      this.common.showError('Please Fill All Mandatory Field');
    }
    else {
      let targetTime = (this.targetAction.targetTime) ? this.common.dateFormatter(this.targetAction.targetTime) : null;
      const params = {
        campTargetId: this.targetAction.rowId,
        stateId: this.targetAction.state.id,
        actionId: this.targetAction.action.id,
        nextActId: this.targetAction.nextAction.id,
        nextActTarTime: targetTime,
        remark: this.targetAction.remark,
        remarkIdList: this.standards.map(remark => { return { remarkId: remark.id } }),
        userCallLogId: null
      };
      this.common.loading++;
      this.api.post("Campaigns/addCampTargetAction ", params)
        .subscribe(res => {
          this.common.loading--;
          if (res['code']>0) {
            this.common.showToast(res['msg']);
            this.getTargetActionData();
            this.resetData();
          } else {
            this.common.showError(res['msg']);
          }
        }, err => {
          this.common.loading--;
          this.common.showError();
          console.log(err);
        });
    }
  }



  getTargetActionData() {
    let campTargetId = this.targetAction.campTargetId;
    this.resetTable();
    const params = "campTargetId=" + campTargetId;
    this.common.loading++;
    this.api.get('Campaigns/getCampTarAction?' + params)
      .subscribe(res => {
        this.common.loading--;
        if(res['code']===0) { this.common.showError(res['msg']); return false;};
        if (!res['data']) return;
        this.campaignTargetActionData = res['data'];
        this.campaignTargetActionData.length ? this.setTable() : this.resetTable();
      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }

  resetTable() {
    this.table.data = {
      headings: {},
      columns: []
    };
  }

  setTable() {
    this.table.data = {
      headings: this.generateHeadings(),
      columns: this.getTableColumns()
    };
    return true;
  }

  generateHeadings() {
    let headings = {};
    for (var key in this.campaignTargetActionData[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.formatTitle(key) };
      }
    }
    return headings;
  }

  formatTitle(strval) {
    let pos = strval.indexOf('_');
    if (pos > 0) {
      return strval.toLowerCase().split('_').map(x => x[0].toUpperCase() + x.slice(1)).join(' ')
    } else {
      return strval.charAt(0).toUpperCase() + strval.substr(1);
    }
  }

  getTableColumns() {
    let columns = [];
    this.campaignTargetActionData.map(campaign => {
      let column = {};
      for (let key in this.generateHeadings()) {
        if (key == 'Action') {
          column[key] = {
            value: "",
            isHTML: false,
            action: null,
            icons: this.actionIcons(campaign)
          };
        } else {
          column[key] = { value: campaign[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    })

    return columns;
  }

  actionIcons(campaign) {
    let icons = [
      { class: 'fas fa-trash-alt ml-2', action: this.deleteCampaign.bind(this, campaign) }
    ];
    return icons;
  }

  deleteCampaign(row) {
    let params = {
      campTarActId: row._camptaractid,
    }
    if (row._camptaractid) {
      this.common.params = {
        title: 'Delete Record',
        description: `<b>&nbsp;` + 'Are Sure To Delete This Record' + `<b>`,
      }

      const activeModal = this.modalService.open(ConfirmComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
      activeModal.result.then(data => {
        if (data.response) {
          this.common.loading++;
          this.api.post('Campaigns/removeCampTarAction', params)
            .subscribe(res => {
              this.common.loading--;
              if(res['code']===0) { this.common.showError(res['msg']); return false;};
              this.common.showToast(res['msg']);
              this.getTargetActionData();
            }, err => {
              this.common.loading--;
              this.common.showError();
              console.log('Error: ', err);
            });
        }
      });
    }
  }


  resetData() {
    this.targetAction.campaign = { id: null, name: "" };
    this.targetAction.state = { id: null, name: "" };
    this.targetAction.action = { id: null, name: "" };
    this.targetAction.nextAction = { id: null, name: "" };
    this.targetAction.standardRemarkId = [];
    this.targetAction.remark = "";
    this.targetAction.targetTime = new Date();
    this.standards = [];
  }

}
