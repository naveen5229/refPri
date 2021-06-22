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
    show_mobile:'',
    show_address:'',
    name: "",
    mobile:'',
    address:'',
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
      this.targetAction.show_address = this.common.params.targetActionData.address;
      this.targetAction.show_mobile = this.common.params.targetActionData.mobile;
    };
    this.getTargetActionData();
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


  getTargetActionData() {
    let campTargetId=this.targetAction.campTargetId;
    this.resetTable();
    const params =  "campTargetId=" + campTargetId;
    this.common.loading++;
    this.api.get('Campaigns/getTargetContactDetails?'+params)
      .subscribe(res => {
        this.common.loading--;
        if(res['code']===0) { this.common.showError(res['msg']); return false;};
        if (!res['data']) return;
        this.campaignTargetActionData = res['data'];
        this.campaignTargetActionData.length ? this.setTable() : this.resetTable();

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
    console.log('delete',row);
    let params = {
      campTargetContactId: row._id,
    }
    if (row._id) {
      this.common.params = {
        title: 'Delete Record',
        description: `<b>&nbsp;` + 'Are Sure To Delete This Record' + `<b>`,
      }

      const activeModal = this.modalService.open(ConfirmComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
      activeModal.result.then(data => {
        if (data.response) {
          this.common.loading++;
          this.api.post('Campaigns/deleteTargetContactDetails', params)
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

  saveCampaignTargetAction() {
      console.log('params',this.targetAction);
    const params = {
      campTargetId: this.targetAction.campTargetId,
      name: this.targetAction.name,
      mobileno: this.targetAction.mobile,
      address: this.targetAction.address,
      email: this.targetAction.email,
     
    };

    this.common.loading++;
    this.api.post("Campaigns/addCampTargetContact ", params)
      .subscribe(res => {
        this.common.loading--;
        if (res['code'] >0) {
          this.common.showToast(res['msg']);
          this.getTargetActionData();
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
