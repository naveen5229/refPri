import { Component, OnInit } from '@angular/core';
import {  NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../../@core/mock/users.service';
import { ImageViewComponent } from '../../modals/image-view/image-view.component';
import { CalulateTravelDistanceComponent } from '../../modals/calulate-travel-distance/calulate-travel-distance.component';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';

@Component({
  selector: 'ngx-user-wise-expenses',
  templateUrl: './user-wise-expenses.component.html',
  styleUrls: ['./user-wise-expenses.component.scss']
})
export class UserWiseExpensesComponent implements OnInit {
  today = this.common.getDate(0);
  adminList = [];
  adminWiseList = [];
  adminwageslistforExcel = [];
  updatedExpenses = [];
  adminHeaderforExcel = {};
  head = ['Date', 'User Wages', 'System Wages', 'Summary', 'OnSide Images', 'Action']
  data = {
    admin: { id: null, name: null },
    startDate: null,
    endDate: null
  }
  constructor(
    public modalService: NgbModal,
    public common: CommonService,
    public user: UserService,
    public api: ApiService) {
    this.getAdmin();
  }

  ngOnInit() {
  }

  selectAdmin(admin) {
    console.log(admin);
    this.data.admin = { id: admin.id, name: admin.name };
  }

  getAdmin() {
    this.adminList = [];
    this.common.loading++;
    this.api.get('Admin/getAllAdmin.json')
      .subscribe(res => {
        this.common.loading--;
        if(res['code']===0) { this.common.showError(res['msg']); return false;};
        this.adminList = res['data'] || [];
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
  }

  showAdminWiseWagesList() {
    let adminId = this.data.admin.id;

    if (!adminId) {
      this.common.showError('Please select User');
      return;
    }
    if (this.data.startDate > this.data.endDate) {
      this.common.showError('End Date should be grater than Start Date')
      return;
    }

    let param = `userId=${adminId}&startDate=${this.common.dateFormatter1(this.data.startDate)}&endDate=${this.common.dateFormatter1(this.data.endDate)}`;
    this.common.loading++;
    this.adminWiseList = [];
    this.api.get('Admin/getOnSiteExpensesByUser?' + param)
      .subscribe(res => {
        this.common.loading--;
        if (res['code'] == 1) {
          this.adminWiseList = res['data'] || [];
          this.setTree();
          this.updateExpenseArray();
        } else {
          this.common.showError(res['msg']);
        }
      }, (err) => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
  }

  updateExpenseArray() {
    this.updatedExpenses = [];
    this.updatedExpenses = this.adminWiseList.map(data => {
      return {
        user_id: this.data.admin.id,
        date: data.sqdate,
        user_amount: data.travel_amount,
        system_amount: data.system_wages,
        other_amount: data.other_amount,
        total_amount: data.total_expense,
      }
    });
    console.log('arrayManaged', this.updatedExpenses)
  }

  calculateDistance(user) {
    console.log("🚀 ~ file: installer-wise-wages.component.ts ~ line 92 ~ InstallerWiseWagesComponent ~ calculateDistance ~ user", user)
    let dateForTravel = new Date();
    dateForTravel = user.sqdate;
    this.common.params = { adminId: this.data.admin, date: dateForTravel, close: true };
    const activeModal = this.modalService.open(CalulateTravelDistanceComponent, { size: 'xl', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      console.log(data);
      this.common.params = null;
      this.getAdmin();
    })
  }

  setTree() {
    // this.adminWiseList.map(ele => {
    //   if(ele._onside_img){
    //     ele._onside_img.map((ele1) => {
    //         if(ele1.img){
    //         ele1.img = JSON.parse(ele1.img);
    //       }
    //       if(ele1.exp_img){
    //         ele1.exp_img.map(ele3 => {
    //           if(ele3.exp_img){
    //             ele3.exp_img = JSON.parse(ele3.exp_img)
    //           }
    //         })
    //       }
    //   })
    //   }
    // })
    console.log(this.adminWiseList);
  }

  downloadExcel() {
    this.formatheader();
    if (this.adminwageslistforExcel.length == 0) {
      this.common.showError('No Data Found')
    } else {
      this.common.getCSVFromDataArray(this.adminwageslistforExcel, this.adminHeaderforExcel, 'installer_wise_wages')
    }
  }

  formatheader() {
    let headings = {};
    for (let key in this.head) {
      headings[this.head[key]] = { title: this.head[key], placeholder: this.head[key] }
    };
    this.adminHeaderforExcel = headings;
    console.log(this.adminHeaderforExcel)
    this.setcolumns();
  }
  setcolumns() {
    let columns = [];
    this.adminWiseList.map(lead => {
      let column = {};
      for (let key in this.adminHeaderforExcel) {
        if (key === 'Date') {
          column[key] = this.common.dateFormatternew(lead.sqdate, 'ddMMYYYY');
        } else if (key === 'User Wages') {
          column[key] = lead.user_wages;
        } else if (key === 'System Wages') {
          column[key] = lead.system_wages;
        } else if (key === 'Summary') {
          column[key] = lead.km_calculation;
        } else if (key === 'OnSide Images') {
          column[key] = lead._onside_img ? lead._onside_img.length : '';
        } else if (key === 'Action') {
          column[key] = null;
        }
      }
      columns.push(column);
    });
    this.adminwageslistforExcel = columns;
    console.log('excel data', this.adminwageslistforExcel);
  }

  saveWages() {
    console.log('adminWiseList', this.updatedExpenses);
    this.common.loading++;
    let params = {
      expenses: JSON.stringify(this.updatedExpenses),
    }
    this.api.post(`Admin/saveOnSiteExpenseByAdmin`, params).subscribe(res => {
      this.common.loading--;
      if (res['code'] == 1) {
        if (res['data'][0]['y_id'] > 0) {
          this.common.showToast(res['data'][0]['y_msg']);
          this.showAdminWiseWagesList();
        }
      }else{
        this.common.showError(res['msg']);
      }
    },err=>{
      this.common.showError();
    })
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

}