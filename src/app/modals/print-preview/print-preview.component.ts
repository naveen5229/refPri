import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';

@Component({
  selector: 'ngx-print-preview',
  templateUrl: './print-preview.component.html',
  styleUrls: ['./print-preview.component.scss']
})
export class PrintPreviewComponent implements OnInit {
  tollUsage = [];
  campaignid=0;
  campaignname='';
  campaignDataList = [];
  campaignTargetData = [];
  table = {
    data: {
      headings: {},
      columns: [],
    },
    settings: {
      hideHeader: true
    }
  };
  constructor(   
     public activeModal: NgbActiveModal,
     public api: ApiService, public common: CommonService,
    ) {this.getCampaignTargetData(),
      this.setTable() }

  ngOnInit() {
    console.log('fasdf');
  }
  closeModal() {
    this.activeModal.close();
  }

  printHandler(){
    console.log('dsfasdf');
    window.print;
  }

  setTable() {
    this.table.data = {
      headings: this.generateHeadings(),
      columns: this.getTableColumns()
    };
    return true;
  }
   getCampaignTargetData() {
    const params = {campId: this.campaignid}
    // this.resetTable();
    // this.common.loading++;
    this.api.get('Campaigns/getCampTarget?campId='+15)
      .subscribe(res => {
        // this.common.loading--;
        if(res['code']===0) { this.common.showError(res['msg']); return false;};
        if (!res['data']) return;
        this.campaignTargetData = res['data'];
        this.campaignTargetData.length ? this.setTable() : this.setTable();

      }, err => {
        // this.common.loading--;
        this.common.showError();
        console.log(err);
      });
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
            icons: ''
          };
        } 
        // else if (key == 'MobileNo') {
        //   column[key] = { value: campaign[key], class: 'blue', action: this.targetAction.bind(this, campaign) };
        // } 
        // else if (key == 'Company') {
        //   column[key] = { value: campaign[key], class: 'blue', action: this.addContactAction.bind(this, campaign) };
        // }
        else {
          column[key] = { value: campaign[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    })

    return columns;
  }

  // actionIcons(campaign) {
  //   let icons = [
  //     { class: "far fa-edit", action: this.editCampaign.bind(this, campaign) },
  //     { class: 'fas fa-trash-alt ml-2', action: this.deleteCampaign.bind(this, campaign) },
  //     { class: 'fas fa-address-book ml-2 s-4', action: this.targetAction.bind(this, campaign)},

  //   ];
  //   return icons;
  // }
}
