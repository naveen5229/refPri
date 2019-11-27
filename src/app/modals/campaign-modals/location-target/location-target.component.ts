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
  constructor(private activeModal: NgbActiveModal,
    public mapService: MapService,
    public common: CommonService,
    public api: ApiService,
    private zone: NgZone,
    public modalService: NgbModal) {
    this.common.handleModalSize("class", "modal-lg", "1200", "px");
    this.title = this.common.params.title ? this.common.params.title : "Location";
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

}
