import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../../Service/common/common.service';
import { ApiService } from '../../../Service/Api/api.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmComponent } from '../../confirm/confirm.component';

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
  constructor(public common: CommonService,
    public api: ApiService,
    public activeModal: NgbActiveModal,
    public modalService: NgbModal) {
    this.title = this.common.params.title ? this.common.params.title : 'Transaction Contacts';
    this.button = this.common.params.button ? this.common.params.button : 'Add';
    if (this.common.params && this.common.params.editData) {
      this.contactForm.transId = this.common.params.editData.transId;
    };
    this.getTransactionContact();
  }

  closeModal() {
    this.activeModal.close({ response: false });
  }

  ngOnInit() { }

  getTransactionContact() {
    this.resetTable();
    const params = "transId=" + this.contactForm.transId;
    this.common.loading++;
    this.api.get('Processes/getTransactionContacts?' + params).subscribe(res => {
      this.common.loading--;
      console.log("api data", res);
      if (!res['data']) return;
      this.transContactList = res['data'] || [];
      this.transContactList.length ? this.setTable() : this.resetTable();
    }, err => {
      this.common.loading--;
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
        } else {
          column[key] = { value: campaign[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    })

    return columns;
  }

  actionIcons(campaign) {
    let icons = [
      { class: 'fas fa-trash-alt', action: this.deleteContact.bind(this, campaign) }
    ];
    return icons;
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
      const activeModal = this.modalService.open(ConfirmComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
      activeModal.result.then(data => {
        if (data.response) {
          this.common.loading++;
          this.api.post('Processes/deleteTransactionContact', params).subscribe(res => {
            this.common.loading--;
            if (res['code'] == 1) {
              this.common.showToast(res['msg']);
              this.getTransactionContact();
            } else {
              this.common.showError(res['msg']);
            }
          }, err => {
            this.common.loading--;
            console.log('Error: ', err);
          });
        }
      });
    }
  }

  addTransactionContact() {
    console.log('params', this.contactForm);
    const params = {
      transId: this.contactForm.transId,
      name: this.contactForm.name,
      mobileno: this.contactForm.mobile,
      email: this.contactForm.email,
    };
    this.common.loading++;
    this.api.post("Processes/addTransactionContact ", params)
      .subscribe(res => {
        this.common.loading--;
        console.log(res);
        if (res['code'] == 1) {
          if (res['data'][0].y_id > 0) {
            this.common.showToast(res['msg']);
            this.reserForm();
            this.getTransactionContact();
          } else {
            this.common.showError(res['msg']);
          }
        } else {
          this.common.showError(res['msg']);
        }
      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }

  reserForm() {
    this.contactForm.name = "";
    this.contactForm.mobile = null;
    this.contactForm.email = null
  }

}
