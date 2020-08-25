import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../Service/Api/api.service';
import { CommonService } from '../../../Service/common/common.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'ngx-view-dashboard',
  templateUrl: './view-dashboard.component.html',
  styleUrls: ['./view-dashboard.component.scss']
})
export class ViewDashboardComponent implements OnInit {
  processId = null;
  processName = null;
  dynFieldList = [];
  table = {
    data: {
      headings: {},
      columns: [],
    },
    settings: {
      hideHeader: true
    }
  };

  constructor(public api: ApiService,
    public common: CommonService,
    public activeModal: NgbActiveModal,
    private modalService: NgbModal) {
    if (this.common.params && this.common.params.processId) {
      this.processId = (this.common.params.processId) ? this.common.params.processId : null;
      this.processName = (this.common.params.processId) ? this.common.params.processName : null;
      this.getDynFieldList();
    }
  }

  ngOnInit() { }

  closeModal(res) {
    this.activeModal.close({ response: res });
  }

  getDynFieldList() {
    this.common.loading++;
    this.api.get("Processes/getProcessDashboardData?processId=" + this.processId).subscribe(res => {
      this.common.loading--;
      if (res['code'] == 1) {
        this.dynFieldList = res['data'] || [];
        this.dynFieldList.length ? this.setTable() : this.resetTable();
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  resetTable() {
    this.table.data = {
      headings: {},
      columns: []
    };
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
    for (var key in this.dynFieldList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    return headings;
  }

  getTableColumns() {
    let columns = [];
    this.dynFieldList.map(row => {
      let column = {};
      for (let key in this.generateHeadings()) {
        if (key.toLowerCase() == 'action') {

        } else {
          column[key] = { value: row[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    })

    return columns;
  }

}
