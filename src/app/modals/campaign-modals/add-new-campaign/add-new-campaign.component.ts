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
  campaignAdd = {
    name: "",
    type: null,
    startTime: new Date(),
    endTime: new Date()
  }

  productTypeLis = [];
  constructor(public common: CommonService,
    public api: ApiService,
    public activeModal: NgbActiveModal,
    public modalSService: NgbModal) {
    this.getProductType();
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

  savecampaign() {
    if (this.campaignAdd.endTime < this.campaignAdd.startTime) {
      this.common.showError("Date in Invalid");
      return;
    }
    let startDate = this.common.dateFormatter(this.campaignAdd.startTime);
    let endDate = this.common.dateFormatter(this.campaignAdd.endTime);
    let params = {
      campaignName: this.campaignAdd.name,
      productType: this.campaignAdd.type,
      startTime: startDate,
      endTime: endDate

    }
    this.common.loading++;
    this.api.post('Campaigns/addCampaign', params)
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
