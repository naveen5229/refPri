import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { AddActivityLogsComponent } from '../../modals/add-activity-logs/add-activity-logs.component';
import { ConfirmComponent } from '../../modals/confirm/confirm.component';

@Component({
  selector: 'ngx-activity-logs',
  templateUrl: './activity-logs.component.html',
  styleUrls: ['./activity-logs.component.scss']
})
export class ActivityLogsComponent implements OnInit {

  activityLogsist = [];
  departments = [];
  table = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  processWiseActivityList = [];
  processProjectList = [];
  processProjectFrom = {
    startDate: this.common.getDate(-2),
    endDate: this.common.getDate(),
    processProject: { id: null, name: null }
  }

  date = new Date();
  department = {
    id: null,
    name: ''
  };
  viewSummaryList = [];

  workLogViewType = [
    { id: 1, name: 'Process' },
    { id: 0, name: 'Project' }
  ]
  selectedWorkLogType = 1;

  constructor(public common: CommonService,
    public api: ApiService,
    public modalService: NgbModal,
  ) {
    this.common.refresh = this.refresh.bind(this);
    this.getActivityLogsist();
    this.getDepartments();
  }

  ngOnInit() { }

  refresh() {
    this.getActivityLogsist();
    this.getDepartments();
  }

  getDepartments() {
    this.common.loading++;
    this.api.get("Admin/getDepartmentList", "I")
      .subscribe(res => {
        this.common.loading--;
        if (res['code'] === 0) { this.common.showError(res['msg']); return false; };
        this.departments = res['data'] || [];
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
  }

  getProcessProjectList() {
    this.processProjectFrom.processProject = { id: null, name: null};
    let api = '';
    if (this.selectedWorkLogType == 1) {
      api = 'Processes/getProcessList';
    } else if (this.selectedWorkLogType == 0) {
      api = 'AdminTask/allProjectList';
    }

    this.common.loading++;
    this.api.get(api).subscribe(res => {
      this.common.loading--;
      if (res['code'] === 0) { this.common.showError(res['msg']); return false; };
      if (!res['data']) return;
      if (this.selectedWorkLogType == 1) {
        this.processProjectList = res['data'].map(data => { return { id: data._id, name: data.name } });
      } else if (this.selectedWorkLogType == 0) {
        this.processProjectList = res['data'].map(data => { return { id: data._project_id, name: data.project_desc } });
      }
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log(err);
    });
  }

  selectedDepartment(selectedDept) {
    console.log(selectedDept);
    this.department.id = selectedDept.id;
    this.department.name = selectedDept.name;
  }

  addActivityLog(activity) {
    this.common.params = { isEdit: activity };
    const activeModal = this.modalService.open(AddActivityLogsComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      console.log(data);
      if (data) {
        this.getActivityLogsist();
      }
    })
  }

  getActivityLogsist() {
    this.common.loading++;
    this.api.get('Admin/getActivityLogs')
      .subscribe(res => {
        this.common.loading--;
        if (res['code'] === 0) { this.common.showError(res['msg']); return false; };
        this.activityLogsist = res['data'] || [];
        this.activityLogsist.length ? this.setTable() : this.resetTable();
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

  setTable() {
    this.table.data = {
      headings: this.generateHeadings(),
      columns: this.getTableColumns()
    };
    return true;
  }

  generateHeadings() {
    let headings = {};
    for (var key in this.activityLogsist[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
        if (key == 'addtime') {
          headings[key]["type"] = "date";
        }
      }
    }
    return headings;
  }

  getTableColumns() {
    let columns = [];
    this.activityLogsist.map(activity => {
      let column = {};
      for (let key in this.generateHeadings()) {
        if (key == 'Action' || key == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(activity)
          };
        } else {
          column[key] = { value: activity[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    });
    return columns;
  }

  actionIcons(activity) {
    let icons = [
      { class: "fa fa-edit", action: this.addActivityLog.bind(this, activity) },
      { class: "fa fa-trash", action: this.deleteActivity.bind(this, activity) },
    ];
    return icons;
  }

  deleteActivity(activity) {
    console.log(activity);
    if (activity._id) {
      let params = '?activityId=' + activity._id
      this.common.params = {
        title: 'Delete Activity Logs',
        description: `<b>&nbsp;` + 'Are You Sure To Delete This Record' + `<b>`,
      }

      const activeModal = this.modalService.open(ConfirmComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
      activeModal.result.then(data => {
        if (data.response) {
          this.common.loading++;
          this.api.get('Admin/deleteActivityLog' + params)
            .subscribe(res => {
              this.common.loading--;
              if (res['code'] === 0) { this.common.showError(res['msg']); return false; };
              this.common.showToast(res['msg']);
              this.getActivityLogsist();
            }, err => {
              this.common.loading--;
              this.common.showError();
              console.log('Error: ', err);
            });
        }
      });
    } else {
      this.common.showError("Activity ID Not Available");
    }
  }

  openViewSummary() {
    this.viewSummaryList = [];
    document.getElementById('viewSummary').style.display = 'block';
  }

  closeViewSummary() {
    document.getElementById('viewSummary').style.display = 'none';
  }

  viewSummary() {
    this.common.loading++;
    let params = "?date=" + this.common.dateFormatter1(this.date) + "&departmentId=" + this.department.id;
    this.api.get('Admin/getActivityLogSummary' + params).subscribe(res => {
      this.common.loading--;
      if (res['code'] > 0) {
        this.viewSummaryList = res['data'] || [];
      } else {
        this.common.showError(res['msg']);
      };
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  openProcessWiseSummary() {
    this.selectedWorkLogType = 1;
    this.processWiseActivityList = [];
    this.processProjectFrom = {
      startDate: this.common.getDate(-2),
      endDate: this.common.getDate(),
      processProject: { id: null, name: null }
    }
    this.getProcessProjectList();
    document.getElementById('viewProcessWiseSummary').style.display = 'block';
  }

  closeProcessWiseSummary() {
    document.getElementById('viewProcessWiseSummary').style.display = 'none';
  }

  viewProcessWiseSummary() {
    let params = "?refId=" + this.processProjectFrom.processProject.id + "&refType=" + this.selectedWorkLogType + "&startDate=" + this.common.dateFormatter1(this.processProjectFrom.startDate) + "&endDate=" + this.common.dateFormatter1(this.processProjectFrom.endDate);
    this.common.loading++;
    this.api.get('Admin/getWorkLogSummary' + params).subscribe(res => {
      this.common.loading--;
      if (res['code'] > 0) {
        this.processWiseActivityList = res['data'] || [];
      } else {
        this.common.showError(res['msg']);
      };
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  exportCSV(type = null) {
    let dataList = this.viewSummaryList;
    let title = 'View-activity-log-summary';
    if (type == 2) {
      dataList = this.processWiseActivityList;
      title = 'View-Processwise-activity-log-summary';
    }
    if (dataList.length > 0) {
      let headings = { "Name": { title: "Name" }, "Description": { title: "Description" }, "Outcome": { title: "Outcome" }, "Contact person": { title: "Contact person" }, "Spend hour": { title: "Spend hour" }, "Total hours": { title: "Total hours" }, "Date": { title: "Date" } };
      let columns = [];
      dataList.map((row, index) => {
        let column = {};
        column['Name'] = row['name'];
        column['Total hours'] = row['total_spend_hour'];
        column['Date'] = row['date'];
        row.description_data.map((row2, index2) => {
          console.log("index2", index2);
          console.log("row", row);
          if (index2 > 0) {
            column = {};
            column['Name'] = "";
            column['Total hours'] = "";
            column['Date'] = "";
          }
          column['Spend hour'] = row2['spend_hour'];
          column['Description'] = row2['description'];
          column['Outcome'] = row2['outcome'];
          column['Contact person'] = row2['contact_person'];
          columns.push(column);
        });
      });
      // console.log("heading columns:",headings,columns,);
      this.common.getCSVFromDataArray(columns, headings, title);
    } else {
      this.common.showError('No Data Found');
    }
  }

}