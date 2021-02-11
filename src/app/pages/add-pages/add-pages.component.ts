import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { UserService } from '../../Service/user/user.service';

@Component({
  selector: 'ngx-add-pages',
  templateUrl: './add-pages.component.html',
  styleUrls: ['./add-pages.component.scss']
})
export class AddPagesComponent implements OnInit {

  data = [];
  groupdata = [];
  selectedGroup = null;
  groupName = '';
  rowId = null;
  table = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };
  type = 'Dashboard';
  pageName = '';
  url = '';
  pageRoleType = 1;
  constructor(public api: ApiService,
    public common: CommonService,
    public user: UserService) {
    this.common.refresh = this.refresh.bind(this);
    this.getPageData();
    this.getGroupList();
  }

  ngOnInit() {
  }

  refresh() {
    this.getPageData();
    this.getGroupList();
  }
  getPageData() {
    console.log(this.user);
    this.common.loading++;
    const params = 'adminId=' + this.user['_details']['id'];
    this.api.get("UserRole/getAdminPages.json?" + params).subscribe(res => {
      this.common.loading--;
      this.data = res['data'];
      this.setTable();
      console.log("data", res['data'])
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  getGroupList() {
    this.common.loading++;
    this.api.get('UserRole/getPageGroup').subscribe(res => {
      this.common.loading--;
      this.groupdata = res['data'];
      console.log("api Data:", this.groupdata);
    }, err => {
      this.common.loading--;
      console.log('Error: ', err);
    })
  }
  getSelectedGroup(group) {
    this.selectedGroup = group.id;
    this.groupName = group.name
    console.log(group)
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
    for (var key in this.data[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    return headings;
  }

  getTableColumns() {
    let columns = [];
    this.data.map(ticket => {
      let column = {};
      for (let key in this.generateHeadings()) {
        if (key == 'Action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(ticket)
          };
        } else {
          column[key] = { value: ticket[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    });
    return columns;
  }

  actionIcons(request) {
    if (request.status != 'Active') {
      let icons = [{ class: "fa fa-edit", action: this.editData.bind(this, request), }];
      return icons;
    }
  }

  editData(request) {
    console.log(request);
    this.rowId = request._id;
    this.pageName = request.title;
    this.url = request.route;
    this.groupName = request.group_name;
    this.selectedGroup = request._parent_id;
    this.pageRoleType = request._role_type;
  }

  saveUserRole() {
    const params = {
      title: this.pageName,
      route: this.url,
      groupName: this.groupName,
      tableId: this.rowId,
      hasAdd: false,
      hasDelete: false,
      hasEdit: false,
      module: 'Pages',
      parentId: this.selectedGroup,
      type: this.type,
      pageRoleType: this.pageRoleType
    };
    this.common.loading++;
    this.api.post('UserRole/savePage.json', params)
      .subscribe(res => {
        this.common.loading--;
        console.log('Res: ', res);
        if (res['success']) {
          this.resetUserRole();
          this.common.showToast(res['msg']);
          this.getPageData();
        } else {
          this.common.showError(res['msg']);
        }
      }, err => {
        this.common.loading--;
        console.log('Error: ', err);
      })
  }

  resetUserRole() {
    this.rowId = null;
    this.pageName = '';
    this.url = '';
    this.groupName = '';
    this.pageRoleType = 1;
  }

}