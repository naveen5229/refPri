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

  startDate = new Date();
  endDate = new Date();
  driverId = null;
  driverLatLong = [];
  travelStartDate=null;
  travelEndDate=null;
  totalDistance=0;
  constructor(public mapService: MapService,
    public common: CommonService,
    public api: ApiService) {
      //console.log("distance",this.di(53.32055555555556,-1.7297222222222221,53.31861111111111,-1.6997222222222223))
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.mapService.mapIntialize("map", 18, 25, 75, true);
  }

  getDriverLatLongs() {
    this.common.loading++;
    let params = "driverId=" + this.driverId + "&startTime=" + this.common.changeDateformat1(this.startDate) + "&endTime=" + this.common.changeDateformat1(this.endDate);
    this.api.get("Drivers/getDriverLatLong?" + params)
      .subscribe(res => {
        this.common.loading--;
        console.log("res", res['data']);
        this.driverLatLong = res['data'];
        if (this.driverLatLong && this.driverLatLong.length) {
          this.travelStartDate=this.driverLatLong[0].location_fetch_time;
          this.travelEndDate=this.driverLatLong[this.driverLatLong.length-1].location_fetch_time;
          console.log("date1234",this.travelStartDate,this.travelEndDate);
          this.createrouteMarker();
          this.calculateDistance();
        }
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
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
    this.driverLatLong.map((data) => {
      data['color'] = 'FF0000';
      data['subType'] = 'marker';
      this.mapService.createPolyPathManual(this.mapService.createLatLng(data.lat, data.long), polygonOption);
    });
   
    // for (let i = 0; i < this.driverLatLong.length; i++) {
    // //   this.mapService.createPolyPathManual(this.mapService.createLatLng(this.driverLatLong[i].lat, this.driverLatLong[i].long), polygonOption);
    // // }
     this.mapService.createMarkers(this.driverLatLong);
     
  }

  calculateDistance(){
     this.totalDistance=0;
    for (let i = 1; i < this.driverLatLong.length; i++) {
      let lati1 = this.driverLatLong[i - 1].lat;
      let  long1 = this.driverLatLong[i - 1].long;
      let lati2 = this.driverLatLong[i].lat;
       let long2 = this.driverLatLong[i].long;
      this.totalDistance=this.totalDistance+this.calcDistance(lati1, long1, lati2, long2)
    }
    console.log("totalDistance",this.totalDistance);

  }

  calcDistance(lati1, lon1, lati2, lon2) 
    {
      var R = 6371; // km
      let dLat = this.toRad(lati2-lati1);
      let dLon = this.toRad(lon2-lon1);
      let lat1 = this.toRad(lati1);
      let lat2 = this.toRad(lati2);

      let a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      var d = R * c;
      return d;
    }

   toRad(Value) 
    {
        return Value * Math.PI / 180;
    }


}
