import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { GenericModelComponent } from '../../modals/generic-model/generic-model.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'ngx-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.scss']
})
export class AttendanceComponent implements OnInit {
  attandanceList = [];
  date = new Date();
  today = new Date();

  tableAttandanceList = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };
  constructor(public common: CommonService, public api: ApiService,   public modalService: NgbModal
    ) {
    this.getAttendanceList();
    this.common.refresh = this.refresh.bind(this);
  }
  ngOnInit() {
  }

  refresh() {
    this.getAttendanceList();
  }

  getAttendanceList() {
    this.attandanceList = [];
    this.resetTable();
    // let params = "?date=" + this.common.dateFormatter(this.common.getDate());
    let params = "?date=" + this.common.dateFormatter(this.date);
    this.common.loading++;
    this.api.get('Admin/getAttendanceList.json' + params)
      .subscribe(res => {
        this.common.loading--;
        // console.log('res:', res);
        this.attandanceList = res['data'] || [];
        console.log(this.attandanceList);
        this.attandanceList.length ? this.setTable() : this.resetTable();

      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }

  resetTable() {
    this.tableAttandanceList.data = {
      headings: {},
      columns: []
    };
  }
  generateHeadings() {
    let headings = {};
    for (var key in this.attandanceList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    return headings;
  }

  setTable() {
    this.tableAttandanceList.data = {
      headings: this.generateHeadings(),
      columns: this.getTableColumns()
    };
    return true;
  }

  getTableColumns() {
    console.log(this.generateHeadings());
    let columns = [];
    this.attandanceList.map(ticket => {
      let column = {};
      for (let key in this.generateHeadings()) {

        if (key == 'Action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            // icons: this.actionIcons(pending)
          };
        } else if (key == 'present') {
          column[key] = {
            value: "",
            isHTML: true,
            icons: (ticket[key]) ? [{ class: "fa fa-check text-success", action: null, title: "present" }] : '',
            action: null,
            class: "text-center"
          };
        } else if (key == 'activity_spend_time') {
          column[key] = { value: ticket[key], class: 'blue', action: this.getLogs.bind(this, ticket) };
        } else {
          column[key] = { value: ticket[key], class: '', action: '' };
        }
      }
      columns.push(column);
    });
    return columns;

  }
  getLogs(ticket) {
    console.log(ticket);
    let dataparams = {
      view: {
        api: 'Admin/getActivityLogs',
        param: {userId: ticket['_userid'], date:this.common.dateFormatter1(this.date)}
      },
      title: "Activity Logs",
      actionRequired: true
    }
    // this.common.handleModalSize('class', 'modal-lg', '1100');
    this.common.params = { data: dataparams };
    const activeModal = this.modalService.open(GenericModelComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
  }
}
