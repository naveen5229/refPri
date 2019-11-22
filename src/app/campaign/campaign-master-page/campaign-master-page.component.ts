import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmComponent } from '../../modals/confirm/confirm.component';

@Component({
  selector: 'ngx-campaign-master-page',
  templateUrl: './campaign-master-page.component.html',
  styleUrls: ['./campaign-master-page.component.scss']
})
export class CampaignMasterPageComponent implements OnInit {
  activeTab = "productMaster";
  productData = [];
  table = {
    data: {
      headings: {},
      columns: [],
    },
    settings: {
      hideHeader: true
    }
  };
  url = "CampaignModules/getProducts";
  deleteUrl = "CampaignModules/removeProduct";
  deleteParams = {};
  newProduct = "";
  campaignDataList = [];
  stateDataList = [];
  actionDataList = [];

  campaignId = null;
  stateId = null;
  actionId = null;

  constructor(public api: ApiService,
    public common: CommonService,
    public modalService: NgbModal) {
    this.common.refresh = this.refresh.bind(this);
    this.getMasterDyanmicData();
  }
  ngOnInit() {
  }

  refresh() {
    this.getMasterDyanmicData();
  }

  getcampaignList() {
    this.api.get("CampaignSuggestion/getCampaignList").subscribe(res => {
      console.log("data", res['data']);
      this.campaignDataList = res['data'];
    },
      err => {
        this.common.loading--;

        this.common.showError();
        console.log('Error: ', err);
      });
  }
  getStateList() {
    this.api.get("CampaignSuggestion/getStateList").subscribe(res => {
      console.log("data", res['data']);
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
      console.log("data", res['data']);
      this.actionDataList = res['data'];
    },
      err => {
        this.common.loading--;

        this.common.showError();
        console.log('Error: ', err);
      });
  }


  getReportdata(type) {
    this.activeTab = type;
    this.resetData();
    switch (type) {
      case 'productMaster':
        this.url = "CampaignModules/getProducts";
        this.deleteUrl = "CampaignModules/removeProduct";
        break;

      case 'actionMaster':
        this.url = "CampaignModules/getActions";
        this.deleteUrl = "CampaignModules/removeAction";
        break;

      case 'stateMaster':
        this.url = "CampaignModules/getStates";
        this.deleteUrl = "CampaignModules/removeState";
        break;

      case 'remarkMaster':
        this.url = "CampaignModules/getRemarks";
        this.deleteUrl = "CampaignModules/removeRemark";
        break;

      case 'campaignState':
        this.url = "Campaigns/getCampStateMapping";
        this.getcampaignList();
        this.getStateList();
        break;

      case 'campaignAction':
        this.url = "Campaigns/getCampActionMapping";
        this.getcampaignList();
        this.getActionList();
        break;

    }
    this.getMasterDyanmicData();

    console.log("type", type);

  }




  getMasterDyanmicData() {
    this.resetTable();
    this.common.loading++;
    this.api.get(this.url).subscribe(res => {
      this.common.loading--;
      console.log("data", res['data'])
      if (!res['data']) return;
      this.productData = res['data'];
      this.productData.length ? this.setTable() : this.resetTable();

    },
      err => {
        this.common.loading--;

        this.common.showError();
        console.log('Error: ', err);
      });
  }

  resetData() {
    this.url = "";
    this.newProduct = "";
    this.campaignDataList = [];
    this.stateDataList = [];
    this.actionDataList = [];
    this.campaignId = null;
    this.stateId = null;
    this.actionId = null;

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
    for (var key in this.productData[0]) {
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
    this.productData.map(rowData => {
      let column = {};
      for (let key in this.generateHeadings()) {
        if (key == 'Action') {
          column[key] = {
            value: "",
            isHTML: false,
            action: null,
            icons: this.actionIcons(rowData)
          };
        } else {
          column[key] = { value: rowData[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    })

    return columns;
  }

  actionIcons(rowData) {
    let icons = [
      { class: 'fas fa-trash-alt ml-3', action: this.deleteRecord.bind(this, rowData) }
    ];
    return icons;
  }
  deleteRecord(row) {

    switch (this.activeTab) {
      case 'productMaster':
        this.deleteParams = {
          productId: row._productid
        };
        break;
      case 'actionMaster':
        this.deleteParams = {
          actionId: row._actionid
        };
        break;
      case 'stateMaster':
        this.deleteParams = {
          stateId: row._stateid
        };
        break;
      case 'remarkMaster':
        this.deleteParams = {
          remarkId: row._stateid
        };
        break;
      case 'campaignState':
        console.log('typeof boolean');
        break;
      case 'campaignAction':
        console.log('typeof boolean');
        break;

    }

    if (this.deleteParams) {
      this.common.params = {
        title: 'Delete ',
        description: `<b>&nbsp;` + 'Are Sure To Delete This Record' + `<b>`,
      }

      const activeModal = this.modalService.open(ConfirmComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
      activeModal.result.then(data => {
        if (data.response) {
          this.common.loading++;
          this.api.post(this.deleteUrl, this.deleteParams)
            .subscribe(res => {
              this.common.loading--;
              this.common.showToast(res['msg']);
              this.getMasterDyanmicData();
            }, err => {
              this.common.loading--;
              console.log('Error: ', err);
            });
        }
      });
    }

  }


  addNewRecord(url) {
    if (!this.newProduct) return this.common.showError("Please Select Field");
    const params = {
      name: this.newProduct
    };
    this.common.loading++;
    this.api.post(url, params).subscribe(res => {
      this.common.loading--;
      console.log("data", res['data']);
      if (res['success'] == true) {
        this.common.showToast(res['msg']);
        this.getMasterDyanmicData();
      }
      else {
        this.common.showError(res['msg']);
      }
    },
      err => {
        this.common.loading--;

        this.common.showError();
        console.log('Error: ', err);
      });
  }

  addCampaignState(url, params, req) {
    if (!this.campaignId) return this.common.showError("Please Select Campaign");
    if (!req) return this.common.showError("Please Select " + req);

    this.common.loading++;
    this.api.post(url, params).subscribe(res => {
      this.common.loading--;
      console.log("data", res['data']);
      if (res['success'] == true) {
        this.common.showToast(res['msg']);
        this.getMasterDyanmicData();
      }
      else {
        this.common.showError(res['msg']);
      }
    },
      err => {
        this.common.loading--;

        this.common.showError();
        console.log('Error: ', err);
      });
  }

}
