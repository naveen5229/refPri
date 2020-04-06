import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MapService } from '../../Service/map/map.service';
declare var google: any;
declare let MarkerClusterer: any;

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
  placeholder = 'search location';

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
    let markers = this.mapService.createMarkers(this.installerList, false, false, ['location'], false, true);
    // let options = {
    //   gridSize: 10,
    //   maxZoom: 18,
    //   zoomOnClick: false,
    //   imagePath: "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m"
    // };

    // //console.log("markers:", markers);
    // setTimeout(() => {
    //   var locations = [
    //     { lat: -31.563910, lng: 147.154312 },
    //     { lat: -33.718234, lng: 150.363181 },
    //     { lat: -33.727111, lng: 150.371124 },
    //     { lat: -33.848588, lng: 151.209834 },
    //     { lat: -33.851702, lng: 151.216968 },
    //     { lat: -34.671264, lng: 150.863657 },
    //     { lat: -35.304724, lng: 148.662905 },
    //     { lat: -36.817685, lng: 175.699196 },
    //     { lat: -36.828611, lng: 175.790222 },
    //     { lat: -37.750000, lng: 145.116667 },
    //     { lat: -37.759859, lng: 145.128708 },
    //     { lat: -37.765015, lng: 145.133858 },
    //     { lat: -37.770104, lng: 145.143299 },
    //     { lat: -37.773700, lng: 145.145187 },
    //     { lat: -37.774785, lng: 145.137978 },
    //     { lat: -37.819616, lng: 144.968119 },
    //     { lat: -38.330766, lng: 144.695692 },
    //     { lat: -39.927193, lng: 175.053218 },
    //     { lat: -41.330162, lng: 174.865694 },
    //     { lat: -42.734358, lng: 147.439506 },
    //     { lat: -42.734358, lng: 147.501315 },
    //     { lat: -42.735258, lng: 147.438000 },
    //     { lat: -43.999792, lng: 170.463352 }
    //   ];
    //   var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    //   var markers = locations.map(function (location, i) {
    //     return new google.maps.Marker({
    //       position: location,
    //       label: labels[i % labels.length]
    //     });
    //   });
    //   console.log("markers", markers);
    //   this.markerCluster = new MarkerClusterer(this.mapService.map, markers, options);
    // }, 1000);
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

  markerCluster = null;
  // handleMarkerCluster(isShow: boolean) {
  //   if (this.markerCluster) this.markerCluster.clearMarkers();
  //   if (!isShow) {
  //     this.markers.map(marker => marker.marker.setMap(this.mapService.map));
  //     return;
  //   }
  //   let options = {
  //     gridSize: 60,
  //     maxZoom: 18,
  //     zoomOnClick: false,
  //     imagePath: "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m"
  //   };

  //   this.markerCluster = new MarkerClusterer(this.map, this.markers.map(marker => marker.marker), options);
  //   google.maps.event.addListener(this.markerCluster, 'clusterclick', (cluster) => {
  //     let content = '<div style="color:#000">' + cluster.getMarkers()
  //       .map((maker, index) => `${index + 1}. ${maker.title}`)
  //       .join('&nbsp;&nbsp;') + '</div>';
  //     console.log('content:', content);
  //     if (this.map.getZoom() <= this.markerCluster.getMaxZoom()) {
  //       if (!this.infoWindow)
  //         this.infoWindow = new google.maps.InfoWindow({ content });

  //       this.infoWindow.setContent(content);
  //       this.infoWindow.setPosition(cluster.getCenter());
  //       this.infoWindow.open(this.map, '');
  //     }
  //   });

  // }

}
