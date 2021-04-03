import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddFieldComponent } from '../../modals/process-modals/add-field/add-field.component';
import { UserMappingComponent } from '../../modals/process-modals/user-mapping/user-mapping.component';
import { ConfirmComponent } from '../../modals/confirm/confirm.component';
import { AddDashboardFieldComponent } from '../../modals/process-modals/add-dashboard-field/add-dashboard-field.component';

@Component({
  selector: 'ngx-ticket-process',
  templateUrl: './ticket-process.component.html',
  styleUrls: ['./ticket-process.component.scss']
})
export class TicketProcessComponent implements OnInit {
  primaryCategoryListForProperty = [];
  secondaryCategoryListForProperty = [];
  typeCategoryListForProperty = [];
  listTarget = null;
  listModalTitle = null;
  claimStatusData = [
    { id: 0, name: 'Disable' },
    { id: 1, name: 'Enable' }
  ];
  ticketInputValues = [
    { id: 0, name: 'Auto' },
    { id: 1, name: 'Manual' },
    { id: 2, name: 'Both' }
  ];

  formTypeFields = [
    { id: 0, name: 'Add Ticket Form' },
    { id: 2, name: 'Primary Info Form' },
    { id: 1, name: 'On Ticket Close Form' },
  ]
  ticketData = [];
  ticketPropertyData = [];
  esclationMatrixList = [];
  table = {
    data: {
      headings: {},
      columns: [],
    },
    settings: {
      hideHeader: true
    }
  };

  ticketPropertyTable = {
    data: {
      headings: {},
      columns: [],
    },
    settings: {
      hideHeader: true
    }
  };

  esclationTable = {
    data: {
      headings: {},
      columns: [],
    },
    settings: {
      hideHeader: true
    }
  };

  ticketForm = {
    id: null,
    name: '',
    startTime: this.common.getDate(),
    endTime: null,
    priCatAlias: "",
    secCatAlias: "",
    priCatList: [{ name: '' }],
    secCatList: [{ name: '' }],
    typeList: [{ name: '' }],
    Supervisor: { id: null, name: '' },
    ticketInput: { id: 0, name: 'Auto' },
    isActive: true,
    url: { checkStatus: '', updateStatus: '', liveFeed: '' },
    ccUserPresense: true
  }

  formRefType = {
    tpId: null,
    formFieldRefType: { id: null, name: null },
  }

  ticketPropertyForm = {
    tpId: '',
    priCatId: { id: null, name: '' },
    SecCatId: { id: null, name: '' },
    typeId: { id: null, name: '' },
    allocationAuto: { id: 0, name: 'Disable' },
    esclationAuto: { id: 0, name: 'Disable' },
    claimStatus: false,
    escTime: '',
    complRemTime: '',
    complEscTime: '',
    isUrgent: false,
    isActive: true,
    callRequired: false,
    callingBenchmark: null,
    completionBenchmark: null,
    requestId: null,
    repeatDuration: 0,
    uniqueFields: []
  }

  esclationMatrix = {
    tpPropertyId: '',
    userId: { id: null, name: '' },
    seniorUserId: { id: null, name: '' },
    userLevel: null,
    fromTime: this.common.getDate(),
    toTime: this.common.getDate(),
    requestId: ''
  }

  tableCat = {
    data: {
      headings: {},
      columns: [],
    },
    settings: {
      hideHeader: true
    }
  };

  catForm = {
    tpId: null,
    requestId: null,
    type: null,
    name: null
  }

  adminList = [];
  optionLink = 'Advance..';
  displayAdvance = false;
  ticketFormFields = [];

  constructor(public api: ApiService, public common: CommonService, public modalService: NgbModal) {
    this.getAllAdmin();
    this.getTicketList();
    this.common.refresh = this.refresh.bind(this);
  }

  refresh() {
    this.getAllAdmin();
    this.getTicketList();
  }

  ngOnInit() { }

