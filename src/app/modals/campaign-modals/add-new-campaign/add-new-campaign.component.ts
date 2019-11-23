import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../../Service/common/common.service';
import { ApiService } from '../../../Service/Api/api.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'ngx-add-new-campaign',
  templateUrl: './add-new-campaign.component.html',
  styleUrls: ['./add-new-campaign.component.scss',]
})
export class AddNewCampaignComponent implements OnInit {
  title = "";
  button = "Add";
  campaignAdd = {
    rowId: null,
    name: "",
    typeId: null,
    typeName: null,
    startTime: new Date(),
    endTime: null
  }

  productTypeLis = [];
  constructor(public common: CommonService,
    public api: ApiService,
    public activeModal: NgbActiveModal,
    public modalSService: NgbModal) {
    this.getProductType();
    this.title = this.common.params.title ? this.common.params.title : 'Add Campaign';
    this.button = this.common.params.button ? this.common.params.button : 'Add';

    if (this.common.params && this.common.params.campaignEditData) {
      this.campaignAdd.rowId = this.common.params.campaignEditData.rowId ? this.common.params.campaignEditData.rowId : null;
      this.campaignAdd.name = this.common.params.campaignEditData.campaignName;
      this.campaignAdd.typeId = this.common.params.campaignEditData.productId;
      this.campaignAdd.typeName = this.common.params.campaignEditData.productName;
      this.campaignAdd.startTime = this.common.params.campaignEditData.startTime ? new Date(this.common.params.campaignEditData.startTime) : new Date();
      this.campaignAdd.endTime = this.common.params.campaignEditData.endTime ? new Date(this.common.params.campaignEditData.endTime) : new Date();
    }
  }

  closeModal() {
    this.activeModal.close({ response: false });
  }

  ngOnInit() {
  }
  getProductType() {
    this.common.loading++;
    this.api.get('CampaignSuggestion/getProductList')
      .subscribe(res => {
        this.common.loading--;
        this.productTypeLis = res['data'];
        console.log(this.productTypeLis);
      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }
  unselected(variable) {
    if (this.campaignAdd[variable]) {
      document.getElementById(variable)['value'] = '';
      this.campaignAdd[variable] = null;
    }
  }

  savecampaign() {
    let url = "Campaigns/addCampaign";
    if (this.campaignAdd.endTime) {
      if (this.campaignAdd.endTime < this.campaignAdd.startTime) {
        this.common.showError("EndDate not less then Start Date");
        return;
      }
    }
    if (!this.campaignAdd.name) return this.common.showError("Please Select Campaign Name");
    if (!this.campaignAdd.typeId) return this.common.showError("Please Select Product Type");

    let startDate = this.common.dateFormatter(this.campaignAdd.startTime);
    let endDate = this.campaignAdd.endTime ? this.common.dateFormatter(this.campaignAdd.endTime) : null;
    let params = {};
    if (this.campaignAdd.rowId) {
      params = {
        campaignId: this.campaignAdd.rowId,
        campaignName: this.campaignAdd.name,
        productType: this.campaignAdd.typeId,
        startTime: startDate,
        endTime: endDate

      };
      url = "Campaigns/updateCampaign";
    } else {
      params = {
        campaignName: this.campaignAdd.name,
        productType: this.campaignAdd.typeId,
        startTime: startDate,
        endTime: endDate
      }
      url = "Campaigns/addCampaign";

    }

    this.common.loading++;
    this.api.post(url, params)
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
