import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../../Service/common/common.service';
import { ApiService } from '../../../Service/Api/api.service';
import { UserService } from '../../../Service/user/user.service';
import {NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'ngx-form-data-table',
  templateUrl: './form-data-table.component.html',
  styleUrls: ['./form-data-table.component.scss']
})
export class FormDataTableComponent implements OnInit {
AdditionalFields = [];
  constructor(public activeModal: NgbActiveModal,public common: CommonService, public api: ApiService, public modalService: NgbModal, public userService: UserService)
  {
    console.log(this.common.params.additionalform,'additional data from formdata table')
    this.AdditionalFields = this.common.params.additionalform;
   }

  ngOnInit() {
  }
  close(res) {
    this.activeModal.close({ response: res,data:(this.AdditionalFields && this.AdditionalFields.length>0 ) ? this.AdditionalFields : null});
  }

  addTransaction(){
    this.close(true);
  }
}
