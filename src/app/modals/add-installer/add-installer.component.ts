import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { LocationSelectionComponent } from '../location-selection/location-selection.component';
@Component({
  selector: 'add-installer',
  templateUrl: './add-installer.component.html',
  styleUrls: ['./add-installer.component.scss']
})
export class AddInstallerComponent implements OnInit {
  installerData = {
    installerId: null,
    name: '',
    mobileno: '',
    partner: {
      id: null,
      name: ''
    },
    isApp: false,
    location: '',
    baseLat: '',
    baseLong: ''
  }
  keepGoing = true;
  searchString = '';
  // partnerList = [];

  constructor(public activeModal: NgbActiveModal,
    public modalService: NgbModal,
    public api: ApiService,
    public common: CommonService) {
    console.log('edit params', this.common.params)
    if (this.common.params != null && this.common.params.installer) {
      this.installerData = {
        installerId: this.common.params.installer._id,
        partner: {
          id: this.common.params.installer._partnerid,
          name: this.common.params.installer.partner_name
        },
        name: this.common.params.installer.name,
        mobileno: this.common.params.installer.mobileno,
        isApp: this.common.params.installer._isapp,
        location: this.common.params.installer.location,
        baseLat: this.common.params.installer._base_lat,
        baseLong: this.common.params.installer._base_long
      }
      console.log("edit data:", this.installerData);
    }

  }
  ngOnInit() {
  }


  selectedPartner(event) {
    this.installerData.partner.id = event.id;
    this.installerData.partner.name = event.name;
  }

  selectLocation(place) {
    console.log("palce", place);
    this.installerData.baseLat = place.lat;
    this.installerData.baseLong = place.long;
    this.installerData.location = place.location || place.name;
  }

  onChangeAuto(search) {
    this.installerData.baseLat = null;
    this.installerData.baseLong = null;
    this.installerData.location = null;
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
            console.log('new-response----', res, res.location);
            this.keepGoing = true;
            if (res.location.lat) {
              this.installerData.location = res.location.address;
              (<HTMLInputElement>document.getElementById('location')).value = this.installerData.location;
              this.installerData.baseLat = res.location.lat;
              this.installerData.baseLong = res.location.lng;
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

  addInstaller() {
    let params = {
      installerId: this.installerData.installerId,
      name: this.installerData.name,
      mobileno: this.installerData.mobileno,
      partnerid: this.installerData.partner.id,
      isapp: this.installerData.isApp,
      location: this.installerData.location,
      baseLat: this.installerData.baseLat,
      baseLong: this.installerData.baseLong
    }
    console.log(params);

    if (this.installerData.name == '' || this.installerData.mobileno == '' ||
      this.installerData.partner.id == null || this.installerData.location == null || this.installerData.location == ''
      || this.installerData.baseLat == null || this.installerData.baseLat == '' || this.installerData.baseLong == null || this.installerData.baseLong == '') {
      this.common.showError('Please Fill All Mandatory Fields');
      return false;
    }
    this.common.loading++;
    this.api.post('Installer/addNewInstaller', params)
      .subscribe(res => {
        this.common.loading--;
        console.log(res);
        if (res['code'] > 0) {
          this.common.showToast(res['msg']);
          this.closeModal(true);
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
