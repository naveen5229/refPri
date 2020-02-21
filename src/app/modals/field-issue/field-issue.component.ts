import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { LocationSelectionComponent } from '../location-selection/location-selection.component';

@Component({
  selector: 'field-issue',
  templateUrl: './field-issue.component.html',
  styleUrls: ['./field-issue.component.scss']
})
export class FieldIssueComponent implements OnInit {
  vehicleStatus = null;
  keepGoing = true;
  searchString = '';
  isNotified = false;
  vehicleTrip = {
    endLat: null,
    endLng: null,
    endName: null,
    targetTime: null,
    id: null,
    regno: null,

    startName: null,

    placementType: null,
    vehicleId: null,
    siteId: null,
    locationType: 'city',
    allowedHaltHours: null
  };
  placements = null;
  placementSite = null;
  placementSuggestion = [];
  ref_page = null;
  companiesList = [];
  requestTypes = [];
  deviceModals = [];
  requestData = {
    requestId: null,
    partner: {
      id: 0,
      name: ''
    },
    company: {
      id: 0,
      name: ''
    },
    request_type: {
      id: 0,
      name: ''
    },
    regno: '',
    device_model: {
      id: 0,
      name: ''
    },
    driver_name: '',
    driver_mobileno: '',
    supervisor_name: '',
    supervisor_mobileno: '',
    sim_provider_id: 0,
    location: '',
    lat: '',
    long: '',
    remark: ''
  }

  constructor(public activeModal: NgbActiveModal,
    public modalService: NgbModal,
    public api: ApiService,
    public common: CommonService) {
    console.log('edit params', this.common.params)
    if (this.common.params != null) {
      this.requestData = {
        requestId: this.common.params.request._id,
        partner: {
          id: this.common.params.request._partner_id,
          name: this.common.params.request.partner_name
        },
        company: {
          id: this.common.params.request._company_id,
          name: this.common.params.request.company_name
        },
        request_type: {
          id: this.common.params.request._request_type_id,
          name: this.common.params.request.request_type
        },
        regno: this.common.params.request.regno,
        device_model: {
          id: this.common.params.request._device_model_id,
          name: this.common.params.request.device_model
        },
        driver_name: this.common.params.request.driver_name,
        driver_mobileno: this.common.params.request.driver_mobileno,
        supervisor_name: this.common.params.request.supervisor_name,
        supervisor_mobileno: this.common.params.request.supervisor_mobileno,
        sim_provider_id: (this.common.params.request._sim_provider_id > 0) ? this.common.params.request._sim_provider_id : 0,
        location: this.common.params.request.location_name,
        lat: this.common.params.request._lat,
        long: this.common.params.request._long,
        remark: this.common.params.request.remark
      }
      console.log("edit data:", this.requestData);
    }
    // this.getCompanyDetails();
    this.getRequestType();
    this.getDeviceModals();
  }

  ngOnInit() {
  }

  getCompanyDetails() {
    this.common.loading++;
    this.api.get("Suggestion/getCompanyName.json?")
      .subscribe(res => {
        this.common.loading--;
        this.companiesList = res['data'] || [];
        console.log(this.requestTypes);
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
  }

  getRequestType() {
    this.common.loading++;
    this.api.get("Grid/getRequestType")
      .subscribe(res => {
        this.common.loading--;
        this.requestTypes = res['data'] || [];
        console.log(this.requestTypes);
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
  }

  getDeviceModals() {
    this.common.loading++;
    this.api.get("Grid/getDeviceModals")
      .subscribe(res => {
        this.common.loading--;
        this.deviceModals = res['data'] || [];
        console.log(this.requestTypes);
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
  }

  selectCompany(selectedCompany) {
    this.requestData.company.id = selectedCompany.id;
    this.requestData.company.name = selectedCompany.name;
  }

  selectRequestType(selectedRequestType) {
    this.requestData.request_type.id = selectedRequestType.id;
    this.requestData.request_type.name = selectedRequestType.name;
    console.log(this.requestData.request_type);
  }

  selectDeviceModal(selectedDevieModel) {
    this.requestData.device_model.id = selectedDevieModel.id;
    this.requestData.device_model.name = selectedDevieModel.name;
  }
  selectPartner(event) {
    this.requestData.partner.id = event.id;
    this.requestData.partner.name = event.name;
  }

  addRequest() {
    let params = {
      requestId: this.requestData.requestId,
      driverName: this.requestData.driver_name,
      driverMobileno: this.requestData.driver_mobileno,
      supervisorName: this.requestData.supervisor_name,
      supervisorMobileno: this.requestData.supervisor_mobileno,
      requestTypeId: this.requestData.request_type.id,
      companyId: this.requestData.company.id,
      regno: this.requestData.regno,
      deviceModelId: this.requestData.device_model.id,
      simProviderId: this.requestData.sim_provider_id,
      location: this.requestData.location,
      lat: 2323.33,
      long: 34234.33,
      remark: this.requestData.remark
    }
    console.log(params);

    if (this.requestData.supervisor_name != '' && this.requestData.supervisor_mobileno != '' &&
      this.requestData.device_model.id != null && this.requestData.company.id && this.requestData.request_type.id != null
      && this.requestData.location != null) {
      this.common.loading++;
      this.api.post('Grid/addFieldSupportRequest', params)
        .subscribe(res => {
          this.common.loading--;
          console.log(res);
          if (res['code'] > 0) {
            if (res['data'][0]['y_id'] > 0) {
              this.common.showToast(res['data'][0].y_msg)
              this.closeModal(true);
            } else {
              this.common.showError(res['data'][0].y_msg)
            }
          } else {
            this.common.showError(res['msg']);
          }
        }, err => {
          this.common.loading--;
          this.common.showError();
          console.log(err);
        });
    }
    else {
      this.common.showError('Please Fill All Mandatory Fields');
    }
  }

  selectLocation(place) {
    console.log("palce", place);
    this.placementSite = place.id;
    this.vehicleTrip.siteId = null;
    this.vehicleTrip.endLat = place.lat;
    this.vehicleTrip.endLng = place.long;
    this.vehicleTrip.endName = place.location || place.name;
  }

  onChangeAuto(search) {
    this.placementSite = null;
    this.vehicleTrip.siteId = null;
    this.vehicleTrip.endLat = null;
    this.vehicleTrip.endLng = null;
    this.vehicleTrip.endName = null;
    this.searchString = search;
    console.log('..........', search);
  }

  takeAction(res) {
    setTimeout(() => {
      console.log("Here", this.keepGoing, this.searchString.length, this.searchString);

      if (this.keepGoing && this.searchString.length) {
        this.common.params = { placeholder: 'selectLocation', title: 'SelectLocation' };

        const activeModal = this.modalService.open(LocationSelectionComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
        this.keepGoing = false;
        activeModal.result.then(res => {
          if (res != null) {
            console.log('response----', res, res.location, res.id);
            this.keepGoing = true;
            if (res.location.lat) {
              this.vehicleTrip.endName = res.location.name;

              (<HTMLInputElement>document.getElementById('endname')).value = this.vehicleTrip.endName;
              this.vehicleTrip.endLat = res.location.lat;
              this.vehicleTrip.endLng = res.location.lng;
              this.placementSite = res.id;
              this.keepGoing = true;
            }
          }
        })

      }
    }, 1000);

  }

  closeModal(response) {
    this.activeModal.close({ response: response });
  }

}
