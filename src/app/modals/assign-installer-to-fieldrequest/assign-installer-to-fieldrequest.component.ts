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
    installer: {
      id: null,
      name: ''
    },
    partner: {
      id: null,
      name: ''
    }
  };
  installerList = [];

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

  closeModal(response) {
    this.activeModal.close({ response: response });
  }

  selectedInstaller(event) {
    this.approveForm.installer.id = event.id;
    this.approveForm.installer.name = event.name;
  }

  selectPartner(event) {
    this.approveForm.partner.id = event.id;
    this.approveForm.partner.name = event.name;
    this.approveForm.installer.id = null;
    this.approveForm.installer.id = '';
    this.installerList = [];
    if (event.id) {
      this.installerListByPartner();
    }
  }
  installerListByPartner() {
    let params = {
      partnerId: this.approveForm.partner.id
    }
    this.api.post("Installer/getInstallerListByPartner.json", params).subscribe(res => {
      console.log("data", res['data'])
      if (res['code'] > 0) {
        this.installerList = res['data'];
      } else {
        this.common.showError(res['msg']);
      }
    },
      err => {
        this.common.showError();
        console.log('Error: ', err);
      });
  }

  assignInstallerToFieldSupportRequest() {
    if (this.approveForm.requestId == '') {
      return this.common.showError("Request Id is missing")
    }
    // else if (this.approveForm.installer.id == '') {
    //   return this.common.showError("Installer is missing")
    // }
    else if (this.approveForm.partner.id == '') {
      return this.common.showError("Partner is missing")
    }
    else {
      const params = {
        requestId: this.approveForm.requestId,
        installerId: this.approveForm.installer.id,
        partnerId: this.approveForm.partner.id,
        status: 0
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
