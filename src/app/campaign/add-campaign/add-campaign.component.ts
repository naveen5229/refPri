import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddNewCampaignComponent } from '../../modals/campaign-modals/add-new-campaign/add-new-campaign.component';
import { ConfirmComponent } from '../../modals/confirm/confirm.component';
import { DataMappingComponent } from '../../modals/campaign-modals/data-mapping/data-mapping.component';
import { LocationTargetComponent } from '../../modals/campaign-modals/location-target/location-target.component';
import { marker } from 'leaflet';
import { InfoMatrixComponent } from '../../modals/info-matrix/info-matrix.component';
import { CampaignUserMappingComponent } from '../../modals/campaign-user-mapping/campaign-user-mapping.component';

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
  filterData = [];
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
        if(res['code']===0) { this.common.showError(res['msg']); return false;};
        if (!res['data']) return;
        this.campaignData = res['data'];
        this.campaignData.length ? this.setTable() : this.resetTable();

      }, err => {
        this.common.loading--;
        this.common.showError();
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
      { class: "fas fa-plus ml-2", action: this.infoMatrix.bind(this, campaign) },
      { class: "fas fa-list-alt pri_cat ml-2", action: this.priCatMapping.bind(this, campaign), title: "Primary Category Mapping" },
      { class: "fas fa-list-alt ml-2", action: this.secCatMapping.bind(this, campaign), title: "Secondary Category Mapping" },
      { class: "fas fa-user-alt ml-2", action: this.campaignUserMapping.bind(this, campaign), title: "Campaign User Mapping" },

    ];
    return icons;
  }

  campaignUserMapping(campaign) {
    console.log(campaign);
    this.common.params = { 'campaignId': campaign._campaignid };
    const activeModal = this.modalService.open(CampaignUserMappingComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    // activeModal.result.then(data => {
    //   if (data.response) {
    //     this.getCampaignData();
    //   }
    // });
  }
  infoMatrix(campaign) {
    console.log(campaign);
    this.common.params = { 'campaignId': campaign._campaignid, 'title': 'Info Matrix' };
    const activeModal = this.modalService.open(InfoMatrixComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        // this.getCampaignData();
      }
    });
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
              if(res['code']===0) { this.common.showError(res['msg']); return false;};
              this.common.showToast(res['msg']);
              this.getCampaignData();
            }, err => {
              this.common.loading--;
              this.common.showError();
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

  }

  priCatMapping(campaign) {
    const data = {
      apiUrl: "Campaigns/getCampPriCatMapping",
      param: {
        campaignId: campaign._campaignid
      },
      updateUrl: "Campaigns/addCampPriCatMapping",
      updateParam: {
        campaignId: campaign._campaignid,
        priCatIdList: null
      },
      idType: "priCatId",
    }
    this.common.params = { data, title: "Primary Category Mapping", button: "Add" };
    const activeModal = this.modalService.open(DataMappingComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static' });

  }

  secCatMapping(campaign) {
    const data = {
      apiUrl: "Campaigns/getCampSecCatMapping",
      param: {
        campaignId: campaign._campaignid
      },
      updateUrl: "Campaigns/addCampSecCatMapping",
      updateParam: {
        campaignId: campaign._campaignid,
        secCatIdList: null
      },
      idType: "secCatId",
    }
    this.common.params = { data, title: "Secondary Category Mapping", button: "Add" };
    const activeModal = this.modalService.open(DataMappingComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static' });

  }



  viewlocation(campaign) {
    this.common.params = { campaignId: campaign._campaignid, title: "Location Target" };
    const activeModal = this.modalService.open(LocationTargetComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      this.getCampaignData();
    });
  }

}
