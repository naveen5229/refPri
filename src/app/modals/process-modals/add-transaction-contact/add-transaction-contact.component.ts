import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../../Service/common/common.service';
import { ApiService } from '../../../Service/Api/api.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmComponent } from '../../confirm/confirm.component';
import { AddentityfieldsComponent } from '../../../modals/addentityfields/addentityfields.component';

@Component({
  selector: 'ngx-add-transaction-contact',
  templateUrl: './add-transaction-contact.component.html',
  styleUrls: ['./add-transaction-contact.component.scss']
})
export class AddTransactionContactComponent implements OnInit {
  title = "";
  button = "Add";
  contactForm = {
    name: "",
    mobile: null,
    address: '',
    email: null,
    association: null,
    transId: null
  }

  transContactList = [];
  table = {
    data: {
      headings: {},
      columns: [],
    },
    settings: {
      hideHeader: true
    }
  };
  fromPage = null; //null=process,1=>ticket
  constructor(public common: CommonService,
    public api: ApiService,
    public activeModal: NgbActiveModal,
    public modalService: NgbModal) {
    this.title = this.common.params.title ? this.common.params.title : 'Transaction Contacts';
    this.button = this.common.params.button ? this.common.params.button : 'Add';
    this.fromPage = this.common.params.fromPage ? this.common.params.fromPage : null;
    if (this.common.params && this.common.params.editData) {
      this.contactForm.transId = this.common.params.editData.transId;
    };
    this.getTransactionContact();
  }
  // use from two module change carefully

  closeModal() {
    this.activeModal.close({ response: false });
  }

  ngOnInit() { }

  getTransactionContact() {
    this.resetTable();
    let params = "?transId=" + this.contactForm.transId;
    let apiName = "Processes/getTransactionContacts";
    if(this.fromPage==1){
      params = "?ticketId=" + this.contactForm.transId;
      apiName = "Ticket/getTicketContacts";
    }
    this.common.loading++;
    this.api.get(apiName + params).subscribe(res => {
      this.common.loading--;
      if(res['code']===0) { this.common.showError(res['msg']); return false;};
      if (!res['data']) return;
      this.transContactList = res['data'] || [];
      this.transContactList.length ? this.setTable() : this.resetTable();
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

  setTable() {
    this.table.data = {
      headings: this.generateHeadings(),
      columns: this.getTableColumns()
    };
    return true;
  }
  generateHeadings() {
    let headings = {};
    for (var key in this.transContactList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    return headings;
  }

  addEntity(contact){
    let editDataModal = {
      typeName: null,
      typeId: null,
      entityName: null,
      entityId: null,
      contactName: (contact.name) ? contact.name : null,
      contactId: null,
      contactNo: contact.mobile,
      email: (contact.email) ? contact.email : null,
      association: null,
      requestId: null
    }
    this.common.params = {
      entityTypes: null,
      entityContactFieldsTitle: "Add contact on entity",
      modalType: 4,
      editData: editDataModal
    }
    const activeModal = this.modalService.open(AddentityfieldsComponent, { size: 'md', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
    activeModal.result.then(data => {
      // console.log("addEntity ~ data", data)
    });
  }

  getTableColumns() {
    let columns = [];
    this.transContactList.map(campaign => {
      let column = {};
      for (let key in this.generateHeadings()) {
        if (key.toLowerCase() == 'action') {
          column[key] = {
            value: "",
            isHTML: false,
            action: null,
            icons: this.actionIcons(campaign)
          };
        }
        else if (key == 'mobile' && this.fromPage==1) {
          column[key] = { value: campaign[key] ? campaign[key] : null, class: 'blue cursor-pointer', action: this.addEntity.bind(this, campaign), }
        } 
         else {
          column[key] = { value: campaign[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    })

    return columns;
  }

  actionIcons(campaign) {
    let icons = [
      { class: 'fas fa-trash-alt', action: this.deleteContact.bind(this, campaign) },
      { class: 'fa fa-phone', action: this.callSync.bind(this, campaign) }
    ];
    return icons;
  }

  callSync(lead) {
    let params = {
      mobileno: lead.mobile
    }
    this.common.loading++;
    this.api.post('Notification/sendCallSuggestionNotifications', params).subscribe(res => {
      this.common.loading--;
      if (res['code'] == 1) {
        this.common.showToast(res['msg']);
        // this.getTransactionContact();
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  deleteContact(row) {
    console.log('delete', row);
    let params = {
      requestId: row._id,
    }
    if (row._id) {
      this.common.params = {
        title: 'Delete Record',
        description: '<b>Are Sure To Delete This Record<b>',
      }
      let apiName = 'Processes/deleteTransactionContact';
      if(this.fromPage==1){
        apiName = 'Ticket/deleteTicketContact';
      }
      // console.log("deleteContact:",apiName,params);return false;
      const activeModal = this.modalService.open(ConfirmComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
      activeModal.result.then(data => {
        if (data.response) {
          this.common.loading++;
          this.api.post(apiName, params).subscribe(res => {
            this.common.loading--;
            if (res['code'] == 1) {
              this.common.showToast(res['msg']);
              this.getTransactionContact();
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

  addTransactionContact() {
    // console.log('params', this.contactForm);
    let params = {
      transId: this.contactForm.transId,
      name: this.contactForm.name,
      mobileno: this.contactForm.mobile,
      email: this.contactForm.email,
      association: this.contactForm.association,
      ticketId: null
    };
    let apiName = "Processes/addTransactionContact";
    if(this.fromPage==1){
      apiName = 'Ticket/addTicketContact';
      params.ticketId = this.contactForm.transId;
    }
    // console.log("addTransactionContact:",apiName,params);return false;
    this.common.loading++;
    this.api.post(apiName, params)
      .subscribe(res => {
        this.common.loading--;
        if (res['code'] == 1) {
          if (res['data'][0].y_id > 0) {
            this.common.showToast(res['data'][0].y_msg);
            this.reserForm();
            this.getTransactionContact();
          } else {
            this.common.showError(res['data'][0].y_msg);
          }
        } else {
          this.common.showError(res['msg']);
        }
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
  }

  reserForm() {
    this.contactForm.name = "";
    this.contactForm.mobile = null;
    this.contactForm.email = null;
    this.contactForm.association = null;
  }

}
