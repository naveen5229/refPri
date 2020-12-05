import { Component, OnInit } from '@angular/core';
import { SaveadminComponent } from '../../modals/saveadmin/saveadmin.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { SendmessageComponent } from '../../modals/sendmessage/sendmessage.component';
@Component({
  selector: 'ngx-admin-tool',
  templateUrl: './admin-tool.component.html',
  styleUrls: ['./admin-tool.component.scss']
})
export class AdminToolComponent implements OnInit {

  activeAdminUserList = [];

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
    public api: ApiService,
    public modalService: NgbModal,
  ) {
    this.getActiveAdminList();
    this.common.refresh = this.refresh.bind(this);
  }

  ngOnInit() {}

  refresh(){
    this.getActiveAdminList();
  }

  adminTools() {
    const activeModal = this.modalService.open(SaveadminComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
  }

  getActiveAdminList() {
    this.common.loading++;
    this.api.get('Admin/getAllAdmin').subscribe(res => {
        this.common.loading--;
        this.activeAdminUserList = res['data'] || [];
        this.activeAdminUserList.length ? this.setTable() : this.resetTable();
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
    let headings = {};
    for (var key in this.activeAdminUserList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.formatTitle(key) };
        if(key == 'doj'){
          headings[key]["type"] = "date";
        }
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
    this.activeAdminUserList.map(activeAdmin => {
      let column = {};
      for (let key in this.generateHeadings()) {
        if (key == 'Action' || key == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(activeAdmin)
          };
        } else {
          column[key] = { value: activeAdmin[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    });
    return columns;

  }

  actionIcons(activeAdmin) {
    let icons = [
      { class: "fa fa-edit", action: this.editActiveAdmin.bind(this, activeAdmin) },
      // { class: "fa fa-info-circle", action: this.editAdminInfo.bind(this, activeAdmin) },
      // { class: "fa fa-trash", action: this.deleteInstaller.bind(this, installer) },
    ];
    return icons;
  }

  editActiveAdmin(activeAdmin) {
    this.common.params = { activeAdminDetail: activeAdmin, title: "Edit Admin", button: "Update" };
    const activeModal = this.modalService.open(SaveadminComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      console.log(data);
      if (data) {
        this.getActiveAdminList();
      }
    })
  }

  closeAdminDetailModal() {
    document.getElementById("adminDetailModal").style.display = "none";
  }

  adminDetail = {
    id: null,
    name: "",
    fatherName: ""
  }

  editAdminInfo(activeAdmin) {
    document.getElementById("adminDetailModal").style.display = "block";
    this.adminDetail.id = activeAdmin.id;
    this.adminDetail.name = activeAdmin.name;
  }

  exportCSV() {
    // this.common.getCSVFromTableId('dailyPartnerReport');
    this.common.getCSVFromDataArray(this.activeAdminUserList, this.table.data.headings, 'Admin')
  }

}
