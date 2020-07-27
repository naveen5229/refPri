import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ImportbulkvehicleComponent } from '../importbulkvehicle/importbulkvehicle.component';
@Component({
  selector: 'ngx-addvehicle',
  templateUrl: './addvehicle.component.html',
  styleUrls: ['./addvehicle.component.scss']
})
export class AddvehicleComponent implements OnInit {

  Foid = null;
  regno = null;
  isDost = 1;
  vehicleList = [];
  constructor(public common:CommonService,
    public api:ApiService,
    public activeModal:NgbActiveModal,
    public modalSService:NgbModal) { }

  ngOnInit() {
  }

  selectFoUser(user) {
    this.Foid = user.id;
  }
  importDriverCsv() {
     this.modalSService.open(ImportbulkvehicleComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
  }
  closeModal() {
    this.activeModal.close();

  }
  Submit() {
    let params = {
      foid: this.Foid,
      regno: this.regno,
      id:this.id

    };
    // console.log(params);
    this.common.loading++;
    let response;
    this.api.postBooster('Gisdb/addVehicle', params)
      .subscribe(res => {
        this.common.loading--;
        console.log('Res:', res['data']);
        this.vehicleList = res['data'];
        this.common.showToast(res['msg']);
        this.closeModal();
        console.log('vehicle', this.vehicleList);
      }, err => {
        this.common.loading--;
        console.log(err);
      });
    // return response;

  }
  foName = null;
  id =null;
  editFlag = false;
  selectFoVehicle(event) {
    console.log("print",event, event.id, event.regno);
    this.regno = event.regno;
    this.editFlag = true;
    this.Foid = event.foid;
    this.id = event.id;
  }
  resetDetail(){
    this.foName = null;
    this.Foid = null;
    this.id = null;
    this.regno = null;
    this.editFlag = false;
  } 

}
