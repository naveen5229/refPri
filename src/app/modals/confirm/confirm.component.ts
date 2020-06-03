import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../../@core/mock/users.service';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';

@Component({
  selector: 'ngx-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss']
})
export class ConfirmComponent implements OnInit {

  title = '';
  description = '';
  btn1 = '';
  btn2 = '';
  isRemark = false;
  remark = "";



  constructor(public api: ApiService,
    public common: CommonService,
    public user: UserService,
    private modalService: NgbModal,
    private activeModal: NgbActiveModal) {
    this.title = this.common.params.title;
    this.description = this.common.params.description || 'Are you sure?';
    this.btn1 = this.common.params.btn1 || 'Confirm';
    this.btn2 = this.common.params.btn2 || 'Cancel';
    this.isRemark = (this.common.params.isRemark) ? true : false;
  }

  ngOnInit() {
  }

  closeModal(response, apiHit) {
    this.activeModal.close({ response: response, apiHit: apiHit, remark: this.remark });
  }

}
