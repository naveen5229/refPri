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
  processForm = {
    processId: null,
    isValidationCheck: 1
  }
  processList = [];
  constructor(public common: CommonService,
    public api: ApiService,
    public activeModal: NgbActiveModal,
    public modalService: NgbModal) {
    this.title = this.common.params.title;
    this.button = this.common.params.button;
    this.typeFrom = (this.common.params.typeFrom) ? this.common.params.typeFrom : null;
    this.common.handleModalSize('class', 'modal-lg', '450', 'px');
    if (this.typeFrom == "process") {
      this.processList = (this.common.params.processList) ? this.common.params.processList : [];
    } else {
      this.getcampaignList();
    }

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
      if(res['code']===0) { this.common.showError(res['msg']); return false;};
      this.campaignDataList = res['data'];
    },err => {
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
      if (!this.processForm.processId) {
        this.common.showError("Process is missing");
        return false;
      }
      let formField = null;
      const params = "refId=" + this.processForm.processId + "&refType=2&transId=null";
      this.common.loading++;
      this.api.get('Processes/getFormWrtRefId?' + params).subscribe(res => {
        this.common.loading--;
        if (res['code'] == 1) {
          formField = res['data'] || [];
          if (formField && formField.length > 0) {
            let headings = {};
            headings['identity'] = { title: 'identity', placeholder: 'identity' };
            for (var key of formField) {
              headings[key['r_coltitle']] = { title: key['r_coltitle'], placeholder: key['r_coltitle'] };
            }
            console.log("headings:", headings);
            this.common.getCSVFromDataArray([{ identity: "" }], headings, null);
          } else {
            this.common.showError("Data not found");
          }
        } else {
          this.common.showError(res['msg']);
        }
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.error('Api Error:', err);
      });


    } else {
      window.open(this.api.I_URL + "sample/sampleCampaignCsv.csv");
    }
  }

  uploadCsv() {
    let params = null;
    let apiPath = null;
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
        processId: this.processForm.processId,
        csv: this.upload.csv,
        isValidationCheck: this.processForm.isValidationCheck
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
    if (!apiPath) {
      return this.common.showError("Something went wrong, please try again");
    }
    this.common.loading++;
    this.api.post(apiPath, params)
      .subscribe(res => {
        this.common.loading--;
        if(res['code']===0) { this.common.showError(res['msg']); return false;};
        this.common.showToast(res["msg"]);
        let successData = res['data']['success'];
        let errorData = res['data']['fail'];
        alert(res["msg"]);
        let title = 'Csv Uploaded Data';
        if (this.typeFrom == "process" && this.processForm.isValidationCheck == 1) {
          title = 'Preview';
        }
        this.common.params = { successData, errorData, title: title };
        const activeModal = this.modalService.open(ErrorReportComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
        activeModal.result.then(data => {
          if (data.response) {
            if (this.typeFrom == "process" && this.processForm.isValidationCheck == 1) {
            } else {
              this.activeModal.close({ response: true });
            }
          }
        });
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
  }
}
