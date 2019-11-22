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

    //   rowId: campaign._camptargetid,
    //   campaignId: campaign._campid,
    //   campaignName: campaign.CampaignName,
    //   potential: campaign.Potential,
    //   name: campaign.Name,
    //   mobile: campaign.MobileNo,
    //   locationId: campaign._locationid,
    //   locationName: campaign.Location,
    //   address: campaign.Address


    //   if (this.common.params && this.common.params.targetEditData) {
    //     this.target.rowId = this.common.params.targetEditData.rowId ? this.common.params.targetEditData.rowId : null;
    //     this.target.name = this.common.params.targetEditData.campaignName;
    //     this.target.typeId = this.common.params.targetEditData.productId;
    //     this.target.typeName = this.common.params.targetEditData.productName;
    //     this.target.startTime = this.common.params.targetEditData.startTime ? new Date(this.common.params.targetEditData.startTime) : new Date();
    //     this.target.endTime = this.common.params.targetEditData.endTime ? new Date(this.common.params.targetEditData.endTime) : new Date();
    //   }
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
    if (this.target.potential > 4) {
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