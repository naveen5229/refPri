import { Component, ViewChild, ElementRef, OnInit, NgZone } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { state } from '@angular/animations';
import { stat } from 'fs';
import { CompileShallowModuleMetadata } from '@angular/compiler';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';

declare var google: any;

@Component({
  selector: 'location-selection',
  templateUrl: './location-selection.component.html',
  styleUrls: ['./location-selection.component.scss']
})

export class LocationSelectionComponent implements OnInit {
  title = '';
  placeholder = '';
  map: any;
  // @ViewChild('map', { static: false }) mapElement: ElementRef;
  @ViewChild('map', { static: true }) mapElement: ElementRef;
  name = null;
  location = {
    lat: 26.9124336,
    lng: 75.78727090000007,
    name: 'Jaipur, Rajasthan, India',
    district: 'jaipur',
    state: 'Rajasthan',
    dislat: 0.27092289999999863,
    dislng: 0.3012657000000445
  };
  data = [];
  r_id = null;
  marker: any;
  geocoder: any;
  markerOrigin: any;
  submitted = false;
  constructor(
    public common: CommonService,
    private activeModal: NgbActiveModal,
    private zone: NgZone,
    public api: ApiService) {
    this.title = this.common.params.title || 'Vehicle Location';
    this.placeholder = this.common.params.placeholder || 'Enter Drop Location';
    this.location = this.common.params.title ? {
      lat: null,
      lng: null,
      name: null,
      district: null,
      state: null,
      dislat: null,
      dislng: null
    } : this.location;
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.common.params['location']) {
        this.location = this.common.params['location'];
        this.loadMap(this.location.lat, this.location.lng);
      } else {
        this.loadMap();
      }
      this.geocoder = new google.maps.Geocoder;
    }, 1000);
    console.log("search:");
  }

  loadMap(lat = 26.9124336, lng = 75.78727090000007) {
    let mapOptions = {
      center: new google.maps.LatLng(lat, lng),
      zoom: 12,
      disableDefaultUI: true,
      mapTypeControl: false,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
    };
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    google.maps.event.addListener(this.map, 'click', evt => { this.updateLocationByClick(evt) });
    this.createMarker(lat, lng);
    setTimeout(() => {
      this.autoSuggestion();
    }, 2000);
  }

  resetData() {
    this.location.name = null;
    this.location.district = null;
    this.location.state = null;
    this.name = null;
  }

  updateLocationByClick(evt) {
    this.resetData();
    this.marker.setPosition(evt.latLng);
    this.geocoder.geocode({ 'location': evt.latLng }, this.getAddress.bind(this));
  }

  autoSuggestion() {
    console.log("search2:");
    var source = document.getElementById('location');
    console.log("search3:", source);
    var options = {
      componentRestrictions: { country: ['in', 'bd', 'np'] },
      language: 'en',
      types: ['(regions)'],
    };
    var autocompleteOrigin = new google.maps.places.Autocomplete(source, options);
    google.maps.event.addListener(autocompleteOrigin, 'place_changed', this.updateLocationByTyping.bind(this, autocompleteOrigin));

  }

  setMap(lat, lng) {
    this.marker.setPosition(new google.maps.LatLng(lat, lng));
    this.map.setCenter(new google.maps.LatLng(lat, lng));
  }

  verifyLocation() {
    if (!this.location.dislat || !this.location.dislng || !this.location.district || !this.location.lat || !this.location.lng || !this.location.name || !this.location.state)
      return false;
    return true;
  }

  SetParams(place) {
    this.resetData();
    place.address_components.forEach(element => {
      if (!this.location.name && element['types'][0] == "sublocality_level_1") {
        this.location.name = element.long_name;
      } else if (!this.location.name && element['types'][0] == "sublocality") {
        this.location.name = element.long_name;
      } else if (!this.location.name && element['types'][0] == "locality") {
        this.location.name = element.long_name;
      } else if (!this.location.state && element['types'][0] == "administrative_area_level_1") {
        this.location.state = element.long_name;
      } else if (!this.location.district && element['types'][0] == "administrative_area_level_2") {
        this.location.district = element.long_name;
      } else if (!this.location.district && element['types'][0] == "administrative_area_level_3") {
        this.location.district = element.long_name;
      } else if (!this.location.district && element['types'][0] == "administrative_area_level_4") {
        this.location.district = element.long_name;
      }
    });
    this.location.lat = place.geometry.location.lat();
    this.location.lng = place.geometry.location.lng();
    this.location.dislat = place.geometry.viewport.getNorthEast().lat() - place.geometry.viewport.getSouthWest().lat();
    this.location.dislng = place.geometry.viewport.getNorthEast().lng() - place.geometry.viewport.getSouthWest().lng();
    if (this.location.state && this.location.district && this.location.name) {
      this.name = this.location.name + "," + this.location.district + "," + this.location.state;
    } else {
      this.common.showError("Location Invalid");
    }
    if (this.location.lat && this.location.lng)
      this.setMap(this.location.lat, this.location.lng);
  }

  updateLocationByTyping(autocomplete) {
    console.log('tets', autocomplete.getPlace());
    let place = autocomplete.getPlace();
    this.SetParams(place);
  }
  createMarker(lat = 26.9124336, lng = 75.78727090000007) {
    this.marker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: new google.maps.LatLng(lat, lng),
      draggable: true
    });
  }

  getAddress(results, status) {
    console.log('results', results);
    console.log(status);
    if (results[0]) {
      this.location.lat = this.marker.getPosition().lat();
      this.location.lng = this.marker.getPosition().lng();
      let place = results[0];
      this.SetParams(place);
    }
  }

  addListerner(element, event, callback) {
    if (element)
      google.maps.event.addListener(element, event, callback);
  }

  closeModal(event) {
    if (!event) {
      this.activeModal.close();
    } else if (this.verifyLocation()) {
      let params = {
        locationId: null,
        locationName: this.location.name,
        district: this.location.district,
        state: this.location.state,
        locationLat: this.location.lat,
        locationLong: this.location.lng,
        distLat: this.location.dislat,
        distLong: this.location.dislng
      };
      this.common.loading++;
      this.api.getBooster('sitesOperation/insertLocationDetails', params)
        .subscribe(res => {
          console.log(res);
          this.common.loading--;
          this.data = res['data'];
          if (this.data[0]['r_id'] < 0) {
            this.common.showError(res['data'][0]['r_msg']);
          }
          else {
            this.common.showToast("Success");
            this.r_id = this.data[0].r_locid;
            this.activeModal.close({ location: this.location, id: this.r_id });
          }
        }, err => {
          console.log(err);
          this.common.loading--;
        });
    } else {
      this.common.showError("Invalid Location");
      this.resetData();
    }

  }
}

