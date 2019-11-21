import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddNewCampaignComponent } from '../../modals/campaign-modals/add-new-campaign/add-new-campaign.component';

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
    // let icons = [
    //   {
    //     class: "far fa-eye",
    //     action: this.templatePreview.bind(this, 'Preview', campaign)
    //   },
    //   {
    //     class: "fas fa-user",
    //     action: this.assign.bind(this, 'Edit', campaign)
    //   },
    // ];
    // this.user.permission.edit && icons.push({ class: "far fa-edit", action: this.addAndEdit.bind(this, 'Edit', campaign) });
    // this.user.permission.delete && icons.push({ class: 'fas fa-trash-alt', action: this.deleteUserTemplate.bind(this, campaign) });

    // return icons;
  }






}
