import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MapService } from '../../Service/map/map.service';
declare var google: any;

@Component({
  selector: 'show-installer',
  templateUrl: './show-installer.component.html',
  styleUrls: ['./show-installer.component.scss']
})
export class ShowInstallerComponent implements OnInit {
  @ViewChild('map', { static: true }) mapElement: ElementRef;

  installerList = [];
  requestData = {
    type: null,
    lat: 22.719568,
    long: 75.857727,
    zoom: 4.5
  }

  constructor(public activeModal: NgbActiveModal,
    public modalService: NgbModal,
    public common: CommonService,
    public api: ApiService,
    public mapService: MapService) {
    if (this.common.params && this.common.params.type) {
      this.requestData.type = this.common.params.type;
      this.requestData.lat = this.common.params.lat;
      this.requestData.long = this.common.params.long;
      console.log("requestData:", this.requestData);
    }

    if (this.requestData && this.requestData.type == 'nearestInstaller') {
      this.getNearestInstallerList();
      this.requestData.zoom = 12;
    } else {
      this.getAllInstallerLocationList();
    }
  }

  ngOnInit() { }

  ngAfterViewInit() {

    setTimeout(() => {
      this.mapService.mapIntialize('map', this.requestData.zoom, this.requestData.lat, this.requestData.long);
      setTimeout(() => {
        this.autoSuggestion();
      }, 2000);

      if (this.requestData && this.requestData.type == 'nearestInstaller') {
        this.mapService.createSingleMarker(this.mapService.createLatLng(this.requestData.lat, this.requestData.long), true);
      }
    }, 200);

  }

  closeModal(response) {
    this.activeModal.close();
  }

  getAllInstallerLocationList() {
    this.installerList = [];
    this.common.loading++;
    this.api.get('Installer/getAllInstallerLocationList.json?')
      .subscribe(res => {
        this.common.loading--;
        this.installerList = res['data'] || [];
        console.log('after get data call api', this.installerList);
        this.createInstallerMarkers();
      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }

  getNearestInstallerList() {
    let params = {
      lat: this.requestData.lat,
      long: this.requestData.long
    };
    this.installerList = [];
    this.common.loading++;
    this.api.post('Installer/getNearestInstallerList.json?', params)
      .subscribe(res => {
        this.common.loading--;
        this.installerList = res['data'] || [];
        console.log('getNearestInstallerList:', this.installerList);
        this.createInstallerMarkers();
      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }

  createInstallerMarkers() {
    this.mapService.createMarkers(this.installerList, false, false, ['location'], false, true);
  }

  autoSuggestion() {
    var source = document.getElementById('locationSearch');
    var options = {
      componentRestrictions: { country: ['in', 'bd', 'np'] },
      language: 'en',
      types: ['(regions)'],
    };
    var autocompleteOrigin = new google.maps.places.Autocomplete(source, options);
    google.maps.event.addListener(autocompleteOrigin, 'place_changed', this.updateLocationByTyping.bind(this, autocompleteOrigin));

  }
  updateLocationByTyping(autocomplete) {
    console.log('tets', autocomplete.getPlace());
    let place = autocomplete.getPlace();
    // this.SetParams(place);
    let lat = place.geometry.location.lat();
    let lng = place.geometry.location.lng();

    if (lat && lng) {
      let latLng = this.mapService.createLatLng(lat, lng);
      this.mapService.zoomAt(latLng, 12);
      // this.mapService.resetMarker(true);
      // setTimeout(() => {
      //   this.mapService.createSingleMarker(latLng, true);
      // }, 1000);

    }
  }

}
