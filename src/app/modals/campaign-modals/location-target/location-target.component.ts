import { Component, OnInit, NgZone } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MapService } from '../../../Service/map/map.service';
import { CommonService } from '../../../Service/common/common.service';
import { ApiService } from '../../../Service/Api/api.service';

@Component({
  selector: 'ngx-location-target',
  templateUrl: './location-target.component.html',
  styleUrls: ['./location-target.component.scss']
})
export class LocationTargetComponent implements OnInit {
  title = ""
  filterData = [];
  viaMark = [];
  campaignId = null;
  infoWindow = null;
  insideInfo = null;

  constructor(private activeModal: NgbActiveModal,
    public mapService: MapService,
    public common: CommonService,
    public api: ApiService,
    private zone: NgZone,
    public modalService: NgbModal) {
    this.common.handleModalSize("class", "modal-lg", "1200", "px");
    this.title = this.common.params.title ? this.common.params.title : "Location";
    this.campaignId = this.common.params.campaignId ? this.common.params.campaignId : null;
    if(this.campaignId) this.getViewLocationData();
  }

  ngOnInit() {
  }

  closeModal() {
    this.activeModal.close();
  }

  ngAfterViewInit() {
    this.mapService.mapIntialize("map");
    this.mapService.setMapType(0);
    this.mapService.zoomMap(5);
    this.mapService.map.setOptions({ draggableCursor: 'cursor' });

    setTimeout(() => {
      this.mapService.addListerner(this.mapService.map, 'click', evt => {
      });
    }, 1000);
  }


  getViewLocationData() {
    this.common.loading++;
    this.api.get('campaigns/getAllTargetWrtCamp?campaignId=' + this.campaignId)
      .subscribe(res => {
        this.common.loading--;
        console.log("api data", res);
        if (!res['data']) return;
        this.filterData = res['data'];
        this.createrouteMarker();

      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }

  createrouteMarker() {
    if (this.filterData && this.filterData.length) {
      this.filterData.filter(marker => {
        marker['subType'] = 'marker';
      });
    }
    if (this.viaMark.length) {
      this.mapService.resetMarker(true, true, this.viaMark);
    }
    this.viaMark = this.mapService.createMarkers(this.filterData, false, false);
    this.mapService.centerAt(this.mapService.createLatLng(this.filterData[0].lat, this.filterData[0].long));
    let markerIndex = 0
    for (const marker of this.viaMark) {
      let event = this.filterData[markerIndex];
      this.mapService.addListerner(marker, 'mouseover', () => this.setEventInfo(event));
      this.mapService.addListerner(marker, 'mouseout', () => this.unsetEventInfo());
      markerIndex++;
    }
  }



  setEventInfo(event) {
    console.log("Event", event);
    if (event) {
      this.insideInfo = new Date().getTime();
      if (this.infoWindow) {
        this.infoWindow.close();
      }
      this.infoWindow = this.mapService.createInfoWindow();
      this.infoWindow.opened = false;
      this.infoWindow.setContent(`
      <p>Campaign Id :${event.campaign_id}</p>
      <p>Name :${event.name}</p>`);
      this.infoWindow.setPosition(this.mapService.createLatLng(event.lat, event.long));
      this.infoWindow.open(this.mapService.map);
    }
  }


  async unsetEventInfo() {
    let diff = new Date().getTime() - this.insideInfo;
    if (diff > 200) {
      this.infoWindow.close();
      this.infoWindow.opened = false;
    }
  }

}
