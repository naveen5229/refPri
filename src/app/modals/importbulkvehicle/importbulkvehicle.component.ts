import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';

@Component({
  selector: 'ngx-importbulkvehicle',
  templateUrl: './importbulkvehicle.component.html',
  styleUrls: ['./importbulkvehicle.component.scss']
})
export class ImportbulkvehicleComponent implements OnInit {

  csv = null;
  foid = null;
  constructor(public activeModal: NgbActiveModal,
    public modalService: NgbModal,
    public api: ApiService,
    public common: CommonService) {
      this.common.handleModalSize('class', 'modal-lg', '800');
    }

  ngOnInit() {
  }

  sampleCsv() {
    window.open("http://13.126.215.102/sample/csv/sample_bulk_vehicle_upload.csv");
  }
  closeModal() {
    this.activeModal.close();
  }
  selectFoUser(user) {
    this.foid = user.id;

  }
  cancelModal() {
    this.activeModal.close();
  }
  handleFileSelection(event) {
    this.common.loading++;
    this.common.getBase64(event.target.files[0])
      .then(res => {
        this.common.loading--;


        let file = event.target.files[0];
        console.log("Type", file.type);
        if (file.type == "application/vnd.ms-excel") {
        }
        else {
          alert("valid Format is : csv");
          return false;
        }


        res = res.toString().replace('vnd.ms-excel', 'csv');
        console.log('Base 64: ', res);
        this.csv = res;
      }, err => {
        this.common.loading--;
        console.error('Base Err: ', err);
      })
  }
  uploadCsv() {
    const params = {
      vehicleBulkCsv: this.csv,
      foid: this.foid
    };
    if (!params.vehicleBulkCsv && !params.foid) {
      return this.common.showError("Select  Option");
    }
    console.log("Data :", params);
    this.common.loading++;
    this.api.postBooster('Gisdb/addBulkVehicle', params)
      .subscribe(res => {
        this.common.loading--;
        console.log("upload result", res);
        // let successData =  res['data']['success'];
        // let errorData =res['data']['fail'];
        // alert(res["msg"]);
        // this.common.params = { apiData: params,successData, errorData, title: 'Bulk Vehicle csv Verification',isUpdate:false };
        // const activeModal = this.modalService.open(CsvErrorReportComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
      }, err => {
        this.common.loading--;
        console.log(err);
      });
    }

}
