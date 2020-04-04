import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';

@Component({
  selector: 'ngx-approve-field-support-request',
  templateUrl: './approve-field-support-request.component.html',
  styleUrls: ['./approve-field-support-request.component.scss']
})
export class ApproveFieldSupportRequestComponent implements OnInit {
  btn = 'Approval';
  approveForm = {
    requestId: null,
    installer: {
      id: null,
      name: ''
    },
    partner: {
      id: null,
      name: ''
    },
    status: null,
    remark: ""
  };
  // partnerName = "";
  installerList = [];

  constructor(public activeModal: NgbActiveModal,
    public api: ApiService,
    public common: CommonService,
    public modalService: NgbModal) {
    console.log("task list", this.common.params);
    console.log("request list", this.common.params.request);
    if (this.common.params != null) {
      this.btn = this.common.params.button;
      this.approveForm = {
        requestId: this.common.params.request._id,
        installer: {
          id: this.common.params.request._installer_id,
          name: this.common.params.request.installer_name
        },
        partner: {
          id: this.common.params.request._partner_id,
          name: this.common.params.request.partner_name
        },
        status: this.common.params.status,
        remark: ""
      }
      console.log("edit data", this.approveForm);
    }
    // this.installerListByPartner();
  }

  ngOnInit() {
  }
  // installerListByPartner() {
  //   let params = {
  //     partnerId: this.approveForm.partner.id
  //   }
  //   this.api.post("Installer/getInstallerListByPartner.json", params).subscribe(res => {
  //     console.log("data", res['data'])
  //     if (res['code'] > 0) {
  //       this.installerList = res['data'];
  //     } else {
  //       this.common.showError(res['msg']);
  //     }
  //   },
  //     err => {
  //       this.common.showError();
  //       console.log('Error: ', err);
  //     });
  // }

  closeModal(response) {
    this.activeModal.close({ response: response });
  }

  // selectedInstaller(event) {
  //   if (event.id) {
  //     this.approveForm.installer.id = event.id;
  //     this.approveForm.installer.name = event.name;
  //   } else {
  //     this.approveForm.installer.id = null;
  //     this.approveForm.installer.name = '';
  //   }
  // }

  approveFieldSupportRequest() {
    if (this.approveForm.requestId == '') {
      return this.common.showError("Request Id is missing")
    }
    else if (!(this.approveForm.installer.id > 0)) {
      return this.common.showError("Installer is missing")
    }
    else if (!(this.approveForm.partner.id > 0)) {
      return this.common.showError("Partner is missing")
    }
    else {
      const params = {
        requestId: this.approveForm.requestId,
        installerId: this.approveForm.installer.id,
        partnerId: this.approveForm.partner.id,
        status: this.approveForm.status,
        remark: this.approveForm.remark
      }
      console.log("params:", params); return false;
      this.common.loading++;
      this.api.post('Grid/approvedFieldSupportRequestByPartner', params).subscribe(res => {
        console.log(res);
        this.common.loading--;
        if (res['code'] > 0) {
          this.common.showToast(res['msg'])
          this.closeModal(true);
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

}
