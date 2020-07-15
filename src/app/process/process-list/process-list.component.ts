import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddProcessComponent } from '../../modals/process-modals/add-process/add-process.component';
import { DataMappingComponent } from '../../modals/campaign-modals/data-mapping/data-mapping.component';

@Component({
  selector: 'ngx-process-list',
  templateUrl: './process-list.component.html',
  styleUrls: ['./process-list.component.scss']
})
export class ProcessListComponent implements OnInit {
  processData = [];
  table = {
    data: {
      headings: {},
      columns: [],
    },
    settings: {
      hideHeader: true
    }
  };

  constructor(public api: ApiService, public common: CommonService, public modalService: NgbModal) {
    this.getProcessList();
  }

  ngOnInit() {
  }

  getProcessList() {
    this.common.loading++;
    this.api.get('Processes/getProcessList')
      .subscribe(res => {
        this.common.loading--;
        console.log("api data", res);
        if (!res['data']) return;
        this.processData = res['data'];
        this.processData.length ? this.setTable() : this.resetTable();

      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }

  addProcess(processDate = null) {
    this.common.params = { title: "Add Process", button: "Next", editData: processDate };
    const activeModal = this.modalService.open(AddProcessComponent, { size: 'md', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        this.getProcessList();
      }
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
    for (var key in this.processData[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    return headings;
  }

  getTableColumns() {
    let columns = [];
    this.processData.map(process => {
      let column = {};
      for (let key in this.generateHeadings()) {
        if (key.toLowerCase() == 'action') {
          column[key] = {
            value: "",
            isHTML: false,
            action: null,
            icons: this.actionIcons(process)
          };
        } else {
          column[key] = { value: process[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    })

    return columns;
  }

  actionIcons(process) {
    let icons = [
      { class: "far fa-edit", title: "Edit", action: this.addProcess.bind(this, process) },
      { class: "fas fa-list-alt pri_cat ml-2", action: this.openCatModal.bind(this, process, 1), title: "Primary Category Mapping" },
      { class: "fas fa-list-alt ml-2", action: this.openCatModal.bind(this, process, 2), title: "Secondary Category Mapping" },
    ];
    return icons;
  }

  catType = 1;
  catList = [];
  tableCatList = {
    data: {
      headings: {},
      columns: [],
    },
    settings: {
      hideHeader: true
    }
  };

  closeCatModal() {
    document.getElementById("catModal").style.display = "none";
  }

  openCatModal(process, type) {
    this.catType = type;
    let apiName = "Processes/getProcessPriCat?processId=" + process._id;
    if (type == 1) {
      apiName = "Processes/getProcessPriCat?processId=" + process._id;
    } else {
      apiName = "Processes/getProcessSecCat?processId=" + process._id;
    }
    this.common.loading++;
    this.api.get(apiName).subscribe(res => {
      this.common.loading--;
      console.log("api data", res);
      if (!res['data']) return;
      this.processData = res['data'];
      this.catList.length ? this.setTableCatList() : this.resetTableCatList();

    }, err => {
      this.common.loading--;
      console.log(err);
    });
    document.getElementById("catModal").style.display = "block";
  }

  resetTableCatList() {
    this.tableCatList.data = {
      headings: [],
      columns: []
    };
  }

  setTableCatList() {
    this.tableCatList.data = {
      headings: this.generateHeadingsCatList(),
      columns: this.getTableColumnsCatList()
    };
    return true;
  }

  generateHeadingsCatList() {
    let headings = {};
    for (var key in this.catList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    return headings;
  }

  getTableColumnsCatList() {
    let columns = [];
    this.catList.map(cat => {
      let column = {};
      for (let key in this.generateHeadingsCatList()) {
        if (key.toLowerCase() == 'action') {
          column[key] = {
            value: "",
            isHTML: false,
            action: null,
            icons: this.actionIconsCatList(cat)
          };
        } else {
          column[key] = { value: cat[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    })

    return columns;
  }

  actionIconsCatList(cat) {
    console.log("cat:", cat);
  }

}
