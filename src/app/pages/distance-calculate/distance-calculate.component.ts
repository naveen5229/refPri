import { Component, OnInit } from '@angular/core';
import { MapService } from '../../Service/map/map.service';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';

@Component({
  selector: 'ngx-distance-calculate',
  templateUrl: './distance-calculate.component.html',
  styleUrls: ['./distance-calculate.component.scss']
})
export class DistanceCalculateComponent implements OnInit {

  startDate = null;
  endDate = null;
  driverId = null;
  driverLatLong = [];
  travelStartDate = null;
  travelEndDate = null;
  totalDistance = 0;
  constructor(public mapService: MapService,
    public common: CommonService,
    public api: ApiService) {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.mapService.mapIntialize("map");
  }

  getDriverLatLongs() {
    if (this.driverId==null) {
      this.common.showError("Please Enter Name");
      return;
    } else if (this.startDate==null) {
      this.common.showError("startDate Is missing");
      return;
    } else if (this.endDate==null) {
      this.common.showError("Enddate Is missing");
    } else if (this.startDate > this.endDate) {
      this.common.showError("startDate is always less then EndDate")
    } else {
      this.common.loading++;
      let params = "driverId=" + this.driverId + "&startTime=" + this.common.changeDateformat1(this.startDate) + "&endTime=" + this.common.changeDateformat1(this.endDate);
      this.api.get("Drivers/getDriverLatLong?" + params)
        .subscribe(res => {
          this.common.loading--;
          if(res['code']===0) { this.common.showError(res['msg']); return false;};
          this.driverLatLong = res['data'];
          if (this.driverLatLong && this.driverLatLong.length) {
            this.travelStartDate = this.driverLatLong[0].location_fetch_time;
            this.travelEndDate = this.driverLatLong[this.driverLatLong.length - 1].location_fetch_time;
            this.createrouteMarker();
            this.calculateDistance();
          }else{
            alert("NO DATA FOUND");
          }
        }, err => {
          this.common.loading--;
          this.common.showError();
          console.log('Error: ', err);
        });
    }

  }

  createrouteMarker() {
    this.mapService.clearAll();
    let polygonOption = {
      strokeColor: '#99999',
      strokeOpacity: 0.8,
      strokeWeight: 1,
      icons: [{
        icon: this.mapService.lineSymbol,
        offset: '100%',
        repeat: '40px'
      }]
    };
    this.driverLatLong.forEach((data)=>{
      data['color'] = 'FF0000';
      data['subType'] = 'marker';
    })
    this.mapService.createMarkers(this.driverLatLong);
    this.driverLatLong.map((data) => {   
      this.mapService.createPolyPathManual(this.mapService.createLatLng(data.lat, data.long), polygonOption);
    });
    
  }

  calculateDistance() {
    this.totalDistance = 0;
    for (let i = 1; i < this.driverLatLong.length; i++) {
      let lati1 = this.driverLatLong[i - 1].lat;
      let long1 = this.driverLatLong[i - 1].long;
      let lati2 = this.driverLatLong[i].lat;
      let long2 = this.driverLatLong[i].long;
      this.totalDistance = this.totalDistance + this.calcDistance(lati1, long1, lati2, long2)
    }
    console.log("totalDistance", this.totalDistance);
  }

  calcDistance(lati1, lon1, lati2, lon2) {
    let R = 6371; // km
    let dLat = this.toRad(lati2 - lati1);
    let dLon = this.toRad(lon2 - lon1);
    let lat1 = this.toRad(lati1);
    let lat2 = this.toRad(lati2);
    let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
  }

  toRad(Value) {
    return Value * Math.PI / 180;
  }


}
