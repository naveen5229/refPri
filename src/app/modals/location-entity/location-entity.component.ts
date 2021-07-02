import { Component, NgZone, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { MapService } from '../../Service/map/map.service';

@Component({
  selector: 'ngx-location-entity',
  templateUrl: './location-entity.component.html',
  styleUrls: ['./location-entity.component.scss']
})
export class LocationEntityComponent implements OnInit {
  location = {
    lat: null,
    long: null
  }
  type = "entity";
  entityTypes = [];
  entityType = null;
  entityTypeName = null;
  entity = null;
  title = "Location Entity Mapping";
  constructor(public common: CommonService,
    private activeModal: NgbActiveModal,
    public api: ApiService,
    public mapService: MapService) {
    this.common.handleModalSize("class", "modal-lg", "1200", "px");
    console.log("params==", this.common.params);
    this.location.lat = this.common.params && this.common.params.lat ? this.common.params.lat : null;
    this.location.long = this.common.params && this.common.params.lng ? this.common.params.lng : null;
    this.mapService.afterDragLat = this.location.lat;
    this.mapService.afterDragLng = this.location.long;
    this.getEntityType();
  }

  ngOnInit() {
  }

  marker = null;
  ngAfterViewInit() {
    this.mapService.mapIntialize("map1", 16);
    this.mapService.setMapType(0);
    setTimeout(() => {
      this.marker = this.mapService.createDraggableMarker(this.location.lat, this.location.long);
    }, 2000)
  }

  getEntityType() {
    this.common.loading++;
    this.api.get('Entities/getEntityTypes').subscribe(res => {
      this.common.loading--;
      if (res['code'] > 0) {
        if (!res['data']) return;
        this.entityTypes = res['data'] || [];
        this.entityType = res['data'][0]._id;
        this.entityTypeName = res['data'][0].type;
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log(err);
    });
  }


  closeModal(res) {
    this.activeModal.close({ response: res });
  }

  setEntity(event){
    if(event._id){
      this.entity=event.id;
    }else{
      this.saveEntity();
    }
  }

  mapEntity() {
    this.common.loading++;
    let params = {
      entity: this.entity,
      lat: this.mapService.afterDragLat,
      lng: this.mapService.afterDragLng,
      imageId:this.common.params && this.common.params.imageId ? this.common.params.imageId : null
    }
    console.log("params=", params);
    this.api.post('Entities/saveEntityMapping', params).subscribe(res => {
      this.common.loading--;
      if (res['data'][0]['y_id'] > 0) {
        this.common.showToast(res['msg']);
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log(err);
    });
  }

  saveEntity() {
    console.log(document.getElementById('entityId')['value']);
    let params = {
      name: document.getElementById('entityId')['value'],
      entityTypeId: this.entityType
    };

    let apiBase = `Entities/saveEntity`;
    // console.log('final data',apiBase,params);return;
    this.common.loading++;
this.api.post(apiBase, params).subscribe(res => {
  this.common.loading--;
  if (res['code'] == 1) {
    console.log(res);
    this.entity = res['data'][0].y_id;
    this.common.showToast(res['msg']);
  } else {
    this.common.showError(res['msg']);
  }
}, err => {
  this.common.loading--;
  this.common.showError();
  console.log('Error: ', err);
});
console.log(apiBase, params)
  }
}