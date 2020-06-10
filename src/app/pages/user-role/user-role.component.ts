import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import * as _ from 'lodash';

@Component({
  selector: 'ngx-user-role',
  templateUrl: './user-role.component.html',
  styleUrls: ['./user-role.component.scss']
})
export class UserRoleComponent implements OnInit {

  adminId = null;
  adminList = [];
  getAllPagesList = [];
  formattedData = [];
  isShow = false;

  constructor(public common: CommonService,
             public api: ApiService) { 
              this.getAllAdmin();
             }

  ngOnInit() {
  }

  refresh() {
    this.isShow =false;
    this.getAllAdmin();
    document.getElementById('adminName')['value'] = '';
    this.formattedData = [];
  }

  getAllAdmin() {
    console.log('-------');
    this.api.get("Admin/getAllAdmin.json").subscribe(res => {
      console.log("data", res['data'])
      if (res['code'] > 0) {
        this.adminList = res['data'] || [];
      } else {
        this.common.showError(res['msg']);
      }
    },
      err => {
        this.common.showError();
        console.log('Error: ', err);
      });
  }

  getAdminPagesDetails(adminId) {
    this.adminId = adminId;
    console.log(adminId);
    // this.formattedData = [];
    // this.selectedUser.details = user;
    const params = 'adminId=' + adminId;
    this.common.loading++;
    this.api.get('UserRole/getUserPages.json?' + params)
      .subscribe(res => {
        this.isShow = true;
        this.common.loading--;
        this.getAllPagesList = res['data'];
        console.log(this.getAllPagesList);
        this.managedata();
        console.log("Res Data:", this.getAllPagesList)
        // this.selectedUser.oldPreferences = res['data'];
      }, err => {
        this.common.loading--;
        console.log('Error: ', err);
      })
  }

  managedata() {
    let firstGroup = _.groupBy(this.getAllPagesList, 'module');
    this.formattedData = Object.keys(firstGroup).map(key => {
      return {
        name: key,
        groups: firstGroup[key],
        isSelected: false,
        isOp: false,
      }
    });
    this.formattedData.map(module => {
      let isMasterAllSelected = true;
      let pageGroup = _.groupBy(module.groups, 'group_name');
      console.log(pageGroup);
      console.log(Object.keys(pageGroup));
      module.groups = Object.keys(pageGroup).map(key => {
        let isAllSelected = true;
        let pages = pageGroup[key].map(page => {
          // page.isSelected = page.userid ? true : false;
          // page.isadd = page.isadd ? true : false;
          // page.isedit = page.isedit ? true : false;
          // page.isdeleted = page.isdeleted ? true : false;
          page.isOp = false;
          if (isAllSelected)
            isAllSelected = page.isSelected;
          return page;
        });
        if (isMasterAllSelected) {
          isMasterAllSelected = isAllSelected;
        }
        return {
          name: key,
          pages: pages,
          // isSelected: isAllSelected,
        }
      });
      module.isSelected = isMasterAllSelected;
    });
    console.log(this.formattedData);

    this.formattedData = _.sortBy(this.formattedData, ['name'], ['asc']).map(module => {
      module.groups = _.sortBy(module.groups, ['name'], ['asc']).map(groups => {
        groups.pages = _.sortBy(groups.pages, ['title'], ['asc']);
        return groups;
      });
      console.log(this.formattedData);
      return module;
    });
  }

  checkOrUnCheckAll(details, type) {
    // this.common.isComponentActive = true;
    // console.log("component is", this.common.isComponentActive);
    if (type === 'group') {
      console.log('details.isSelected:', details.isSelected);
      details.pages.map(page => {
        console.log('details.isSelected:', details.isSelected);
        page.isSelected = details.isSelected
      });
    } else if (type === 'module') {
      details.groups.map(group => {
        group.isSelected = details.isSelected;
        group.pages.map(page => page.isSelected = details.isSelected);
      });
    }
    if (!details.isSelected && type == 'page') {
      details.isSelected = details.isSelected;
      details.isadd = false;
      details.isedit = false;
      details.isdeleted = false;
      details.isOp = true;
    }
  }


  findSelectedPages() {
    let data = [];
    console.log('formattedData: ', this.formattedData);
    this.formattedData.map(module => {
      module.groups.map(group => {
        group.pages.map(page => {
          if (page.isSelected) {
            data.push({ id: page.id, status: true });
          }
          else {
            data.push({ id: page.id, status: false});
          }
        })
      })

    });
    return data;
  }

  saveUserRole() {
    const params = {
      pages: this.findSelectedPages(),
      adminId: this.adminId
    };
    console.log("Param:", params);
    this.common.loading++;
    this.api.post('UserRole/saveAdminRole.json', params)
      .subscribe(res => {
        this.common.loading--;
        console.log('Res: ', res);
        this.common.showToast(res['msg']);
        // this.getUserDetails(this.userId);
        this.refresh();

      }, err => {
        this.common.loading--;
        console.log('Error: ', err);
      })
  }



}
