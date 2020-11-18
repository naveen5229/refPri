import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../../@core/mock/users.service';
import { ImageViewComponent } from '../../modals/image-view/image-view.component';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';

@Component({
  selector: 'ngx-on-site-images-summary',
  templateUrl: './on-site-images-summary.component.html',
  styleUrls: ['./on-site-images-summary.component.scss']
})
export class OnSiteImagesSummaryComponent implements OnInit {
  adminReportList: any;
  date = new Date();
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
    this.getAdminReports()
  }

  ngOnInit() {
  }

  getAdminReports() {
    this.table = {
      data: {
        headings: {},
        columns: []
      },
      settings: {
        hideHeader: true
      }
    };

    let date = this.common.dateFormatter(this.date);
    const params = `?date=${date}`;
    console.log(params);
    // return;
    this.common.loading++;
    this.api.get('Admin/getOnSiteImagesSummary' + params, 'I')
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
    this.adminReportList.map(shift => {
      let column = {};
      for (let key in this.generateHeadings()) {
        console.log("OnSiteImagesSummaryComponent -> getTableColumns -> key", key)
        if (key == 'Action' || key == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            // icons: this.actionIcons(inventory)
          };
        } else if (key == 'images_upload') {
          column[key] = { value: shift[key], class: shift['_img'].length > 0 ? "blue font-weight-bold" : "black", action: shift['_img'].length > 0 ? this.openImageView.bind(this, shift) : '' };
        } else {
          column[key] = { value: shift[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    });
    console.log(columns);
    return columns;

  }

  openImageView(shift) {
    console.log("OnSiteImagesSummaryComponent -> openImageView -> shift", shift)
    // return;
    let images = [];
    images = shift._img.map(data => {
      return {
        name: data.doc_name,
        image: data.url,
      }
    });
    this.common.params = { images, title: 'Image' };
    const activeModal = this.modalService.open(ImageViewComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
  }


}
