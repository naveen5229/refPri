import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../../Service/common/common.service';
import { ApiService } from '../../../Service/Api/api.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmComponent } from '../../confirm/confirm.component';

@Component({
  selector: 'ngx-add-category',
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.scss']
})
export class AddCategoryComponent implements OnInit {
  title = "Add Primary Category";
  catForm = {
    id: null,
    process_id: null,
    name: ""
  };

  catType = 1; //1=pri,2=sec,3=type
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
  constructor(public common: CommonService,
    public api: ApiService,
    public activeModal: NgbActiveModal,
    public modalService: NgbModal) {
    // this.button = this.common.params.button ? this.common.params.button : 'Add';
    if (this.common.params && this.common.params.actionData) {
      this.catType = this.common.params.actionData.catType;
      this.catForm.process_id = this.common.params.actionData.process_id;
      this.getProcessCat();
    }
    if (this.catType == 1) {
      this.title = "Add Primary Category";
    } else if (this.catType == 2) {
      this.title = "Add Secondary Category";
    } else if (this.catType == 3) {
      this.title = "Add Type";
    }
  }

  ngOnInit() { }

  closeModal(res) {
    this.activeModal.close({ response: res });
  }

  resetCatForm() {
    this.catForm.id = null;
    this.catForm.name = "";
  }

  getProcessCat() {
    this.resetTableCatList();
    let apiName = null;
    if (this.catType == 1) {
      apiName = "Processes/getProcessPriCat?processId=" + this.catForm.process_id;
    } else if (this.catType == 2) {
      apiName = "Processes/getProcessSecCat?processId=" + this.catForm.process_id;
    } else if (this.catType == 3) {
      apiName = "Processes/getProcessType?processId=" + this.catForm.process_id;
    }
    this.common.loading++;
    this.api.get(apiName).subscribe(res => {
      this.common.loading--;
      if(res['code']===0) { this.common.showError(res['msg']); return false;};
      if (!res['data']) return;
      this.catList = res['data'];
      this.catList.length ? this.setTableCatList() : this.resetTableCatList();

    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log(err);
    });
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
    let icons = [
      { class: "far fa-edit", title: "Edit", action: this.editProcessCat.bind(this, cat) },
      { class: "far fa-trash-alt", title: "Delete", action: this.deleteProcessCat.bind(this, cat) }
    ];
    return icons;
  }

  editProcessCat(cat) {
    this.catForm.id = cat._id;
    this.catForm.name = cat.name;
  }

  addProcessCat() {
    let apiName = null;
    if (this.catType == 1) {
      apiName = "Processes/addProcessPriCat";
    } else if (this.catType == 2) {
      apiName = "Processes/addProcessSecCat";
    } else if (this.catType == 3) {
      apiName = "Processes/addProcessType";
    }
    let params = {
      processId: this.catForm.process_id,
      name: this.catForm.name,
      requestId: this.catForm.id
    }
    this.common.loading++;
    this.api.post(apiName, params).subscribe(res => {
      this.common.loading--;
      if (res['code'] == 1) {
        if (res['data'][0]['y_id'] > 0) {
          this.resetCatForm();
          this.common.showToast(res['msg']);
          this.getProcessCat();
        } else {
          this.common.showError(res['msg']);
        }
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log(err);
    });
  }

  deleteProcessCat(cat) {
    this.common.params = {
      title: 'Delete Category',
      description: 'Are you sure to delete this record?'
    };
    const activeModal = this.modalService.open(ConfirmComponent, { size: "sm", container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        let apiName = null;
        if (this.catType == 1) {
          apiName = "Processes/deleteProcessPriCat";
        } else if (this.catType == 2) {
          apiName = "Processes/deleteProcessSecCat";
        } else if (this.catType == 3) {
          apiName = "Processes/deleteProcessType";
        }
        let params = {
          id: cat._id
        };
        this.common.loading++;
        this.api.post(apiName, params).subscribe(res => {
          this.common.loading--;
          if (res['code'] == 1) {
            if (res['data'][0]['y_id'] > 0) {
              this.common.showToast(res['msg']);
              this.getProcessCat();
            } else {
              this.common.showError(res['msg']);
            }
          } else {
            this.common.showError(res['msg']);
          }
        }, err => {
          this.common.loading--;
          this.common.showError();
          console.log(err);
        });
      }
    });
  }

}
