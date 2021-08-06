import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericModelComponent } from '../../modals/generic-model/generic-model.component';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { UserService } from '../../Service/user/user.service';

@Component({
  selector: 'ngx-meeting-admin-report',
  templateUrl: './meeting-admin-report.component.html',
  styleUrls: ['./meeting-admin-report.component.scss']
})
export class MeetingAdminReportComponent implements OnInit {

  endTime = new Date();
  startTime = new Date();
  activeTab = 'all-meeting';
  filterby = 'entitywise';
  table = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  meetingAdminList = [];
  constructor(public common: CommonService,
    public modalService: NgbModal,
    public api: ApiService,
    public userService: UserService) {
    this.startTime.setDate(this.startTime.getDate() - 3)
    this.startTime.setHours(0);
    this.startTime.setMinutes(0);
    this.startTime.setSeconds(0);
    this.endTime.setDate(this.endTime.getDate() - 1)
    this.endTime.setHours(23);
    this.endTime.setMinutes(59);
    this.endTime.setSeconds(59);

    this.common.refresh = this.refresh.bind(this);
    this.getData();
  }

  ngOnInit() {
  }

  refresh() {
    this.getData();
  }

  getData() {
    let type = 0;
    this.meetingAdminList = [];
    this.table = {
      data: {
        headings: {},
        columns: []
      },
      settings: {
        hideHeader: true
      }
    };
    let startdate = this.common.dateFormatter(this.startTime);
    let enddate = this.common.dateFormatter(this.endTime);


    let url = "Report/getAdminMeetingReport.json?"
    if (this.activeTab == 'user-meeting') {
      type = 1;
    } else if (this.activeTab == 'follow-up-meeting') {
      type = 2;
    }
    else if (this.activeTab == 'all-meeting'){
      type = 3;
    }

    const params =
      "startDate=" + startdate +
      "&endDate=" + enddate +
      "&type=" + type ;
    this.common.loading++;
    this.api.get(url + params)
      .subscribe(res => {
        this.common.loading--;
        if (res['code'] === 0) { this.common.showError(res['msg']); return false; };
        this.meetingAdminList = res['data'] || [];
        this.meetingAdminList.length ? this.setTable() : this.resetTable();
        return this.meetingAdminList[0];
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
  }


  resetTable() {
    this.table.data = {
      headings: {},
      columns: []
    };
  }

  generateHeadings() {
    // console.log(this.dailyReportList);
    let headings = {};
    for (var key in this.meetingAdminList[0]) {
      // console.log(key.charAt(0));

      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.formatTitle(key) };
      }
    }
    return headings;
  }

  formatTitle(strval) {
    let pos = strval.indexOf('_');
    if (pos > 0) {
      return strval.toLowerCase().split('_').map(x => x[0].toUpperCase() + x.slice(1)).join(' ')
    } else {
      return strval.charAt(0).toUpperCase() + strval.substr(1);
    }
  }

  setTable() {
    this.table.data = {
      headings: this.generateHeadings(),
      columns: this.getTableColumns()
    };
    return true;
  }

  getTableColumns() {
    console.log(this.generateHeadings());
    let columns = [];
    this.meetingAdminList.map(ticket => {
      let column = {};
      for (let key in this.generateHeadings()) {
        if (key == 'Action' || key == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(ticket)
          };
        } else {
          column[key] = { value: (ticket[key] && typeof (ticket[key]) == 'object') ? ticket[key]['value'] + ticket[key]['suffix'] : ticket[key], class: (ticket[key]) ? ticket[key]['class'] : '', action: '' };
        }
      }
      columns.push(column);
    });
    return columns;

  }

  actionIcons(entity) {
    let icons = [
      {
        class: "fa fa-info",
        action: this.getDetails.bind(this, entity),
        txt: "",
        title: "Detail",
      },
    ];

    return icons;
  }

  getDetails(entity) {
    console.log("entity=", entity);
    let startdate = this.common.dateFormatter(this.startTime);
    let enddate = this.common.dateFormatter(this.endTime);
    let dataparams = {
      view: {
        api: 'Report/getAdminMeetingReport.json',
        param: {
          startDate: startdate,
          endDate: enddate,
          entityId: entity._contact_id,
          adminId: entity._aduserid ? entity._aduserid : null,
          type: 3,
          filterBy: this.filterby,
          isDetail: true
        }
      },
      title: `Detail `,
      // type: "transtruck"
    }
    // this.common.handleModalSize('class', 'modal-lg', '1100');
    this.common.params = { data: dataparams };
    const activeModal = this.modalService.open(GenericModelComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
  }


}
