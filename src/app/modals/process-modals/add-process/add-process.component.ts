import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../../Service/common/common.service';
import { ApiService } from '../../../Service/Api/api.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'ngx-add-process',
  templateUrl: './add-process.component.html',
  styleUrls: ['./add-process.component.scss']
})
export class AddProcessComponent implements OnInit {
  title = "Add Process";
  button = "Submit";
  processForm = {
    id: null,
    name: '',
    startTime: this.common.getDate(),
    endTime: this.common.getDate(2),
    priCatAlias: "",
    secCatAlias: "",
    defaultOwn: {
      id: null,
      name: ""
    },
    active: false,
    attachmentFile: { name: null, file: null },
  };
  adminList = [];
  fileType = null;
  fileTypeDisplay = null;
  attachmentDataToDisplay = { name: null, url: null };

  constructor(public common: CommonService,
    public api: ApiService,
    public activeModal: NgbActiveModal,
    public modalSService: NgbModal) {
    this.adminList = this.common.params.adminList;
    if (this.common.params && this.common.params.editData) {
      this.processForm = {
        id: this.common.params.editData._id,
        name: this.common.params.editData.name,
        startTime: (this.common.params.editData.start_date) ? new Date(this.common.params.editData.start_date) : this.common.getDate(),
        endTime: (this.common.params.editData.end_date) ? new Date(this.common.params.editData.end_date) : null,
        priCatAlias: (this.common.params.editData.pri_category_alias) ? this.common.params.editData.pri_category_alias : "",
        secCatAlias: (this.common.params.editData.sec_category_alias) ? this.common.params.editData.sec_category_alias : "",
        defaultOwn: {
          id: (this.common.params.editData._default_po) ? this.common.params.editData._default_po : null,
          name: (this.common.params.editData._default_po) ? this.common.params.editData.default_po : "",
        },
        active: common.params.editData._is_active,
        attachmentFile: { name: null, file: null },
      };


      if (this.common.params.editData.manual && this.common.params.editData._doc_url) {
        this.attachmentDataToDisplay = { name: this.common.params.editData.manual, url: this.common.params.editData._doc_url };
        if (this.attachmentDataToDisplay.name) {
          var ext = this.attachmentDataToDisplay.name.split('.').pop();
          this.formatIcon(ext, 'fileTypeDisplay');
        }
      }
    }

  }

  ngOnInit() {
  }

  closeModal(res) {
    this.attachmentDataToDisplay = { name: null, url: null };
    this.activeModal.close({ response: res });
  }

  saveProcess() {
    if (!this.processForm.name) {
      this.common.showError("Please Select Process Name");
      return false;
    }
    if (!this.processForm.startTime) {
      this.common.showError("Start Date is missing");
      return false;
    }
    if (this.processForm.endTime && this.processForm.endTime < this.processForm.startTime) {
      this.common.showError("End Date not less then Start Date");
      return false;
    }

    let params = {
      requestId: (this.processForm.id > 0) ? this.processForm.id : null,
      name: this.processForm.name,
      startDate: this.processForm.startTime ? this.common.dateFormatter(this.processForm.startTime) : null,
      endDate: this.processForm.endTime ? this.common.dateFormatter(this.processForm.endTime) : null,
      priCatAlias: this.processForm.priCatAlias,
      secCatAlias: this.processForm.secCatAlias,
      defaultOwnId: this.processForm.defaultOwn.id,
      isActive: this.processForm.active,
      attachmentName: this.processForm.attachmentFile.name,
      attachment: this.processForm.attachmentFile.file
    }
    // return;
    this.common.loading++;
    this.api.post("Processes/addProcess", params).subscribe(res => {
      this.common.loading--;
      console.log(res);
      if (res['code'] == 1) {
        if (res['data'][0]['y_id'] > 0) {
          this.common.showToast(res['msg']);
          this.closeModal(true);
        } else {
          this.common.showError(res['msg']);
        }
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.loading--;
      console.log(err);
    });
  }

  handleFileSelection(event) {
    this.common.loading++;
    this.common.getBase64(event.target.files[0]).then((res: any) => {
      this.common.loading--;
      let file = event.target.files[0];
      var ext = file.name.split('.').pop();
      this.formatIcon(ext, 'fileType')
      let formats = ["jpeg", "jpg", "png", 'xlsx', 'xls', 'docx', 'doc', 'pdf', 'csv'];
      if (formats.includes(ext)) {
      } else {
        this.common.showError("Valid Format Are : jpeg, png, jpg, xlsx, xls, docx, doc, pdf,csv");
        return false;
      }
      this.processForm.attachmentFile = { name: file.name, file: res };
    }, err => {
      this.common.loading--;
      console.error('Base Err: ', err);
    })
  }

  formatIcon(ext, targetName) {
    let icon = null;
    switch (ext) {
      case 'xlxs' || 'xls': icon = 'fa fa-file-excel-o'; break;
      case 'docx' || 'doc': icon = 'fa fa-file'; break;
      case 'pdf': icon = 'fa fa-file-pdf-o'; break;
      case 'csv': icon = 'fas fa-file-csv'; break;
      default: icon = null;
    }
    if (targetName === 'fileType') {
      this.fileType = icon;
    } else if (targetName === 'fileTypeDisplay') {
      this.fileTypeDisplay = icon;
    }
  }
}