  getAllAdmin() {
    this.api.get("Admin/getAllAdmin.json").subscribe(res => {
      if (res['code'] > 0) {
        let data = res['data'] || [];
        this.adminList = data.map(ele => { return { id: ele.id, name: ele.name } })
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  getTicketList() {
    this.common.loading++;
    this.api.get('Ticket/getTicketProcessList').subscribe(res => {
      this.common.loading--;
      if (res['code'] === 0) { this.common.showError(res['msg']); return false; };
      if (!res['data']) return;
      this.ticketData = res['data'];
      this.ticketData.length ? this.setTable() : this.resetTable();

    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log(err);
    });
  }

  addTicket() {
    this.resetForm();
    document.getElementById('addTicket').style.display = 'block';
  }

  closeaddticketModal() {
    document.getElementById('addTicket').style.display = 'none';
    // this.resetForm();
  }


  resetForm() {
    this.ticketForm = {
      id: null,
      name: '',
      startTime: this.common.getDate(),
      endTime: null,
      priCatAlias: "",
      secCatAlias: "",
      priCatList: [{ name: '' }],
      secCatList: [{ name: '' }],
      typeList: [{ name: '' }],
      Supervisor: { id: null, name: '' },
      isActive: true,
      ticketInput: { id: 0, name: 'Auto' },
      url: { checkStatus: '', updateStatus: '', liveFeed: '' },
      ccUserPresense: true
    }
  }

  resetTable() {
    this.table.data = {
      headings: {},
      columns: []
    };
  }

  setTable() {
    this.table.data = {
      headings: this.generateHeadings(),
      columns: this.getTableColumns()
    };
    return true;
  }

  generateHeadings() {
    let headings = {};
    for (var key in this.ticketData[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    return headings;
  }

  getTableColumns() {
    let columns = [];
    this.ticketData.map(ticket => {
      let column = {};
      for (let key in this.generateHeadings()) {
        if (key.toLowerCase() == 'action') {
          column[key] = {
            value: "",
            isHTML: false,
            action: null,
            icons: this.actionIcons(ticket)
          };
        } else {
          column[key] = { value: ticket[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    })

    return columns;
  }

  addFields(toField) {
    this.listTarget = toField;
    if (toField === 'priCatList') {
      this.listModalTitle = 'Primary Category';
    } else if (toField === 'secCatList') {
      this.listModalTitle = 'Secondary Category';
    } else if (toField === 'typeList') {
      this.listModalTitle = 'Type';
    }
    document.getElementById('addFields').style.display = 'block';
  }

  insertFields(insertTo) {
    if (!this.ticketForm[insertTo][this.ticketForm[insertTo].length - 1].name) {
      this.common.showError('Please Fill The Empty Field First');
    } else {
      this.ticketForm[insertTo].push({ name: '' });
    }
  }

  closeFieldsModal(ListTarget) {
    if (ListTarget == null) {
      document.getElementById('addFields').style.display = 'none';
    } else {
      this.ticketForm[ListTarget] = [{ name: '' }]
    }
    this.catForm = {
      tpId: null,
      requestId: null,
      type: null,
      name: null
    }
  }

  saveTicketProcess() {
    let params = {
      name: this.ticketForm.name,
      startDate: this.ticketForm.startTime ? this.common.dateFormatter(this.ticketForm.startTime) : null,
      endDate: this.ticketForm.endTime ? this.common.dateFormatter(this.ticketForm.endTime) : null,
      priCatAlias: this.ticketForm.priCatAlias,
      secCatAlias: this.ticketForm.secCatAlias,
      priCatInfo: JSON.stringify(this.ticketForm.priCatList),
      secCatInfo: JSON.stringify(this.ticketForm.secCatList),
      typeInfo: JSON.stringify(this.ticketForm.typeList),
      isActive: this.ticketForm.isActive,
      requestId: (this.ticketForm.id > 0) ? this.ticketForm.id : null,
      ticketInput: this.ticketForm.ticketInput.id,
      checkStatusUrl: this.ticketForm.url.checkStatus,
      updateStatusUrl: this.ticketForm.url.updateStatus,
      liveFeedUrl: this.ticketForm.url.liveFeed,
      ccUserPresense: this.ticketForm.ccUserPresense
      // supervisorId: this.ticketForm.Supervisor.id
    }
    console.log('params', params);
    if (!params.name) {
      this.common.showError('Please enter Process Name');
      return false;
    }
    if (this.displayAdvance) {
      if ((this.ticketForm.url.checkStatus && (this.ticketForm.url.checkStatus).slice(0, 5) !== 'https') ||
        (this.ticketForm.url.updateStatus && (this.ticketForm.url.updateStatus).slice(0, 5) !== 'https') ||
        (this.ticketForm.url.liveFeed && (this.ticketForm.url.liveFeed).slice(0, 5) !== 'https')) {
        return this.common.showError('Please enter valid url: Should start with https.');
      }
    }

    this.common.loading++;
    this.api.post('Ticket/saveTicketProcess', params).subscribe(res => {
      this.common.loading--;
      if (res['code'] == 1) {
        if (res['data'][0].y_id > 0) {
          this.common.showToast(res['data'][0].y_msg);
          this.ticketForm.id = res['data'][0].y_id;
          this.ticketPropertyForm.tpId = res['data'][0].y_id;
          this.closeaddticketModal();
          this.openTicketPropertyModal(this.ticketForm.id);
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
    });
  }

  getTicketProcessProperty(id) {
    this.common.loading++;
    this.api.get(`Ticket/getTicketProcessProperty?tpId=${id}`).subscribe(res => {
      this.common.loading--;
      this.resetTicketPropertyTable();
      if (res['code'] === 0) { this.common.showError(res['msg']); return false; };
      if (!res['data']) {
        return;
      } else {
        this.ticketPropertyData = res['data'];
        this.setTicketPropertyTable();
      }
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log(err);
    });
  }

  resetTicketPropertyTable() {
    this.ticketPropertyTable.data = {
      headings: {},
      columns: []
    };
  }

  setTicketPropertyTable() {
    this.ticketPropertyTable.data = {
      headings: this.generateTicketPropertyHeadings(),
      columns: this.getTicketPropertyTableColumns()
    };
    return true;
  }

  generateTicketPropertyHeadings() {
    let headings = {};
    for (var key in this.ticketPropertyData[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    return headings;
  }

  getTicketPropertyTableColumns() {
    let columns = [];
    this.ticketPropertyData.map(property => {
      let column = {};
      for (let key in this.generateTicketPropertyHeadings()) {
        if (key.toLowerCase() == 'action') {
          column[key] = {
            value: "",
            isHTML: false,
            action: null,
            icons: this.actionPropertyIcons(property)
          };
        } else {
          column[key] = { value: property[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    })

    return columns;
  }


  openTicketPropertyModal(id) {
    this.ticketPropertyForm.tpId = id;
    this.getTicketProcessProperty(id);
    this.getTicketFormField(0);
    document.getElementById('ticketPropertyList').style.display = 'block';
  }

  closeTicketPropertyModal() {
    document.getElementById('ticketPropertyList').style.display = 'none';
    this.getTicketList();
    this.resetForm();
  }



  getTicketFormField(refType) {
    if (!this.ticketPropertyForm.tpId) {
      this.common.showError("Ticket Process is missing");
      return false;
    }
    this.ticketFormFields = [];
    let params = "?refId=" + this.ticketPropertyForm.tpId + "&refType=" + refType + "&ticketId=null";
    this.api.get("Ticket/getTicketFormFieldById" + params).subscribe(res => {
      if (res['code'] > 0) {
        if (res['data']) {
          this.ticketFormFields = res['data'].map(data => {
            return {
              refid: this.ticketPropertyForm.tpId,
              r_colid: data.r_colid,
              reftype: 0,
              r_coltype: data.r_coltype,
              r_coltitle: data.r_coltitle,
              r_isdynamic: data.r_isdynamic,
            }
          });
        }
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  actionIcons(ticket) {
    let icons = [
      { class: "far fa-edit", title: "Edit", action: this.editTicket.bind(this, ticket) },
      { class: "fas fa-list-alt pri_cat", action: this.openCatModal.bind(this, ticket, 1), title: "Primary Category Mapping" },
      { class: "fas fa-list-alt", action: this.openCatModal.bind(this, ticket, 2), title: "Secondary Category Mapping" },
      { class: "fas fa-list-alt process_type", action: this.openCatModal.bind(this, ticket, 3), title: "Type Mapping" },
      { class: "fas fa-plus-square", action: this.openTicketPropertyModal.bind(this, ticket._id), title: "Ticket Property" },
      { class: "fas fa-plus-square text-primary", action: this.openTicketFormMatrixTypeModal.bind(this, ticket._id), title: "Form Matrix" },
      { class: "fas fa-bars text-primary", action: this.openDashboardFieldModal.bind(this, ticket), title: "Add Dashboard Field" }
    ];
    return icons;
  }

  openCatModal(ticket, type) {
    console.log("openCatModal:", ticket);
    let setDataTo;
    if (type == 1) {
      setDataTo = 'priCatList';
    } else if (type == 2) {
      setDataTo = 'secCatList';
    } else if (type == 3) {
      setDataTo = 'typeList';
    }
    this.catForm.tpId = ticket._id;
    this.catForm.requestId = null;
    this.catForm.type = type;

    this.addFields(setDataTo);
    this.getCatListByType(setDataTo);
  }

  getCatListByType(setDataTo) {
    this.common.loading++;
    this.api.get(`Ticket/getTicketProcessCatByType?tpId=${this.catForm.tpId}&type=${this.catForm.type}`).subscribe(res => {
      this.common.loading--;
      if (res['code'] > 0) {
        this.ticketForm[setDataTo] = res['data'] || [];
        (this.ticketForm[setDataTo].length) ? this.setTableCat(setDataTo) : this.resetTableCat(setDataTo);
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  // start: cat list table
  resetTableCat(setDataTo) {
    this.tableCat.data = {
      headings: {},
      columns: []
    };
  }

  setTableCat(setDataTo) {
    this.tableCat.data = {
      headings: this.generateHeadingsCat(setDataTo),
      columns: this.getTableColumnsCat(setDataTo)
    };
    return true;
  }

  generateHeadingsCat(setDataTo) {
    let headings = {};
    for (var key in this.ticketForm[setDataTo][0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    return headings;
  }

  getTableColumnsCat(setDataTo) {
    let columns = [];
    this.ticketForm[setDataTo].map(ticket => {
      let column = {};
      for (let key in this.generateHeadingsCat(setDataTo)) {
        if (key.toLowerCase() == 'action') {
          column[key] = {
            value: "",
            isHTML: false,
            action: null,
            icons: this.actionIconsCat(ticket)
          };
        } else {
          column[key] = { value: ticket[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    })
    return columns;
  }

  actionIconsCat(ticket) {
    let icons = [
      { class: "far fa-edit", title: "Edit", action: this.editTpCat.bind(this, ticket) }
    ];
    return icons;
  }

  editTpCat(ticket) {
    this.catForm.requestId = ticket._id;
    this.catForm.name = ticket.name;
  }
  // end: cat list table

  addTpCatByType(listTarget) {
    if (!this.catForm.name) {
      this.common.showError("Name is missing");
      return false;
    }
    let type = null;
    if (listTarget === 'priCatList') {
      type = 1;
    } else if (listTarget === 'secCatList') {
      type = 2;
    } else if (listTarget === 'typeList') {
      type = 3;
    }
    let params = {
      tpId: this.catForm.tpId,
      type: type,
      name: this.catForm.name,
      requestId: this.catForm.requestId
    }
    this.common.loading++;
    this.api.post('Ticket/addTicketProcessCatByType', params).subscribe(res => {
      this.common.loading--;
      if (res['code'] == 1) {
        if (res['data'][0].y_id > 0) {
          this.catForm.requestId = null;
          this.catForm.name = null;
          this.common.showToast(res['msg']);
          this.getCatListByType(listTarget);
        } else {
          this.common.showError(res['msg']);
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

  editTicket(ticket) {
    if (ticket) {
      // console.log(ticket);
      this.ticketForm.id = ticket._id;
      this.ticketForm.name = ticket.name;
      this.ticketForm.startTime = new Date(ticket.start_date);
      this.ticketForm.endTime = (ticket.end_date) ? new Date(ticket.end_date) : null;
      this.ticketForm.priCatAlias = ticket.pri_category_alias;
      this.ticketForm.secCatAlias = ticket.sec_category_alias;
      this.ticketForm.isActive = ticket._is_active;
      this.ticketForm.priCatList = [{ name: '' }];
      this.ticketForm.secCatList = [{ name: '' }];
      this.ticketForm.typeList = [{ name: '' }];
      this.ticketForm.ticketInput = { id: ticket._ticket_input, name: ticket.ticket_input };
      this.ticketForm.url = { checkStatus: ticket._check_status_url, updateStatus: ticket._update_status_url, liveFeed: ticket._live_feed_url };
      this.ticketForm.ccUserPresense = ticket._default_cc_user;
    }
    document.getElementById('addTicket').style.display = 'block';
  }

  addTicketProperty() {
    if (!this.ticketPropertyForm.tpId) {
      this.resetAddTicketPropertyForm(this.ticketForm.id);
      this.setDataForFields(this.ticketPropertyForm.tpId);
    } else {
      this.resetAddTicketPropertyForm(this.ticketPropertyForm.tpId);
      this.setDataForFields(this.ticketPropertyForm.tpId);
    }
    document.getElementById('addTicketProperty').style.display = 'block';
  }
  closeAddTicketPropertyModal() {
    document.getElementById('addTicketProperty').style.display = 'none';
  }

  setDataForFields(id) {
    const num = 3;
    for (let i = 1; i <= num; i++) {
      this.api.get(`Ticket/getTicketProcessCatByType?tpId=${id}&type=${i}`).subscribe(res => {
        if (res['code'] > 0) {
          let data;
          if (i === 1) {
            data = res['data'] ? res['data'] : [];
            this.primaryCategoryListForProperty = data.map(ele => { return { id: ele._id, name: ele.name } })
          } else if (i === 2) {
            data = res['data'] ? res['data'] : [];
            this.secondaryCategoryListForProperty = data.map(ele => { return { id: ele._id, name: ele.name } })
          } else if (i === 3) {
            data = res['data'] ? res['data'] : [];
            this.typeCategoryListForProperty = data.map(ele => { return { id: ele._id, name: ele.name } })
          }
        } else {
          this.common.showError(res['msg']);
        }
      }, err => {
        this.common.showError();
        console.log('Error: ', err);
      });
    }
  }

  resetAddTicketPropertyForm(id) {
    this.ticketPropertyForm = {
      tpId: id,
      priCatId: { id: null, name: '' },
      SecCatId: { id: null, name: '' },
      typeId: { id: null, name: '' },
      allocationAuto: { id: 0, name: 'Disable' },
      esclationAuto: { id: 0, name: 'Disable' },
      claimStatus: false,
      escTime: '',
      complRemTime: '',
      complEscTime: '',
      isUrgent: false,
      isActive: true,
      callRequired: false,
      callingBenchmark: null,
      completionBenchmark: null,
      requestId: null,
      repeatDuration: 0,
      uniqueFields: []
    }
  }

  saveTicketPropertyList() {
    let reqId = null;
    if (this.ticketPropertyForm.requestId) {
      reqId = this.ticketPropertyForm.requestId;
    }

    let params = {
      tpId: this.ticketPropertyForm.tpId,
      priCatId: this.ticketPropertyForm.priCatId.id,
      SecCatId: this.ticketPropertyForm.SecCatId.id,
      typeId: this.ticketPropertyForm.typeId.id,
      allocationAuto: this.ticketPropertyForm.allocationAuto.id,
      esclationAuto: this.ticketPropertyForm.esclationAuto.id,
      claim: this.ticketPropertyForm.claimStatus ? 1 : 0,
      escTime: this.ticketPropertyForm.escTime,
      complRemTime: this.ticketPropertyForm.complRemTime,
      complEscTime: this.ticketPropertyForm.complEscTime,
      isUrgent: this.ticketPropertyForm.isUrgent,
      isActive: this.ticketPropertyForm.isActive,
      callRequired: this.ticketPropertyForm.callRequired,
      callingBenchmark: this.ticketPropertyForm.callingBenchmark,
      completionBenchmark: this.ticketPropertyForm.completionBenchmark,
      requestId: reqId,
      repeatDuration: this.ticketPropertyForm.repeatDuration,
      uniqueFields: (this.ticketPropertyForm.uniqueFields.length > 0) ? JSON.stringify(this.ticketPropertyForm.uniqueFields) : null
    }

    console.log('params', params);
    // return;
    this.common.loading++;
    this.api.post('Ticket/saveTicketProcessProperty', params).subscribe(res => {
      this.common.loading--;
      if (res['code'] == 1) {
        if (res['data'][0].y_id > 0) {
          this.common.showToast(res['data'][0].y_msg);
          this.closeAddTicketPropertyModal();
          this.getTicketProcessProperty(this.ticketPropertyForm.tpId);
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


  actionPropertyIcons(property) {
    let icons = [
      { class: "far fa-edit", title: "Edit", action: this.editPropertyTicket.bind(this, property) },
      { class: "fas fa-plus-square", action: this.openTicketEsclationMatrixModal.bind(this, property), title: "User Matrix" },
      { class: "fas fa-user", action: this.addProcessUsers.bind(this, property), title: "Admin User Mapping" }
    ];
    return icons;
  }

  editPropertyTicket(property) {
    if (property) {
      this.ticketPropertyForm.tpId = property._tpid;
      this.ticketPropertyForm.priCatId = { id: property._pri_cat_id, name: property.primary_category };
      this.ticketPropertyForm.SecCatId = { id: property._sec_cat_id, name: property.secondary_category };
      this.ticketPropertyForm.typeId = { id: property._type_id, name: property.type };
      this.ticketPropertyForm.allocationAuto = { id: property._allocation_auto, name: property.allocation_auto };
      this.ticketPropertyForm.esclationAuto = { id: property._esclation_auto, name: property.esclation_auto };
      this.ticketPropertyForm.claimStatus = property._claim_ticket == 0 ? false : true;
      this.ticketPropertyForm.escTime = property.esc_time;
      this.ticketPropertyForm.complRemTime = property.compl_rem_time;
      this.ticketPropertyForm.complEscTime = property.compl_esc_time;
      this.ticketPropertyForm.isUrgent = property.is_urgent;
      this.ticketPropertyForm.isActive = property.is_active;
      this.ticketPropertyForm.requestId = property._id;
      this.ticketPropertyForm.callRequired = property.is_call_required;
      this.ticketPropertyForm.callingBenchmark = property.calling_benchmark;
      this.ticketPropertyForm.completionBenchmark = property.completion_benchmark;
      this.ticketPropertyForm.uniqueFields = property._unique_fields;
      this.ticketPropertyForm.repeatDuration = property._repeat_duplicay_duration;
    }
    document.getElementById('addTicketProperty').style.display = 'block';
    if (!this.ticketPropertyForm.tpId) {
      this.setDataForFields(this.ticketPropertyForm.tpId);
    } else {
      this.setDataForFields(this.ticketPropertyForm.tpId);
    }
  }

  openTicketEsclationMatrixModal(property) {
    // console.log(property, this.esclationMatrixList, this.esclationTable);
    this.esclationMatrixList = [];
    this.resetEsclation();
    this.esclationMatrix.tpPropertyId = property._id;
    this.getPreFilledMatrix(this.esclationMatrix.tpPropertyId);
    document.getElementById('esclationMatrix').style.display = 'block';
  }

  getPreFilledMatrix(tpPropertyId) {
    this.api.get(`Ticket/getTicketEsclationMatrix?tpPropertyId=${tpPropertyId}`).subscribe(res => {
      this.resetEsclationTable();
      if (res['code'] > 0) {
        if (res['data']) {
          // this.setPreFilledMatrix(res['data'][0]);
          this.esclationMatrixList = res['data'];
          this.setesclationTable();
        }
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  resetEsclationTable() {
    this.esclationTable = {
      data: {
        headings: {},
        columns: [],
      },
      settings: {
        hideHeader: true
      }
    };
  }

  setesclationTable() {
    this.esclationTable.data = {
      headings: this.generateesclationTableHeadings(),
      columns: this.getesclationTableColumns()
    };
    return true;
  }

  generateesclationTableHeadings() {
    let headings = {};
    for (var key in this.esclationMatrixList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    return headings;
  }

  getesclationTableColumns() {
    let columns = [];
    this.esclationMatrixList.map(esclation => {
      let column = {};
      for (let key in this.generateesclationTableHeadings()) {
        if (key.toLowerCase() == 'action') {
          column[key] = {
            value: "",
            isHTML: false,
            action: null,
            icons: this.esclationIcons(esclation)
          };
        } else {
          column[key] = { value: esclation[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    })

    return columns;
  }
  // setPreFilledMatrix(data){
  //   console.log('esclation',data)
  //   // this.esclationMatrix.tpPropertyId = '';
  //   this.esclationMatrix.userId = {id:data._userid,name:data.user};
  //   this.esclationMatrix.seniorUserId = {id:data._senior_userid,name:data.senior_user};
  //   this.esclationMatrix.userLevel = data.user_level;
  //   this.esclationMatrix.fromTime = new Date(data._from_time);
  //   this.esclationMatrix.toTime = new Date(data._to_time);
  //   this.esclationMatrix.requestId = data._id;

  //   console.log('after update esclation',this.esclationMatrix);
  // }

  closeTicketEsclationMatrixModal() {
    document.getElementById('esclationMatrix').style.display = 'none';
  }

  resetEsclation() {
    this.esclationMatrix = {
      tpPropertyId: '',
      userId: { id: null, name: '' },
      seniorUserId: { id: null, name: '' },
      userLevel: null,
      fromTime: this.common.getDate(),
      toTime: this.common.getDate(),
      requestId: ''
    }
  }

  saveTicketEsclationMatrixModal() {
    let requestID = null;
    if (this.esclationMatrix.requestId) {
      requestID = this.esclationMatrix.requestId;
    }
    let params = {
      tpPropertyId: this.esclationMatrix.tpPropertyId,
      userId: this.esclationMatrix.userId.id,
      seniorUserId: this.esclationMatrix.seniorUserId.id,
      userLevel: this.esclationMatrix.userLevel,
      fromTime: this.common.dateFormatter(this.esclationMatrix.fromTime),
      toTime: this.common.dateFormatter(this.esclationMatrix.toTime),
      requestId: requestID
    }

    this.common.loading++;
    this.api.post('Ticket/saveTicketEsclationMatrix', params).subscribe(res => {
      this.common.loading--;
      if (res['code'] == 1) {
        if (res['data'][0].y_id > 0) {
          this.common.showToast(res['data'][0].y_msg);
          this.closeTicketEsclationMatrixModal();
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

  openTicketFormMatrixModal(tpId, refType) {
    // console.log("🚀 ~ file: ticket-process.component.ts ~ line 872 ~ TicketProcessComponent ~ openTicketFormMatrixModal ~ refType", refType)
    // document.getElementById('ticketFormMatrix').style.display = 'block';
    let refData = {
      id: tpId,
      type: refType
    }
    this.common.params = { ref: refData, formType: 11 };
    const activeModal = this.modalService.open(AddFieldComponent, { size: (refType == 0) ? 'xl' : 'lg', container: 'nb-layout', backdrop: 'static' });
  }

  openTicketFormMatrixTypeModal(tpID) {
    this.formRefType.tpId = tpID;
    document.getElementById('ticketFormMatrixType').style.display = 'block';
  }

  closeTicketFormMatrixTypeModal() {
    document.getElementById('ticketFormMatrixType').style.display = 'none';
    this.resetFormRefType();
  }
  resetFormRefType() {
    this.formRefType = {
      tpId: null,
      formFieldRefType: { id: null, name: null }
    }
  }

  saveTicketFormMatrixTypeModal() {
    if (this.formRefType.formFieldRefType.id === null) {
      this.common.showError('Select Type')
    } else {
      this.openTicketFormMatrixModal(this.formRefType.tpId, this.formRefType.formFieldRefType.id);
      document.getElementById('ticketFormMatrixType').style.display = 'none';
      this.resetFormRefType();
    }
  }

  addProcessUsers(property) {
    this.common.params = { process_id: property._id, adminList: this.adminList, fromPage: 'ticket' };
    const activeModal = this.modalService.open(UserMappingComponent, { size: 'md', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        console.log("ticket UserMappingComponent:", data.response);
      }
    });
  }

  esclationIcons(property) {
    let icons = [
      { class: 'fas fa-trash-alt', title: "Delete Action", action: this.deleteAction.bind(this, property) },
    ];
    return icons;
  }

  deleteAction(row) {
    let params = {
      id: row._id,
    }
    if (row._id) {
      this.common.params = {
        title: 'Delete Record',
        description: `<b>&nbsp;` + 'Are you Sure To Delete This Record' + `<b>`,
      }
      const activeModal = this.modalService.open(ConfirmComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
      activeModal.result.then(data => {
        if (data.response) {
          this.common.loading++;
          this.api.post('Ticket/deleteTicketEsclationMatrix', params).subscribe(res => {
            this.common.loading--;
            if (res['code'] == 1) {
              if (res['data'][0].y_id > 0) {
                this.common.showToast(res['data'][0].y_msg);
                this.getPreFilledMatrix(this.esclationMatrix.tpPropertyId);
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
      });
    }
  }

  openDashboardFieldModal(process) {
    this.common.params = { processId: process._id, processName: process.name, fromPage: 1 };
    const activeModal = this.modalService.open(AddDashboardFieldComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
  }

}
