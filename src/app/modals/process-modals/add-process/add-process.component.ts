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
    }
  };
  adminList = [];

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
        endTime: (this.common.params.editData.start_date) ? new Date(this.common.params.editData.end_date) : this.common.getDate(2),
        priCatAlias: (this.common.params.editData.pri_category_alias) ? this.common.params.editData.pri_category_alias : "",
        secCatAlias: (this.common.params.editData.sec_category_alias) ? this.common.params.editData.sec_category_alias : "",
        defaultOwn: {
          id: (this.common.params.editData._default_po) ? this.common.params.editData._default_po : null,
          name: (this.common.params.editData._default_po) ? this.common.params.editData.default_po : "",
        }
      };
    }
  }

  ngOnInit() {
  }

  closeModal(res) {
    this.activeModal.close({ response: res });
  }

  saveProcess() {
    console.log("processForm:", this.processForm);
    if (!this.processForm.name) {
      this.common.showError("Please Select Process Name");
      return false;
    }
    if (!this.processForm.endTime || !this.processForm.startTime) {
      this.common.showError("Start Date Or End Date is missing");
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
      defaultOwnId: this.processForm.defaultOwn.id
    }

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

}
