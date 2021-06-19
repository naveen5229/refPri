import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from '../../../Service/common/common.service';
import { ApiService } from '../../../Service/Api/api.service';
import { UserService } from '../../../Service/user/user.service';

@Component({
  selector: 'ngx-add-extra-time',
  templateUrl: './add-extra-time.component.html',
  styleUrls: ['./add-extra-time.component.scss']
})
export class AddExtraTimeComponent implements OnInit {

  btn = 'Add Time';
  title = "Add Extra Time";
  ticketId = null;
  dataForm = {
    time: null
  }

  constructor(public activeModal: NgbActiveModal, public modalService: NgbModal, public api: ApiService,
    public common: CommonService, public userService: UserService) {
    if (this.common.params != null) {
      this.title = this.common.params.title;
      this.btn = this.common.params.btn;
      this.ticketId = this.common.params.ticketId;
    }
  }

  ngOnInit() {
  }

  closeModal(response) {
    this.activeModal.close({
      response: response
    });
  }

  buyTime() {
    let params = {
      ticketId: this.ticketId,
      time: this.common.timeToSecond(this.dataForm.time)
    }
    this.common.loading++;
    let apiName = 'Ticket/buyTimeForTicket'
    this.api.post(apiName, params)
      .subscribe(res => {
        this.common.loading--;
        if (res['code'] > 0) {
          this.closeModal(true);
          this.common.showToast(res['msg']);
        } else {
          this.common.showError(res['msg']);
        }
      }, err => {
        console.error(err);
        this.common.showError();
        this.common.loading--;
      });
  }

}
