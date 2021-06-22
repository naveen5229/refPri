import { Component, OnInit } from '@angular/core';
import { CommonService } from "../../Service/common/common.service";
import { ApiService } from "../../Service/Api/api.service";
import { UserService } from "../../Service/user/user.service";
import _ from 'lodash';
import { ConfirmComponent } from '../../modals/confirm/confirm.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'ngx-settings',
  templateUrl: './company-setting.component.html',
  styleUrls: ['./company-setting.component.scss']
})
export class SettingsComponent implements OnInit {
  loggedInUser = null;
  displaySelectionText = { id: 1, name: 'Select Company' };
  activeTab = 1;
  selectedEntityType = { id: 1, type: 'Company' };
  settingTypeOptions = [
    { id: 1, type: 'Company' },
    { id: 2, type: 'Department' },
    { id: 3, type: 'Group' },
    { id: 4, type: 'User' }
  ];
  selectedListing = [];
  adminList = [];
  departmentList = [];
  groupList = [];

  allSettingProfiles = [];
  settingProfileHeader = [];
  settingFormat = [];

  selectedSettingType = null;
  allSettings = [];

  constructor(public common: CommonService,
    public api: ApiService,
    public userService: UserService,
    public modalService: NgbModal) {
    this.loggedInUser = userService._details;
    console.log('loggedIn user:', this.loggedInUser);
    this.selectedSettingType = { id: this.loggedInUser.foid, name: this.loggedInUser.companyName };
    this.getAllAdmin();
    this.getDepartmentList();
    this.getUserGroupList();
    this.getSettingProfile();
    this.common.refresh = this.refresh.bind(this);
  }

  ngOnInit() {
  }

  refresh() {
    this.activeTab = 1;
    this.getAllAdmin();
    this.getDepartmentList();
    this.getUserGroupList();
    this.getSettingProfile();
  }

  getSettingProfile() {
    this.api.get("UserRole/getSettingProfile").subscribe(
      (res) => {
        console.log("data", res["data"]);
        if (res["code"] > 0) {
          this.allSettingProfiles = res["data"] || [];
          this.setHeaderFormat();
          console.log('loadedSettings', this.allSettingProfiles);
        } else {
          this.common.showError(res["msg"]);
        }
      },
      (err) => {
        this.common.showError();
        console.log("Error: ", err);
      }
    );
  }

  setHeaderFormat() {
    //setting default entityType and entityName
    // this.selectedEntityType = { id: 1, type: 'Company' };
    // this.setSettingType({ id: 1, type: 'Company' });

    //getting headings for table here
    this.settingProfileHeader = [];
    this.settingFormat = [];
    if (this.allSettingProfiles && this.allSettingProfiles.length > 0) {
      this.allSettingProfiles.map(settings => {
        if (this.activeTab === settings.type) {
          settings.data.map(data => {
            this.settingProfileHeader.push(data.profile_name);
            this.settingFormat.push(data);
          });
        }
      })
    }

    //gettingsettings here
    this.getUserSettings(this.activeTab);
  }

  getUserSettings(type) {
    this.allSettings = [];
    this.common.loading++;
    this.api.get("UserRole/getCompanySetting?type=" + type).subscribe(
      (res) => {
        this.common.loading--;
        if (res["code"] > 0) {
          this.allSettings = res["data"] || [];
          if (type == 2) {
            this.allSettings.forEach(setting => {
              if (setting.data && setting.data.length > 0) {
                setting.data.map(data => {
                  if (data.profile_name === 'Completed' && data.profile_value) {
                    data.profile_value = parseInt(data.profile_value.trim());
                  }
                })
              }
            })
          }
          console.log('loadedSettings', this.allSettings)
        } else {
          this.common.showError(res["msg"]);
        }
      },
      (err) => {
        this.common.loading--;
        this.common.showError();
        console.log("Error: ", err);
      }
    );
  }

  getAllAdmin() {
    this.api.get("Admin/getAllAdmin.json").subscribe(
      (res) => {
        console.log("data", res["data"]);
        if (res["code"] > 0) {
          let adminList = res["data"] || [];
          this.adminList = adminList.map((x) => {
            return { id: x.id, name: x.name + " - " + x.department_name };
          });
        } else {
          this.common.showError(res["msg"]);
        }
      },
      (err) => {
        this.common.showError();
        console.log("Error: ", err);
      }
    );
  }

  getDepartmentList() {
    this.api.get("Admin/getDepartmentList.json").subscribe(
      (res) => {
        console.log("data", res["data"]);
        if (res["code"] > 0) {
          this.departmentList = res["data"] || [];
        } else {
          this.common.showError(res["msg"]);
        }
      },
      (err) => {
        this.common.showError();
        console.log("Error: ", err);
      }
    );
  }

