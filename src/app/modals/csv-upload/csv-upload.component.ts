import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'ngx-csv-upload',
  templateUrl: './csv-upload.component.html',
  styleUrls: ['./csv-upload.component.scss']
})
export class CsvUploadComponent implements OnInit {

  title = "";
  button = "upload";
  upload = {
    csv: null
  }
  csv: any;
  constructor(public common: CommonService,
    public api: ApiService,
    public activeModal: NgbActiveModal,
    public modalSService: NgbModal) {
    this.title = this.common.params.title;
    this.button = this.common.params.button;

  }

  ngOnInit() {
  }
  closeModal() {
    this.activeModal.close({ response: false });
  }


  handleFileSelection(event) {
    this.common.loading++;
    this.common.getBase64(event.target.files[0])
      .then(res => {
        this.common.loading--;
        let file = event.target.files[0];
        if (file.type == "application/vnd.ms-excel") {
        }
        else {
          alert("valid Format Are : csv");
          return false;
        }

        res = res.toString().replace('vnd.ms-excel', 'csv');
        this.csv = res;
      }, err => {
        this.common.loading--;
        console.error('Base Err: ', err);
      })
  }

  sampleCsv() {
    window.open("http://13.126.215.102/sample/csv/sample_document_upload.csv");
  }

  uploadCsv() {

  }
}
