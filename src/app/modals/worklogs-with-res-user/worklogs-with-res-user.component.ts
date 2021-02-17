import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'ngx-worklogs-with-res-user',
  templateUrl: './worklogs-with-res-user.component.html',
  styleUrls: ['./worklogs-with-res-user.component.scss']
})
export class WorklogsWithResUserComponent implements OnInit {
  userWorkDetail = [];
  userId = ''
  constructor(public common: CommonService,
    public api: ApiService,
    public activeModal: NgbActiveModal) {
    this.userId = this.common.params.emp
    this.userWorklogs();
    this.common.handleModalSize('class', 'modal-lg', '1200');
  }

  ngOnInit() {
  }

  closeModal(response) {
    this.activeModal.close({ response: response });
  }

  userWorklogs() {
    const params = {
      userId: this.userId,
      date: this.common.params.userDate
    }
    this.common.loading++
    this.api.post("Report/getWorkLogsWrtUser", params).subscribe(res => {
      this.common.loading--;
      if(res['code']===0) { this.common.showError(res['msg']); return false;};
      this.userWorkDetail = res['data'];
    }, err => {
      this.common.loading--;
      console.log(err);
      this.common.showError();
    });
  }

}
