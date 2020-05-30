import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { UserService } from '../../Service/user/user.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmComponent } from '../../modals/confirm/confirm.component';
import { CampaignTargetActionComponent } from '../../modals/campaign-modals/campaign-target-action/campaign-target-action.component';
import { AddContactComponent } from '../../modals/campaign-modals/add-contact/add-contact.component';
import { TargetCampaignComponent } from '../../modals/campaign-modals/target-campaign/target-campaign.component';
import { GenericModelComponent } from '../../modals/generic-model/generic-model.component';
import { TaskMessageComponent } from '../../modals/task-message/task-message.component';
import { ReminderComponent } from '../../modals/reminder/reminder.component';

@Component({
  selector: 'ngx-campaign',
  templateUrl: './mycampaign.component.html',
  styleUrls: ['./mycampaign.component.scss']
})
export class MycampaignComponent implements OnInit {
  activeTab = 'leadsForMe';
  adminList = [];
  leadsForMe = [];
  leadsByMe = [];
  allCompletedLeads = [];
  unreadLeads = [];
  ccLeads = [];

  tableLeadsForMe = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  tableLeadsByMe = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  tableAllCompletedLeads = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  tableUnreadLeads = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  tableCcLeads = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  searchData = {
    startDate: <any>this.common.getDate(-2),
    endDate: <any>this.common.getDate()
  }

  constructor(public common: CommonService, public api: ApiService, public modalService: NgbModal, public userService: UserService) {
    this.getCampaignByType(1);
    this.getAllAdmin();
  }

  ngOnInit() { }

