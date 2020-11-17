import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { UserService } from '../../Service/user/user.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'ngx-on-site-images',
  templateUrl: './on-site-images.component.html',
  styleUrls: ['./on-site-images.component.scss']
})
export class OnSiteImagesComponent implements OnInit {
  adminReportList: any;
  startDate = this.common.getDate(-2);
  endDate = this.common.getDate();
  today = new Date();

  table = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  transActionList = null;
  tableTransActionList = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  constructor(public common: CommonService, public user: UserService, public api: ApiService, public modalService: NgbModal) {
    this.getAdminReportsByUser()
  }

  ngOnInit() { }

  getAdminReportsByUser() {
    this.table = {
      data: {
        headings: {},
        columns: []
      },
      settings: {
        hideHeader: true
      }
    };

    let startDate = this.common.dateFormatter(this.startDate);
    let endDate = this.common.dateFormatter(this.endDate);
    const params = `?startDate=${startDate}&endDate=${endDate}`;
    // return;
    this.common.loading++;
    this.api.get('Admin/getOnSiteImagesByUser' + params, 'I').subscribe(res => {
      this.common.loading--;
      if (res['code'] > 0) {
        if (res['data']) {
          this.adminReportList = res['data'] || [];
          this.adminReportList.length ? this.setTable() : this.setTable();
          console.log(this.adminReportList);
        }
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.loading--;
      console.log(err);
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
    for (var key in this.adminReportList[0]) {
      console.log(key.charAt(0));

      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    return headings;
  }

  getTableColumns() {
    let columns = [];
    this.adminReportList.map(adminReport => {
      let column = {};
      for (let key in this.generateHeadings()) {
        if (key == 'Action' || key == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(adminReport)
          };
        } else if (key == 'attached_document') {
          column[key] = { value: adminReport[key], class: 'blue', action: this.goToImage.bind(this, adminReport[key]) };
        } else {
          column[key] = { value: adminReport[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    });
    console.log(columns);
    return columns;

  }

  goToImage(img) {
    window.open(img);
  }

  actionIcons(adminReport) {
    let icons = [
      { class: !adminReport._refid ? "fa fa-paperclip gray" : "fa fa-paperclip", action: this.openDataModal.bind(this, adminReport), txt: "", title: 'report', },
      { class: "fas fa-sitemap", action: this.openTransActionListModal.bind(this, adminReport), txt: "", title: 'Txn Action', }
    ];
    // icons.push({ class: !adminReport._refid ? "fa fa-paperclip gray" : "fa fa-paperclip", action: this.openDataModal.bind(this, adminReport), txt: "", title: 'report', });
    return icons;
  }
  openDataModal(adminReport) {
    console.log("OnSiteImagesComponent -> openReportModal -> adminReport", adminReport);
    if (adminReport._action_name && adminReport._identity && adminReport._process) {

    }
    this.common.showToast('working');
  }

  closeDataModal() {
    document.getElementById('dataWindow').style.display = 'none';
  }

  openTransActionListModal(adminReport) {
    this.getProcessLeadByType();
    document.getElementById('transActionList').style.display = 'block';
  }

  closeTransActionListModal() {
    document.getElementById('transActionList').style.display = 'none';
  }

  getProcessLeadByType() {
    let type = 1, startDate = null, endDate = null;
    this.common.loading++;
    let params = "?type=" + type + "&startDate=" + startDate + "&endDate=" + endDate;
    this.api.get("Processes/getMyProcessByType" + params).subscribe(res => {
      this.common.loading--;
      if (res['code'] == 1) {
        this.transActionList = res['data'] || [];
        this.setTableTransActionList();
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  // start: TransActionList
  setTableTransActionList() {
    this.tableTransActionList.data = {
      headings: this.generateHeadingsTransActionList(),
      columns: this.getTableColumnsTransActionList()
    };
    return true;
  }

  generateHeadingsTransActionList() {
    let headings = {};
    for (var key in this.transActionList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
      if (key === "addtime" || key === "action_completed") {
        headings[key]["type"] = "date";
      }
    }
    return headings;
  }

  getTableColumnsTransActionList() {
    let columns = [];
    this.transActionList.map(lead => {
      let column = {};
      for (let key in this.generateHeadingsTransActionList()) {
        if (key.toLowerCase() == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIconsForTransAction(lead)
          };
        } else if (key == 'action_expdate' && new Date(lead[key]) < this.common.getDate()) {
          column[key] = { value: lead[key], class: 'black font-weight-bold', action: '' };
        } else {
          column[key] = { value: lead[key], class: 'black', action: '' };
        }
        column['style'] = { 'background': this.common.taskStatusBg(lead._status) };
      }
      columns.push(column);
    });
    return columns;
  }
  // end: TransActionList

  actionIconsForTransAction(lead) {
    let icons = [
      { class: "fa fa-plus", action: this.mapOnSiteImageWithTransAction.bind(this, lead), txt: "", title: 'Map with on-site-image', },
    ];
    return icons;
  }

  mapOnSiteImageWithTransAction(lead) {
    let transActionId = null, onSiteImageId = null;
    this.common.loading++;
    let params = {
      transActionId: transActionId,
      onSiteImageId: onSiteImageId
    }
    this.api.post("Processes/mapOnSiteImageWithTransAction", params).subscribe(res => {
      this.common.loading--;
      if (res['code'] == 1) {
        this.common.showToast(res['msg']);
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
  }

}
