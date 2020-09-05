import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ErrorReportComponent } from '../error-report/error-report.component';

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
    campaignId: null,
    campaignType: 1,

  }
  csv: any;
  campaignDataList = [];
  typeFrom = null;
  selectedPartner = {
    id: null,
    name: ""
  };
  selectedProcess = null;
  constructor(public common: CommonService,
    public api: ApiService,
    public activeModal: NgbActiveModal,
    public modalService: NgbModal) {
    this.title = this.common.params.title;
    this.button = this.common.params.button;
    this.typeFrom = (this.common.params.typeFrom) ? this.common.params.typeFrom : null;
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
        console.log("file-type:", file.type);
        if (file.type == "application/vnd.ms-excel" || file.type == "text/csv") {
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

  sampleCsv() {
    if (this.typeFrom == 'installer') {
      window.open(this.api.I_URL + "sample/addInstallerSample.csv");
    } else if (this.typeFrom == 'process') {
      alert("working...")
      // window.open(this.api.I_URL + "sample/addInstallerSample.csv");
    } else {
      window.open(this.api.I_URL + "sample/sampleCampaignCsv.csv");
    }
  }

  uploadCsv() {
    let params = null;
    let apiPath = null;
    // const params = {
    //   CmpTarCsv: this.upload.csv,
    //   campaignId: this.upload.campaignId,
    //   campaignType: this.upload.campaignType
    // };
    if (this.typeFrom == 'installer') {
      params = {
        partnerId: this.selectedPartner.id,
        addInstallerCsv: this.upload.csv
      };
      apiPath = 'Installer/importAddInstallerCsv';
      if (!params.addInstallerCsv || !params.partnerId) {
        return this.common.showError("Partner or CSV is missing");
      }
    } else if (this.typeFrom == 'process') {
      params = {
        processId: this.selectedProcess,
        csv: this.upload.csv
      };
      apiPath = 'Processes/importTransactionCsv';
      if (!params.csv || !params.processId) {
        return this.common.showError("Process or CSV is missing");
      }
    } else {
      params = {
        CmpTarCsv: this.upload.csv,
        campaignId: this.upload.campaignId,
        campaignType: this.upload.campaignType
      };
      apiPath = 'Campaigns/ImportCampTargetCsv';
      if (!params.CmpTarCsv || !params.campaignId) {
        return this.common.showError("Select Option First");
      }
    }
    console.log("upload params:", params, apiPath);
    // if (!params.CmpTarCsv && !params.campaignId) {
    //   return this.common.showError("Select Option First");
    // }
    if (!apiPath) {
      return this.common.showError("Something went wrong, please try again");
    }
    this.common.loading++;
    this.api.post(apiPath, params)
      .subscribe(res => {
        this.common.loading--;
        this.common.showToast(res["msg"]);

        let successData = res['data']['success'];
        let errorData = res['data']['fail'];
        console.log("error: ", errorData);
        alert(res["msg"]);
        this.common.params = { successData, errorData, title: 'csv Uploaded Data' };
        const activeModal = this.modalService.open(ErrorReportComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
        activeModal.result.then(data => {
          if (data.response) {
            this.activeModal.close({ response: true });
          }
        });
      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }
}
