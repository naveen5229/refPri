import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../../Service/common/common.service';
import { ApiService } from '../../../Service/Api/api.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'ngx-target-campaign',
  templateUrl: './target-campaign.component.html',
  styleUrls: ['./target-campaign.component.scss']
})
export class TargetCampaignComponent implements OnInit {

  title = "";
  button = "Add";

  campaignAdd = {
    rowId: null,
    name: "",
    typeId: null,
    typeName: null,
    startTime: new Date(),
    endTime: new Date()
  }

  productTypeLis = [];
  constructor(public common: CommonService,
    public api: ApiService,
    public activeModal: NgbActiveModal) {
    this.getProductType();
    this.title = this.common.params.title ? this.common.params.title : 'Add Target Campaign';
    this.button = this.common.params.button ? this.common.params.button : 'Add';

    // if (this.common.params && this.common.params.campaignEditData) {
    //   this.campaignAdd.rowId = this.common.params.campaignEditData.rowId ? this.common.params.campaignEditData.rowId : null;
    //   this.campaignAdd.name = this.common.params.campaignEditData.campaignName;
    //   this.campaignAdd.typeId = this.common.params.campaignEditData.productId;
    //   this.campaignAdd.typeName = this.common.params.campaignEditData.productName;
    //   this.campaignAdd.startTime = this.common.params.campaignEditData.startTime ? new Date(this.common.params.campaignEditData.startTime) : new Date();
    //   this.campaignAdd.endTime = this.common.params.campaignEditData.endTime ? new Date(this.common.params.campaignEditData.endTime) : new Date();
    // }
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

}