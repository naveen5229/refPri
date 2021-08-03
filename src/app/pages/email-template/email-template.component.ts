import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { AddEmailTemplateComponent } from '../../modals/add-email-template/add-email-template.component';
import { ConfirmComponent } from '../../modals/confirm/confirm.component';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { TableService } from '../../Service/Table/table.service';

@Component({
  selector: 'ngx-email-template',
  templateUrl: './email-template.component.html',
  styleUrls: ['./email-template.component.scss']
})
export class EmailTemplateComponent implements OnInit {
  selectedPage = 'my-leaves';
  adminList = [];
  groupList = [];
  myLeaves: any;
  dtOptions: any = {};
  leaveTypes = 4;
  startDate = new Date(new Date().setDate(new Date().getDate() - 15));
  endDate = new Date();
  allmyLeaves = [];
  windowType = 'templates';



  @ViewChild(DataTableDirective, { static: false })
  dtElement: any;
  dttrigger: any = new Subject();

  tables = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  constructor(
    public common: CommonService,
    public modalService: NgbModal,
    public api: ApiService,
    public table:TableService,
    private router: Router
  ) {
    this.getAllAdmin();
    this.getUserGroupList()
  }

  ngOnInit() {
  }

  getAllAdmin() {
    this.api.get("Admin/getAllAdmin.json").subscribe(
      (res) => {
        if (res["code"] > 0) {
          let adminList = res["data"] || [];
          console.log(adminList)
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

  addTemplate() {
    let title = "Add Template";
    let btn = "Add";

    this.common.params = {
      userList: this.adminList,
      groupList: this.groupList,
      // formType: formType,
      title: title,
      btn: btn
    };
    const activeModal = this.modalService.open(AddEmailTemplateComponent, {
      size: "lg",
      container: "nb-layout",
      backdrop: "static",
    });
    activeModal.result.then((data) => {
      console.log("data.response = ", data.response);
      if (data.response) {
        // this.selectedPage = 'my-leaves';
      }
//  this.selectedPage='my-leaves';

    });
  }

  getTemplate() {
    this.myLeaves = [];
    let startDate = this.leaveTypes == 4 ? new Date() : this.startDate;
    let params = "leaveType=" + this.leaveTypes +
      "&startDate=" + this.common.dateFormatter1(startDate) +
      "&endDate=" + this.common.dateFormatter1(this.endDate);
    console.log("params====", params);
    this.resetTable();
    this.common.loading++;
    this.api.get('AdminTask/getLeaveRequestData?' + params)
      .subscribe(res => {
        this.common.loading--;
        if (res['code'] === 0) {
          this.common.showError(res['msg']); return false;
        }
        if (res['data'] && res['data']) {
          this.allmyLeaves = res['data'] || [];
          console.log(' this.allmyLeaves: ', this.allmyLeaves);
          this.myLeaves = res['data'] || [];
          this.renderTable();
          console.log('this.myLeaves: ', this.myLeaves);
          // this.myLeaves.length ? this.setTable() : this.resetTable();
        }
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
  }

  generateHeadings() {
    let headings = {};
    for (var key in this.myLeaves[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
        if (key == 'date') {
          headings[key]["type"] = "date";
        }
      }
    }
    return headings;
  }

  getTableColumns() {
    let columns = [];
    this.myLeaves.map(shift => {
      let column = {};
      for (let key in this.generateHeadings()) {
        if (key == 'Action' || key == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(shift)
          };
        } else {
          column[key] = { value: shift[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    });
    console.log(columns);
    return columns;

  }

  actionIcons(row) {
    let icons = [];
    if (1) {
      icons.push({
        class: "fas fa-trash-alt",
        action: this.deleterow.bind(this, row, -101),
        txt: "",
        title: "Delete Template",
      });
    }
    return icons;
  }

  resetTable() {
    this.tables.data = {
      headings: {},
      columns: []
    };
  }

  renderTable() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.clear();
      dtInstance.destroy();
      this.dttrigger.next();
    });
  }

  deleterow(ticket, type) {
    if (ticket._refid) {
      let params = {
        taskId: ticket._refid,
      };
      this.common.params = {
        title: "Delete Template ",
        description: `<b>&nbsp;` + "Are You Sure To Delete This Record" + `<b>`,
      };

      const activeModal = this.modalService.open(ConfirmComponent, {
        size: "sm",
        container: "nb-layout",
        backdrop: "static",
        keyboard: false,
        windowClass: "accountModalClass",
      });
      activeModal.result.then((data) => {
        if (data.response) {
          this.common.loading++;
          this.api.post("AdminTask/deleteTicket", params).subscribe(
            (res) => {
              this.common.loading--;
              if (res['code'] === 0) { this.common.showError(res['msg']); return false; };
              this.common.showToast(res["msg"]);
              this.getTemplate();
            },
            (err) => {
              this.common.loading--;
              this.common.showError();
              console.log("Error: ", err);
            }
          );
        }
      });
    } else {
      this.common.showError("Leave ID Not Available");
    }
  }

  editTemplate(item?:any) {
    // this.resetType();
    // console.log('item',item);
    // this.id = item.id;
    // this.expenseType = item.description;
    //   this.typestatus = (item.expense_status == 1)?"Active":"Inactive";
    //   this.category = item.expenses_category;
    //   this.title = "Update Expense Type";
    //   this.btn = 'Update';

  }

   viewDetails(row?: any) {
     this.common.params = { details: [row], title: 'info' }
    console.log('row',row);
  //   const activeModal = this.modalService.open(ViewDetailsComponent, { size: 'lg' });

   }

   deleteTemplate(item?: any) {
    this.common.loading++;
    let params: any = {
      id: item.id,
    }
    this.api.post('Expense/deleteExpenseType.json', params)
      .subscribe((res: any) => {
        this.common.loading--;
        this.getTemplate();
        // console.log('id',this.id);
      }, (err: any) => {
        console.error('Error: ', err);
        this.common.loading--;
      });
  }

}

