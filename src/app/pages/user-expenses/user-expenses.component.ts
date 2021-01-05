
import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../../@core/mock/users.service';
import { ImageViewComponent } from '../../modals/image-view/image-view.component';
import { CalulateTravelDistanceComponent } from '../../modals/calulate-travel-distance/calulate-travel-distance.component';
import { ConfirmComponent } from '../../modals/confirm/confirm.component';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { LocationOnSiteImageComponent } from '../../modals/location-on-site-image/location-on-site-image.component';

@Component({
  selector: 'ngx-user-expenses',
  templateUrl: './user-expenses.component.html',
  styleUrls: ['./user-expenses.component.scss']
})
export class UserExpensesComponent implements OnInit {
  // partnerId = null;
  userwageslist = [];
  userwagesHeader = {};
  Date = new Date();
  table = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true

    }
  };
  tableImages = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true

    }
  };
  imageList = [];

  constructor(public common: CommonService,
    public api: ApiService,
    public user: UserService,
    public modalService: NgbModal) {
    // this.partnerId = this.user._details.partnerid;
  }

  ngOnInit() {
    console.log(this.Date, 'sdfgfds')
  }

  showinstallerwageslist() {
    this.userwageslist = [];
    this.table = {
      data: {
        headings: {},
        columns: []
      },
      settings: {
        hideHeader: true
      }
    };


    this.common.loading++;
    let param = `date=${this.common.dateFormatter1(this.Date)}`
    this.api.get(`Admin/getOnSiteExpenses?${param}`)
      .subscribe(res => {
        this.common.loading--;
        // console.log('res:', res);
        this.userwageslist = res['data'] || [];
        console.log(this.userwageslist);

        this.userwageslist.length ? this.setTable() : this.resetTable();
        // this.setTable() 

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
    for (var key in this.userwageslist[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.formatTitle(key) };
      }
    }
    this.userwagesHeader = headings;
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
    this.userwageslist.map(installer => {
      let column = {};
      for (let key in this.generateHeadings()) {
        if (key.toLowerCase() == 'action') {
          column[key] = {
            value: "",
            isHTML: false,
            action: null,
            icons: this.actionIcons(installer)
          };
        } else if (key.toLowerCase() == 'image_count') {
          column[key] = { value: installer[key], class: 'blue', action: (installer[key] > 0) ? this.openImages.bind(this, installer) : '' };
        } else {
          column[key] = { value: installer[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    });
    return columns;
  }
  actionIcons(request) {
    let icons = [
      { class: "fa fa-map-marker", action: this.calculateDistance.bind(this, request) },
    ];
    return icons;
  }

  calculateDistance(user) {
    console.log("🚀 ~ file: installer-wise-wages.component.ts ~ line 92 ~ InstallerWiseWagesComponent ~ calculateDistance ~ user", user)
    // return
    let dateForTravel = new Date();
    dateForTravel = this.Date;
    this.common.params = { adminId: { id: user._aduserid, name: user.name }, date: dateForTravel, close: true };
    const activeModal = this.modalService.open(CalulateTravelDistanceComponent, { size: 'xl', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      console.log(data);
      this.common.params = null;
    })
  }

  openImages(installer) {
    console.log("🚀 ~ file: installer-wages.component.ts ~ line 127 ~ InstallerWagesComponent ~ openImages ~ installer", installer);
    this.common.loading++;
    let param = `userId=${installer._aduserid}&startDate=${this.common.dateFormatter1(this.Date)}&endDate=${this.common.dateFormatter1(this.Date)}`
    this.api.get(`Admin/getOnSiteImagesByUser?${param}`)
      .subscribe(res => {
        this.common.loading--;
        this.imageList = res['data'] || [];
        console.log(this.imageList);
        this.imageList.length ? this.setTableImages(installer) : this.resetTableImages();
        document.getElementById('imageListing').style.display = 'block';

      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }

  closeImageListing() {
    document.getElementById('imageListing').style.display = 'none';
  }

  setTableImages(installer) {
    this.tableImages.data = {
      headings: this.generateImagesHeadings(),
      columns: this.getTableImagesColumns(installer)
    };
    return true;
  }
  generateImagesHeadings() {
    let headings = {};
    for (var key in this.imageList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.formatTitle(key) };
      }
    }
    return headings;
  }
  getTableImagesColumns(installer) {
    let columns = [];
    this.imageList.map(img => {
      let column = {};
      for (let key in this.generateImagesHeadings()) {
        if (key.toLowerCase() == 'action') {
          column[key] = {
            value: "",
            isHTML: false,
            action: null,
            icons: this.actionIconsOnImages(img, installer)
          };
        } else if (key.toLowerCase() == 'image') {
          column[key] = { value: "View Image", class: 'blue', action: this.openLink.bind(this, 'test', img['_url']) };
        } else {
          column[key] = { value: img[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    });
    return columns;
  }

  openLink(type, image) {
    let images = [
      {
        name: type,
        image: image
      },
    ];
    console.log("image", images)
    // this.common.params = { images, title: 'Image' };
    const activeModal = this.modalService.open(ImageViewComponent, { size: 'lg', container: 'nb-layout' });
    activeModal.componentInstance.imageList = { images, title: 'Image' };
  }

  actionIconsOnImages(img, installer) {
    let icons = [
      { class: "fa fa-map-marker", action: this.location.bind(this, img) }
    ];
    if (img.status.toLowerCase() == 'pending') {
      icons.push(
        { class: "fa fa-times", action: this.reject.bind(this, img, installer) });
    }
    return icons;
  }

  location(img) {
    this.common.params = {
      filterData: [img]
    }
    console.log(this.common.params);
    const activeModal = this.modalService.open(LocationOnSiteImageComponent, { size: 'xl', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      console.log("response:", data)
      if (data && data.response) {
        console.log("response:", data)
      }
    })
  }

  reject(img, installer) {
    console.log("🚀 ~ file: installer-wages.component.ts ~ line 209 ~ InstallerWagesComponent ~ reject ~ img", img);
    this.common.params = {
      title: 'Reject Image',
      description: `<b>&nbsp;` + 'Are You Sure To Reject This Image' + `<b>`,
    }
    const activeModal = this.modalService.open(ConfirmComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
    activeModal.result.then(data => {
      if (data.response) {
        console.log("data", data);
        this.common.loading++;
        let params = {
          id: img._id,
          status: -1
        };
        // console.log(params)
        // return;
        this.api.post(`Admin/updateOnSiteImageStatus`, params).subscribe(res => {
          this.common.loading--;
          if (res['code'] == 1) {
            this.common.showToast(res['msg']);
            this.openImages(installer);
          }
          console.log('res', res);
        }, err => {
          console.log("🚀 ~ file: installer-wages.component.ts ~ line 216 ~ InstallerWagesComponent ~ this.api.post ~ err", err)
          this.common.loading--;
        });
      }
    });
  }

  resetTable() {
    this.table.data = {
      headings: {},
      columns: []
    };
  }
  resetTableImages() {
    this.tableImages.data = {
      headings: {},
      columns: []
    }
  }

  // displayWages(request) {
  //   this.common.params = { installer: request }
  //   this.modalService.open(ExpenselistComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
  // }

  downloadExcel() {
    if (this.userwageslist.length == 0) {
      this.common.showError('No Data Found')
    } else {
      this.common.getCSVFromDataArray(this.userwageslist, this.userwagesHeader, 'user wages')
    }
  }

}
