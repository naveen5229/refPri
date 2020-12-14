import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddInstallerComponent } from '../../modals/add-installer/add-installer.component';
import { ConfirmComponent } from '../../modals/confirm/confirm.component';
import { CsvUploadComponent } from '../../modals/csv-upload/csv-upload.component';
import { ShowInstallerComponent } from '../../modals/show-installer/show-installer.component';

@Component({
  selector: 'installer',
  templateUrl: './installer.component.html',
  styleUrls: ['./installer.component.scss']
})
export class InstallerComponent implements OnInit {
  installerlist = [];
  installerData = {
    name: ''
  }
  tableInstallerList = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  constructor(public modalService: NgbModal,public common: CommonService,public api: ApiService) {
    this.common.refresh = this.refresh.bind(this);
    this.getInstallerList();
  }

  ngOnInit() {}
  
  refresh() {
    this.getInstallerList();
  }

  showInstallerModal(mode = null) {
    if (mode != 'edit') {
      this.common.params = null;
    }
    const activeModal = this.modalService.open(AddInstallerComponent, { size: 'md', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        this.getInstallerList();
      }
    })
  }

  getInstallerList() {
    this.common.loading++;
    this.api.get("Installer/getInstallerList.json?").subscribe(
      res => {
        this.common.loading--;
        console.log("datA", res);
        this.installerlist = res['data'] || [];
        this.installerlist.length ? this.setTableInstallerList() : this.resetSmartTable();

      },
      err => {
        this.common.loading--;
        console.log(err);
      }
    );
  }

  resetSmartTable() {
    this.tableInstallerList.data = {
      headings: {},
      columns: []
    };
  }

  setTableInstallerList() {
    this.tableInstallerList.data = {
      headings: this.generateHeadingsInstallerList(),
      columns: this.getTableColumnsInstallerList()
    };
    console.log("tableInstallerList:", this.tableInstallerList);
    return true;
  }

  generateHeadingsInstallerList() {
    let headings = {};
    for (var key in this.installerlist[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    return headings;
  }

  getTableColumnsInstallerList() {
    let columns = [];
    this.installerlist.map(installer => {
      let column = {};
      for (let key in this.generateHeadingsInstallerList()) {
        if (key == 'Action' || key == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(installer)
          };
        } else {
          column[key] = { value: installer[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    });

    return columns;
  }
  actionIcons(installer) {
    let icons = [
      { class: "fa fa-edit", action: this.editInstaller.bind(this, installer) },
      { class: "fa fa-trash", action: this.deleteInstaller.bind(this, installer) },
    ];
    return icons;
  }

  editInstaller(installer) {
    this.common.params = { installer, title: "Edit Installer", button: "Edit" };
    this.showInstallerModal('edit');
  }
  deleteInstaller(installer) {
    if (installer._id) {
      let params = {
        installerId: installer._id
      }
      this.common.params = {
        title: 'Delete Installer',
        description: `<b>&nbsp;` + 'Are You Sure To Delete This Record' + `<b>`,
      }

      const activeModal = this.modalService.open(ConfirmComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
      activeModal.result.then(data => {
        if (data.response) {
          this.common.loading++;
          this.api.post('Installer/deleteInstaller', params)
            .subscribe(res => {
              this.common.loading--;
              this.common.showToast(res['msg']);
              this.getInstallerList();
            }, err => {
              this.common.loading--;
              console.log('Error: ', err);
            });
        }
      });
    } else {
      this.common.showError("Installer ID Not Available");
    }
  }

  uploadDataByCsv() {
    this.common.params = { title: "Add Installer CSV", button: "Upload", typeFrom: 'installer' };
    const activeModal = this.modalService.open(CsvUploadComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        this.getInstallerList();
      }
    });
  }

  showInstallerMap() {
    this.common.params = null;
    const activeModal = this.modalService.open(ShowInstallerComponent, { size: 'xl', container: 'nb-layout', backdrop: 'static' });
  }

}