  addCampaignTarget() {
    this.common.params = { title: "Add Lead ", button: "Add" }
    const activeModal = this.modalService.open(TargetCampaignComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        this.activeTab = 'leadsByMe';
        this.getCampaignByType(2);
      }
    });
  }

  resetSearchData() {
    this.searchData = {
      startDate: <any>this.common.getDate(-2),
      endDate: <any>this.common.getDate()
    }
  }

  getAllAdmin() {
    this.api.get("Admin/getAllAdmin.json").subscribe(res => {
      console.log("data", res['data'])
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

  getCampaignByType(type, startDate = null, endDate = null) {
    this.common.loading++;
    if (type == 4 && this.searchData.startDate && this.searchData.endDate) {
      startDate = this.common.dateFormatter(this.searchData.startDate);
      endDate = this.common.dateFormatter(this.searchData.endDate);
    }
    let params = "?type=" + type + "&startDate=" + startDate + "&endDate=" + endDate;
    this.api.get("Campaigns/getMyCampaignByType" + params).subscribe(res => {
      this.common.loading--;
      console.log("data", res['data'])
      this.reserSmartTableData();
      if (type == 1) {//normal task pending (task for me)
        this.leadsForMe = res['data'] || [];
        this.setTableLeadsForMe(type);
      } else if (type == 2) { //task by me
        this.leadsByMe = res['data'] || [];
        this.setTableLeadsByMe(type);
      } else if (type == 3) {
        this.ccLeads = res['data'] || [];
        this.setTableCcLeads(type);
      } else if (type == 4) {
        this.allCompletedLeads = res['data'] || [];
        this.setTableAllCompletedLeads(type);
      } else if (type == 5) {
        this.unreadLeads = res['data'] || [];
        this.setTableUnreadLeads(type);
      }
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  reserSmartTableData() {
    this.tableLeadsForMe.data = {
      headings: {},
      columns: []
    };
    this.tableLeadsByMe.data = {
      headings: {},
      columns: []
    };
    this.tableAllCompletedLeads.data = {
      headings: {},
      columns: []
    };
    this.tableUnreadLeads.data = {
      headings: {},
      columns: []
    };
  }

  // start: leads for me
  setTableLeadsForMe(type) {
    this.tableLeadsForMe.data = {
      headings: this.generateHeadingsLeadsForMe(),
      columns: this.getTableColumnsLeadsForMe(type)
    };
    return true;
  }

  generateHeadingsLeadsForMe() {
    let headings = {};
    for (var key in this.leadsForMe[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    return headings;
  }

  getTableColumnsLeadsForMe(type) {
    let columns = [];
    this.leadsForMe.map(campaign => {
      let column = {};
      for (let key in this.generateHeadingsLeadsForMe()) {
        if (key == 'Action' || key == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(campaign, type)
          };
        } else if (key == 'Company') {
          column[key] = { value: campaign[key], class: 'blue', action: this.addContactAction.bind(this, campaign, type) };
        } else if (key == 'FleetSize') {
          column[key] = { value: campaign[key], class: 'blue', action: this.getLogs.bind(this, campaign, type) };
        } else {
          column[key] = { value: campaign[key], class: 'black', action: '' };
        }

        column['style'] = { 'background': this.common.taskStatusBg(campaign._status) };
      }
      columns.push(column);
    });
    return columns;
  }
  // end: leads for me

  // start: leads by me
  setTableLeadsByMe(type) {
    this.tableLeadsByMe.data = {
      headings: this.generateHeadingsLeadsByMe(),
      columns: this.getTableColumnsLeadsByMe(type)
    };
    return true;
  }

  generateHeadingsLeadsByMe() {
    let headings = {};
    for (var key in this.leadsByMe[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    return headings;
  }

  getTableColumnsLeadsByMe(type) {
    let columns = [];
    this.leadsByMe.map(campaign => {
      let column = {};
      for (let key in this.generateHeadingsLeadsByMe()) {
        if (key == 'Action' || key == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            // icons: this.actionIcons(campaign, type)
            icons: this.actionIcons(campaign, type)
          };
        } else if (key == 'Company') {
          column[key] = { value: campaign[key], class: 'blue', action: this.addContactAction.bind(this, campaign, type) };
        } else if (key == 'FleetSize') {
          column[key] = { value: campaign[key], class: 'blue', action: this.getLogs.bind(this, campaign, type) };
        } else {
          column[key] = { value: campaign[key], class: 'black', action: '' };
        }

        column['style'] = { 'background': this.common.taskStatusBg(campaign._status) };
      }
      columns.push(column);
    });
    return columns;
  }
  // end: leads by me

  // start: AllCompletedLeads
  setTableAllCompletedLeads(type) {
    this.tableAllCompletedLeads.data = {
      headings: this.generateHeadingsAllCompletedLeads(),
      columns: this.getTableColumnsAllCompletedLeads(type)
    };
    return true;
  }

  generateHeadingsAllCompletedLeads() {
    let headings = {};
    for (var key in this.allCompletedLeads[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    return headings;
  }

  getTableColumnsAllCompletedLeads(type) {
    let columns = [];
    this.allCompletedLeads.map(campaign => {
      let column = {};
      for (let key in this.generateHeadingsAllCompletedLeads()) {
        if (key == 'Action' || key == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(campaign, type)
          };
        } else {
          column[key] = { value: campaign[key], class: 'black', action: '' };
        }

        column['style'] = { 'background': this.common.taskStatusBg(campaign._status) };
      }
      columns.push(column);
    });
    return columns;
  }
  // end: AllCompletedLeads

  // start unread task for me list
  setTableUnreadLeads(type) {
    this.tableUnreadLeads.data = {
      headings: this.generateHeadingsUnreadLeads(),
      columns: this.getTableColumnsUnreadLeads(type)
    };
    return true;
  }

  generateHeadingsUnreadLeads() {
    let headings = {};
    for (var key in this.unreadLeads[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    return headings;
  }

  getTableColumnsUnreadLeads(type) {
    let columns = [];
    this.unreadLeads.map(campaign => {
      let column = {};
      for (let key in this.generateHeadingsUnreadLeads()) {
        if (key == 'Action' || key == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(campaign, type)
          };
        } else {
          column[key] = { value: campaign[key], class: 'black', action: '' };
        }

        column['style'] = { 'background': this.common.taskStatusBg(campaign._status) };
      }
      columns.push(column);
    });
    return columns;
  }
  // end unread lead
  // start cc leads
  setTableCcLeads(type) {
    this.tableCcLeads.data = {
      headings: this.generateHeadingsCcLeads(),
      columns: this.getTableColumnsCcLeads(type)
    };
    return true;
  }

  generateHeadingsCcLeads() {
    let headings = {};
    for (var key in this.ccLeads[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    return headings;
  }

  getTableColumnsCcLeads(type) {
    let columns = [];
    this.ccLeads.map(campaign => {
      let column = {};
      for (let key in this.generateHeadingsCcLeads()) {
        if (key == 'Action' || key == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(campaign, type)
          };
        } else {
          column[key] = { value: campaign[key], class: 'black', action: '' };
        }

        column['style'] = { 'background': this.common.taskStatusBg(campaign._status) };
      }
      columns.push(column);
    });
    return columns;
  }
  // end cc leads

  actionIcons(campaign, type) {
    let icons = [
      { class: "fas fa-comments no-comment", action: this.campaignMessage.bind(this, campaign, type), txt: '', title: null }
    ];
    if (campaign._unreadcount > 0) {
      icons = [
        { class: "fas fa-comments new-comment", action: this.campaignMessage.bind(this, campaign, type), txt: campaign._unreadcount, title: null },
      ];
    } else if (campaign._unreadcount == 0) {
      icons = [
        { class: "fas fa-comments", action: this.campaignMessage.bind(this, campaign, type), txt: '', title: null },
      ];
    }
    else if (campaign._unreadcount == -1) {
      icons = [
        { class: "fas fa-comments no-comment", action: this.campaignMessage.bind(this, campaign, type), txt: '', title: null },
      ];
    }

    if (type == 1) {
      if (campaign._status == 2) {
        icons.push({ class: "fa fa-thumbs-up text-success", action: this.changeCampaignStatusWithConfirm.bind(this, campaign, type, 5), txt: '', title: "Mark Completed" });
      } else if (campaign._status == 0) {
        icons.push({ class: "fa fa-thumbs-up text-warning", action: this.updateCampaignStatus.bind(this, campaign, type, 2), txt: '', title: "Mark Ack" });
        icons.push({ class: "fa fa-times text-danger", action: this.changeCampaignStatusWithConfirm.bind(this, campaign, type, -1), txt: '', title: "Mark Rejected" });
      }
    } else if (type == 2) {
      icons.push({ class: "far fa-edit", action: this.editCampaign.bind(this, campaign, type), txt: '', title: null });
      icons.push({ class: 'fas fa-trash-alt ml-2', action: this.deleteCampaign.bind(this, campaign, type), txt: '', title: null });
      icons.push({ class: 'fas fa-address-book ml-2 s-4', action: this.targetAction.bind(this, campaign, type), txt: '', title: null });

    } else if (type == 3 && !campaign._cc_status) {
      icons.push({ class: "fa fa-check-square text-warning", action: this.ackLeadByCcUser.bind(this, campaign, type), txt: '', title: "Mark Ack as CC Lead" });

    } else if (type == 5) {
      // if (campaign._status == 2) {
      //   icons.push({ class: "fa fa-thumbs-up text-success", action: this.changeCampaignStatusWithConfirm.bind(this, campaign, type, 5), txt: '', title: "Mark Completed" });
      // } else 
      if (campaign._status == 0) {
        icons.push({ class: "fa fa-thumbs-up text-warning", action: this.updateCampaignStatus.bind(this, campaign, type, 2), txt: '', title: "Mark Ack" });
        icons.push({ class: "fa fa-times text-danger", action: this.changeCampaignStatusWithConfirm.bind(this, campaign, type, -1), txt: '', title: "Mark Rejected" });
      } else if (campaign._cc_user_id && !campaign._cc_status) {
        icons.push({ class: "fa fa-check-square text-warning", action: this.ackLeadByCcUser.bind(this, campaign, type), txt: '', title: "Mark Ack as CC Lead" });
      }
    }

    if ((campaign._status == 5 || campaign._status == -1)) {
    } else {
      if (campaign._isremind == 1) {
        icons.push({ class: "fa fa-bell isRemind", action: (type == -8) ? '' : this.checkReminderSeen.bind(this, campaign, type), txt: '', title: null });
      } else if (campaign._isremind == 2 && type != 5) {
        icons.push({ class: "fa fa-bell reminderAdded", action: this.showReminderPopup.bind(this, campaign, type), txt: '', title: null });
      } else {
        if (type != 5) {
          icons.push({ class: "fa fa-bell", action: this.showReminderPopup.bind(this, campaign, type), txt: '', title: null });
        }
      }
    }
    return icons;
  }

  editCampaign(campaign, type) {
    console.log("editCampaign:", campaign);
    let targetEditData = {
      rowId: campaign._camptargetid,
      campaignId: campaign._campid,
      campainType: campaign._camtype,
      campaignName: campaign._campaignname,
      potential: campaign.FleetSize,
      name: campaign.Company,
      mobile: campaign._mobileno,
      locationId: campaign._locationid,
      locationName: campaign.Location,
      address: campaign._address,
      lat: campaign._lat,
      long: campaign._long,
      potCat: campaign._potcat,
      priOwnId: campaign._priownid,
      potCatname: campaign['Fleet Category'],
      // priOwnname: campaign['Primary Owner'],
      priOwnname: campaign._priown,
    }

    this.common.params = { targetEditData, title: "Edit Lead", button: "Edit" };

    const activeModal = this.modalService.open(TargetCampaignComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        this.getCampaignByType(type);
      }
    });
  }

  deleteCampaign(row, type) {
    let params = {
      campTargetId: row._camptargetid,
    }
    if (row._camptargetid) {
      this.common.params = {
        title: 'Delete Record',
        description: `<b>&nbsp;` + 'Are Sure To Delete This Record' + `<b>`,
      }

      const activeModal = this.modalService.open(ConfirmComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
      activeModal.result.then(data => {
        if (data.response) {
          this.common.loading++;
          this.api.post('Campaigns/removeCampTarget', params)
            .subscribe(res => {
              this.common.loading--;
              this.common.showToast(res['msg']);
              this.getCampaignByType(type);
            }, err => {
              this.common.loading--;
              console.log('Error: ', err);
            });
        }
      });
    }
  }

  targetAction(campaign, type) {
    let targetActionData = {
      rowId: campaign._camptargetid,
      campaignId: campaign._campid,
      campaignName: campaign.CampaignName,
      potential: campaign.Potential,
      name: campaign.Name,
      mobile: campaign._mobileno,
      locationId: campaign._locationid,
      locationName: campaign.Location,
      address: campaign._address,
      camptargetid: campaign._camptargetid
    };

    this.common.params = { targetActionData, title: "Campaign Target Contacts", button: "Add" };
    const activeModal = this.modalService.open(AddContactComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      this.getCampaignByType(type);
    });
  }

  addContactAction(campaign, type) {
    let targetActionData = {
      rowId: campaign._camptargetid,
      campaignId: campaign._campid,
      campaignName: campaign._campaignname,
      potential: campaign.Potential,
      name: campaign.Company,
      mobile: campaign._mobileno,
      locationId: campaign._locationid,
      locationName: campaign.Location,
      address: campaign.Address,
      camptargetid: campaign._camptargetid

    };
    console.log(campaign);
    this.common.params = { targetActionData, title: "Campaign Target Action", button: "Add", stateDataList: null, actionDataList: null, nextactionDataList: null };
    const activeModal = this.modalService.open(CampaignTargetActionComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      this.getCampaignByType(type);
    });
  }

  getLogs(campaign, type) {
    console.log(campaign);
    let dataparams = {
      view: {
        api: 'Communication/getFoWiseLogs.json',
        param: {
          mobileno: campaign['_mobileno'],
          addTime: this.common.dateFormatter2(campaign['AddTime'])
        }
      },
      title: "Communication Logs",
      type: "transtruck"
    }
    // this.common.handleModalSize('class', 'modal-lg', '1100');
    this.common.params = { data: dataparams };
    const activeModal = this.modalService.open(GenericModelComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });

  }

  // actionIcons(campaign, type) {
  //   let icons = [
  //     { class: "fas fa-comments", action: this.campaignMessage.bind(this, campaign, type), txt: '', title: null },
  //   ];

  //   if (campaign._unreadcount > 0) {
  //     icons = [
  //       { class: "fas fa-comments new-comment", action: this.campaignMessage.bind(this, campaign, type), txt: campaign._unreadcount, title: null },
  //     ];
  //   } else if (campaign._unreadcount == -1) {
  //     icons = [
  //       { class: "fas fa-comments no-comment", action: this.campaignMessage.bind(this, campaign, type), txt: '', title: null },
  //     ];
  //   }

  //   if (type == 2) {
  //     icons.push({ class: "fas fa-trash-alt", action: this.deletecampaign.bind(this, campaign, type), txt: '', title: "Delete Task" });
  //   } else if (type == 1) {
  //     if ((campaign._status == 5 || campaign._status == -1)) {
  //       icons.push({ class: "fa fa-retweet", action: this.reactivecampaign.bind(this, campaign, type), txt: '', title: "Re-Active" });
  //     } else if (campaign._status == 2) {
  //       icons.push({ class: "fa fa-thumbs-up text-success", action: this.changecampaignStatusWithConfirm.bind(this, campaign, type, 5), txt: '', title: "Mark completed" });
  //     } else if (campaign._status == 0) {
  //       icons.push({ class: "fa fa-check-square text-warning", action: this.updatecampaignStatus.bind(this, campaign, type, 2), txt: '', title: "Mark Ack" });
  //       icons.push({ class: "fa fa-times text-danger", action: this.updatecampaignStatus.bind(this, campaign, type, -1), txt: '', title: "Mark Rejected" });
  //     }
  //   } else if (type == 4) {
  //     if (campaign._status == 0 && campaign._assignee_user_id == this.userService._details.id) {
  //       icons.push({ class: "fa fa-check-square text-warning", action: this.updatecampaignStatus.bind(this, campaign, type, 2), txt: '', title: "Mark Ack" });
  //       icons.push({ class: "fa fa-times text-danger", action: this.updatecampaignStatus.bind(this, campaign, type, -1), txt: '', title: "Mark Rejected" });
  //     }
  //     else if (campaign._status == 5 && (campaign._tktype == 101 || campaign._tktype == 102)) {
  //       icons.push({ class: "fa fa-check-square text-warning", action: this.ackTaskByAssigner.bind(this, campaign, type), txt: '', title: "Mark Ack as Completed Task" });
  //     }
  //   }
  //   if ((campaign._status == 5 || campaign._status == -1)) {
  //   } else {
  //     if (campaign._isremind == 1) {
  //       icons.push({ class: "fa fa-bell isRemind", action: (type == -8) ? '' : this.checkReminderSeen.bind(this, campaign, type), txt: '', title: null });
  //     } else if (campaign._isremind == 2 && type != -8) {
  //       icons.push({ class: "fa fa-bell reminderAdded", action: this.showReminderPopup.bind(this, campaign, type), txt: '', title: null });
  //     } else {
  //       if (type != -8) {
  //         icons.push({ class: "fa fa-bell", action: this.showReminderPopup.bind(this, campaign, type), txt: '', title: null });
  //       }
  //     }
  //   }

  //   return icons;
  // }

  updateCampaignStatus(campaign, type, status) {
    if (campaign._camptargetid) {
      let params = {
        leadId: campaign._camptargetid,
        status: status
      }
      this.common.loading++;
      this.api.post('Campaigns/updateCampaignTargetTkt', params).subscribe(res => {
        this.common.loading--;
        if (res['code'] > 0) {
          this.common.showToast(res['msg']);
          this.getCampaignByType(type);
        } else {
          this.common.showError(res['data']);
        }
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
    } else {
      this.common.showError("campaign ID Not Available");
    }
  }

  changeCampaignStatusWithConfirm(campaign, type, status) {
    if (campaign._camptargetid) {
      let preText = (status == 5) ? "Complete" : "Reject";
      this.common.params = {
        title: preText + ' Lead',
        description: `<b>` + 'Are You Sure You ' + preText + ` this Lead <b>`,
      }
      const activeModal = this.modalService.open(ConfirmComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
      activeModal.result.then(data => {
        if (data.response) {
          this.updateCampaignStatus(campaign, type, status);
        }
      });
    } else {
      this.common.showError("Lead ID Not Available");
    }
  }

  campaignMessage(campaign, type) {
    console.log("campaign:", campaign);
    if (campaign._tktid > 0 && campaign._camptargetid > 0) {
      let campaignEditData = {
        ticketId: campaign._tktid,
        camptargetid: campaign._camptargetid,
        statusId: campaign._status,
        lastSeenId: campaign._lastreadid,
        // taskId: (campaign._tktype == 101 || campaign._tktype == 102) ? campaign._refid : null,
        tabType: type
      }
      this.common.params = { campaignEditData, title: "campaign Comment", button: "Save", subTitle: campaign.Company, fromPage: 'campaign' };
      const activeModal = this.modalService.open(TaskMessageComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
      activeModal.result.then(data => {
        this.getCampaignByType(type);
      });
    } else {
      this.common.showError("Invalid Lead");
    }
  }

  searchAllCompletedLead() {
    console.log("searchData:", this.searchData);
    if (this.searchData.startDate && this.searchData.endDate) {
      let startDate = this.common.dateFormatter(this.searchData.startDate);
      let endDate = this.common.dateFormatter(this.searchData.endDate);
      this.getCampaignByType(3, startDate, endDate);
    } else {
      this.common.showError("Select start date and end date");
    }
  }

  showReminderPopup(campaign, type) {
    this.common.params = { ticketId: campaign._tktid, title: "Add Reminder", btn: "Set Reminder", fromPage: "canpaign" };
    const activeModal = this.modalService.open(ReminderComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        this.getCampaignByType(type);
      }
    });
  }

  checkReminderSeen(campaign, type) {
    let params = {
      ticketId: campaign._tktid
    };
    this.common.loading++;
    this.api.post('Campaigns/checkLeadReminderSeen', params)
      .subscribe(res => {
        this.common.loading--;
        this.common.showToast(res['msg']);
        this.getCampaignByType(type);
      }, err => {
        this.common.loading--;
        console.log('Error: ', err);
      });
  }

  ackLeadByCcUser(campaign, type) {
    if (campaign._tktid) {
      let params = {
        ticketId: campaign._tktid,
        leadId: campaign._camptargetid
      }
      console.log("ackLeadByCcUser:", params);
      this.common.loading++;
      this.api.post('Campaigns/ackLeadByCcUser', params).subscribe(res => {
        this.common.loading--;
        if (res['code'] == 1) {
          this.common.showToast(res['msg']);
          this.getCampaignByType(type);
        } else {
          this.common.showError(res['data']);
        }
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
    } else {
      this.common.showError("Lead ID Not Available");
    }
  }

  // ackTaskByAssigner(campaign, type) {
  //   if (campaign._tktid && campaign._refid) {
  //     let params = {
  //       campaignId: campaign._tktid,
  //       taskId: campaign._refid
  //     }
  //     console.log("ackTaskByAssigner:", params);
  //     this.common.loading++;
  //     this.api.post('AdminTask/ackTaskByAssigner', params).subscribe(res => {
  //       this.common.loading--;
  //       if (res['code'] > 0) {
  //         this.common.showToast(res['msg']);
  //         this.getCampaignByType(type);
  //       } else {
  //         this.common.showError(res['data']);
  //       }
  //     }, err => {
  //       this.common.loading--;
  //       this.common.showError();
  //       console.log('Error: ', err);
  //     });
  //   } else {
  //     this.common.showError("Task ID Not Available");
  //   }
  // }

}
