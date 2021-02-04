import { Component, NgZone, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { MapService } from '../../Service/map/map.service';

@Component({
  selector: 'ngx-location-on-site-image',
  templateUrl: './location-on-site-image.component.html',
  styleUrls: ['./location-on-site-image.component.scss']
})
export class LocationOnSiteImageComponent implements OnInit {

  table = null;
  status = {
    '0': 'pending',
    '1': 'Active',
    '-1': 'Rejected'
  }
  location = {
    lat: null,
    long: null
  }

  map = null;
  route
  marker = null;
  markers = [];
  routeData = [];
  constructor(public common: CommonService,
    private activeModal: NgbActiveModal,
    private zone: NgZone,
    public api: ApiService,
    public mapService: MapService) {
    this.routeData = this.common.params.filterData;
    console.log("🚀 ~ file: locationonsideimage.component.ts ~ line 36 ~ LocationonsideimageComponent ~ this.routeData", this.routeData)
    if (this.routeData != null) {
      this.table = this.setTable();
    }
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.mapService.mapIntialize("map", 16);
    this.mapService.setMapType(0);
    this.map = this.mapService.map;
    setTimeout(() => {
      this.generateEventsMarkers();
    }, 2000)
  }

  setTable() {
    let headings = {
      Time: { title: 'Time', placeholder: 'Time', class: 'alignText' },
      // SiteType: { title: 'Site Type', placeholder: 'Site Type' },
      Status: { title: 'Status', placeholder: 'Status', class: 'tag' },
    };
    return {
      data: {
        headings: headings,
        columns: this.getTableColumns()
      },
      settings: {
        hideHeader: true,
        tableHeight: "auto"
      }
    }
  }
  getTableColumns() {
    console.log("SITES:", this.routeData);
    let columns = [];
    this.routeData.map(res => {
      let column = {
        Time: { value: res.addtime, class: 'pdng' },
        // SiteType: { value: res.sitetype },
        Status: { value: (res._status == 0 ? 'Pending' : (res._status == 1 ? 'Active' : 'Reject')), class: 'icon text-center' },
      };
      columns.push(column);
    });
    return columns;
  }

  generateEventsMarkers() {
    this.markers.map(marker => marker.setMap(null));

    let events = this.routeData.map(loc => {
      return {
        lat: loc['_lat'],
        lng: loc['_long'],
        msg: loc['addtime']
      }
    });
    console.log(events);
    this.markers = events.map((event, index) => {
      let color = '#00ff00';
      let marker = new google.maps.Marker({
        position: event,
        map: this.map,
        title: event.msg
      });
      return marker;
    });

    this.map.panTo({ lat: this.routeData[0]['_lat'], lng: this.routeData[0]['_long'] });
  }

  closeModal(res) {
    this.activeModal.close();
  }

}