import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../../Service/common/common.service';
import { ApiService } from '../../../Service/Api/api.service';
import { UserService } from '../../../Service/user/user.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'ngx-form-data-table',
  templateUrl: './form-data-table.component.html',
  styleUrls: ['./form-data-table.component.scss']
})
export class FormDataTableComponent implements OnInit {
  additionalFields = [];
  tableHeader = null;
  isDisabled = false;
  constructor(public activeModal: NgbActiveModal, public common: CommonService, public api: ApiService, public modalService: NgbModal, public userService: UserService) {
    this.additionalFields = this.common.params.additionalform;
    this.isDisabled = common.params.isDisabled;
    console.log("additionalFields:", this.additionalFields);
    if (this.additionalFields && this.additionalFields.length > 0) {
      this.tableHeader = JSON.parse(JSON.stringify(this.additionalFields[0]));
      this.additionalFields.forEach(element => {
        element.forEach(e => {
          if (e.param_type == 'date') {
            e.param_value = (e.param_value) ? new Date(e.param_value) : new Date();
          }
        });
      });
    }
  }

  ngOnInit() { }

  close(res) {
    this.activeModal.close({ response: res, data: (this.additionalFields && this.additionalFields.length > 0) ? this.additionalFields : null });
  }

  AddTableRow() {
    let temp = JSON.parse(JSON.stringify(this.tableHeader));
    temp.forEach(e => {
      e.param_value = (e.param_type == 'date') ? new Date() : null;
    });
    this.additionalFields.push(temp);
  }

  addTransaction() {
    // console.log("additionalFields:", this.additionalFields);
    this.close(true);
  }
}
