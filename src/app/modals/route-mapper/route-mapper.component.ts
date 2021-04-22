import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { MapService } from '../../Service/map/map.service';
interface Report {
  name: string; // Abhishek Jangir axes
  department: string; // AT-Operation
  attendance: string; // Present
  mobile: number; // 7976410490
  lastFetch: string; // 30 Oct 20 18:16
  lat: number; // 26.577875
  lng: number; // 74.8395645
  loc: boolean; // true or false
  net: boolean; // true or false
  wifi: boolean; // true or false
  userId: number; // 160
  addTime: string; // 2020-10-30T18:16:23.793977
};

interface Location {
  lat: number; // 26.5771167
  location_fetch_time: string;// "2020-10-31T09:45:05"
  lng: number; //74.8391989
}

@Component({
  selector: 'ngx-route-mapper',
  templateUrl: './route-mapper.component.html',
  styleUrls: ['./route-mapper.component.scss']
})
export class RouteMapperComponent implements OnInit {
  report: Report;
  userId = null;
  // startDate = new Date(this.common.getDate(-1));
  // endDate = new Date(this.common.getDate())
  startDate = this.common.getDate(-1);
  endDate = this.common.getDate()
  locations: Location[] = [];
  isRouteTrakingOn: boolean = false;
  map = null;
  marker = null;
  completeRoutePolyline = null;
  routeMapperPolyline = null;
  routeMapperPolylinePath = [];
  routeTrackingInterval = null;
  routeTrackingSpeed = 1;
  speeds = [
    { name: '0.1x', value: 1000 },
    { name: '0.25x', value: 600 },
    { name: '0.5x', value: 400 },
    { name: '0.75x', value: 300 },
    { name: '1x', value: 200 },
    { name: '2x', value: 100 },
    { name: '3x', value: 10 },
    { name: '4x', value: 1 },
  ];

  infoWindows = [];
  markers = [];
  routeRange = 1;
  routeDataIndex = -1;

  constructor(public activeModal: NgbActiveModal, private api: ApiService, private common: CommonService,
    private mapService: MapService) {
    this.report = this.common.params;
    console.log("report:", this.common.params);
    this.userId = this.common.params.userId;
    this.startDate = this.common.params.startDate;
    this.endDate = this.common.params.endDate;
    this.getLocationLogs();
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.mapService.mapIntialize("route-maper-map", 10);
    this.mapService.setMapType(0);
    this.map = this.mapService.map;
  }

  getLocationLogs() {
    console.log('dates', this.startDate, this.endDate);
    const params = `fromDate=${this.common.dateFormatter(this.startDate)}&toDate=${this.common.dateFormatter(this.endDate)}&userId=${this.userId}`;
    this.common.loading++;
    this.api.get('Admin/getLocationLogsWrtUser?' + params)
      .subscribe((res: any) => {
        this.common.loading--;
        if (res['code'] === 0) { this.common.showError(res['msg']); return false; };
        let locations = res.data.filter(item => {
          return new Date(item.location_fetch_time).getTime() >= new Date(this.startDate).getTime() &&
            new Date(item.location_fetch_time).getTime() <= new Date(this.endDate).getTime();
        });
        this.locations = locations;
        console.log("locations", this.locations)
        if (this.locations && this.locations.length) {
          this.createCompleteRoute();
          this.setMarker(this.locations[0]);
          if (!this.routeMapperPolyline) this.initPolyline();
        } else {
          if (this.completeRoutePolyline) {
            this.completeRoutePolyline.setMap(null);
            this.setMarker(null);
          }
        }
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log('err:', err);
      });
  }

  closeModal(response) {
    this.activeModal.close({
      response: response
    });
  }


  createCompleteRoute() {
    if (this.completeRoutePolyline)
      this.completeRoutePolyline.setMap(null);
    this.completeRoutePolyline = new google.maps.Polyline({
      path: this.locations,
      geodesic: true,
      strokeColor: '#999',
      strokeOpacity: 1.0,
      strokeWeight: 2
    });

    this.completeRoutePolyline.setMap(this.map);
  }


  createInfoWindow(content) {
    return new google.maps.InfoWindow({ content });
  }

  infoWindowOpner(index, event) {
    this.infoWindows[index].open(this.map, this.markers[index]);
  }

  stopRouteTracking() {
    this.routeMapperPolylinePath['clear']();
    this.isRouteTrakingOn = false;
    this.setMarker(new google.maps.LatLng(this.locations[0].lat, this.locations[0].lng));
  }

  setMarker(position) {
    if (!this.marker) {
      this.marker = new google.maps.Marker({
        position: position,
        map: this.map,
        icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|FFF000'
      });
    } else {
      this.marker.setPosition(position);
    }
    this.map.panTo(position);
  }

  startRouteTracking() {
    if (!this.locations.length) return;
    this.stopRouteTracking();
    this.isRouteTrakingOn = true;
    this.routeMaker(0);
  }

  initPolyline() {
    this.routeMapperPolyline = new google.maps.Polyline({
      path: [new google.maps.LatLng(this.locations[0].lat, this.locations[0].lng)],
      geodesic: true,
      strokeColor: '#000',
      strokeOpacity: 1.0,
      strokeWeight: 2
    });
    this.routeMapperPolyline.setMap(this.map);
    this.routeMapperPolylinePath = this.routeMapperPolyline.getPath();
  }


  routeMaker(index, isRanger?) {
    if (index === this.locations.length) {
      this.routeRange = 100;
      return;
    }
    let latLng = new google.maps.LatLng(this.locations[index].lat, this.locations[index].lng);
    if (isRanger) {
      this.routeMapperPolylinePath['clear']();
      for (let i = 0; i <= index; i++) {
        this.routeMapperPolylinePath.push(new google.maps.LatLng(this.locations[i].lat, this.locations[i].lng));
      }
    } else {
      this.routeMapperPolylinePath.push(latLng);
      let point1 = (this.locations.length) / 100;
      let percentage = index / point1;
      this.routeRange = Math.ceil(percentage);
    }
    this.marker.setPosition(latLng);
    this.map.panTo(latLng)
    index++;
    this.isRouteTrakingOn && setTimeout(this.routeMaker.bind(this, index), this.routeTrackingSpeed);

  }

  setRouteRange() {
    if (!this.locations.length) return;
    this.isRouteTrakingOn = false;
    let point1 = (this.locations.length - 1) / 100;
    if (this.routeRange == 1) this.routeMaker(0, true);
    else if (this.routeRange == 100) this.routeMaker(this.locations.length - 1, true);
    else this.routeMaker(Math.floor(point1 * this.routeRange), true);
  }



}
