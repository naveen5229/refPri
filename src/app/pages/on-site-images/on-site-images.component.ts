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

  constructor(public common: CommonService, public user: UserService, public api: ApiService, public modalService: NgbModal) {
    this.getAdminReportsByUser()
  }

  ngOnInit() {
  }

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
    console.log(params);
    // return;
    this.common.loading++;
    this.api.get('Admin/getOnSiteImagesByUser' + params, 'I')
      .subscribe(res => {
        this.common.loading--;
        console.log('res:', res);
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
    let icons = [];
    icons.push({ class: !adminReport._refid ? "fa fa-paperclip gray" : "fa fa-paperclip", action: this.openDataModal.bind(this, adminReport), txt: "", title: 'report', });
    return icons;
  }
  openDataModal(adminReport) {
    console.log("OnSiteImagesComponent -> openReportModal -> adminReport", adminReport);
    if(adminReport._action_name && adminReport._identity && adminReport._process){
      
    }
    this.common.showToast('working');
  }

  closeDataModal(){
    document.getElementById('dataWindow').style.display = 'none';
  }

}
