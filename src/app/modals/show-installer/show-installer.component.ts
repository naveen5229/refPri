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

  constructor(public activeModal: NgbActiveModal,
    public modalService: NgbModal,
    public common: CommonService,
    public api: ApiService,
    public mapService: MapService) {
    // if (this.common.params && this.common.params.installerList) {
    //   this.installerList = this.common.params.installerList;
    //   console.log("installerList:", this.installerList);
    // }
  }

  ngOnInit() { }

  requestData = {
    lat: 22.719568,
    long: 75.857727
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.mapService.mapIntialize('map', 4.5, this.requestData.lat, this.requestData.long);
      setTimeout(() => {
        this.autoSuggestion();
      }, 2000);
      this.getAllInstallerLocationList();
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
