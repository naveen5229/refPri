import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { SendmessageComponent } from '../../modals/sendmessage/sendmessage.component';
import { GenericModelComponent } from '../../modals/generic-model/generic-model.component';
import { ConfirmComponent } from '../../modals/confirm/confirm.component';

@Component({
  selector: 'ngx-ww-tools',
  templateUrl: './ww-tools.component.html',
  styleUrls: ['./ww-tools.component.scss']
})
export class WwToolsComponent implements OnInit {
 selectedContact = {};
 buttonType = '';
 modalApi = '';
 param = {};
 title = '';
  constructor(public common: CommonService,
    public api: ApiService,
    public modalService: NgbModal,
    ) { }

  ngOnInit() {
  }
  contactDetails(event) {
    this.selectedContact = event;
    console.log(this.selectedContact);
  }
  sendWwMsg() {
    const activeModal = this.modalService.open(SendmessageComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
  }

  resetContacts(buttonType) {
    console.log(buttonType);
    if (buttonType == 'reset') {
      let params = {
        contactId:this.selectedContact['contact_id'],
        type: 'single'
      }
      console.log(params);
      this.common.loading++;
      this.api.post('WhatsappWeb/resetContacts', params)
        .subscribe(res => {
          this.common.loading--;
          if (res['success']) {
            console.log(res);
            this.common.showToast(res['msg']);
          }
        }, err => {
          this.common.loading--;
          console.log(err);
          this.common.showError();
        });
    }
    else if(buttonType == 'resetAll') {
      
      this.common.params = {
        title: 'Confirm Model',
        description: 'Are you sure you want to reset all contacts?',
        btn2: "No",
        btn1: 'Yes'
      };
      const activeModal = this.modalService.open(ConfirmComponent, { size: "sm", container: 'nb-layout', backdrop: 'static' });
      console.log(activeModal);
      activeModal.result.then(data => {
        console.log('res', data);
        if (data.response) {
          let params = {
            type: 'all'
          }
          this.common.loading++;
          this.api.post('WhatsappWeb/resetContacts', params)
            .subscribe(res => {
              this.common.loading--;
              console.log("res", res);
              if (res['success']) {
                this.common.showToast(res['msg']);
              }
            }, err => {
              this.common.loading--;
              console.log(err);
              this.common.showError();
            });
              
        }
      })
    
  }
}

pendingMsgActiveContacts(buttonType){
  if (buttonType == 'pendingMsg') {
    this.modalApi = 'WhatsappWeb/getPendingMessage';
    this.param = {};
    this.title = "Pending Message"
  } else if (buttonType == 'activeContacts') {
    this.modalApi = 'WhatsappWeb/getActiveContacts';
    this.param = {};
    this.title = "Active Contacts"
  }

  let dataparams = {
    view: {
      api: this.modalApi,
      param: this.param
    },
    
    title: this.title
  }
  this.common.handleModalSize('class', 'modal-lg', '1100');
  this.common.params = { data: dataparams };
  this.modalService.open(GenericModelComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
}

  
}
