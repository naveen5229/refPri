import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { range } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserService } from '../../@core/mock/users.service';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { MapService } from '../../Service/map/map.service';
import { RouteMapperComponent } from '../route-mapper/route-mapper.component';
declare var google: any;
import * as _ from 'lodash';

@Component({
  selector: 'ngx-calulate-travel-distance',
  templateUrl: './calulate-travel-distance.component.html',
  styleUrls: ['./calulate-travel-distance.component.scss']
})
export class CalulateTravelDistanceComponent implements OnInit {
  SwitchButton = 'Live';
  map;
  poly;
  markers = [];
  values = [];
  phone;
  imageArrayonMap = [];
  final = [];
  closebuttonForModel = false;
  startDate = new Date();
  endDate = new Date();
  adminList = [];
  travelDistanceData = [];
  admin = {
    id: null,
    name: ''
  };
  requestData = {
    type: null,
    lat: 22.719568,
    long: 75.857727,
    zoom: 4.5
  };
  installerMarker;
  wayPoints = null;
  multiMarkerInfoWindow: any;

  constructor(public activeModal: NgbActiveModal,
    public modalService: NgbModal,
    public api: ApiService,
    public user: UserService,
    public common: CommonService,
    public mapService: MapService) {
    this.resetData();

    console.log(this.common.params, 'params here')
    if (this.common.params) {
      this.admin = this.common.params.adminId;
      this.startDate = new Date(this.common.params.date);
      this.endDate = new Date(this.common.params.date);
      this.closebuttonForModel = this.common.params.close;
      this.startDate.setHours(0);
      this.startDate.setMinutes(0);
      this.endDate.setHours(23);
      this.endDate.setMinutes(59);
      this.getTravelDistance();
    }
    this.getAdmin();

  }

  ngOnInit() {
  }

  closeModal(response) {
    this.activeModal.close({ response: response })
  }

