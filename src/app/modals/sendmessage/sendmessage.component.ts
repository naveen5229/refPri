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

  message = null;
  imageTextFirst = 1;
  uploadeImage = null;
  order = [];
  imagesUrl = [];
  contact_type = 'UKN';
  showOrder = false;
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
        if (file.type == "application/vnd.ms-excel" || file.type == "text/csv") {
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
    this.order = [];
    if (this.message == null && this.imagesUrl.length)  {
        this.order.push('imgs');
    }
    if (this.message != null && !this.imagesUrl.length)  {
      this.order.push('msg');
  }
  if (this.message != null && this.imagesUrl.length)  {
      if(this.imageTextFirst == 1) {
        this.order.push('imgs', 'msg');
      }
      else {
        this.order.push('msg', 'imgs');
      }
}
console.log(this.order.length);
if (!this.order.length ) {
  this.common.showError('Please Fill All Field');
} else{
    const params = {
      order: this.order,
      imgs: this.imagesUrl,
      contactsCsv: this.csv,
      adminId: this.mesaageData.admin_id,
      msg: this.message,
      contactType: this.contact_type
    };
    console.log(params);
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

handleFileSelectionImage(event) {
  // this.common.loading++;
  let file = event.target.files[0];
  console.log("Type", file.type);
  if (file.type == "image/jpeg" || file.type == "image/jpg" ||
    file.type == "image/png" || file.type == "application/pdf" || file.type == "image/gif") {
    this.common.showToast("SuccessFull File Selected");
  }
  else {
    this.common.showError("valid Format Are : jpeg,png,jpg,pdf,gif");
    return false;
  }
  let promises = [];
  for(let file of event.target.files)
    promises.push(this.common.getBase64(file));
    console.log(promises);
  Promise.all(promises).then(results => this.imagesUrl = results)
  .catch(err =>console.error(err));
  
}


}
