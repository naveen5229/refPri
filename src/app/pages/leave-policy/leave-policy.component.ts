import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmComponent } from '../../modals/confirm/confirm.component';
import { GeneralModalComponent } from '../../modals/general-modal/general-modal.component';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { UserService } from '../../Service/user/user.service';

@Component({
  selector: 'ngx-leave-policy',
  templateUrl: './leave-policy.component.html',
  styleUrls: ['./leave-policy.component.scss']
})
export class LeavePolicyComponent implements OnInit {

  leavesPloicies = [];
  leaveTypes = [];
  leaveTypeName = null;
  btnText = "Save";
  leavePolicy = {
    id: null,
    typeId: null,
    periodStart: new Date(),
    periodEnd: new Date(),
    maxCarryForward: 0,
    paidCount: 0,
    unpaidCount: 0,
    allowedApplyCount: 0,
    maxDaysPerApply: 0,
    minGapDays: 0,
    minEmployementToApply: 0,
    maxEncashment: 0
  };
  policySetting = {
    id: null,
    wef: new Date(),
    calculationFormula: null,
    holidaySandwich: false,
    CalendarFixed: false,
    encashmentOptional: false,
    encashmentMonth: '3',
    encashCarryForward: 0
  };
  table = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };
  isWefDisabled = false;
  constructor(public common: CommonService,
    public modalService: NgbModal,
    public api: ApiService,
    public userService: UserService) {
    this.getData();
    this.getLeaveTypes();
    this.common.refresh = this.refresh.bind(this);
  }

  refresh() {
    this.getData();
    this.getLeaveTypes();
  }

  ngOnInit() {
  }

  selectLeaveType(event) {
    this.leaveTypeName = event.leave_type;
    this.leavePolicy.typeId = event.id;
  }

  getLeaveTypes() {
    let url = "LeavePolicy/getLeaveTypeList?";
    this.common.loading++;
    this.api.get(url)
      .subscribe(res => {
        this.common.loading--;
        this.leaveTypes = res['data'] || [];
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
  }

  startDate = null;
  endDate = null;

  getData() {
    this.leavesPloicies = [];
    this.table = {
      data: {
        headings: {},
        columns: []
      },
      settings: {
        hideHeader: true
      }
    };
    let startDate = this.startDate ? this.common.dateFormatter1(this.startDate) : null;
    let endDate = this.endDate ? this.common.dateFormatter1(this.endDate) : null;
   
    let params = {
      startDate : startDate ,
      endDate: endDate ,
    
   };

    let url = "LeavePolicy/getLeavePolicies?";
    this.common.loading++;
    this.api.post(url , params)
      .subscribe(res => {
        this.common.loading--;
        if (res['code'] === 0) 
        { 
          this.common.showError(res['msg']);
           return false;
         }
         else {
          this.leavesPloicies = res['data'] || [];
          this.leavesPloicies.length ? this.setTable() : this.resetTable();
      }
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
  }


  getSingleRowData(policyId?, policySettingId?, type?) {
   
    let startDate = this.startDate ? this.common.dateFormatter1(this.startDate) : null;
    let endDate = this.endDate ? this.common.dateFormatter1(this.endDate) : null;
    policyId = policyId ? policyId : null;
    policySettingId = policySettingId ? policySettingId : null;
    let params = {startDate : startDate ,
       endDate: endDate ,
      policyId: policyId ,
      policySettingId: policySettingId
    };
    let url = "LeavePolicy/getLeavePolicies?";
    this.common.loading++;
    this.api.post(url , params)
      .subscribe(res => {
        this.common.loading--;
        if (res['code'] === 0) 
        { 
          this.common.showError(res['msg']);
           return false;
         }
         else {
        if (type == 'view') {
          this.viewDetails(res['data'][0]);
        } else if (type == 'edit') {
          this.editRow(res['data'][0]);
        } 
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
  generateHeadings() {
    // console.log(this.dailyReportList);
    let headings = {};
    for (var key in this.leavesPloicies[0]) {
      // console.log(key.charAt(0));

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

  setTable() {
    this.table.data = {
      headings: this.generateHeadings(),
      columns: this.getTableColumns()
    };
    return true;
  }

  getTableColumns() {
    console.log(this.generateHeadings());
    let columns = [];
    this.leavesPloicies.map(ticket => {
      let column = {};
      for (let key in this.generateHeadings()) {
        if (key == 'Action' || key == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(ticket)
          };
        } else {
          column[key] = { value: (ticket[key] && typeof (ticket[key]) == 'object') ? ticket[key]['value'] + ticket[key]['suffix'] : ticket[key], class: (ticket[key]) ? ticket[key]['class'] : '', action: '' };
        }
      }
      columns.push(column);
    });
    return columns;

  }

  actionIcons(row) {
    let icons = [
      {
        class: "fa fa-eye",
        action: this.getSingleRowData.bind(this, row._policy_id, row._leave_policy_detailid, 'view'),
        txt: "",
        title: "Detail",
      },
      {
        class: "fa fa-edit",
        action: this.getSingleRowData.bind(this, row._policy_id, row._leave_policy_detailid, 'edit'),
        txt: "",
        title: "Edit",
      },
      {
        class: "fa fa-trash",
        action: this.delete.bind(this, row),
        txt: "",
        title: "Delete",
      },

    ];

    return icons;
  }

  resetForm() {
    this.leaveTypeName = null;
    this.leavePolicy = {
      id: null,
      typeId: null,
      periodStart: new Date(),
      periodEnd: new Date(),
      maxCarryForward: 0,
      paidCount: 0,
      unpaidCount: 0,
      allowedApplyCount: 0,
      maxDaysPerApply: 0,
      minGapDays: 0,
      minEmployementToApply: 0,
      maxEncashment: 0
    };
    this.policySetting = {
      id: null,
      wef: new Date(),
      calculationFormula: null,
      holidaySandwich: false,
      CalendarFixed: false,
      encashmentOptional: false,
      encashmentMonth: '3',
      encashCarryForward: 0
    };
    this.btnText = "Save";
  }

  saveData() {
    let params = {
      policyId: this.leavePolicy.id,
      policyTypeId: this.leavePolicy.typeId,
      periodStart: this.leavePolicy.periodStart ? this.common.dateFormatter1(this.leavePolicy.periodStart) : null,
      periodEnd: this.leavePolicy.periodEnd? this.common.dateFormatter1(this.leavePolicy.periodEnd) : null,
      maxCarryForward: this.leavePolicy.maxCarryForward,
      paidCount: this.leavePolicy.paidCount,
      unpaidCount: this.leavePolicy.unpaidCount,
      allowedApplyCount: this.leavePolicy.allowedApplyCount,
      maxDaysPerApply: this.leavePolicy.maxDaysPerApply,
      minGapDays: this.leavePolicy.minGapDays,
      minEmployementToApply: this.leavePolicy.minEmployementToApply,
      maxEncashment: this.leavePolicy.maxEncashment,
      policySettingId: this.policySetting.id,
      wef: this.policySetting.wef? this.common.dateFormatter1(this.policySetting.wef) : null,
      calculationFormula: this.policySetting.calculationFormula,
      holidaySandwich: this.policySetting.holidaySandwich,
      CalendarFixed: this.policySetting.CalendarFixed,
      encashmentOptional: this.policySetting.encashmentOptional,
      encashmentMonth: this.policySetting.encashmentMonth,
      encashCarryForward: this.policySetting.encashCarryForward,
    }

    let url = "LeavePolicy/saveLeavePolicies";
    this.common.loading++;
    this.api.post(url, params)
      .subscribe(res => {
        this.common.loading--;
        this.common.showToast(res['data'][0].result);
        this.getData();
        this.resetForm();
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
  }

  editRow(row) {
    this.leavePolicy.id = row._policy_id;
    this.leavePolicy.typeId = row._typeid;
    this.leaveTypeName = row.leave_type;
    this.leavePolicy.periodStart = row.period_start?new Date(row.period_start):null;
    this.leavePolicy.periodEnd = row.period_end?new Date(row.period_end):null;
    this.leavePolicy.maxCarryForward = row.max_cf;
    this.leavePolicy.paidCount = row.paid_count;
    this.leavePolicy.unpaidCount = row.unpaid_count;
    this.leavePolicy.allowedApplyCount = row.allowed_apply_count;
    this.leavePolicy.maxDaysPerApply = row.max_allowed_per_apply;
    this.leavePolicy.minGapDays = row.min_gap_days;
    this.leavePolicy.minEmployementToApply = row.min_employment_to_apply;
    this.leavePolicy.maxEncashment = row.max_encashment;
    this.policySetting.id = row._policy_detailid;
    this.policySetting.wef = row.wef?new Date(row.wef):null;;
    this.policySetting.calculationFormula = row.calulcation_method;
    this.policySetting.holidaySandwich = row.holiday_sandwich;
    this.policySetting.CalendarFixed = row.calendar_fixed;
    this.policySetting.encashmentOptional = row.encashment_optional;
    this.policySetting.encashmentMonth = row.encashment_month;
    this.policySetting.encashCarryForward = row.priority_encashor_cf;
    this.btnText = "Update";
    this.isWefDisabled = true;
  }


  delete(row) {
    let params = {
      isDelete: 1,
      policyId: row._policy_id
    }
    this.common.params = {
      title: 'Delete Policy ',
      description: `<b>&nbsp;` + 'Are You Sure To Delete This Record' + `<b>`,
    }
    const activeModal = this.modalService.open(ConfirmComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
    activeModal.result.then(data => {
      if (data.response) {
        let url = "LeavePolicy/saveLeavePolicies";
        this.common.loading++;
        this.api.post(url, params)
          .subscribe(res => {
            this.common.loading--;
            this.common.showToast(res['data'][0].result);
            this.getData()
          }, err => {
            this.common.loading--;
            this.common.showError();
            console.log(err);
          });
      }
    });
  }

  viewDetails(row?: any) {
    this.common.params = { details: [row], title: 'Details' }

    const activeModal = this.modalService.open(GeneralModalComponent, { size: 'lg' });

  }
}
