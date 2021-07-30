import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmComponent } from '../../modals/confirm/confirm.component';
import { ErrorReportComponent } from '../../modals/error-report/error-report.component';
import { GeneralModalComponent } from '../../modals/general-modal/general-modal.component';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { UserService } from '../../Service/user/user.service';

@Component({
  selector: 'ngx-employee-leave-balance',
  templateUrl: './employee-leave-balance.component.html',
  styleUrls: ['./employee-leave-balance.component.scss']
})
export class EmployeeLeaveBalanceComponent implements OnInit {

  allUsers = [];
  leaves = {
    id:null,
    user:null,
    wef:new Date(),
    count:null,
  };
  userName=null;
  btnText = 'Save';
  employeeLeaves = [];

  table = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };
  constructor(public common: CommonService,
    public modalService: NgbModal,
    public api: ApiService,
    public userService: UserService) { 
      this.getAllAdmin();
      this.getData();
    }

  ngOnInit() {
  }

  refresh() {
    this.getAllAdmin();
      this.getData();
  }

  getAllAdmin() {
    let apiName = "Admin/getAllAdmin.json";
    console.log("this.userService._details['isSuperUser']====", this.userService._details['isSuperUser']);
    this.common.loading++;
    this.api.get(apiName)
      .subscribe(res => {
        this.common.loading--;
        if (res['code'] === 0) { this.common.showError(res['msg']); return false; };
        let allUsers = res['data'] || [];
        allUsers.map(x => {
          this.allUsers.push({
            "id": x.id,
            "name": x.name,
            "mobileno": x.mobileno,
            "department_name": x.department_name,
            "_dept_id":x._dept_id
          });
        })
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
  };

  selectedUser(event){
    this.leaves.user = event.id;
    this.userName = event.name;
  }

  getData() {
    this.employeeLeaves = [];
    this.table = {
      data: {
        headings: {},
        columns: []
      },
      settings: {
        hideHeader: true
      }
    };
  
    let url = "LeavePolicy/getEmployeeLeaveBalance";
    this.common.loading++;
    this.api.get(url)
      .subscribe(res => {
        this.common.loading--;
        if (res['code'] === 0) 
        { 
          this.common.showError(res['msg']);
           return false;
         }
         else {
          this.employeeLeaves = res['data'] || [];
          this.employeeLeaves.length ? this.setTable() : this.resetTable();
      }
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
  }


  getSingleRowData(row,type) {

        if (type == 'view') {
          this.viewDetails(row);
        } else if (type == 'edit') {
          this.editRow(row);
        } 
     
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
    for (var key in this.employeeLeaves[0]) {
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
    this.employeeLeaves.map(ticket => {
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
        action: this.getSingleRowData.bind(this, row, 'view'),
        txt: "",
        title: "Detail",
      },
      {
        class: "fa fa-edit",
        action: this.getSingleRowData.bind(this, row, 'edit'),
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
    this.leaves = {
      id:null,
      user:null,
      wef:new Date(),
      count:null,
    };
    this.btnText = "Save";
    this.userName = null;
  }

  saveData() {
    if(this.addType=='import'){
      this.uploadCsv();
      return;
    }else if(this.addType=='individual'){
      let params = {
        id: this.leaves.id,
        adminId: this.leaves.user,
        count: this.leaves.count,
        wef: this.leaves.wef? this.common.dateFormatter1(this.leaves.wef) : null,
       
      }
  
      let url = "LeavePolicy/saveEmployeeLeaveBalance";
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
    
  }

  editRow(row) {
    this.leaves.id = row._id;
    this.leaves.count = row.added_leaves;
    this.leaves.user = row._user_id;
    this.userName = row.name;
    this.leaves.wef = row.wef?new Date(row.wef):null;
    this.btnText = "Update";
  }


  delete(row) {
    let params = {
      id: row._id
    }
    this.common.params = {
      title: 'Delete Leaves ',
      description: `<b>&nbsp;` + 'Are You Sure To Delete This Record' + `<b>`,
    }
    const activeModal = this.modalService.open(ConfirmComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
    activeModal.result.then(data => {
      if (data.response) {
        let url = "LeavePolicy/deleteEmployeeLeaveBalance";
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
    console.log("row",row);
    this.common.params = { details: [row], title: 'Details' }

    const activeModal = this.modalService.open(GeneralModalComponent, { size: 'lg' });

  }

  addType="individual";
  leaveBalanceCsv =null;
  handleFileSelection(event) {
    this.common.loading++;
    this.common.getBase64(event.target.files[0])
      .then(res => {
        this.common.loading--;
        let file = event.target.files[0];
        console.log("file-type:", file.type);
        if (file.type == "application/vnd.ms-excel" || file.type == "text/csv") {
        }
        else {
          alert("valid Format Are : csv");
          return false;
        }

        res = res.toString().replace('vnd.ms-excel', 'csv');
        this.leaveBalanceCsv = res;
      }, err => {
        this.common.loading--;
        console.error('Base Err: ', err);
      })
  }

  
  uploadCsv() {
    let params = {
      leaveBalanceCsv: this.leaveBalanceCsv,
    };
    if (!params.leaveBalanceCsv) {
      return this.common.showError("CSV is missing");
    }
    this.common.loading++;
    this.api.post("LeavePolicy/importLeaveBalanceCsv", params)
      .subscribe(res => {
        this.common.loading--;
        if (res["code"] > 0) {
          this.common.showToast(res["msg"]);
          let successData = res['data']['success'];
          let errorData = res['data']['fail'];
          alert(res["msg"]);
          this.common.params = { successData, errorData, title: 'csv Uploaded Data' };
          const activeModal = this.modalService.open(ErrorReportComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
          activeModal.result.then(data => {
            if (data.response) {
              // this.activeModal.close({ response: true });
              this.leaveBalanceCsv = null;
              this.getData();
            }
          });
        } else {
          this.common.showError(res["msg"]);
        }
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
  }

  sampleCsv() {
    window.open(this.api.I_URL + "sample/employeeLeaveBalnceCsvSample.csv");
  }


}
