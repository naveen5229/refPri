import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { UserService } from '../../Service/user/user.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmComponent } from '../confirm/confirm.component';

@Component({
  selector: 'ngx-salary-detail',
  templateUrl: './salary-detail.component.html',
  styleUrls: ['./salary-detail.component.scss']
})
export class SalaryDetailComponent implements OnInit {
  today = new Date();
  salaryDetailList = [];
  tableSalaryDetail = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };
  selectedDates = {
    start: '',
    end: ''
  };

  salaryDetailForm = {
    name: null,
    tableId: null,
    empId: null,
    empType: 1,
    ctc: null,
    isPf: false,
    isEsic: false,
    leaveAllow: null,
    vpf: null,
    wef: null,
    otHourRate: null
  }

  constructor(public common: CommonService, public api: ApiService, public modalService: NgbModal, private activeModal: NgbActiveModal, public userService: UserService) { }

  ngOnInit() {
  }

  closeModal(response) {
    this.salaryDetailForm = {
      name: null,
      tableId: null,
      empId: null,
      empType: 1,
      ctc: null,
      isPf: false,
      isEsic: false,
      leaveAllow: null,
      vpf: null,
      wef: null,
      otHourRate: null
    };

    this.activeModal.close({ response: response });
  }

  getSalaryDetails() {
    this.common.loading++;
    let params = "?date=" + this.selectedDates.start;
    this.api.get("Admin/getSalaryDetails" + params).subscribe(res => {
      this.common.loading--;
      console.log("data", res['data'])
      this.reserSmartTableData();
      this.salaryDetailList = res['data'] || [];
      this.setTableSalaryDetail();

    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  reserSmartTableData() {
    this.tableSalaryDetail.data = {
      headings: {},
      columns: []
    };
  }

  setTableSalaryDetail() {
    this.tableSalaryDetail.data = {
      headings: this.generateHeadingsSalaryDetail(),
      columns: this.getTableColumnsSalaryDetail()
    };
    return true;
  }

  generateHeadingsSalaryDetail() {
    let headings = {};
    for (var key in this.salaryDetailList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    return headings;
  }

  getTableColumnsSalaryDetail() {
    let columns = [];
    this.salaryDetailList.map(ticket => {
      let column = {};
      for (let key in this.generateHeadingsSalaryDetail()) {
        if (key == 'Action' || key == 'action') {
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

  actionIcons(ticket) {
    let icons = [
      { class: "fa fa-plus", action: this.showDetailFormModal.bind(this, ticket, 0), txt: '', title: "Add" },
      { class: "fa fa-edit", action: this.showDetailFormModal.bind(this, ticket, 1), txt: '', title: "Edit" },
      { class: "fa fa-trash-alt", action: this.deleteSalaryDetail.bind(this, ticket), txt: '', title: "Delete" },
    ];
    return icons;
  }

  closeDetailFormModal() {
    document.getElementById("detailFormModal").style.display = "none";
  }

  showDetailFormModal(sDetail, isEdit) {
    this.salaryDetailForm.name = sDetail.name;
    this.salaryDetailForm.tableId = (isEdit) ? sDetail._id : null;
    this.salaryDetailForm.empId = sDetail._emp_id;
    this.salaryDetailForm.empType = (sDetail._emp_type) ? sDetail._emp_type : 1;
    this.salaryDetailForm.ctc = sDetail.ctc;
    this.salaryDetailForm.isPf = sDetail.pf_applicable;
    this.salaryDetailForm.isEsic = sDetail.esic_applicable;
    this.salaryDetailForm.leaveAllow = sDetail.leave_allow;
    this.salaryDetailForm.vpf = sDetail.vpf;
    this.salaryDetailForm.wef = new Date(sDetail.wef);
    this.salaryDetailForm.otHourRate = sDetail.ot_hour_rate;

    document.getElementById("detailFormModal").style.display = "block";
  }

  addSalaryDetail() {
    let params = {
      tableId: this.salaryDetailForm.tableId,
      empId: this.salaryDetailForm.empId,
      empType: this.salaryDetailForm.empType,
      ctc: this.salaryDetailForm.ctc,
      isPf: this.salaryDetailForm.isPf,
      isEsic: this.salaryDetailForm.isEsic,
      leaveAllow: this.salaryDetailForm.leaveAllow,
      vpf: this.salaryDetailForm.vpf,
      wef: (this.salaryDetailForm.wef) ? this.common.dateFormatter(this.salaryDetailForm.wef) : null,
      otHourRate: this.salaryDetailForm.otHourRate
    }
    this.common.loading++;
    this.api.post("Admin/saveSalaryDetail", params).subscribe(res => {
      this.common.loading--;
      console.log("data", res['data']);
      if (res['code'] == 1) {
        this.common.showToast(res['msg']);
        this.closeDetailFormModal();
        this.getSalaryDetails();
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
  }


  deleteSalaryDetail(sDetail) {
    console.log(sDetail);
    if (sDetail._id) {
      let params = {
        tableId: sDetail._id
      }
      this.common.params = {
        title: 'Delete Salary Detail',
        description: `<b>&nbsp;` + 'Are You Sure To Delete This Record' + `<b>`,
      }

      const activeModal = this.modalService.open(ConfirmComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
      activeModal.result.then(data => {
        if (data.response) {
          this.common.loading++;
          this.api.post('Admin/deleteSalaryDetailById', params)
            .subscribe(res => {
              this.common.loading--;
              this.common.showToast(res['msg']);
              this.getSalaryDetails();
            }, err => {
              this.common.loading--;
              console.log('Error: ', err);
            });
        }
      });
    } else {
      this.common.showError("Activity ID Not Available");
    }
  }

}
