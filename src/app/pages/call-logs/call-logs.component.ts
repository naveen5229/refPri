import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../../Service/user/user.service';
import { AddentityfieldsComponent } from '../../modals/addentityfields/addentityfields.component';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { MapService } from '../../Service/map/map.service';

@Component({
  selector: 'ngx-call-logs',
  templateUrl: './call-logs.component.html',
  styleUrls: ['./call-logs.component.scss']
})
export class CallLogsComponent implements OnInit {
  callLogList: any;
  date = new Date();
  today = new Date();
  adminList = [];
  userListForRM = [];
  loggedInUser = null;
  activeLogs = { id: null, name: null };

  table = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  headingForCsv = {};


  constructor(public common: CommonService, public user: UserService, public api: ApiService, public modalService: NgbModal, public mapService: MapService) {
    this.loggedInUser = this.user._details;
    console.log("🚀loggedInUser", this.loggedInUser)
    this.activeLogs = { id: this.loggedInUser.id, name: this.loggedInUser.name };
    this.common.refresh = this.refresh.bind(this);
    this.getCallLogs();
    this.getAllAdmin();
  }

  ngOnInit() {
  }

  refresh() {
    this.getCallLogs();
    this.getAllAdmin();
  }

  getAllAdmin() {
    this.api.get("Admin/getAllAdmin.json").subscribe(
      (res) => {
        console.log("data", res["data"]);
        if (res["code"] > 0) {
          let adminList = res["data"] || [];
          this.filterUserForRM(adminList);
          this.adminList = adminList.map((x) => {
            return { id: x.id, name: x.name + " - " + x.department_name };
          });
        } else {
          this.common.showError(res["msg"]);
        }
        console.log('adminList', this.adminList)
      },
      (err) => {
        this.common.showError();
        console.log("Error: ", err);
      }
    );
  }

  filterUserForRM(adminList) {
    let userListForRM = adminList.filter(users => {
      return this.loggedInUser.id === users._reporting_user_id;
    });
    this.userListForRM = userListForRM.map(user => { return { id: user.id, name: user.name } });
    if (this.userListForRM && this.userListForRM.length > 0) {
      this.userListForRM.splice(0, 0, { id: this.loggedInUser.id, name: this.loggedInUser.name });
    }
    console.log('userListForRM', this.userListForRM);
  }

  getCallLogs() {
    console.log(this.activeLogs);
    this.table = {
      data: {
        headings: {},
        columns: []
      },
      settings: {
        hideHeader: true
      }
    };

    let date = this.common.dateFormatternew(this.date);
    const params = '?Date=' + date + '&aduserId=' + this.activeLogs.id;
    console.log(params);
    this.common.loading++;
    this.api.get('UserCallLogs/getUserCallLog' + params)
      .subscribe(res => {
        this.common.loading--;
        // if (res['code'] === 0) { this.common.showError(res['msg']); return false; }; 
        if (res['code'] > 0) {
          this.callLogList = res['data'] || [];
          this.callLogList.length ? this.setTable() : this.resetTable();
        } else {
          this.common.showError(res['msg']);
        }
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
    for (var key in this.callLogList[0]) {
      console.log(key.charAt(0));

      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.formatTitle(key) };
      }
    }
    this.headingForCsv = headings;
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


  getTableColumns() {
    let columns = [];
    this.callLogList.map(shift => {
      let column = {};
      for (let key in this.generateHeadings()) {
        if (key == 'Action' || key == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            // icons: this.actionIcons(inventory)
          };
        } else if (key == 'mobileno') {
          column[key] = { value: shift[key] ? shift[key] : null, class: (shift.callee) ? null : 'blue cursor-pointer', action: (shift.callee) ? null : this.addEntity.bind(this, shift), }
        } else {
          column[key] = { value: shift[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    });
    console.log(columns);
    return columns;

  }

  addEntity(contact) {
    let editDataModal = {
      typeName: null,
      typeId: null,
      entityName: null,
      entityId: null,
      contactName: (contact.name) ? contact.name : null,
      contactId: null,
      contactNo: contact.mobileno,
      email: (contact.email) ? contact.email : null,
      association: null,
      requestId: null
    }
    this.common.params = {
      entityTypes: null,
      entityContactFieldsTitle: "Add contact on entity",
      modalType: 4,
      editData: editDataModal
    }
    const activeModal = this.modalService.open(AddentityfieldsComponent, { size: 'md', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
    activeModal.result.then(data => {
      // console.log("addEntity ~ data", data)
    });
  }

  exportCSV() {
    this.common.getCSVFromDataArray(this.callLogList, this.headingForCsv, `Call Logs ${this.activeLogs.name}`)
  }
}