  ngAfterViewInit() {

    var latlng = new google.maps.LatLng(26.901052, 75.790624);
    var opt =
    {
      center: latlng,
      zoom: 7,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    // map initialization
    this.map = new google.maps.Map(document.getElementById("map"), opt);
    // polyline initializtion
    var polyOptions = {
      strokeColor: '#99999',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      icons: [{
        icon: { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW },
        offset: '100%',
        repeat: '40px'
      }]
    }
    this.poly = new google.maps.Polyline(polyOptions);
    this.poly.setMap(this.map);
    console.log('poly', this.poly);
    // return;
    var path = this.poly.getPath();
  }

  selectUser(installer) {
    console.log(installer);
    this.admin.id = installer.id;
    this.admin.name = installer.name;

  }

  getAdmin() {
    this.adminList = [];

    this.common.loading++;
    this.api.get('Admin/getAllAdmin.json')
      .subscribe(res => {
        this.common.loading--;
        if (res['code'] === 0) { this.common.showError(res['msg']); return false; };
        this.adminList = res['data'] || [];
        console.log(this.adminList);
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
  }

  getTravelDistance() {
    if (!this.admin.id) {
      this.common.showError('Select User')
    } else {

      const params = '&installerId=' + this.admin.id + '&fromDate=' + this.common.dateFormatter(this.startDate) + '&toDate=' + this.common.dateFormatter(this.endDate);
      this.common.loading++;
      this.api.get("Location/getLatLongBtwTime.json?" + params)
        .subscribe(res => {
          this.common.loading--;
          if (res['code'] === 0) { this.common.showError(res['msg']); return false; };
          let travelDistanceLatLng = res['data'] || [];

          if (travelDistanceLatLng[0]['wayPoints'] && travelDistanceLatLng[0]['wayPoints'].length > 0) {
            travelDistanceLatLng[0]['wayPoints'].forEach((element, index) => {
              element.label = index + 1;
            });
          }

          if (travelDistanceLatLng[1]['wayPointsLive'] && travelDistanceLatLng[1]['wayPointsLive'].length > 0) {
            travelDistanceLatLng[1]['wayPointsLive'].forEach((element, index) => {
              element.label = index + 1;
            });
          }
          this.travelDistanceData = travelDistanceLatLng || [];
          console.log("🚀 ~ file: calulate-travel-distance.component.ts ~ line 132 ~ CalulateTravelDistanceComponent ~ getTravelDistance ~ this.travelDistanceData", this.travelDistanceData)
          if (!this.travelDistanceData) {
            this.common.showError('No Data Found');
          } else {
            this.calcRoadDistance(this.travelDistanceData[0]);
          }

        }, err => {
          this.common.loading--;
          this.common.showError();
          console.log(err);
        });

    }
  }

  calcRoadDistance(partnerVal) {
    console.log("TravelDistanceComponent -> calcRoadDistance -> partnerVal", partnerVal);
    this.storeTable(partnerVal);
    // this.removeProximate(partnerVal['wayPointdata']);
    this.plotMarker(partnerVal['wayPoints']);
    // this.plotPath(partnerVal['wayPointdata']);
    setTimeout(() => {
      this.plotPath(partnerVal['wayPointdata']);
    }, 2000);
  }
  storeTable(partnerVal) {
    let final = [];
    final.push({
      "km": Math.round(partnerVal.dis / 1000),
      "startDate": this.common.changeDateformat2(partnerVal.wayPoints[0].location_fetch_time),
      "endDate": this.common.changeDateformat2(partnerVal.wayPoints[partnerVal.wayPoints.length - 1].location_fetch_time)
    });
    this.buildTable(final);
  }

  mycallback(response) {
    var row = [];
    var element;
    var distance;
    row = response.rows;
    element = row[0].elements;
    distance = element[0].distance;
    return distance.value;
  }

  buildTable(values) {
    this.final = values;

  }

  haversine(lat1, long1, lat2, long2, range) {
    var R = 6371000;
    var phi_1 = this.toRad(lat1);
    var phi_2 = this.toRad(lat2);
    let delta_phi = this.toRad((lat2 - lat1));
    let delta_lambda = this.toRad((long2 - long1));
    let a = Math.sin(delta_phi / 2.0) * Math.sin(delta_phi / 2.0) +
      Math.cos(phi_1) * Math.cos(phi_2) *
      Math.sin(delta_lambda / 2.0) * Math.sin(delta_lambda / 2.0);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    let km = (R * c) / 1000.0;

    if (km > range) {
      return true;
    }
    else
      return false;
  }


  toRad(value) {
    return (value * Math.PI) / 180;
  }


  infowindow = new google.maps.InfoWindow();
  plotMarker(values) {
    this.infowindow.opened = false;

    this.markers.map(marker => marker.setMap(null));
    this.markers = [];

    let groups = _.groupBy(values, loc => { return loc.lat + '_' + loc.long });
    console.log('groups:', groups);
    let count = 1;
    Object.keys(groups).map((key, i) => {
      const group = groups[key];
      let length = group.length

      let marker = new google.maps.Marker({
        position: { lat: group[0].lat, lng: group[0].long },
        label: length > 1 ? group[0].label + '-' + group[length - 1].label : group[0].label.toString(),
        map: this.map
      });

      count += length;

      google.maps.event.addListener(marker, "click", (event) => {
        if (this.infowindow) {
          this.infowindow.close();
          this.infowindow.opened = false;
        }
        if (this.multiMarkerInfoWindow) this.multiMarkerInfoWindow.setMap(null);
        if (group.length > 1) {
          if (!this.multiMarkerInfoWindow) {
            this.multiMarkerInfoWindow = new google.maps.InfoWindow({});
          }
          this.multiMarkerInfoWindow.setContent(this.setMultiMarkerContent(group));
          this.multiMarkerInfoWindow.open(this.map, marker);
        } else {

          console.log(event.latLng.lat())
          let lat = event.latLng.lat();
          let lng = event.latLng.lng();
          this.getImages(this.admin.id, lat, lng, group[0].time);
        }
      });

      this.markers.push(marker);
    })
  }

  setMultiMarkerContent(points) {
    let div = document.createElement('div');
    let style = `margin-right: 10px;
      width: 20px;
      height: 20px;
      background: red;
      display: inline-block;
      text-align: center;
      line-height: 20px;
      border-radius: 19px;
      cursor: pointer;
      font-weight: bold;`;

    points.map((point, i) => {
      let ele = document.createElement('span');
      ele.innerHTML = `<span style="${style}">${point.label}</span>`;
      ele.onclick = () => this.getImages(this.admin.id, point.lat, point.long, point.time)
      // ele.onclick = () => this.getImages(47, 19.2530844, 73.0154552, '2020-12-01T14:46:10.111754')
      div.appendChild(ele);
    });
    return div;
  }

  plotPath(values) {
    this.infowindow.opened = false;
    let thiss = this;
    var path = this.poly.getPath();
    console.log("plot");
    console.log(thiss.imageArrayonMap, 'images')

    this.poly.setMap(this.map);
    path.clear();
    var bounds = new google.maps.LatLngBounds();

    for (var i = 0; i < values.length; i++) {

      let loc = new google.maps.LatLng(values[i].lat, values[i].long);
      path.push(loc);
      bounds.extend(loc);
    }
    this.map.setCenter(bounds.getCenter()); //or use custom center
    this.map.fitBounds(bounds);
  }

  getImages(id, lat, lng, time) {
    console.log('time:', id, lat, lng, time);
    const params = `userId=${id}&lat=${lat}&long=${lng}&time=${time}`;
    this.api.get("Admin/getImageOnClick?" + params).subscribe((res: any) => {
      if (res['code'] === 0) { this.common.showError(res['msg']); return false; };
      this.imageArrayonMap = res.data || []
      console.log('images:', this.imageArrayonMap);
      this.showImages(lat, lng);
    }, err => {
      this.common.showError(err.msg)
    })
  }

  showImages(lat, lng) {
    let images = this.imageArrayonMap;
    let suffix = new Date().getTime();
    let activeSlide = 0;
    let html = `
      <div id="jrx-slider" style="height: 300px; position:relative;">
        <div id="pre-${suffix}" style="position: absolute;z-index: 999;color: #fff;font-size: 60px;top: 60px; cursor:pointer;">&lt;</div>
        <div>
          ${images.map((image, index) => {
      return `<div class="jrx-slide" style="display: ${!index ? 'block' : 'none'}; "><img src="${image._url}" style="width:100%; height: 100%;"></div>`
    }).join('')}
        </div>
        <div id="next-${suffix}" style="position: absolute;z-index: 999;color: #fff;font-size: 60px;top: 60px;right:0px; cursor:pointer;">&gt;</div>
      </div>
    `;

    this.infowindow = new google.maps.InfoWindow({
      content: html
    });

    if (images.length > 0) {
      let loc = new google.maps.LatLng(lat, lng);
      this.infowindow.setPosition(loc);
      // this.infowindow.open(this.map, this.installerMarker);
      this.infowindow.open(this.map);
    } else {
      return;
    }

    google.maps.event.addListener(this.infowindow, 'domready', () => {
      let ele = document.getElementById('jrx-slider').children[1];
      document.getElementById('pre-' + suffix).onclick = () => {
        if (activeSlide === 0) activeSlide = images.length - 1;
        else activeSlide--;

        for (let i = 0; i < images.length; i++) {
          ele.children[i]['style'].display = i === activeSlide ? 'block' : 'none';
        }
      }
      document.getElementById('next-' + suffix).onclick = () => {
        if (activeSlide === images.length - 1) activeSlide = 0;
        else activeSlide++;

        for (let i = 0; i < images.length; i++) {
          ele.children[i]['style'].display = i === activeSlide ? 'block' : 'none';
        }
      }
    });
  }

  clearMap() {
    this.resetData();
    var path = this.poly.getPath();
    for (var i = 0; i < this.markers.length; i++) {
      this.markers[i].setMap(null);
    }
    this.markers = [];
    path.clear();
  }

  resetData() {
    this.final = [];
    this.admin.id = null;
    this.startDate = new Date();
    this.endDate = new Date();
  }

  viewRoute() {
    let report = {
      startDate: this.startDate,
      endDate: this.endDate,
      userId: this.admin.id
    }
    this.common.params = report;
    this.modalService.open(RouteMapperComponent, { size: 'xl', container: 'nb-layout', backdrop: 'static' });
    // this.common.handleModalSize('class', 'modal-lg', '1200');

  }

  switchLatLngHandler() {
    switch (this.SwitchButton) {
      case 'Live':
        const seprateLiveObject = this.travelDistanceData[1];
        const manuplateLive = { dis: seprateLiveObject.disLive, wayPointdata: seprateLiveObject.wayPointdataLive, wayPoints: seprateLiveObject.wayPointsLive };
        console.log('Passed', manuplateLive);
        this.calcRoadDistance(manuplateLive);
        this.SwitchButton = 'Recorded';
        break;
      case 'Recorded':
        console.log('Passed', this.travelDistanceData[0]);
        this.calcRoadDistance(this.travelDistanceData[0]);
        this.SwitchButton = 'Live';
        break;
    }
  }

}