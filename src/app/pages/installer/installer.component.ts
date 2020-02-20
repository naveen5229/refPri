import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddInstallerComponent } from '../../modals/add-installer/add-installer.component';

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
  table = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  constructor(public modalService: NgbModal,
    public common: CommonService,
    public api: ApiService) { }

  ngOnInit() {
  }

  addInstaller() {
    const activeModal = this.modalService.open(AddInstallerComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
  }

  getInstallerList() {
    this.common.loading++;
    this.api.get("Grid/getInstallerList.json?").subscribe(
      res => {
        this.common.loading--;
        console.log("datA", res);
        if (res['data'] == null) {
          this.common.showToast('No Tag For This Vehicle!!');
          this.installerlist = [];
          return;
        }
        else {
          this.installerlist = res['data'] || [];
          this.installerlist.length ? this.setTable() : this.resetTable();
        }
      },
      err => {
        this.common.loading--;
        console.log(err);
      }
    );
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
    for (var key in this.installerlist[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.formatTitle(key) };
      }
    }
    return headings;
  }

  formatTitle(strval) {
    let pos = strval.indexOf('_');
    if (pos > 0) {
      return strval.toLowerCase().split('_').map(x => x[0].toUpperCase() + x.slice(1)).join(' ')
    } else {
      return strval.charAt(0).toUpperCase() + strval.substr(1);
    }
  }

  getTableColumns() {
    let columns = [];
    this.installerlist.map(installer => {
      let column = {};
      for (let key in this.generateHeadings()) {
        if (key == 'Action') {
          column[key] = {
            value: "",
            isHTML: false,
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
  actionIcons(request) {
    let icons = [
      {
        class: " icon fa fa-paper-plane blue",
        // action: this.openIssueRequestModal.bind(this, request),
      }
    ];
    return icons;
  }

}
