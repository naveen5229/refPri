import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';

@Component({
  selector: 'ngx-assign-installer-to-fieldrequest',
  templateUrl: './assign-installer-to-fieldrequest.component.html',
  styleUrls: ['./assign-installer-to-fieldrequest.component.scss']
})
export class AssignInstallerToFieldrequestComponent implements OnInit {

  btn = 'Send approval to partner';
  approveForm = {
    requestId: null,
    installerId: null,
    partnerId: null
  };
  partnerName = "";

  constructor(public activeModal: NgbActiveModal,
    public api: ApiService,
    public common: CommonService,
    public modalService: NgbModal) {
    console.log("task list", this.common.params);
    if (this.common.params != null) {
      if (this.common.params.requestId) {
        this.approveForm.requestId = this.common.params.requestId;
      }
    }
    // this.getProjectList()
  }

  ngOnInit() {
  }
  getPartnerNameByInstaller(installerId) {
    let params = {
      installerId: installerId
    }
    this.api.post("Grid/getPartnerNameByInstaller.json", params).subscribe(res => {
      console.log("data", res['data'])
      if (res['code'] > 0) {
        this.approveForm.partnerId = res['data']['partnerId'];
        this.partnerName = res['data']['partnerName'];
      } else {
        this.common.showError(res['msg']);
      }
    },
      err => {
        this.common.showError();
        console.log('Error: ', err);
      });
  }

  closeModal(response) {
    this.activeModal.close({ response: response });
  }

  selectedInstaller(event) {
    this.approveForm.installerId = event.id;
    if (event.id) {
      this.approveForm.partnerId = event.partnerid;
      this.partnerName = event.partner_name;
    } else {
      this.approveForm.partnerId = null;
      this.partnerName = "";
    }
  }

  // selectedProject(event) {
  //   console.log("selectedProject:", event);
  //   this.normalTask.projectId = event.id;
  // }
  assignInstallerToFieldSupportRequest() {
    if (this.approveForm.requestId == '') {
      return this.common.showError("Request Id is missing")
    }
    else if (this.approveForm.installerId == '') {
      return this.common.showError("Installer is missing")
    }
    else if (this.approveForm.partnerId == '') {
      return this.common.showError("Partner is missing")
    }
    else {
      const params = {
        requestId: this.approveForm.requestId,
        installerId: this.approveForm.installerId,
        partnerId: this.approveForm.partnerId
      }
      this.common.loading++;
      this.api.post('Grid/assignInstallerToFieldSupportRequest', params).subscribe(res => {
        console.log(res);
        this.common.loading--;
        if (res['code'] > 0) {
          this.common.showToast(res['msg'])
          this.closeModal(true);
        } else {
          this.common.showError(res['msg']);
        }
      },
        err => {
          this.common.loading--;
          this.common.showError();
          console.log('Error: ', err);
        });
    }

  }

}
