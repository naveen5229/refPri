import { Component, OnInit, Renderer } from '@angular/core';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmComponent } from '../../modals/confirm/confirm.component';
import { TargetCampaignComponent } from '../../modals/campaign-modals/target-campaign/target-campaign.component';
import { CampaignTargetActionComponent } from '../../modals/campaign-modals/campaign-target-action/campaign-target-action.component';
import { CsvUploadComponent } from '../../modals/csv-upload/csv-upload.component';
import { AddContactComponent } from '../../modals/campaign-modals/add-contact/add-contact.component';
import { UserService } from '../../Service/user/user.service';
import { PrintPreviewComponent } from '../../modals/print-preview/print-preview.component';

@Component({
  selector: 'ngx-campaign-target',
  templateUrl: './campaign-target.component.html',
  styleUrls: ['./campaign-target.component.scss']
})
export class CampaignTargetComponent implements OnInit {
  campaignTargetData = [];
  tollUsage = [];
  table = {
    data: {
      headings: {},
      columns: [],
    },
    settings: {
      hideHeader: true
    }
  };
  campaignid = 0;
  campaignname = '';
  campaignDataList = [];
  filterParam = {
    stateId: null,
    startDate: new Date(),
    endDate: new Date(),
    nextActionstartDate: new Date(),
    nextActionendDate: new Date()
  }
  stateDataList = [];
  actionDataList = [];
  nextactionDataList = [];
  constructor(public api: ApiService,
    public common: CommonService,
    public user: UserService,
    public renderer: Renderer,
    public modalService: NgbModal) {
    // this.getCampaignTargetData();
    this.getcampaignList();
    this.common.refresh = this.refresh.bind(this);
  }

  ngOnInit() {
  }

