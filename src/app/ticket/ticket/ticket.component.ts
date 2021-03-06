import { AutoSuggestionComponent } from './../../directives/auto-suggestion/auto-suggestion.component';
import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { UserService } from '../../Service/user/user.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormDataTableComponent } from '../../modals/process-modals/form-data-table/form-data-table.component';
import { ReminderComponent } from '../../modals/reminder/reminder.component';
import { TicketChatboxComponent } from '../../modals/ticket-modals/ticket-chatbox/ticket-chatbox.component';
import { AddExtraTimeComponent } from '../../modals/ticket-modals/add-extra-time/add-extra-time.component';
import { ConfirmComponent } from '../../modals/confirm/confirm.component';
import { TicketClosingFormComponent } from '../../modals/ticket-modals/ticket-form-field/ticket-closing-form.component';
import { GenericModelComponent } from '../../modals/generic-model/generic-model.component';
import { AddTransactionContactComponent } from '../../modals/process-modals/add-transaction-contact/add-transaction-contact.component';
import { LocationSelectionComponent } from '../../modals/location-selection/location-selection.component';
// import { ConfirmComponent } from '../../modals/confirm/confirm.component';

@Component({
  selector: 'ngx-ticket',
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.scss']
})
export class TicketComponent implements OnInit {
  additionalFields = [];
  tableHeader = null;
  isDisabled = false;

  arraytype:any;
  arraytypeIndex:number;

  ticketDetailTitle = 'Ticket Info';
  loginUserId = this.userService.loggedInUser.id;
  activeTab = 'allocatedTkt';
  activeSabTab = 0;
  adminList = [];
  tpList = [];
  allocatedTkt = [];
  unallocatedTkt = [];
  unreadTkt = [];
  unassignedTkt = [];
  completedTkt = [];
  completedTktAll = [];
  ccTkt = [];
  addedByMeTkt = [];
  groupList = [];
  tableAllocatedTkt = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  tableUnallocatedTkt = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  tableUnreadTkt = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  tableUnassignedTkt = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  tableCompletedTkt = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  tableCcTkt = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  tableAddedByMeTkt = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  ticketHistoryList = [];
  tableTicketHistory = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  allOpenTicketList = [];
  tableAllOpenTkt = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  ticketFormFields;
  tpPropertyList = [];
  ticketForm = {
    requestId: null,
    tp: { id: null, name: null },
    tpProperty: { id: null, name: null },
    priCat: { id: 0, name: null },
    secCat: { id: 0, name: null },
    type: { id: 0, name: null },
    info: null,
    remark: null
  }
  categoryIds = {
    priCat: null,
    secCat: null,
    type: null,
  }
  priCatList = [];
  secCatList = [];
  typeList = [];
  evenArray = [];
  oddArray = [];
  assignUserObject = {
    tktId: null,
    userId: null,
    type: null
  }

  forwardTicketObject = {
    ticketAllocationId: null,
    tktId: null,
    userId: { id: null, name: '' },
    remark: null,
    tabType: null
  }

  searchData = {
    startDate: <any>this.common.getDate(-2),
    endDate: <any>this.common.getDate()
  }

  openingFormInfo = [];
  closingFormInfo = [];
  primaryFormInfo = [];
  attachmentFile = [{ name: null, file: null }];

  constructor(public common: CommonService, public api: ApiService, public modalService: NgbModal, public userService: UserService) {
    this.getTicketByType(101);
    this.getAllAdmin();
    this.getTicketProcessList();
    this.getUserGroupList();
    this.common.refresh = this.refresh.bind(this);
     if (this.additionalFields && this.additionalFields.length > 0) {
      this.tableHeader = JSON.parse(JSON.stringify(this.additionalFields[0]));
      this.additionalFields.forEach(element => {
        element.forEach(e => {
          e["isNotBindFixedvalue"] = (e["isNotBindFixedvalue"]) ? e["isNotBindFixedvalue"] : false;
          e["notBindFixedvalue"] = (e["notBindFixedvalue"]) ? e["notBindFixedvalue"] : null;
          if (e.param_type == 'date') {
            e.param_value = (e.param_value) ? new Date(e.param_value) : new Date();
          } else if (e.param_type == 'entity') {
            if (e.param_value > 0 && e.param_info && e.param_info.length) {
              let entity_value = e.param_info.find(x => { return x._id == e.param_value });
              e['entity_value'] = (entity_value) ? entity_value.option : null;
            } else {
              e['entity_value'] = null;
            }
          } else if (e.param_value && e.param_info && e.param_info.length) { // for not bind dropdown
            let notBindFixedvalue = e.param_info.find(x => { return x.option == e.param_value });
            if (!notBindFixedvalue) {
              let notBindOption = e.param_info.find(x => x.isNonBind);
              e["isNotBindFixedvalue"] = true;
              e["notBindFixedvalue"] = e.param_value;
              e["param_value"] = (notBindOption && notBindOption.option) ? notBindOption.option : null;
            }
          }

          //earlier code
          // if (e.r_value && e.param_info && e.param_info.length) { // for not bind dropdown
          //   let notBindFixedvalue = e.param_info.find(x => { return x.option == e.r_value });
          //   if (!notBindFixedvalue) {
          //     let notBindOption = e.param_info.find(x => x.isNonBind);
          //     e["isNotBindFixedvalue"] = true;
          //     e["notBindFixedvalue"] = e.r_value;
          //     e["r_value"] = (notBindOption && notBindOption.option) ? notBindOption.option : null;
          //   }
          // }
          //earlier code

        });
      });
    }
  }

  refresh() {
    this.getTicketByType(101);
    this.getAllAdmin();
    this.getTicketProcessList();
    this.getUserGroupList();
    this.activeTab = 'allocatedTkt';
    this.activeSabTab = 0;
  }

  ngOnInit() { }

