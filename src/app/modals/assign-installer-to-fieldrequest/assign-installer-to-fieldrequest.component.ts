import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { MapService } from '../../Service/map/map.service';

declare var google: any;

@Component({
  selector: 'ngx-assign-installer-to-fieldrequest',
  templateUrl: './assign-installer-to-fieldrequest.component.html',
  styleUrls: ['./assign-installer-to-fieldrequest.component.scss']
})
export class AssignInstallerToFieldrequestComponent implements OnInit {

  btn = 'Send approval to partner';
  approveForm = {
    requestId: null,
    installer: {
      id: null,
      name: ''
    },
    partner: {
      id: null,
      name: ''
    }
  };
  installerList = [];
  requestData = {
    lat: 26.9124336,
    long: 75.78727090000007
  };

  // map
  mainLocation = "";
  nearestInstallerlist = [];

  constructor(public activeModal: NgbActiveModal,
    public api: ApiService,
    public common: CommonService,
    public modalService: NgbModal,
    public mapService: MapService) {
    console.log("task list", this.common.params);
    if (this.common.params != null) {
      if (this.common.params.requestId) {
        this.approveForm.requestId = this.common.params.requestId;
        this.requestData.lat = this.common.params.lat;
        this.requestData.long = this.common.params.long;
        this.mainLocation = this.common.params.location;
      }
    }
    // this.getNearestInstallerList();
  }

  ngOnInit() {
  }

  closeModal(response) {
    this.activeModal.close({ response: response });
  }

  selectedInstaller(event) {
    this.approveForm.installer.id = event.id;
    this.approveForm.installer.name = event.name;
  }

  selectPartner(event) {
    this.approveForm.partner.id = event.id;
    this.approveForm.partner.name = event.name;
    this.approveForm.installer.id = null;
    this.approveForm.installer.id = '';
    this.installerList = [];
    if (event.id) {
      this.installerListByPartner();
    }
  }

  installerListByPartner() {
    let params = {
      partnerId: this.approveForm.partner.id
    }
    this.api.post("Installer/getInstallerListByPartner.json", params).subscribe(res => {
      console.log("data", res['data'])
      if (res['code'] > 0) {
        this.installerList = res['data'];
      } else {
        this.common.showError(res['msg']);
      }
    },
      err => {
        this.common.showError();
        console.log('Error: ', err);
      });
  }

  assignInstallerToFieldSupportRequest() {
    if (this.approveForm.requestId == '') {
      return this.common.showError("Request Id is missing")
    }
    // else if (this.approveForm.installer.id == '') {
    //   return this.common.showError("Installer is missing")
    // }
    else if (this.approveForm.partner.id == '') {
      return this.common.showError("Partner is missing")
    }
    else {
      const params = {
        requestId: this.approveForm.requestId,
        installerId: this.approveForm.installer.id,
        partnerId: this.approveForm.partner.id,
        status: 0
      }
      this.common.loading++;
      this.api.post('Grid/assignInstallerToFieldSupportRequest', params).subscribe(res => {
        console.log(res);
        this.common.loading--;
        if (res['code'] > 0) {
          this.common.showToast(res['msg'])
          this.closeModal(true);
        } else {
          this.common.showError(res['msg']);
        }
      },
        err => {
          this.common.loading--;
          this.common.showError();
          console.log('Error: ', err);
        });
    }

  }


  // start: map
  getNearestInstallerList() {
    let params = {
      lat: this.requestData.lat,
      long: this.requestData.long
    };
    console.log(this.common.params.location);
    this.nearestInstallerlist = [];
    this.common.loading++;
    this.api.post('Installer/getNearestInstallerList.json?', params)
      .subscribe(res => {
        this.common.loading--;
        // console.log('res:', res);
        this.nearestInstallerlist = res['data'] || [];
        console.log('after get data call api', this.nearestInstallerlist);
        this.createNearestInstallerMarkers();
        // this.setTable() 
      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }
  createNearestInstallerMarkers() {
    console.log('test api call', this.requestData);
    let singleMarker = this.mapService.createSingleMarker(new google.maps.LatLng(this.requestData.lat, this.requestData.long), true);
    this.mapService.createMarkers(this.nearestInstallerlist, false, false, ['name', 'partner_name'], (installer) => {
      console.log('inner call');
      this.approveForm.installer.id = installer.id;
      this.approveForm.installer.name = installer.name;
      this.approveForm.partner.id = installer.partnerid;
      this.approveForm.partner.name = installer.partner_name;
      console.log('Installer:', installer);
    }, true);
    let infoWindow = null;
    this.mapService.addListerner(singleMarker, 'mouseover', () => {
      let insideInfo = new Date().getTime();
      // if (infoWindow) {
      //   infoWindow.close();
      // }
      infoWindow = this.mapService.createInfoWindow();
      infoWindow.opened = false;
      infoWindow.setContent(`
      <span style='color:blue'>Info</span><br>
      <span style='max-width:200px;display: block'>address :${this.mainLocation}</span>`);
      infoWindow.setPosition(this.mapService.createLatLng(this.requestData.lat, this.requestData.long));
      infoWindow.open(this.mapService.map);
      setTimeout(() => {
        infoWindow.close();
        infoWindow.opened = false;
      }, 1000);
    });
    // this.mapService.addListerner(singleMarker, 'mouseout', function (evt) {
    //   infoWindow.close();
    //   infoWindow.opened = false;
    // });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.mapService.mapIntialize('map', 12, this.requestData.lat, this.requestData.long);
      this.getNearestInstallerList();
    }, 200);
  }
  // end:map

}