  getUserGroupList() {
    this.api.get('UserRole/getUserGroups')
      .subscribe(
        (res) => {
          console.log(" Group data", res["data"]);
          if (res["code"] > 0) {
            let groupList = res['data'] || [];
            this.groupList = groupList.map((x) => {
              return { id: x._id, name: x.name, groupId: x._id, groupuser: x._employee };
            });
          } else {
            this.common.showError(res["msg"]);
          }
        },
        (err) => {
          this.common.showError();
          console.log("Error: ", err);
        });
  }

  setSettingType(settingType) {
    this.displaySelectionText = { id: settingType.id, name: `Select ${settingType.type}` };
    console.log("displaySelectionText", this.displaySelectionText)
    this.selectedSettingType = null;
    switch (settingType.id) {
      case 1: { this.selectedListing = []; this.selectedSettingType = { id: this.loggedInUser.foid, name: this.loggedInUser.companyName }; }
        break;
      case 2: { this.selectedListing = this.departmentList; }
        break;
      case 3: { this.selectedListing = this.groupList; }
        break;
      case 4: { this.selectedListing = this.adminList; }
        break;
    }
  }

  addSetting() {
    console.log(this.selectedSettingType)
    var settingFormat = {
      _foid: null,
      _dept_id: null,
      _group_id: null,
      _user_id: null,
      name: '',
      entity_type: '',
      profile_type: '',
      data: JSON.parse(JSON.stringify(this.settingFormat))
    }

    if (this.selectedSettingType) {
      if (this.displaySelectionText.id === 1) {
        settingFormat._foid = this.selectedSettingType.id;
        settingFormat.name = this.selectedSettingType.name;
        settingFormat.entity_type = 'Company';
      } else if (this.displaySelectionText.id === 2) {
        settingFormat._dept_id = this.selectedSettingType.id;
        settingFormat.name = this.selectedSettingType.name;
        settingFormat.entity_type = 'Department';
      } else if (this.displaySelectionText.id === 3) {
        settingFormat._group_id = this.selectedSettingType.id;
        settingFormat.name = this.selectedSettingType.name;
        settingFormat.entity_type = 'Group';
      } else if (this.displaySelectionText.id === 4) {
        settingFormat._user_id = this.selectedSettingType.id;
        settingFormat.name = this.selectedSettingType.name;
        settingFormat.entity_type = 'User';
      }
    } else {
      this.common.showError(`Please ${this.displaySelectionText.name}`);
    }

    //start : directly adding rows to db section

    console.log('to compare:', settingFormat)
    let settingExistance = this.allSettings.find(x => {
      return x._dept_id === settingFormat._dept_id &&
        x._group_id === settingFormat._group_id &&
        x._user_id === settingFormat._user_id
    });
    console.log('existance:', settingExistance);

    if (settingExistance) {
      this.common.showError('Can not add duplicate settings');
    } else {
      this.saveSettings(settingFormat, 0);
    }

    //end : directly adding rows to db section

    // this.allSettings.push(settingFormat);
    // this.allSettings = _.uniqBy(this.allSettings, (x) => { return x._dept_id || x._foid || x._group_id || x._user_id });
    // console.log("this.allSettings", this.allSettings);
  }


  saveSettings(setting, operationType) {
    console.log('settings', setting);
    let params = {
      operationType: operationType,
      type: this.activeTab,
      info: setting
    }
    console.log("params:", params)
    // return;
    this.common.loading++;
    this.api.post('UserRole/saveCompanySetting', params).subscribe(res => {
      this.common.loading--;
      if (res['code'] > 0) {
        if (res['data'][0].y_id > 0) {
          this.common.showToast(res['msg']);
          this.getUserSettings(this.activeTab);
        } else {
          this.common.showError(res['data'][0].y_msg);
        }
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  deleteSetting(setting, index) {
    this.common.params = {
      title: "Delete",
      description:
        `<b>&nbsp;` + "Are You Sure You Want To Delete This Record" + `<b>`,
    };
    const activeModal = this.modalService.open(ConfirmComponent, { size: "sm", container: "nb-layout", backdrop: "static", keyboard: false, windowClass: "accountModalClass", });
    activeModal.result.then((data) => {
      if (data.response) {
        this.saveSettings(setting, 2);
      }
    });
    // console.log("type", setting.data[0].id);
    // if (setting.data[0].id) {
    //   // delete through api block
    //   this.saveSettings(setting, 2);
    // }
    // else {
    //   console.log('index:', index)
    //   this.allSettings.splice(index,1);
    // }
  }
}
