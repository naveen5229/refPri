import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ErrorReportComponent } from '../error-report/error-report.component';
@Component({
  selector: 'ngx-sendmessage',
  templateUrl: './sendmessage.component.html',
  styleUrls: ['./sendmessage.component.scss']
})
export class SendmessageComponent implements OnInit {

  message = '';
  contact_type = 'UKN';
  mesaageData = {
    admin_id : '',
    admin_name: '',
    admin_mobileno: '',
    assigned: [],

  }
  csv = null;
  upload = {
    csv: null,
    // admin_id: null,
    // campaignType: 1,

  }
  messageDataList = [ ];
  constructor (public common: CommonService,
  public api: ApiService,
  public activeModal: NgbActiveModal,
  public modalService: NgbModal) {
    this.getMessageData();
    this.common.handleModalSize('class', 'modal-lg', '750', 'px');
   }

  ngOnInit() {
  }

  getMessageData() {
    this.common.loading++;
    this.api.get('WhatsappWeb/getWhatsAppAdmin')
    .subscribe(res => {
      this.mesaageData.assigned = res['data'].map(user => {
        return { admin_name: user.admin_name, admin_id: user.admin_id, admin_mobileno: user.admin_mobileno }
      });
      this.common.loading--;
      console.log(res)
      this.messageDataList = res['data']
      console.log("pa", this.messageDataList)
    }, err => {
      this.common.loading--;
      console.error(err);
      this.common.showError();
    });
  }
  selectedAdmin(admin_detail) {
    this.mesaageData.admin_id =admin_detail.admin_id;
    console.log(admin_detail);
  }

  handleFileSelection(event) {
    console.log(event);
    this.common.loading++;
    this.common.getBase64(event.target.files[0])
      .then(res => {
        this.common.loading--;
        let file = event.target.files[0];
        console.log(file);
        if (file.type == "application/vnd.ms-excel") {
        }
        else {
          alert("valid Format Are : csv");
          return false;
        }

        res = res.toString().replace('vnd.ms-excel', 'csv');
        console.log(res);
        this.csv = res;
      }, err => {
        this.common.loading--;
        console.error('Base Err: ', err);
      })
  }
  closeModal() {
    this.activeModal.close({ response: false });
  }
 
  SendMsg() {
    console.log(this.contact_type);
    if (this.contact_type == '' || this.message == '' ) {
      this.common.showError('Please Fill All Fild');
    } else{
    console.log(this.contact_type.length);
    const params = {
      contactsCsv: this.csv,
      adminId: this.mesaageData.admin_id,
      msg: this.message,
      contactType: this.contact_type
    };
    console.log(params.contactType.split);
    this.common.loading++;
    this.api.post('WhatsappWeb/importContactsCsv', params)
    .subscribe(res => {
      this.common.loading--;
          let successData = res['data']['success'];
          let errorData = res['data']['fail'];
          this.common.params = { successData, errorData, title: 'csv Uploaded Data' };
          const activeModal = this.modalService.open(ErrorReportComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
              activeModal.result.then(data => {
                if (data.response) {
                  this.activeModal.close({ response: true });
                }
              });
      this.closeModal();
      // console.log(res)
    }, err => {
      this.common.loading--;
      console.error(err);
      this.common.showError();
    });
  }
}
}
