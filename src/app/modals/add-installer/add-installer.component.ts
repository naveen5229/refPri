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
    name: '',
    mobileno: '',
    partner: {
      id: null,
      name: ''
    },
    isApp: false,
    baseLat: 25.01,
    baseLong: 26.01
  }
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


  constructor(public activeModal: NgbActiveModal,
    public modalService: NgbModal,
    public api: ApiService,
    public common: CommonService) {

  }
  ngOnInit() {
  }

  addInstaller() {

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

  closeModal() {
    // this.activeModal.close();
  }
}
