import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../../@core/mock/users.service';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';

@Component({
  selector: 'ngx-table-view',
  templateUrl: './table-view.component.html',
  styleUrls: ['./table-view.component.scss']
})
export class TableViewComponent implements OnInit {
  @Input() additionalFields = [];
  @Input() tableHeader = null;
  @Input() isDisabled = false;
  @Output() tableUpdate = new EventEmitter();


  constructor(public activeModal: NgbActiveModal, public common: CommonService, public api: ApiService, public modalService: NgbModal, public userService: UserService) {

  }

  ngOnInit() {
    console.log("additionalFields:", this.tableHeader, this.additionalFields);
    if (this.additionalFields && this.additionalFields.length > 0) {
      this.additionalFields.forEach(element => {
        element.forEach(e => {
          if (e.param_type == 'date') {
            e.param_value = (e.param_value) ? new Date(e.param_value) : new Date();
          }
        });
      });
    }
  }

  AddTableRow() {
    let temp = JSON.parse(JSON.stringify(this.tableHeader));
    temp.forEach(e => {
      e.param_value = (e.param_type == 'date') ? new Date() : null;
    });
    this.additionalFields.push(temp);
  }

  addTransaction() {
    console.log("additionalFields:", this.additionalFields);
    this.tableUpdate.next(this.additionalFields);
  }
}