  refresh() {
    this.getcampaignList();
  }
  getcampaignList() {
    this.common.loading++;
    this.api.get("CampaignSuggestion/getCampaignList").subscribe(res => {
      this.common.loading--;
      this.campaignDataList = res['data'];
    },
      err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
  }
  addCampaignTarget() {
    this.common.params = { title: "Add Lead ", button: "Add" }
    const activeModal = this.modalService.open(TargetCampaignComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        this.getCampaignTargetData();
      }
    });
  }
  printTable() {
    const activeModal = this.modalService.open(PrintPreviewComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static', windowClass: 'print-lr-manifest print-lr' });

  }
  printHandler() {
    this.renderer.setElementClass(document.body, 'table_data', false);
    let css = '@page { size: landscape !important; }';
    let head = document.head || document.getElementsByTagName('head')[0];
    let style = document.createElement('style');

    style.type = 'text/css';
    style.media = 'print';

    if (style['styleSheet']) {
      style['styleSheet'].cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }

    head.appendChild(style);

    window.print();
    let printWindowListener = setInterval(() => {
      if (document.readyState == "complete") {
        clearInterval(printWindowListener);
        head.removeChild(style);
        this.renderer.setElementClass(document.body, 'table_data', false);
      }
    }, 1000);
  }
  getCampaignTargetData() {
    let startdate = this.common.dateFormatter(this.filterParam.startDate);
    let enddate = this.common.dateFormatter(this.filterParam.endDate);
    let nextActionstartDate = this.common.dateFormatter(this.filterParam.nextActionstartDate);
    let nextActionendDate = this.common.dateFormatter(this.filterParam.nextActionendDate);
    // const params = { campId: this.campaignid }
    const params = "campId=" + this.campaignid +
      "&stateId=" + this.filterParam.stateId +
      "&startDate=" + startdate +
      "&endDate=" + enddate +
      "&nextActionstartDate=" + nextActionstartDate +
      "&nextActionendDate=" + nextActionendDate;
    console.log('filterParam:', params);
    this.resetTable();
    this.common.loading++;
    this.api.get('Campaigns/getCampTarget?' + params)
      .subscribe(res => {
        this.common.loading--;
        console.log("api data", res);
        if (!res['data']) return;
        this.campaignTargetData = res['data'];
        console.log(this.campaignTargetData);
        this.campaignTargetData.length ? this.setTable() : this.resetTable();

      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }

  printPDF(tblEltId) {
    this.common.loading++;
    // let userid = this.user._customer.id;
    // if (this.user._loggedInBy == "customer")
    // console.log(userid);
    this.api.get('Campaigns/getCampTarget?campId=' + this.campaignid)
      .subscribe(res => {
        console.log(res);
        this.common.loading--;
        let fodata = res['data'];
        let left_heading = fodata['name'];
        let center_heading = "Campaign Target Summary";
        this.common.getPDFFromTableId(tblEltId, left_heading, center_heading, null, '');
      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }

  printCSV(tblEltId) {
    if (this.campaignid > 0) {
      this.common.loading++;
      this.api.get('Campaigns/getCampTarget?campId=' + this.campaignid)
        .subscribe(res => {
          this.common.loading--;
          let fodata = res['data'];
          let left_heading = fodata['name'];
          let center_heading = "Toll Usage";
          this.common.getCSVFromTableId(tblEltId, left_heading, center_heading);
        }, err => {
          this.common.loading--;
          console.log(err);
        });
    } else {
      this.common.showError("Campaign is missing");
    }
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
    for (var key in this.campaignTargetData[0]) {
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
    this.campaignTargetData.map(campaign => {
      let column = {};
      for (let key in this.generateHeadings()) {
        if (key == 'Action') {
          column[key] = {
            value: "",
            isHTML: false,
            action: null,
            icons: this.actionIcons(campaign)
          };
        }
        // else if (key == 'MobileNo') {
        //   column[key] = { value: campaign[key], class: 'blue', action: this.targetAction.bind(this, campaign) };
        // } 
        else if (key == 'Company') {
          column[key] = { value: campaign[key], class: 'blue', action: this.addContactAction.bind(this, campaign) };
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
      { class: "far fa-edit", action: this.editCampaign.bind(this, campaign) },
      { class: 'fas fa-trash-alt ml-2', action: this.deleteCampaign.bind(this, campaign) },
      { class: 'fas fa-address-book ml-2 s-4', action: this.targetAction.bind(this, campaign) },

    ];
    return icons;
  }


  editCampaign(campaign) {
    console.log(campaign);

    let targetEditData = {
      rowId: campaign._camptargetid,
      campaignId: campaign._campid,
      campainType: campaign._camtype,
      campaignName: campaign._campaignname,
      potential: campaign.FleetSize,
      name: campaign.Company,
      mobile: campaign._mobileno,
      locationId: campaign._locationid,
      locationName: campaign.Location,
      address: campaign._address,
      lat: campaign._lat,
      long: campaign._long,
      potCat: campaign._potcat,
      priOwnId: campaign._priownid,
      potCatname: campaign['Fleet Category'],
      priOwnname: campaign['Primary Owner'],

    }

    this.common.params = { targetEditData, title: "Edit Lead", button: "Edit" };
    // console.log(this.common.params);

    const activeModal = this.modalService.open(TargetCampaignComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        this.getCampaignTargetData();
      }
    });
  }


  targetAction(campaign) {
    let targetActionData = {
      rowId: campaign._camptargetid,
      campaignId: campaign._campid,
      campaignName: campaign.CampaignName,
      potential: campaign.Potential,
      name: campaign.Name,
      mobile: campaign._mobileno,
      locationId: campaign._locationid,
      locationName: campaign.Location,
      address: campaign._address,
      camptargetid: campaign._camptargetid

    };

    this.common.params = { targetActionData, title: "Campaign Target Contacts", button: "Add" };
    const activeModal = this.modalService.open(AddContactComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      this.getCampaignTargetData();
    });
  }


  addContactAction(campaign) {
    let targetActionData = {
      rowId: campaign._camptargetid,
      campaignId: campaign._campid,
      campaignName: campaign._campaignname,
      potential: campaign.Potential,
      name: campaign.Company,
      mobile: campaign._mobileno,
      locationId: campaign._locationid,
      locationName: campaign.Location,
      address: campaign.Address,
      camptargetid: campaign._camptargetid

    };
    console.log(campaign);
    this.common.params = { targetActionData, title: "Campaign Target Action", button: "Add", stateDataList: this.stateDataList, actionDataList: this.actionDataList, nextactionDataList: this.nextactionDataList };
    const activeModal = this.modalService.open(CampaignTargetActionComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      this.getCampaignTargetData();
    });
  }





  deleteCampaign(row) {
    let params = {
      campTargetId: row._camptargetid,
    }
    if (row._camptargetid) {
      this.common.params = {
        title: 'Delete Record',
        description: `<b>&nbsp;` + 'Are Sure To Delete This Record' + `<b>`,
      }

      const activeModal = this.modalService.open(ConfirmComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
      activeModal.result.then(data => {
        if (data.response) {
          this.common.loading++;
          this.api.post('Campaigns/removeCampTarget', params)
            .subscribe(res => {
              this.common.loading--;
              this.common.showToast(res['msg']);
              this.getCampaignTargetData();
            }, err => {
              this.common.loading--;
              console.log('Error: ', err);
            });
        }
      });
    }
  }
  uploadDataByCsv() {
    this.common.params = { title: "CSV", button: "Upload" };
    const activeModal = this.modalService.open(CsvUploadComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        this.getCampaignTargetData();
      }
    });
  }

  onCampaignSelect() {
    if (this.campaignid > 0) {
      this.getStateList();
      this.getActionList();
      this.getnextActionList();
    }
  }

  getStateList() {
    // this.common.loading++;
    this.api.get("CampaignSuggestion/getStateList?campaignId=" + this.campaignid).subscribe(res => {
      // this.common.loading--;
      this.stateDataList = res['data'];
    },
      err => {
        // this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
  }
  getActionList() {
    this.common.loading++;
    this.api.get("CampaignSuggestion/getActionList?campaignId=" + this.campaignid).subscribe(res => {
      this.common.loading--;
      this.actionDataList = res['data'];
    },
      err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
  }
  getnextActionList() {
    this.common.loading++;
    this.api.get("CampaignSuggestion/getActionList").subscribe(res => {
      this.common.loading--;
      this.nextactionDataList = res['data'];
    },
      err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
  }


}
