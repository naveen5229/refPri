import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'ngx-mobile-no',
  templateUrl: './mobile-no.component.html',
  styleUrls: ['./mobile-no.component.scss']
})
export class MobileNoComponent implements OnInit {

  mobile = null;
  constructor(
    public common: CommonService,
    private activeModal: NgbActiveModal
  ) {
    //this.common.handleModalSize('class', 'modal-lg', '650');
    this.common.handleModalSize('class', 'modal-lg', '650','px', 1);
    console.log("param", this.common.params);
    this.mobile = this.common.params;
    console.log("mobile 123", this.mobile);
  }

  ngOnInit() {
  }

  dismiss() {
    this.activeModal.close();
  }

}
