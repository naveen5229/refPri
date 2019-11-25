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
      this.targetAction.rowId = this.common.params.targetActionData.rowId ? this.common.params.targetActionData.rowId : null;
      this.targetAction.campaignId = this.common.params.targetActionData.campaignId ? this.common.params.targetActionData.campaignId : null;
      this.targetAction.campaignName = this.common.params.targetActionData.campaignName;
      this.targetAction.name = this.common.params.targetActionData.name;
      this.targetAction.mobile = this.common.params.targetActionData.mobile;
      this.targetAction.locationId = this.common.params.targetActionData.locationId;
      this.targetAction.locationName = this.common.params.targetActionData.locationName;

    };
    this.getStateList();
    this.getActionList();
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
    this.api.get("CampaignSuggestion/getStateList?campaignId=" + this.targetAction.campaignId).subscribe(res => {
      this.common.loading--;
      this.stateDataList = res['data'];
    },
      err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
  }

  getActionList() {
    this.common.loading++;
    this.api.get("CampaignSuggestion/getActionList?campaignId=" + this.targetAction.campaignId).subscribe(res => {
      this.common.loading--;
      this.actionDataList = res['data'];
    },
      err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
  }


  getRemarkList() {
    this.common.loading++;
    this.api.get("CampaignSuggestion/getRemarkList").subscribe(res => {
      this.common.loading--;
      this.remarkDataList = res['data'];
    },
      err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
  }

  unselected(variable) {
    if (this.targetAction[variable]) {
      document.getElementById(variable)['value'] = '';
      this.targetAction[variable] = null;
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
          this.getTargetActionData();
          this.resetData();
        } else {
          this.common.showError(res['msg']);

        }
      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }



  getTargetActionData() {
    this.resetTable();
    this.common.loading++;
    this.api.get('Campaigns/getCampTarAction')
      .subscribe(res => {
        this.common.loading--;
        console.log("api data", res);
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
              this.common.showToast(res['msg']);
              this.getTargetActionData();
            }, err => {
              this.common.loading--;
              console.log('Error: ', err);
            });
        }
      });
    }
  }


  resetData() {
    this.targetAction.campaignId = null;
    this.targetAction.stateId = null;
    this.targetAction.actionId = null;
    this.targetAction.nextActionId = null;
    this.targetAction.standardRemarkId = [];
    this.targetAction.remark = "";
    this.targetAction.targetTime = new Date();
    document.getElementById('stateId')['value'] = '';
    document.getElementById('actionId')['value'] = '';
    document.getElementById('nextActionId')['value'] = '';
    document.getElementById('standard')['value'] = '';

  }

}
