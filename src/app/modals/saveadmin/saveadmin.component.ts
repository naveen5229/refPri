import { Component, OnInit, Renderer } from '@angular/core';
import { UserService } from '../../Service/user/user.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DomSanitizer } from '@angular/platform-browser';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { LocationSelectionComponent } from '../location-selection/location-selection.component';
import { IDropdownSettings } from 'ng-multiselect-dropdown';

@Component({
  selector: 'saveadmin',
  templateUrl: './saveadmin.component.html',
  styleUrls: ['./saveadmin.component.scss']
})
export class SaveadminComponent implements OnInit {
  rowId = null;
  isOtherShow = false;
  isUpdate = false;
  submitted = false;
  preSelectedDept = {
    id: null,
    name: ''
  };
  Fouser = {
    id: null,
    name: null,
    mobileNo: null,
    isActive: '',
    baseLat: null,
    baseLong: null,
    allowRadius: null,
    attenMedium: null,
    location: null,
    department: {
      id: null,
      name: ''
    },
    reportingManager: {
      id: null,
      name: '',
      mobileno: ''
    },
    doj: null,
    dol: null,
    isNotify: 0,
    isCommentNotify: 0,
    isCallSync: false,
    locationRestrict: false,
    wifiRestrict: false
  };
  keepGoing = true;
  searchString = ''

  departments = [];
  name = null;
  mobile = null;
  data = [];
  preSelected = {
    name: '',
    mobileno: ''
  };
  preSelectedManager = {
    name: '',
    mobileno: ''
  };
  activeAdminDetails = {};

  dropdownList = [
    { id: 1, item_text: 'Wifi', value: '1' },
    { id: 2, item_text: 'Base Location', value: '1' },
    { id: 3, item_text: 'Shift', value: '1' },
  ];
  selectedItems;

