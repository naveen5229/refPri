import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { UserService } from '../../Service/user/user.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'ngx-error-report',
  templateUrl: './error-report.component.html',
  styleUrls: ['./error-report.component.scss']
})
export class ErrorReportComponent implements OnInit {
  title = '';
  btn = '';
  errors = [];
  success = [];
  columns = [];
  selectOption = 'fail';


  constructor(public api: ApiService,
    public common: CommonService,
    public user: UserService,
    private activeModal: NgbActiveModal) {
    this.common.handleModalSize('class', 'modal-lg', '1024', 'px', 1);
    this.title = this.common.params.title || 'Error Report';
    this.btn = this.common.params.btn || 'update';
    this.errors = this.common.params.errorData;
    this.success = this.common.params.successData;

    this.selectOption;

    this.columnSperate();
  }

  ngOnInit() {
  }


  closeModal() {
    this.activeModal.close({ response: true });
  }

  report(type) {
    console.log("test", type);
    this.selectOption = type;
    this.columnSperate();
  }

  columnSperate() {
    this.columns = [];
    if (this.selectOption == 'fail') {
      if (this.errors.length) {
        for (var key in this.errors[0]) {
          if (key.charAt(0) != "_")
            this.columns.push(key);
        }
        console.log("columns");
        console.log(this.columns);
      }
    }
    else if (this.selectOption == 'success') {
      if (this.success.length) {
        for (var key in this.success[0]) {
          if (key.charAt(0) != "_")
            this.columns.push(key);
        }
        console.log("columns");
        console.log(this.columns);
      }
    }



  }
  formatTitle(strval) {
    let pos = strval.indexOf('_');
    if (pos > 0) {
      return strval.toLowerCase().split('_').map(x => x[0].toUpperCase() + x.slice(1)).join(' ')
    } else {
      return strval.charAt(0).toUpperCase() + strval.substr(1);
    }
  }



}