  getAllAdmin() {
    this.api.get("Admin/getAllAdmin.json").subscribe(res => {
      if (res['code'] > 0) {
        this.adminList = res['data'] || [];
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  getUserGroupList() {
    this.api.get('UserRole/getUserGroups').subscribe(res => {
      if (res["code"] > 0) {
        let groupList = res['data'] || [];
        this.groupList = groupList.map((x) => {
          return { id: x._id, name: x.name, groupId: x._id, groupuser: x._employee };
        });
      } else {
        this.common.showError(res["msg"]);
      }
    },err => {
      this.common.showError();
      console.log("Error: ", err);
    });
  }

  getTicketProcessList() {
    this.common.loading++;
    this.api.get('Ticket/getTicketProcessList').subscribe(res => {
      this.common.loading--;
      if(res['code']===0) { this.common.showError(res['msg']); return false;};
      let tpList = res['data'] || [];
      this.tpList = tpList.filter(ele => {
        return (ele._is_active && ele._ticket_input > 0)
      })
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log(err);
    });
  }

  getTicketFormField(refType) {
    if (!this.ticketForm.tp.id) {
      this.common.showError("Ticket Process is missing");
      return false;
    }
    this.ticketFormFields = null;
    let params = "?refId=" + this.ticketForm.tp.id + "&refType=" + refType + "&ticketId=" + this.ticketForm.requestId;
    this.api.get("Ticket/getTicketFormFieldById" + params).subscribe(res => {
      if (res['code'] > 0) {
        if (res['data']) {
          this.ticketFormFields = res['data'];
          console.log('fields data',this.ticketFormFields)
          // if (this.activeTab == 'completedTkt') {
            if (refType == 1) {
              this.closingFormInfo = this.ticketFormFields;
            }else if(refType == 2){
              this.primaryFormInfo = this.ticketFormFields;
            } else {
              this.openingFormInfo = this.ticketFormFields;
            }
          // }
          this.formatArray();
        }
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  getTicketProcessProperty() {
    this.common.loading++;
    this.api.get('Ticket/getTicketProcessProperty?tpId=' + this.ticketForm.tp.id).subscribe(res => {
      this.common.loading--;
      if(res['code']===0) { this.common.showError(res['msg']); return false;};
      this.tpPropertyList = res['data'] || [];
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log(err);
    });
  }

  // onSelectNotBind(event,row){
  //   let selectEl = event.target;
  //   let testval = selectEl.options[selectEl.selectedIndex].getAttribute('isNotBind');
  //   row.isNotBindFixedvalue = false;
  //   if(JSON.parse(testval)){
  //     row.isNotBindFixedvalue = true;
  //   }
  // }

  formatArray() {
    this.evenArray = [];
    this.oddArray = [];
    this.ticketFormFields.map(dd => {
      dd["isNotBindFixedvalue"] = false;
      dd["notBindFixedvalue"] = null;
      if (dd.r_coltype == 'date') {
        dd.r_value = dd.r_value ? new Date(dd.r_value) : new Date();
        console.log("date==", dd.r_value);
      }
      if (dd.r_coltype == 'checkbox') {
        dd.r_value = (dd.r_value == "true") ? true : false;
      }
      if (dd.r_coltype == 'entity'){
        if(dd.r_value>0 && dd.r_fixedvalues && dd.r_fixedvalues.length) {
          let entity_value = dd.r_fixedvalues.find(x=>{return x._id==dd.r_value});
          dd['entity_value'] = (entity_value) ? entity_value.option : null;
        }else{
          dd['entity_value'] = null;
        }
      }
      if(dd.r_value && dd.r_fixedvalues && dd.r_fixedvalues.length) { // for not bind dropdown
        let notBindFixedvalue = dd.r_fixedvalues.find(x=>{return x.option==dd.r_value});
        if(!notBindFixedvalue){
          let notBindOption = dd.r_fixedvalues.find(x=>x.isNonBind);
          dd["isNotBindFixedvalue"] = true;
          dd["notBindFixedvalue"] = dd.r_value;
          dd["r_value"] = (notBindOption && notBindOption.option) ? notBindOption.option : null;
        }
      }
      if (dd.r_fixedvalues) {
        dd.r_fixedvalues = dd.r_fixedvalues;
      }
      if (dd.r_colorder && dd.r_colorder % 2 == 0) {
        this.evenArray.push(dd);
      } else {
        this.oddArray.push(dd);
      }
    });

  }


//  close(res) {
//     this.activeModal.close({ response: res, data: (this.additionalFields && this.additionalFields.length > 0) ? this.additionalFields : null });
//   }

  // AddTableRow() {
  //   let temp = JSON.parse(JSON.stringify(this.tableHeader));
  //   temp.forEach(e => {
  //     e.param_value = (e.param_type == 'date') ? new Date() : null;
  //   });
  //   this.additionalFields.push(temp);
  // }


    AddTableRow(header,fields) {
    let temp = JSON.parse(JSON.stringify(header));
    temp.forEach(e => {
      e.param_value = (e.param_type == 'date') ? new Date() : null;
    });
    fields.push(temp);
  }

 addTransaction() {
 console.log('oddarray',this.oddArray);
    // console.log("additionalFields:", this.additionalFields);
    // this.close(true);
  }

  // addTransaction() {
  //   // console.log("additionalFields:", this.additionalFields);
  //   this.close(true);
  // }

  onSelectNotBind(event, row) {
    console.log(event, row)
    let selectEl = event.target;
    let testval = selectEl.options[selectEl.selectedIndex].getAttribute('isNotBind');
    console.log(testval)
    row.isNotBindFixedvalue = false;
    if (JSON.parse(testval)) {
      row.isNotBindFixedvalue = true;
    }
  }

  resetTicketForm() {
    this.tpPropertyList = [];
    this.oddArray = [];
    this.evenArray = [];
    this.priCatList = [];
    this.secCatList = [];
    this.typeList = [];
    this.ticketFormFields = null;
    this.ticketForm = {
      requestId: null,
      tp: { id: null, name: null },
      tpProperty: { id: null, name: null },
      priCat: { id: 0, name: null },
      secCat: { id: 0, name: null },
      type: { id: 0, name: null },
      info: null,
      remark: null
    }
  }

splicetrash(arr:any,index:number){
console.log('arr: ', arr);
let remove = () =>{
arr[0].map((item:any)=>{
  item.param_value = null;
  item.entity_value = null;
});
};
arr.length > 1 ? arr.splice(index,1):remove();

}


  openAddTicketModal() {
    document.getElementById('addTicketModal').style.display = 'block';
  }

  closeAddTicketModal() {
    document.getElementById('addTicketModal').style.display = 'none';
    this.resetTicketForm();
  }

  onSelectedTp(event) {
    console.log("event:", event);
    this.ticketForm.tp.id = event._id;
    console.log('this.ticketForm.tp.id: ', this.ticketForm.tp.id);
    this.ticketForm.tp.name = event.name;

    this.tpPropertyList = [];
    this.oddArray = [];
    this.evenArray = [];
    this.priCatList = [];
    this.secCatList = [];
    this.typeList = [];
    this.ticketFormFields = null;
    setTimeout(() => {
      this.getTicketFormField(0);
      this.getTicketProcessProperty();


    }, 500);

    for (let i = 1; i <= 3; i++) {
      this.getCatListByType(event._id, i)
    }



  }

  getCatListByType(process_id, type) {
    this.priCatList = [];
    this.secCatList = [];
    this.typeList = [];
    let param = `tpId=${process_id}&type=${type}`
    this.common.loading++;
    this.api.get("Ticket/getTicketProcessCatByType?" + param).subscribe(res => {
      this.common.loading--;
      if(res['code']===0) { this.common.showError(res['msg']); return false;};
      if (type == 1) {
        let priCatList = res['data'];
        this.priCatList = priCatList.map(x => { return { id: x._id, name: x.name } });
      } else if (type == 2) {
        let secCatList = res['data'];
        this.secCatList = secCatList.map(x => { return { id: x._id, name: x.name } });
      } else {
        let typeList = res['data'];
        this.typeList = typeList.map(x => { return { id: x._id, name: x.name } });
      }
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  getTicketByType(type, startDate = null, endDate = null) {
    this.activeSabTab = 0;
    this.common.loading++;
    if ((type == 105) && this.searchData.startDate && this.searchData.endDate) {
      startDate = this.common.dateFormatter(this.searchData.startDate);
      endDate = this.common.dateFormatter(this.searchData.endDate);
    }
    this.resetSmartTableData();
    let params = "?type=" + type + "&startDate=" + startDate + "&endDate=" + endDate;
    this.api.get("Ticket/getTicketByType" + params).subscribe(res => {
      this.common.loading--;
      if (res['code'] == 1) {
        if (type == 100) {
          this.unallocatedTkt = res['data'] || [];
          this.setTableUnallocatedTkt(type);
        } else if (type == 101) {
          this.allocatedTkt = res['data'] || [];
          this.setTableAllocatedTkt(type);
        } else if (type == 102) {
          this.unreadTkt = res['data'] || [];
          this.setTableUnreadTkt(type);
        } else if (type == 103) {
          this.unassignedTkt = res['data'] || [];
          this.setTableUnassignedTkt(type);
        } else if (type == 105) {
          this.completedTkt = res['data'] || [];
          this.completedTktAll = this.completedTkt;
          this.setTablecompletedTkt(type);
        } else if (type == 104) {
          this.ccTkt = res['data'] || [];
          this.setTableccTkt(type);
        } else if (type == 106) {
          this.addedByMeTkt = res['data'] || [];
          this.setTableaddedByMeTkt(type);
        } else if (type == 107) {
          this.allOpenTicketList = res['data'] || [];
          this.setTableAllOPenTkt(type);
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

  resetSmartTableData() {
    this.tableAllocatedTkt.data = {
      headings: {},
      columns: []
    };
    this.tableUnallocatedTkt.data = {
      headings: {},
      columns: []
    };
    this.tableUnreadTkt.data = {
      headings: {},
      columns: []
    };
    this.tableUnassignedTkt.data = {
      headings: {},
      columns: []
    };
  }

  // start: allocatedTkt
  setTableAllocatedTkt(type) {
    this.tableAllocatedTkt.data = {
      headings: this.generateHeadingsAllocatedTkt(),
      columns: this.getTableColumnsAllocatedTkt(type)
    };
    return true;
  }

  generateHeadingsAllocatedTkt() {
    let headings = {};
    for (var key in this.allocatedTkt[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
      if (key === "addtime" || key === "action_completed") {
        headings[key]["type"] = "date";
      }
    }
    return headings;
  }

  getTableColumnsAllocatedTkt(type) {
    let columns = [];
    this.allocatedTkt.map(lead => {
      let column = {};
      for (let key in this.generateHeadingsAllocatedTkt()) {
        if (key.toLowerCase() == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(lead, type)
          };
        } else if (key == "remaining_time") {
          column[key] = { value: this.common.findRemainingTime(lead[key]), class: "black", action: "", };
        } else {
          column[key] = { value: lead[key], class: 'black', action: '' };
        }

        column['style'] = { 'background': this.common.taskStatusBg(lead._status) };
      }
      columns.push(column);
    });
    return columns;
  }
  // end: allocatedTkt

  // start: UnallocatedTkt
  setTableUnallocatedTkt(type) {
    this.tableUnallocatedTkt.data = {
      headings: this.generateHeadingsUnallocatedTkt(),
      columns: this.getTableColumnsUnallocatedTkt(type)
    };
    return true;
  }

  generateHeadingsUnallocatedTkt() {
    let headings = {};
    for (var key in this.unallocatedTkt[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
      if (key === "addtime" || key === "action_completed") {
        headings[key]["type"] = "date";
      }
    }
    return headings;
  }

  getTableColumnsUnallocatedTkt(type) {
    let columns = [];
    this.unallocatedTkt.map(lead => {
      let column = {};
      for (let key in this.generateHeadingsUnallocatedTkt()) {
        if (key.toLowerCase() == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(lead, type)
          };
        } else {
          column[key] = { value: lead[key], class: 'black', action: '' };
        }

        // column['style'] = { 'background': this.common.taskStatusBg(lead._status) };
      }
      columns.push(column);
    });
    return columns;
  }
  // end: unallocatedTkt
  // start: UnreadTkt
  setTableUnreadTkt(type) {
    this.tableUnreadTkt.data = {
      headings: this.generateHeadingsUnreadTkt(),
      columns: this.getTableColumnsUnreadTkt(type)
    };
    return true;
  }

  generateHeadingsUnreadTkt() {
    let headings = {};
    for (var key in this.unreadTkt[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
      if (key === "addtime" || key === "action_completed") {
        headings[key]["type"] = "date";
      }
    }
    return headings;
  }

  getTableColumnsUnreadTkt(type) {
    let columns = [];
    this.unreadTkt.map(lead => {
      let column = {};
      for (let key in this.generateHeadingsUnreadTkt()) {
        if (key.toLowerCase() == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(lead, type)
          };
        } else if (key == "remaining_time") {
          column[key] = { value: this.common.findRemainingTime(lead[key]), class: "black", action: "", };
        } else {
          column[key] = { value: lead[key], class: 'black', action: '' };
        }

        column['style'] = { 'background': this.common.taskStatusBg(lead._status) };
      }
      columns.push(column);
    });
    return columns;
  }
  // end: unreadTkt
  // start: UnassignedTkt
  setTableUnassignedTkt(type) {
    this.tableUnassignedTkt.data = {
      headings: this.generateHeadingsUnassignedTkt(),
      columns: this.getTableColumnsUnassignedTkt(type)
    };
    return true;
  }

  generateHeadingsUnassignedTkt() {
    let headings = {};
    for (var key in this.unassignedTkt[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
      if (key === "addtime" || key === "action_completed") {
        headings[key]["type"] = "date";
      }
    }
    return headings;
  }

  getTableColumnsUnassignedTkt(type) {
    let columns = [];
    this.unassignedTkt.map(lead => {
      let column = {};
      for (let key in this.generateHeadingsUnassignedTkt()) {
        if (key.toLowerCase() == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(lead, type)
          };
        } else {
          column[key] = { value: lead[key], class: 'black', action: '' };
        }

        // column['style'] = { 'background': this.common.taskStatusBg(lead._status) };
      }
      columns.push(column);
    });
    return columns;
  }
  // end: UnassignedTkt

  // start: CCTkt
  setTableccTkt(type) {
    this.tableCcTkt.data = {
      headings: this.generateHeadingsccTkt(),
      columns: this.getTableColumnsccTkt(type)
    };
    return true;
  }

  generateHeadingsccTkt() {
    let headings = {};
    for (var key in this.ccTkt[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
      if (key === "addtime" || key === "action_completed") {
        headings[key]["type"] = "date";
      }
    }
    return headings;
  }

  getTableColumnsccTkt(type) {
    let columns = [];
    this.ccTkt.map(lead => {
      let column = {};
      for (let key in this.generateHeadingsccTkt()) {
        if (key.toLowerCase() == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(lead, type)
          };
        } else if (key == "remaining_time") {
          column[key] = { value: this.common.findRemainingTime(lead[key]), class: "black", action: "", };
        } else {
          column[key] = { value: lead[key], class: 'black', action: '' };
        }

        // column['style'] = { 'background': this.common.taskStatusBg(lead._status) };
      }
      columns.push(column);
    });
    return columns;
  }
  // end: CCTkt

  // start: addedByMeTkt
  setTableaddedByMeTkt(type) {
    this.tableAddedByMeTkt.data = {
      headings: this.generateHeadingsaddedByMeTkt(),
      columns: this.getTableColumnsaddedByMeTkt(type)
    };
    return true;
  }

  generateHeadingsaddedByMeTkt() {
    let headings = {};
    for (var key in this.addedByMeTkt[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
      if (key === "addtime" || key === "action_completed") {
        headings[key]["type"] = "date";
      }
    }
    return headings;
  }

  getTableColumnsaddedByMeTkt(type) {
    let columns = [];
    this.addedByMeTkt.map(lead => {
      let column = {};
      for (let key in this.generateHeadingsaddedByMeTkt()) {
        if (key.toLowerCase() == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(lead, type)
          };
        } else if (key == "remaining_time") {
          column[key] = { value: this.common.findRemainingTime(lead[key]), class: "black", action: "", };
        } else {
          column[key] = { value: lead[key], class: 'black', action: '' };
        }

        // column['style'] = { 'background': this.common.taskStatusBg(lead._status) };
      }
      columns.push(column);
    });
    return columns;
  }
  // end: addedByMeTkt

  // start: allOpenTickets
  setTableAllOPenTkt(type) {
    this.tableAllOpenTkt.data = {
      headings: this.generateHeadingsallOpenTickets(),
      columns: this.getTableColumnsallOpenTickets(type)
    };
    return true;
  }

  generateHeadingsallOpenTickets() {
    let headings = {};
    for (var key in this.allOpenTicketList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
      if (key === "addtime" || key === "action_completed") {
        headings[key]["type"] = "date";
      }
    }
    return headings;
  }

  getTableColumnsallOpenTickets(type) {
    let columns = [];
    this.allOpenTicketList.map(lead => {
      let column = {};
      for (let key in this.generateHeadingsallOpenTickets()) {
        if (key.toLowerCase() == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(lead, type)
          };
        } else if (key == "remaining_time") {
          column[key] = { value: this.common.findRemainingTime(lead[key]), class: "black", action: "", };
        } else {
          column[key] = { value: lead[key], class: 'black', action: '' };
        }

        // column['style'] = { 'background': this.common.taskStatusBg(lead._status) };
      }
      columns.push(column);
    });
    return columns;
  }
  // end: allOpenTickets

  // start: CompletedTkt
  setTablecompletedTkt(type) {
    this.tableCompletedTkt.data = {
      headings: this.generateHeadingscompletedTkt(),
      columns: this.getTableColumnscompletedTkt(type)
    };
    return true;
  }

  generateHeadingscompletedTkt() {
    let headings = {};
    for (var key in this.completedTkt[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
      if (key === "addtime" || key === "action_completed") {
        headings[key]["type"] = "date";
      }
    }
    return headings;
  }

  getTableColumnscompletedTkt(type) {
    let columns = [];
    this.completedTkt.map(lead => {
      let column = {};
      for (let key in this.generateHeadingscompletedTkt()) {
        if (key.toLowerCase() == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(lead, type)
          };
        } else if (key == "remaining_time") {
          column[key] = { value: this.common.findRemainingTime(lead[key]), class: "black", action: "", };
        } else {
          column[key] = { value: lead[key], class: 'black', action: '' };
        }

        // column['style'] = { 'background': this.common.taskStatusBg(lead._status) };
      }
      columns.push(column);
    });
    return columns;
  }
  // end: CompletedTkt

  actionIcons(ticket, type) {
    console.log("actionIcons:", ticket);
    let icons = [];
    if (type == 101 || type == 102 || type == 106 || type == 104 || type == 105 || type == 107) {
      icons.push({ class: "fas fa-comments", action: this.ticketMessage.bind(this, ticket, type), txt: "", title: 'Chat Box', });

      if (ticket._unreadcount > 0) {
        icons = [{ class: "fas fa-comments new-comment", action: this.ticketMessage.bind(this, ticket, type), txt: ticket._unreadcount, title: 'Chat Box', },];
      } else if (ticket._unreadcount == -1) {
        icons = [{ class: "fas fa-comments no-comment", action: this.ticketMessage.bind(this, ticket, type), txt: "", title: 'Chat Box', },];
      }

      if (ticket._status == 5 || ticket._status == -1) {
      } else {
        if (ticket._isremind == 1 && (type == 106 || type == 104 || type == 101 || type == 102 || type == 107)) {
          icons.push({ class: "fa fa-bell isRemind", action: this.checkReminderSeen.bind(this, ticket, type), txt: "", title: 'Reminder', });
        } else if (ticket._isremind == 2 && (type != 102)) {
          icons.push({ class: "fa fa-bell reminderAdded", action: this.showReminderPopup.bind(this, ticket, type), txt: "", title: 'Reminder', });
        } else {
          if (type != 102) {
            icons.push({ class: "fa fa-bell", action: this.showReminderPopup.bind(this, ticket, type), txt: "", title: 'Reminder', });
          }
        }
      }
      icons.push({ class: "fas fa-history", action: this.ticketHistory.bind(this, ticket, type), txt: '', title: "History" });

      if (type == 106) {
        icons.push({ class: 'fas fa-trash-alt', action: this.deleteTicket.bind(this, ticket, type), txt: '', title: "Delete Ticket" });
      } else if (type == 101 || type == 102 || type == 107) {
        icons.push({ class: "fas fa-share", action: this.openForwardTicket.bind(this, ticket, type), txt: '', title: "Forward Ticket" });
        if (type == 107) {
          if (ticket._allocated_user == this.loginUserId  && !ticket._status) {
            icons.push({ class: "fa fa-check-square text-warning", action: this.changeTicketStatusWithConfirm.bind(this, ticket, type, 2), txt: "", title: "Mark Ack", });
          } else if (ticket._allocated_user == this.loginUserId && ticket._ticket_closure > 0 &&  ticket._status == 2) {
            icons.push({ class: "fa fa-thumbs-up text-success", action: (ticket._close_form > 0) ? this.openTicketFormData.bind(this, ticket, type, 5) : this.changeTicketStatusWithConfirm.bind(this, ticket, type, 5), txt: "", title: "Mark Completed", });
          }
          if ((ticket._allocated_user == -1 && ticket._status == 0) || ticket._status === null) {
            icons.push({ class: "fa fa-hand-lizard-o text-warning", action: this.claimTicket.bind(this, ticket, type), txt: '', title: "Claim Ticket" });
          }
        } else if (type == 102) {
          if ((ticket._status == 5 || ticket._status == -1) && ticket._close_form > 0) {
            icons.push({ class: "fas fa-plus-square text-primary", action: this.openInfoModal.bind(this, ticket, type, 1), title: "Form Matrix Detail" })
          }
        }
        if (ticket._allocated_user == this.loginUserId && ticket._status == 2 && ticket._check_status>0) {
          icons.push({ class: "fas fa-clipboard-check", action: this.openCheckStatusModal.bind(this, ticket, type), txt: "", title: "Check Status", });
        }
      } else if (type == 105) {
        icons.push({ class: "fa fa-retweet", action: this.changeTicketStatusWithConfirm.bind(this, ticket, type, 0), txt: "", title: "Re-Active", });
        // if ((ticket._status == 5 || ticket._status == -1) && ticket._close_form > 0) {
        //   icons.push({ class: "fas fa-plus-square text-primary", action: this.openInfoModal.bind(this, ticket, type, 1), title: "Form Matrix Detail" })
        // }
      }

      if([101,106].includes(type)){
        icons.push({ class: 'fas fa-address-book s-4', action: this.addTransContact.bind(this, ticket, type), txt: '', title: "Address Book" });
      }

      if (ticket._status == 2 && (type == 101 || type == 102)) {
        icons.push({ class: "fas fa-user-clock", action: this.addTime.bind(this, ticket, type), txt: '', title: "Add Extra Time" });
      }

      if(ticket._allocated_user == this.loginUserId){
        if (!ticket._status && (type == 101 || type == 102)) {
          icons.push({ class: "fa fa-times text-danger", action: this.changeTicketStatusWithConfirm.bind(this, ticket, type, -1), txt: "", title: "Mark Rejected", });
          icons.push({ class: "fa fa-check-square text-warning", action: this.changeTicketStatusWithConfirm.bind(this, ticket, type, 2), txt: "", title: "Mark Ack", });
        } else if (ticket._status == 2 && ticket._ticket_closure > 0 && (type == 101 || type == 102)) {
          icons.push({ class: "fa fa-thumbs-up text-success", action: (ticket._close_form > 0) ? this.openTicketFormData.bind(this, ticket, type, 5) : this.changeTicketStatusWithConfirm.bind(this, ticket, type, 5), txt: "", title: "Mark Completed", });
        }
      }

      icons.push({ class: "fas fa-plus-square", action: this.updatePrimaryInfo.bind(this, ticket, type), txt: '', title: "Update Primary Info" });

    } else if (type == 100) {
      if(ticket._claim_ticket==1){
        icons.push({ class: "fa fa-hand-lizard-o text-warning", action: this.claimTicket.bind(this, ticket, type), txt: '', title: "Claim Ticket" });
      }else{
        icons.push({ class: "fas fa-user-plus", action: this.openAssignUserModal.bind(this, ticket, type), txt: '', title: "Assign User" });
      }
    } else if (type == 103) {
      icons.push({ class: "fas fa-user-plus", action: this.openAssignUserModal.bind(this, ticket, type), txt: '', title: "Assign User" });
    }
    icons.push({ class: "fa fa-info-circle", action: this.openInfoModal.bind(this, ticket, type, 0), txt: '', title: "Ticket Info" });

    return icons;
  }

  updatePrimaryInfo(ticket,type){
    let title = 'Primary Info Fields';
    let actionData = {
      ticketId: ticket._ticket_id,
      refId: ticket._tpid,
      refType: 2,
    };
    this.common.params = { actionData, title: title, button: "Save" };
    const activeModal = this.modalService.open(TicketClosingFormComponent, { size: 'xl', container: 'nb-layout', backdrop: 'static', scrollable: true  });
    activeModal.result.then(data => {
      if (data.response) {
        console.log(data, 'response');
        // if(data.isContinue){
        //   this.updateTicketStatus(ticket, type, status, null);
        // }else{
        //   this.changeTicketStatusWithConfirm(ticket, type, status)
        // }
      }
    });
  }

  deleteTicket(ticket, type) {
    if (ticket._ticket_id > 0) {
      this.common.params = {
        title: "Delete Ticket ",
        description: '<b>Are You Sure To Delete This Ticket ?<b>',
        isRemark: false,
      };
      const activeModal = this.modalService.open(ConfirmComponent, { size: "sm", container: "nb-layout", backdrop: "static", keyboard: false, windowClass: "accountModalClass", });
      activeModal.result.then((data) => {
        if (data.response) {
          let params = {
            ticketId: ticket._ticket_id
          };
          this.common.loading++;
          this.api.post('Ticket/deleteTicket', params).subscribe(res => {
            this.common.loading--;
            if (res['code'] > 0) {
              this.common.showToast(res['msg']);
              this.getTicketByType(type);
            } else {
              this.common.showError(res['msg']);
            }
          }, err => {
            this.common.loading--;
            this.common.showError();
            console.log('Error: ', err);
          });
        }
      });
    } else {
      this.common.showError("Invalid Ticket");
    }
  }

  changeTicketStatusWithConfirm(ticket, type, status) {
    console.log(ticket, 'status');
    if (ticket._ticket_id) {
      let preTitle = "Complete";
      if (status === -1) {
        preTitle = "Reject";
      } else if (status == 2) {
        preTitle = "Acknowledge";
      } else if (ticket._status == 2) {
        preTitle = "Completed";
      } else if (status == 0) {
        preTitle = "Re-Active";
      }
      this.common.params = {
        title: preTitle + " Ticket ",
        description:
          `<b>&nbsp;` + "Are You Sure To " + preTitle + " This Ticket" + `<b>`,
        isRemark: status == -1 ? true : false,
      };
      const activeModal = this.modalService.open(ConfirmComponent, { size: "sm", container: "nb-layout", backdrop: "static", keyboard: false, windowClass: "accountModalClass", });
      activeModal.result.then((data) => {
        console.log("Confirm response:", data);
        if (data.response) {
          this.updateTicketStatus(ticket, type, status, data.remark);
        }
      });
    } else {
      this.common.showError("Ticket ID Not Available");
    }
  }

  claimTicket(ticket, type) {
    let params = {
      tktId: ticket._ticket_id,
      userId: this.loginUserId
    };
    this.common.loading++;
    this.api.post("Ticket/addTicketAllocation", params).subscribe((res) => {
      this.common.loading--;
      if (res['code'] > 0) {
        if (res['data'][0].y_id > 0) {
          this.common.showToast(res['data'][0].y_msg);
        } else {
          this.common.showError(res['data'][0].y_msg);
        }
      } else {
        this.common.showError(res['msg'])
      }
      this.getTicketByType(type);
    }, (err) => {
      this.common.loading--;
      this.common.showError();
      console.log("Error: ", err);
    }
    );
  }

  addTime(ticket, type) {
    this.common.params = {
      ticketId: ticket._ticket_allocation_id,
      title: "Add Extra Time",
      btn: "Add Time",
    };
    const activeModal = this.modalService.open(AddExtraTimeComponent, {
      size: "md",
      container: "nb-layout",
      backdrop: "static",
    });
    activeModal.result.then((data) => {
      if (data.response) {
        this.getTicketByType(type);
      }
    });
  }

  ticketMessage(ticket, type) {
    console.log("type:", type, ticket, this.adminList);
    let ticketEditData = {
      ticketData: ticket,
      ticketId: ticket._ticket_id,
      statusId: ticket._status,
      lastSeenId: ticket._lastreadid,
      tabType: type,
    };

    let subTitle = ticket.identity;
    this.common.params = {
      ticketEditData,
      title: "Ticket Comment",
      button: "Save",
      subTitle: subTitle,
      userList: this.adminList,
      groupList: this.groupList
    };
    const activeModal = this.modalService.open(TicketChatboxComponent, { size: "lg", container: "nb-layout", backdrop: "static", });
    activeModal.result.then((data) => {
      type ? this.getTicketByType(type) : null;
    });
  }

  showReminderPopup(ticket, type) {
    this.common.params = {
      ticketId: ticket._ticket_id,
      remindertime: ticket._remindtime,
      title: "Add Reminder",
      btn: "Set Reminder",
      fromPage: "ticket"
    };
    const activeModal = this.modalService.open(ReminderComponent, { size: "sm", container: "nb-layout", backdrop: "static", });
    activeModal.result.then((data) => {
      if (data.response) {
        this.getTicketByType(type);
      }
    });
  }

  checkReminderSeen(ticket, type) {
    let params = {
      ticketId: ticket._ticket_id,
    };
    this.common.loading++;
    this.api.post("Ticket/checkTicketReminderSeen", params).subscribe((res) => {
      this.common.loading--;
      if(res['code']===0) { this.common.showError(res['msg']); return false;};
      this.common.showToast(res["msg"]);
      this.getTicketByType(type);
    }, (err) => {
      this.common.loading--;
      this.common.showError();
      console.log("Error: ", err);
    }
    );
  }

  saveTicket() {
  //  return  console.log('this.oddarray',this.oddArray,this.evenArray);
    let detailsInfo = this.evenArray.concat(this.oddArray);
    let details = detailsInfo.map(detail => {
      let copyDetails = Object.assign({}, detail);
      if (detail['r_coltype'] == 'date' && detail['r_value']) {
        copyDetails['r_value'] = this.common.dateFormatter(detail['r_value']);
      }else if(detail['isNotBindFixedvalue']) {
        copyDetails['r_value'] = detail['notBindFixedvalue'];
      }
      return copyDetails;
    });
    let params = {
      priCatId: this.categoryIds.priCat,
      secCatId: this.categoryIds.secCat,
      typeId: this.categoryIds.type,
      tpId: this.ticketForm.tp.id,
      info: JSON.stringify(details),
      isAllocated: false,
      requestId: (this.ticketForm.requestId > 0) ? this.ticketForm.requestId : null
    }
    console.log("ticketForm:", params);
    this.common.loading++;
    this.api.post('Ticket/saveTicket', params).subscribe(res => {
      this.common.loading--;
      console.log('response:', res);
      if (res['code'] == 1) {
        if (res['data'][0].y_id > 0) {
          this.common.showToast(res['data'][0].y_msg);
          this.closeAddTicketModal();
          this.activeTab = 'allocatedTkt';
          this.getTicketByType(101);
        } else {
          this.common.showError(res['data'][0].y_msg);
        }
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error:', err)
    })
  }

  // AdditionalForm(arraytype, i) {
  //   console.log('arraytype: ', arraytype);
  //   console.log('oddarray',this.oddArray)
  //   let additionalData:any = null;
  //   additionalData = arraytype == 'oddArray' ? this.oddArray[i]._param_child : this.evenArray[i]._param_child;
  //   this.additionalFields =  additionalData ? additionalData: null;
  //   this.tableHeader = this.additionalFields[0];
  //   console.log('this.additionalFields: ', this.additionalFields);
  //   }

  AdditionalFormNew(data) {
    console.log('final data:',data);
    this.common.params = { additionalform: (data.length > 0) ? data : null,isDisabled:false };
    const activeModal = this.modalService.open(FormDataTableComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
  }

  openAssignUserModal(ticket, type) {
    console.log(this.assignUserObject, ticket);
    this.assignUserObject.tktId = ticket._ticket_id;
    this.assignUserObject.type = type;
    document.getElementById('assignUserModal').style.display = 'block';
  }

  closeassignUserModal() {
    document.getElementById('assignUserModal').style.display = 'none';
    this.resetAssignUser();
  }

  resetAssignUser() {
    this.assignUserObject = {
      tktId: null,
      userId: null,
      type: null
    }
  }

  appointUser() {
    let params = {
      tktId: this.assignUserObject.tktId,
      userId: this.assignUserObject.userId.id
    };
    this.common.loading++;
    this.api.post("Ticket/addTicketAllocation", params).subscribe(res => {
      this.common.loading--;
      if (res['code'] > 0) {
        if (res['data'][0].y_id > 0) {
          this.common.showToast(res['data'][0].y_msg);
          this.getTicketByType(this.assignUserObject.type);
          this.closeassignUserModal();
        } else {
          this.common.showError(res['data'][0].y_msg);
        }
      } else {
        this.common.showToast(res["msg"]);
      }
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log("Error: ", err);
    });
  }

  ticketHistory(ticket, type) {
    let dataparams = {
      view: {
        api: 'Ticket/getTicketHistory',
        param: {
          tktId: ticket._ticket_id
        }
      },
      title: "Ticket History"
    }
    this.common.params = { data: dataparams };
    const activeModal = this.modalService.open(GenericModelComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
  }

  forwardTicket(type) {
    let params = {
      ticketAllocationId: this.forwardTicketObject.ticketAllocationId,
      ticketId: this.forwardTicketObject.tktId,
      userid: this.forwardTicketObject.userId.id,
      remark: this.forwardTicketObject.remark
    };
    this.common.loading++;
    this.api.post("Ticket/forwardTicket", params).subscribe((res) => {
      this.common.loading--;
      if (res['code'] > 0) {
        if (res['data'][0].y_id > 0) {
          this.common.showToast(res['data'][0].y_msg);
          this.closeForwardTicket();
          this.getTicketByType(type);
        } else {
          this.common.showError(res['data'][0].y_msg);
        }
      } else {
        this.common.showError(res['msg']);
      }
    }, (err) => {
      this.common.loading--;
      this.common.showError();
      console.log("Error: ", err);
    });
  }

  openForwardTicket(ticket, type) {
    console.log(ticket);
    this.forwardTicketObject.ticketAllocationId = ticket._ticket_allocation_id;
    this.forwardTicketObject.tktId = ticket._ticket_id;
    this.forwardTicketObject.tabType = type;
    console.log(this.forwardTicketObject)
    document.getElementById('forwardTicket').style.display = 'block';
  }

  closeForwardTicket() {
    document.getElementById('forwardTicket').style.display = 'none';
    this.resetforwardTicket()
  }

  resetforwardTicket() {
    this.forwardTicketObject = {
      ticketAllocationId: null,
      tktId: null,
      userId: { id: null, name: null },
      remark: null,
      tabType: null
    }
  }

  updateTicketStatus(ticket, type, status, remark = null) {
    if (ticket._ticket_allocation_id) {
      let params = {
        ticketId: ticket._ticket_allocation_id,
        statusId: status,
        statusOld: ticket._status,
        remark: remark,
      }
      this.common.loading++;
      this.api.post('Ticket/updateTicketStatus', params).subscribe(res => {
        this.common.loading--;
        if (res['code'] > 0) {
          this.common.showToast(res['msg']);
          this.getTicketByType(type);
        } else {
          this.common.showError(res['msg']);
        }
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
    }
  }

  addTransContact(ticket, type) {
    let editData = {
      transId: ticket._ticket_id
    };
    this.common.params = { editData, title: "Ticket Contacts", button: "Add",fromPage: 1 };
    const activeModal = this.modalService.open(AddTransactionContactComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      this.getTicketByType(type);
    });
  }

  openTicketFormData(ticket, type, status) {
    let title = 'Ticket Closing Form';
    let actionData = {
      ticketId: ticket._ticket_id,
      refId: ticket._tpid,
      refType: 1,
    };
    this.common.params = { actionData, title: title, button: "Save" };
    const activeModal = this.modalService.open(TicketClosingFormComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        console.log(data, 'response');
        if(data.isContinue){
          this.updateTicketStatus(ticket, type, status, null);
        }else{
          this.changeTicketStatusWithConfirm(ticket, type, status)
        }
      }
    });
  }

  openInfoModal(ticket, type, refType) {
    // if (refType == 1) {
    //   this.ticketDetailTitle = 'Closing Form Detail';
    // } else {
      this.ticketDetailTitle = 'Ticket Info';
    // }
    this.ticketForm.tp.id = ticket._tpid;
    this.ticketForm.requestId = ticket._ticket_id;
    this.tpPropertyList = [];
    this.oddArray = [];
    this.evenArray = [];
    this.priCatList = [];
    this.secCatList = [];
    this.typeList = [];
    this.ticketFormFields = null;
    this.openingFormInfo = [];
    this.closingFormInfo = [];
    this.primaryFormInfo = [];
    setTimeout(async () => {
      // await this.getTicketFormField(refType);
      await this.getTicketFormField(0);
        await this.getTicketFormField(2);
    }, 500);

    if (this.activeTab == 'completedTkt') {
      setTimeout(async () => {
        await this.getTicketFormField(1);
        // await this.getTicketFormField(2);
      }, 500);
    }

    document.getElementById('infoWindow').style.display = 'block';
  }

  closeInfo() {
    document.getElementById('infoWindow').style.display = 'none';
    this.resetTicketForm();
  }

  handleFileSelection(event, i,arrayType) {
    this.common.handleFileSelection(event,null).then(res=>{
      console.log("handleFileSelection:",res);
      this.attachmentFile[i]= { name: res['name'], file: res['file'] };
      this.uploadattachFile(arrayType,i);
    },err=>{
      this.common.showError();
    });
  }

  uploadattachFile(arrayType, i) {
    if (!this.attachmentFile[i] || !this.attachmentFile[i].file) {
      this.common.showError("Browse a file first");
      return false;
    }
    let refId = null;
    if (arrayType == 'oddArray') {
      refId = this.oddArray[i].r_colid;
    } else {
      refId = this.evenArray[i].r_colid;
    }
    let params = {
      refId: (refId > 0) ? refId : null,
      name: this.attachmentFile[i].name,
      attachment: this.attachmentFile[i].file
    }
    this.common.loading++;
    this.api.post('Ticket/uploadAttachment', params).subscribe(res => {
      this.common.loading--;
      if (res['code'] == 1) {
        if (res['data'][0]['r_id'] > 0) {
          this.common.showToast(res['msg']);
          this.attachmentFile[i].name = null;
          this.attachmentFile[i].file = null;
          if (arrayType == 'oddArray') {
            this.oddArray[i].r_value = res['data'][0]['r_id'];
          } else {
            this.evenArray[i].r_value = res['data'][0]['r_id'];
          }
        } else {
          this.common.showError(res['msg']);
        }
      } else {
        this.common.showError(res['msg']);
      }
      // console.log("evenArray:::", this.evenArray[i]);
      // console.log("oddArray:::", this.oddArray[i]);
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.error('Api Error:', err);
    });
  }

  filterTicketBySubTab(type, subTabType) {
    if (type == 105) {
      let selectedList = [];
      if (subTabType == 1) {//by me
        selectedList = this.completedTktAll.filter((x) => {
          return x._aduserid == this.loginUserId;
        });
      } else if (subTabType == 2) {//for me
        selectedList = this.completedTktAll.filter((x) => {
          return x._allocated_user == this.loginUserId;
        });
      } else {//all
        selectedList = this.completedTktAll;
      }
      this.completedTkt = selectedList.length > 0 ? selectedList : [];
      this.setTablecompletedTkt(type);
    }
  }

  takeAction(row) {
    let foundLong = this.oddArray.find(x=>{return (x.r_coltitle).toLowerCase()=='longitude'});
    if(foundLong){
    }else if(this.evenArray.length>0){
      foundLong = this.evenArray.find(x=>{return (x.r_coltitle).toLowerCase()=='longitude'});
    }
    if(row.r_value && foundLong && foundLong.r_value){
      let location = {"lat": row.r_value, "lng": foundLong.r_value};
      this.common.params = { placeholder: 'selectLocation', title: 'SelectLocation',location };
    }else{
      this.common.params = { placeholder: 'selectLocation', title: 'SelectLocation' };
    }
    const activeModal = this.modalService.open(LocationSelectionComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(res => {
      if (res != null) {
        console.log('new-response----', res, res.location);
        if (res.location.lat) {
          row.r_value = res.location.lat;
          if(foundLong){
            foundLong.r_value = res.location.lng;
          }
        }
      }
    })
  }

  getUserPresence(empId) {
    this.common.loading++;
    this.api.get("Admin/getUserPresence.json?empId=" + empId).subscribe(res => {
      this.common.loading--;
      if (res['code'] > 0) {
        let userPresence = (res['data'] && res['data'].length) ? res['data'] : null;
        this.adduserConfirm(userPresence)
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });

console.log('this.primaryFormInfo',this.primaryFormInfo);
if(this.primaryFormInfo.length > 0){
console.log('this.primaryFormInfo',this.primaryFormInfo);
// this.AdditionalFormNew(primary._param_child);
}

}

  adduserConfirm(userPresence) {
    if (!userPresence) {
      this.common.params = {
        title: 'User Presence',
        description: '<b>The user has not started the shift for today.<br> Are you sure to add this user ?<b>'
      }
      const activeModal = this.modalService.open(ConfirmComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
      activeModal.result.then(data => {
        if (!data.response) {
          this.forwardTicketObject.userId = {id: null,name: null};
        }
      });
    }
  }

  openCheckStatusModal(ticket,type){
    // console.log("openCheckStatusModal:",ticket);
    this.common.loading++;
    this.api.get("Ticket/checkTicketStatus?ticketId=" + ticket._ticket_id).subscribe(res => {
      this.common.loading--;
      if (res['code'] > 0) {
        let checkStatus = "No data found";
        if(res['data'] && res['data'].length){
          checkStatus = res['data'][0]["status"];
        }
        this.common.params = {
          title: 'Status',
          description: '<b>'+checkStatus+'<b>',
          btn1: 'Ok'
        }
        const activeModal = this.modalService.open(ConfirmComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.loading--;
      this.common.showError();
    });
  }

}
