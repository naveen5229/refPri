import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';

@Component({
  selector: 'ngx-missed-call-logs',
  templateUrl: './missed-call-logs.component.html',
  styleUrls: ['./missed-call-logs.component.scss']
})
export class MissedCallLogsComponent implements OnInit {
  missedCallList = [];
  table = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };
  missedCallForm = {
    startDate: this.common.getDate(-1),
    endDate: this.common.getDate(),
    delay: null
  }
  constructor(public activeModal: NgbActiveModal, public api: ApiService, public common: CommonService, public modalService: NgbModal) {
    // this.getMissedCallList();
  }

  ngOnInit() { }

  closeModal(response) {
    this.activeModal.close({ response: response });
  }

  getMissedCallList() {
    this.table = {
      data: {
        headings: {},
        columns: []
      },
      settings: {
        hideHeader: true
      }
    };
    let startTime = (this.missedCallForm.startDate) ? this.common.dateFormatter(this.missedCallForm.startDate) : null;
    let endTime = (this.missedCallForm.endDate) ? this.common.dateFormatter(this.missedCallForm.endDate) : null;
    let params = "?startDate=" + startTime + "&endDate=" + endTime + "&minute=" + this.missedCallForm.delay;
    this.api.getTranstruck("Admin/getCallMissReport.json" + params).subscribe(res => {
      console.log("data", res['data'])
      if (res['code'] > 0) {
        this.missedCallList = res['data'] || [];
        (this.missedCallList.length > 0) ? this.setTable() : null;
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  setTable() {
    this.table.data = {
      headings: this.generateHeadings(),
      columns: this.getTableColumns()
    };
    return true;
  }

  generateHeadings() {
    let headings = {};
    for (var key in this.missedCallList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    return headings;
  }
  getTableColumns() {
    let columns = [];
    this.missedCallList.map(task => {
      let column = {};
      for (let key in this.generateHeadings()) {
        if (key == 'Action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            // icons: this.actionIcons(task)
          };
        } else {
          column[key] = { value: task[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    });
    return columns;
  }

}
