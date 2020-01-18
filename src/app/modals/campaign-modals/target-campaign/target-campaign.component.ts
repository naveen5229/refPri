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
    campaignName: "",
    name: "",
    campaignType: 1,
    mobile: null,
    potential: null,
    locationId: null,
    locationName: "",
    address: "",
    lat: null,
    long: null,
    fleetcategoryid:0,
    fleetcategoryname:"",
    primaryOwnerid:0,
    primaryownername:''
  }
  campaignDataList = [];
  locationDataList = [];
  primaryownerDataList = [];
  fleetcategoryList = [
    {
      "id": 1,
      "name": "Very Small (0 - 15)"
  },
  {
      "id": 2,
      "name": "Small (16 - 50)"
  },
  {
      "id": 3,
      "name": "Medium (51 - 200)"
  },
  {
    "id": 4,
    "name": "Large (201 - 400)"
  },
  {
    "id": 5,
    "name": "Huge (401 > )"
 },
  ];

  constructor(public common: CommonService,
    public api: ApiService,
    public activeModal: NgbActiveModal) {
    this.getcampaignList();
    //this.getLocationList();
    //this.getPrimaryOwnerList();
    this.title = this.common.params.title ? this.common.params.title : 'Add Target Campaign';
    this.button = this.common.params.button ? this.common.params.button : 'Add';
    console.log(">>>>>>>>>?", this.common.params.targetEditData);

    if (this.common.params && this.common.params.targetEditData) {
      this.target.rowId = this.common.params.targetEditData.rowId ? this.common.params.targetEditData.rowId : null;
      this.target.campaignId = this.common.params.targetEditData.campaignId ? this.common.params.targetEditData.campaignId : null;
      this.target.campaignName = this.common.params.targetEditData.campaignName;
      this.target.name = this.common.params.targetEditData.name;
      this.target.potential = this.common.params.targetEditData.potential;
      this.target.mobile = this.common.params.targetEditData.mobile;
      this.target.locationId = this.common.params.targetEditData.locationId;
      this.target.locationName = this.common.params.targetEditData.locationName;
      this.target.lat = this.common.params.targetEditData.lat;
      this.target.long = this.common.params.targetEditData.long;
      this.target.address = this.common.params.targetEditData.address;
      this.target.fleetcategoryid = this.common.params.targetEditData.potCat;
      this.target.primaryOwnerid = this.common.params.targetEditData.priOwnId;
      this.target.primaryownername = this.common.params.targetEditData.priOwnname;
      this.target.fleetcategoryname = this.common.params.targetEditData.potCatname;
      this.target.campaignType = this.common.params.targetEditData.campainType;

    }
    console.log(this.target.fleetcategoryid);
  }

  closeModal() {
    this.activeModal.close({ response: false });
  }

  ngOnInit() {
  }

  getcampaignList() {
    this.common.loading++;
    this.api.get("CampaignSuggestion/getCampaignList").subscribe(res => {
      this.common.loading--;
      this.campaignDataList = res['data'];
    },
      err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
  }
  getLocationList() {
    this.common.loading++;
    this.api.get("CampaignSuggestion/getLocation").subscribe(res => {
      this.common.loading--;
      this.locationDataList = res['data'];
    },
      err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
  }
  getPrimaryOwnerList() {
    this.common.loading++;
    this.api.get("CampaignSuggestion/getPrimaryOwner").subscribe(res => {
      this.common.loading--;
      this.primaryownerDataList = res['data'];
    },
      err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
  }
  checkValidation() {
    console.log("Validation", this.target.potential);
    if (`${this.target.potential}`.length > 4) {
      return this.common.showError("range Between 0 to 9999")
    }
  }

  saveCampaignTarget() {

    if (!this.target.campaignId || !this.target.name || !this.target.mobile) return this.common.showError("Please Fill Require Field");

    const params = {
      campTargetId: this.target.rowId ? this.target.rowId : null,
      campaignId: this.target.campaignId,
      campaignType: this.target.campaignType,
      name: this.target.name,
      mobileNo: this.target.mobile,
      potential: this.target.potential,
      locationId: this.target.locationId,
      lat: this.target.lat,
      long: this.target.long,
      address: this.target.address,
      potentialCat:this.target.fleetcategoryid,
      primaryOwner:this.target.primaryOwnerid
    }
    console.log(params);

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