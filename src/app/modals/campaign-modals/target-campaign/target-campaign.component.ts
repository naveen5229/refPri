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
  target = {
    rowId: null,
    campaignId: null,
    name: "",
    mobile: null,
    potential: null,
    locationId: null,
    address: "",
  }
  campaignDataList = [];
  locationDataList = [];

  constructor(public common: CommonService,
    public api: ApiService,
    public activeModal: NgbActiveModal) {
    this.getcampaignList();
    this.getLocationList();
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

  getcampaignList() {
    this.api.get("CampaignSuggestion/getCampaignList").subscribe(res => {
      this.campaignDataList = res['data'];
    },
      err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
  }
  getLocationList() {
    this.api.get("CampaignSuggestion/getLocation").subscribe(res => {
      this.locationDataList = res['data'];
    },
      err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
  }
  checkValidation() {
    if (this.target.potential.length > 4) {
      return this.common.showError("range Between 0 to 9999")
    }
  }

  saveCampaignTarget() {
    if (!this.target.campaignId || !this.target.name || !this.target.mobile) return this.common.showError("Please Fill Require Field");

    let params = {};
    if (this.target.rowId) {
      // params = {
      //   campaignId: this.campaignAdd.rowId,
      //   campaignName: this.campaignAdd.name,
      //   productType: this.campaignAdd.typeId,


      // };
      // url = "Campaigns/updateCampaign";
    } else {
      params = {
        campTargetId: this.target.rowId,
        campaignId: this.target.campaignId,
        name: this.target.name,
        mobileNo: this.target.mobile,
        potential: this.target.potential,
        locationId: this.target.locationId,
        address: this.target.address,

      }
    }

    this.common.loading++;
    this.api.post("Campaigns/addCampaignTarget", params)
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