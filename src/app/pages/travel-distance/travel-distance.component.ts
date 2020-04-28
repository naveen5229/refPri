import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { UserService } from '../../Service/user/user.service';
import { MapService } from '../../Service/map/map.service';
declare var google: any;

@Component({
  selector: 'travel-distance',
  templateUrl: './travel-distance.component.html',
  styleUrls: ['./travel-distance.component.scss']
})
export class TravelDistanceComponent implements OnInit {
  map;
  poly;
  markers = [];
  values = [];
  phone;
  final = [];
  partnerId = null;
  startDate = new Date();
  endDate = new Date();
  selectedInstaller = [];
  travelDistanceData = [];
  partner = {
    id: null,
    name: ''
  };
  installer = {
    id: null,
    name: ''
  };
  requestData = {
    type: null,
    lat: 22.719568,
    long: 75.857727,
    zoom: 4.5
  }

  constructor(public api: ApiService,
    public user: UserService, public common: CommonService, public mapService: MapService) {
    this.partnerId = this.user._details.partnerid;


  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    var latlng = new google.maps.LatLng(26.901052, 75.790624);
    var opt = {
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
    var path = this.poly.getPath();

  }

  selectPartner(event) {
    this.partner.id = event.id;
    this.partner.name = event.name;
    this.installer.id = null;
    this.installer.name = '';
    if (event.id) {
      this.getInstallers(event.id);
    }
  }

  getInstallers(partnerId) {
    let params = {
      partnerId: partnerId
    }
    this.common.loading++;
    this.api.post("Installer/getInstallerListByPartner.json", params).subscribe(res => {
      console.log("data", res['data'])
      if (res['code'] > 0) {
        this.common.loading--;
        this.selectedInstaller = res['data'];
      } else {
        this.common.loading--;
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  selectInstaller(installer) {
    console.log(installer);
    this.installer.id = installer.id;
    this.installer.name = installer.name;
  }

  getTravelDistance() {
    if (!this.installer.id) {
      this.common.showError('Select Installer')
    } else {

      const params = '&installerId=' + this.installer.id + '&fromDate=' + this.common.dateFormatter1(this.startDate) + '&toDate=' + this.common.dateFormatter1(this.endDate);
      this.common.loading++;
      this.api.get("Location/getLatLongBtwTime.json?" + params).subscribe(res => {
        this.common.loading--;
        console.log(res);
        this.travelDistanceData = res['data'] || [];
        if (!this.travelDistanceData.length) {
          this.common.showError('No Data Found');
        } else {
          this.calcRoadDistance(this.travelDistanceData);
        }

      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
    }
  }

  calcRoadDistance(partnerVal) {
    this.removeProximate(partnerVal);
    this.plot(partnerVal);
  }

  removeProximate(val) {
    let values = val;
    let newValues = [];
    let lat1, long1, lat2, long2;
    newValues.push(values[0]);
    for (var i = 1; i < values.length; i++) {
      lat1 = values[i - 1].lat;
      long1 = values[i - 1].long;
      lat2 = values[i].lat;
      long2 = values[i].long;
      if (this.haversine(lat1, long1, lat2, long2, 2)) {
        newValues.push(values[i]);
      }
    }
    this.calFinal(newValues, this.mycallback);
  }

  calFinal(partnerValues, mycallback) {
    var aggrDistance = 0;
    var j = 1;
    for (var i = 1; i < partnerValues.length; i++) {
      var origin = new google.maps.LatLng(partnerValues[i - 1].lat, partnerValues[i - 1].long);
      var destination = new google.maps.LatLng(partnerValues[i].lat, partnerValues[i].long);
      var service = new google.maps.DistanceMatrixService();
      service.getDistanceMatrix(
        {
          origins: [origin],
          destinations: [destination],
          travelMode: 'DRIVING',
          avoidHighways: true,
          avoidTolls: true,
        }, (response, status) => {
          console.log(j);
          if (status != google.maps.DistanceMatrixStatus.OK) {
          } else {
            aggrDistance += mycallback(response);
            if (j == partnerValues.length - 1) {
              let final = [];
              final.push({
                "km": aggrDistance / 1000,
                "startDate": partnerValues[0].location_fetch_time,
                "endDate": partnerValues[partnerValues.length - 1].location_fetch_time
              });
              this.buildTable(final);
            }
          }
          j++;
        }
      );

    }
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

  plot(values) {
    var path = this.poly.getPath();
    console.log("plot");
    for (var i = 0; i < this.markers.length; i++) {
      this.markers[i].setMap(null);
    }
    this.markers = [];
    var contentString = [];
    this.poly.setMap(this.map);
    path.clear();
    var bounds = new google.maps.LatLngBounds();

    for (var i = 0; i < values.length; i++) {
      if (i != 0) {
        if (values[i].lat == values[i - 1].lat && values[i].long == values[i - 1].long) {
          contentString.push((i + 1) - 1 + "-" + (i + 1));
        }
      }
      var infowindow = new google.maps.InfoWindow({
        content: String(contentString)
      });
      var loc = new google.maps.LatLng(values[i].lat, values[i].long);
      var marker = new google.maps.Marker({
        position: loc,
        label: (i + 1).toString(),
        map: this.map
      });
      marker.addListener('click', function () {
        infowindow.open(this.map, marker);
      })
      this.markers.push(marker);
      marker.setMap(this.map);
      path.push(loc);
      bounds.extend(loc);
    }
    this.map.setCenter(bounds.getCenter()); //or use custom center
    this.map.fitBounds(bounds);
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
    this.installer.id = null;
    this.startDate = new Date();
    this.endDate = new Date();
  }

}
