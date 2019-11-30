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
    csv: null,
    campaignId: null
  }
  csv: any;
  campaignDataList = [];
  constructor(public common: CommonService,
    public api: ApiService,
    public activeModal: NgbActiveModal,
    public modalSService: NgbModal) {
    this.title = this.common.params.title;
    this.button = this.common.params.button;
    this.common.handleModalSize('class', 'modal-lg', '450', 'px');
    this.getcampaignList();

  }

  ngOnInit() {
  }
  closeModal() {
    this.activeModal.close({ response: false });
  }

  getcampaignList() {
    this.common.loading++;
    this.api.get("CampaignSuggestion/getCampaignList").subscribe(res => {
      this.common.loading--;
      this.campaignDataList = res['data'];
    },
      err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
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
        this.upload.csv = res;
      }, err => {
        this.common.loading--;
        console.error('Base Err: ', err);
      })
  }

  // sampleCsv() {
  //   window.open("http://13.126.215.102/sample/csv/sample_document_upload.csv");
  // }

  uploadCsv() {
    const params = {
      CmpTarCsv: this.upload.csv,
      campaignId: this.upload.campaignId
    };
    if (!params.CmpTarCsv && !params.campaignId) {
      return this.common.showError("Select  Option First");
    }
    this.common.loading++;
    this.api.post('Campaigns/ImportCampTargetCsv', params)
      .subscribe(res => {
        this.common.loading--;
        this.common.showToast(res["msg"]);

        // if (errorData.length) {
        //   this.common.params = { errorData, ErrorReportComponent, title: 'Document Verification' };
        //   const activeModal = this.modalService.open(ErrorReportComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
        // }
        this.activeModal.close({ response: true });
      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }
}
