import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddNewCampaignComponent } from '../../modals/campaign-modals/add-new-campaign/add-new-campaign.component';
import { ConfirmComponent } from '../../modals/confirm/confirm.component';
import { DataMappingComponent } from '../../modals/campaign-modals/data-mapping/data-mapping.component';
import { LocationTargetComponent } from '../../modals/campaign-modals/location-target/location-target.component';

@Component({
  selector: 'ngx-add-campaign',
  templateUrl: './add-campaign.component.html',
  styleUrls: ['./add-campaign.component.scss']
})
export class AddCampaignComponent implements OnInit {

  campaignData = [];
  table = {
    data: {
      headings: {},
      columns: [],
    },
    settings: {
      hideHeader: true
    }
  };
  constructor(public api: ApiService,
    public common: CommonService,
    public modalService: NgbModal) {
    this.getCampaignData();
  }

  ngOnInit() {
  }

  addCampaign() {
    this.common.params = { title: "Add Campaign", button: "Add" }
    const activeModal = this.modalService.open(AddNewCampaignComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        this.getCampaignData();
      }
    });
  }

  getCampaignData() {
    this.common.loading++;
    this.api.get('Campaigns/getCampaigns')
      .subscribe(res => {
        this.common.loading--;
        console.log("api data", res);
        if (!res['data']) return;
        this.campaignData = res['data'];
        this.campaignData.length ? this.setTable() : this.resetTable();

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
    for (var key in this.campaignData[0]) {
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
    this.campaignData.map(campaign => {
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
      { class: "far fa-edit", action: this.editCampaign.bind(this, campaign) },
      { class: 'fas fa-trash-alt ml-3', action: this.deleteCampaign.bind(this, campaign) },
      { class: 'fas fa-grip-horizontal ml-3', action: this.stateMapping.bind(this, campaign) },
      { class: 'fas fa-handshake ml-3', action: this.actionMapping.bind(this, campaign) },
      { class: "fas fa-globe-africa ml-2", action: this.viewlocation.bind(this, campaign) },

    ];
    return icons;
  }


  editCampaign(campaign) {
    let campaignEditData = {
      rowId: campaign._campaignid,
      campaignName: campaign.CampaignName,
      productName: campaign.ProductName,
      startTime: campaign._sartdate,
      endTime: campaign._enddate,
      productId: campaign._productid
    }
    this.common.params = { campaignEditData, title: "Edit Campaign", button: "Edit" };
    const activeModal = this.modalService.open(AddNewCampaignComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        this.getCampaignData();
      }
    });
  }



  deleteCampaign(row) {
    if (row._campaignid) {
      let params = {
        campaignId: row._campaignid,
      }
      this.common.params = {
        title: 'Delete Campaign ',
        description: `<b>&nbsp;` + 'Are Sure To Delete This Record' + `<b>`,
      }

      const activeModal = this.modalService.open(ConfirmComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
      activeModal.result.then(data => {
        if (data.response) {
          this.common.loading++;
          this.api.post('Campaigns/deleteCampaign', params)
            .subscribe(res => {
              this.common.loading--;
              this.common.showToast(res['msg']);
              this.getCampaignData();
            }, err => {
              this.common.loading--;
              console.log('Error: ', err);
            });
        }
      });
    } else {
      this.common.showError("Campagin ID Not Available");
    }
  }

  stateMapping(campaign) {
    const data = {
      apiUrl: "Campaigns/getCampStateMapping",
      param: {
        campaignId: campaign._campaignid
      },
      updateUrl: "Campaigns/addCampStateMapping",
      updateParam: {
        campaignId: campaign._campaignid,
        stateIdList: null
      },
      idType: "stateId",
    }
    this.common.params = { data, title: "State Mapping", button: "Add" };
    const activeModal = this.modalService.open(DataMappingComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        this.getCampaignData();
      }
    });
  }


  actionMapping(campaign) {
    const data = {
      apiUrl: "Campaigns/getCampActionMapping",
      param: {
        campaignId: campaign._campaignid
      },
      updateUrl: "Campaigns/addCampActionMapping",
      updateParam: {
        campaignId: campaign._campaignid,
        actionIdList: null
      },
      idType: "actionId",
    }
    this.common.params = { data, title: "Action Mapping", button: "Add" };
    const activeModal = this.modalService.open(DataMappingComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        this.getCampaignData();
      }
    });
  }


  viewlocation(campaign) {
    this.common.loading++;
    this.api.get('campaigns/getAllTargetWrtCamp?campaignId=' + campaign._campaignid)
      .subscribe(res => {
        this.common.loading--;
        console.log("api data", res);

      }, err => {
        this.common.loading--;
        console.log(err);
      });
    this.common.params = { title: "Location Target" };
    const activeModal = this.modalService.open(LocationTargetComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      this.getCampaignData();
    });
  }
}