  dropdownSettings: IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'item_text',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: false
  };

  constructor(
    public api: ApiService,
    public common: CommonService,
    public user: UserService,
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,
    public renderer: Renderer,
    private sanitizer: DomSanitizer
  ) {
    // console.log(this.user);
    this.Fouser.doj = this.common.getDate(); // for new
    this.getDepartments();
    if (this.common.params && this.common.params.title == 'Edit Admin') {
      console.log(this.common.params.activeAdminDetail);
      this.activeAdminDetails = this.common.params.activeAdminDetail;
      this.Fouser.id = this.activeAdminDetails['id'];
      this.Fouser.name = this.activeAdminDetails['name'];
      this.Fouser.isActive = 'true';
      this.Fouser.mobileNo = this.activeAdminDetails['mobileno'];
      this.Fouser.allowRadius = this.activeAdminDetails['_allow_radius'];
      this.Fouser.attenMedium = this.activeAdminDetails['_atten_medium'];
      this.Fouser.baseLat = this.activeAdminDetails['_base_lat'];
      this.Fouser.baseLong = this.activeAdminDetails['_base_long'];
      this.Fouser.department.id = this.activeAdminDetails['_dept_id'];
      this.Fouser.department.name = this.activeAdminDetails['department_name'];
      this.Fouser.reportingManager.id = this.activeAdminDetails['_reporting_user_id'];
      this.Fouser.reportingManager.name = this.activeAdminDetails['reporting_manager'];
      this.preSelected.name = this.activeAdminDetails['name'];
      this.preSelected.mobileno = this.activeAdminDetails['mobileno'];
      this.Fouser.doj = (this.activeAdminDetails['_doj']) ? new Date(this.activeAdminDetails['_doj']) : null;
      this.Fouser.dol = (this.activeAdminDetails['_dol']) ? new Date(this.activeAdminDetails['_dol']) : null;
      this.Fouser.isNotify = (this.activeAdminDetails['_is_notify']) ? this.activeAdminDetails['_is_notify'] : 0;
      this.Fouser.isCommentNotify = (this.activeAdminDetails['_is_comment_notify']) ? this.activeAdminDetails['_is_comment_notify'] : 0;
      this.Fouser.isCallSync = (this.activeAdminDetails['_is_call_sync']) ? true : false;
      this.Fouser.locationRestrict = (this.activeAdminDetails['_location_restrict']) ? true : false;
      this.Fouser.wifiRestrict = (this.activeAdminDetails['_wifi_restrict']) ? true : false;
      if (this.activeAdminDetails['_atten_medium'] == '100') {
        this.selectedItems = 1;
      } else if (this.activeAdminDetails['_atten_medium'] == '010' || this.activeAdminDetails['_atten_medium'] == '020') {
        this.selectedItems = 2;
      } else if (this.activeAdminDetails['_atten_medium'] == '001') {
        this.selectedItems = 3;
      }
    }
    this.common.params = {};
  }

  ngOnInit() { }

  closeModal(response) {
    this.activeModal.close(response);
  }

  getDepartments() {
    this.common.loading++;
    this.api.get("Admin/getDepartmentList").subscribe(res => {
      this.common.loading--;
      this.departments = res['data'] || [];
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log(err);
    });
  }

  selectedDepartment(selectedDepartment) {
    console.log(selectedDepartment);
    this.Fouser.department.id = selectedDepartment.id;
    this.Fouser.department.name = selectedDepartment.name;
  }

  selectReportingManager(selectedReportingManager) {
    console.log(selectedReportingManager);
    this.Fouser.reportingManager.id = selectedReportingManager.id;
    this.Fouser.reportingManager.name = selectedReportingManager.name;
    this.preSelected.name = selectedReportingManager.report_user_name;
    this.preSelectedManager.name = selectedReportingManager.report_user_name;
    this.preSelected.mobileno = selectedReportingManager.report_user_mobile;
    this.preSelectedManager.mobileno = selectedReportingManager.report_user_mobile;
  }

  addFoAdmin() {  //not used
    let params = {
      name: this.Fouser.name,
      mobileno: this.Fouser.mobileNo,
      // foid: this.Fouser.Foid,
    };
    this.common.loading++;
    let response;
    this.api.post('FoAdmin/addUsers', params).subscribe(res => {
      this.common.loading--;
      this.activeModal.close();
    }, err => {
      this.common.loading--;
      console.log(err);
    });
  }
  selectFoUser(value) {
    console.log("selectFoUser:", value);
    this.Fouser.id = value.id;
    this.Fouser.name = value.name;
    this.Fouser.mobileNo = value.mobileno;
    this.Fouser.reportingManager.id = value.reporting_user_id;
    this.Fouser.reportingManager.name = value.report_user_name;
    this.Fouser.reportingManager.mobileno = value.report_user_mobile;
    this.preSelected.name = value.report_user_name;
    this.preSelected.mobileno = value.report_user_mobile;
    this.preSelectedManager.name = value.report_user_name;
    this.preSelectedManager.mobileno = value.report_user_mobile;
    console.log(this.preSelectedManager);
    if (value.dept_id > 0) {
      this.Fouser.department.id = value.dept_id;
      this.Fouser.department.name = this.departments.find(e => e.id == value.dept_id).name;
    }
    this.Fouser.isActive = value.is_active.toString();
    this.Fouser.doj = (value.doj) ? new Date(value.doj) : null;
    this.Fouser.dol = (value.dol) ? new Date(value.dol) : null;
    this.Fouser.allowRadius = value._allow_radius;
    this.Fouser.attenMedium = value._atten_medium;
    this.Fouser.baseLat = value._base_lat;
    this.Fouser.baseLong = value._base_long;
    this.Fouser.isNotify = (value._is_notify) ? value._is_notify : 0;
    this.Fouser.isCommentNotify = (value._is_comment_notify) ? value._is_comment_notify : 0;
    this.Fouser.isCallSync = (value._is_call_sync) ? true : false;
    this.Fouser.locationRestrict = (value._location_restrict) ? true : false;
    this.Fouser.wifiRestrict = (value._wifi_restrict) ? true : false;

    // this.selectedItems = (value._atten_medium) ? (value._atten_medium).split("") : null;
    if (value._atten_medium == '100') {
      this.selectedItems = 1;
    } else if (value._atten_medium == '010' || value._atten_medium == '020') {
      this.selectedItems = 2;
    } else if (value._atten_medium == '001') {
      this.selectedItems = 3;
    }
    console.log("selectedItems:", this.selectedItems, this.Fouser);

  }

  saveAdmin() {
    // console.log("Fouser:", this.Fouser);
    if (this.user._loggedInBy == 'admin') {
      let params = {
        id: (this.Fouser.id > 0) ? this.Fouser.id : null,
        name: this.Fouser.name,
        mobile: this.Fouser.mobileNo,
        departmentId: this.Fouser.department.id,
        reportingManagerId: this.Fouser.reportingManager.id,
        doj: (this.Fouser.doj) ? this.common.dateFormatter(this.Fouser.doj) : null,
        dol: (this.Fouser.dol) ? this.common.dateFormatter(this.Fouser.dol) : null,
        baseLat: this.Fouser.baseLat,
        baseLong: this.Fouser.baseLong,
        allowRadius: this.Fouser.allowRadius,
        attenMedium: this.Fouser.attenMedium,
        isActive: (this.Fouser.id > 0) ? Boolean(JSON.parse(this.Fouser.isActive)) : true,
        isNotify: this.Fouser.isNotify,
        isCommentNotify: this.Fouser.isCommentNotify,
        isCallSync: this.Fouser.isCallSync,
        locationRestrict: this.Fouser.locationRestrict,
        wifiRestrict: this.Fouser.wifiRestrict

      }
      console.log("params:", params);
      // return false;
      if (this.Fouser.name == null) {
        this.common.showError('Enter Name');
      } else if (this.Fouser.mobileNo == null) {
        this.common.showError('Enter Mobile Number');
      } else if (this.isOtherShow && !this.Fouser.doj) {
        return this.common.showError("Date of joining is missing");
      } else if (this.isOtherShow && this.Fouser.doj > this.common.getDate()) {
        return this.common.showError("Date of joining must not be future date");
      } else if (this.isOtherShow && (!this.Fouser.attenMedium || this.Fouser.attenMedium == '000')) {
        return this.common.showError("Attendance medium is missing");
      }
      else {
        this.common.loading++;
        this.api.post('Admin/save', params)
          .subscribe(res => {
            this.common.loading--;
            this.data = res['data']
            if (res['code'] == 1) {
              if (this.data[0]['y_id'] <= 0) {
                this.common.showError(this.data[0]['y_msg']);
              } else {
                if (!this.isOtherShow && !this.Fouser.id) {
                  this.Fouser.id = this.data[0]['y_id'];
                  this.Fouser.isActive = 'true';
                }
                this.common.showToast(this.data[0]['y_msg']);
                this.isOtherShow = !this.isOtherShow;
                if (!this.isOtherShow) {
                  this.closeModal(true);
                }
              }
            } else {
              this.common.showError(res['msg']);
            }
          }, err => {
            this.common.loading--;
            console.error(err);
            this.common.showError();
          });
      }
    } else if (this.user._loggedInBy == 'customer') {
      let params = {
        foadminuserId: null,
        departmentId: null,
        reportingManagerId: null,
        doj: null,
        dol: null,
        baseLat: null,
        baseLong: null,
        allowRadius: null,
        attenMedium: null,
        name: null,
        mobileno: null,
        foid: null,
        foAdminId: null,
        multipleAccounts: null,
        rowId: null,
        isActive: null,
        locationRestrict: null,
        wifiRestrict: null
      };
      let apiName = "AddFouser/addCompanyUsers.json";
      let apiType = "postTranstruck";

      if (this.isOtherShow) {
        params['foadminuserId'] = this.Fouser.id;
        params['departmentId'] = this.Fouser.department.id;
        params['reportingManagerId'] = this.Fouser.reportingManager.id;
        params['doj'] = (this.Fouser.doj) ? this.common.dateFormatter(this.Fouser.doj) : null;
        params['dol'] = (this.Fouser.dol) ? this.common.dateFormatter(this.Fouser.dol) : null;
        params['baseLat'] = (this.Fouser.baseLat) ? this.Fouser.baseLat : null;
        params['baseLong'] = (this.Fouser.baseLong) ? this.Fouser.baseLong : null;
        params['allowRadius'] = (this.Fouser.allowRadius) ? JSON.stringify(this.Fouser.allowRadius) : null;
        params['attenMedium'] = (this.Fouser.attenMedium) ? this.Fouser.attenMedium : null;
        params['isNotify'] = this.Fouser.isNotify;
        params['isCommentNotify'] = this.Fouser.isCommentNotify;
        params['isCallSync'] = this.Fouser.isCallSync;
        params['locationRestrict'] = this.Fouser.locationRestrict;
        params['wifiRestrict'] = this.Fouser.wifiRestrict;
        apiName = "FoAdmin/saveFoAdminInfo";
        apiType = "post";

      } else {
        params['name'] = this.Fouser.name;
        params['mobileno'] = this.Fouser.mobileNo;
        params['foid'] = this.user._details.foid;
        params['foAdminId'] = this.Fouser.id;
        params['multipleAccounts'] = -1;
        params['rowId'] = (this.Fouser.id > 0) ? this.Fouser.id : null;
        params['isActive'] = (this.Fouser.id > 0) ? Boolean(JSON.parse(this.Fouser.isActive)) : true;

      }
      console.log("params:", params);
      // return false;
      if (this.Fouser.name == null) {
        this.common.showError('Enter Name');
      } else if (this.Fouser.mobileNo == null) {
        this.common.showError('Enter Mobile Number');
      }
      else {
        this.common.loading++;
        this.api[apiType](apiName, params).subscribe(res => {
          this.common.loading--;
          this.data = res['data'];
          if (res['code'] == 1) {
            if (this.data[0]['y_id'] <= 0) {
              this.common.showError(this.data[0]['y_msg']);

            } else {
              this.common.showToast(this.data[0]['y_msg']);
              if (!this.isOtherShow && this.Fouser.id!>0) {
                this.Fouser.id = this.data[0]['y_id'];
              }
              this.isOtherShow = !this.isOtherShow;
              if (!this.isOtherShow) {
                this.closeModal(true);
              }
            }
          } else {
            this.common.showError(res['msg']);
          }
        }, err => {
          this.common.loading--;
          console.error(err);
          this.common.showError();
        });
      }

    }
  }

  onNext() {
    this.isOtherShow = true;
  }

  onCancel() {
    this.Fouser.id = null;
    this.Fouser.name = null;
    this.Fouser.mobileNo = null;
    this.preSelected = {
      name: '',
      mobileno: ''
    };
    this.Fouser.doj = null;
    this.Fouser.dol = null;
    this.Fouser.isNotify = 0;
    this.Fouser.isCommentNotify = 0;
    this.Fouser.isCallSync = false;
    this.Fouser.baseLat = null;
    this.Fouser.baseLong = null;
    this.Fouser.allowRadius = null;
    this.Fouser.attenMedium = null;
    this.Fouser.location = null;
    this.Fouser.locationRestrict = false;
    this.Fouser.wifiRestrict = false;
    this.Fouser.department = {
      id: null,
      name: ''
    }
  }


  onChangeAuto(search) {
    this.Fouser.baseLat = null;
    this.Fouser.baseLong = null;
    this.Fouser.location = null;
    this.searchString = search;
    console.log('..........', search);
  }

  selectLocation(place) {
    console.log("palce", place);
    this.Fouser.baseLat = place.lat;
    this.Fouser.baseLong = place.long;
    this.Fouser.location = place.location || place.name;
  }

  takeAction(res) {
    setTimeout(() => {
      console.log("Here", this.keepGoing, this.searchString.length, this.searchString);
      if (this.keepGoing && this.searchString.length) {
        this.common.params = { placeholder: 'selectLocation', title: 'SelectLocation' };
        const activeModal = this.modalService.open(LocationSelectionComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
        this.keepGoing = false;
        activeModal.result.then(res => {
          if (res != null) {
            console.log('new-response----', res, res.location);
            this.keepGoing = true;
            if (res.location.lat) {
              this.Fouser.location = res.location.address;
              (<HTMLInputElement>document.getElementById('location')).value = this.Fouser.location;
              this.Fouser.baseLat = res.location.lat;
              this.Fouser.baseLong = res.location.lng;
              this.keepGoing = true;
            }
          }
        })

      }
    }, 1000);

  }

  onSelectAttenMedium() {
    if (this.selectedItems == 1) {
      this.Fouser.attenMedium = '100';
    } else if (this.selectedItems == 2) {
      this.Fouser.attenMedium = '010';
    } else if (this.selectedItems == 3) {
      this.Fouser.attenMedium = '001';
    }
  }
}
