import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'ngx-generic-model',
  templateUrl: './generic-model.component.html',
  styleUrls: ['./generic-model.component.scss']
})
export class GenericModelComponent implements OnInit {
  title = '';
  data = [];
  response = [];
  table = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  headings = [];
  valobj = {};
  viewObj = {
    param: null,
    api: null,
  };
  viewModalObj = {
    param: null,
    api: null,
  };
  deleteObj = {
    param: null,
    api: null,
  };
  deleteParams = null;
  viewModalParams = null;
  constructor(private activeModal: NgbActiveModal,
    public common: CommonService,
    private commonService: CommonService,
    public api: ApiService,
    public modalService: NgbModal) {
      if (this.common.params && this.common.params.data) {
        this.title = this.common.params.data.title ? this.common.params.data.title : '';
        if (this.common.params.data.view) {
          let str = "?";
          Object.keys(this.common.params.data.view.param).forEach(element => {
            if (str == '?')
              str += element + "=" + this.common.params.data.view.param[element];
            else
              str += "&" + element + "=" + this.common.params.data.view.param[element];
          });
          this.viewObj = this.common.params.data.view;
          this.viewObj.api += str;
        }
        if (this.common.params.data.delete) {
          this.deleteObj = this.common.params.data.delete;
        }
        if (this.common.params.data.viewModal) {
          this.viewModalObj = this.common.params.data.viewModal;
        }
  
      }
      this.view();
    }

  ngOnInit() {}
  view() {
    this.data = [];
    this.table = {
      data: {
        headings: {},
        columns: []
      },
      settings: {
        hideHeader: true
      }
    };

    this.headings = [];
    this.valobj = {};

    this.common.loading++;
    if (this.common.params && this.common.params.data.type == 'transtruck') {
      this.api.getTranstruck(this.viewObj.api)
      .subscribe(res => {
        this.common.loading--;
        // if(res['code'] ===0){this.common.showError(res['msg']);return false;}
        this.data = res['data'];
        this.common.showToast(res['msg'])
        console.log(this.data);
        if (this.data == null) {
          this.data = [];
          this.table = null;
          return;
        }
        let first_rec = this.data[0];
        for (var key in first_rec) {
          if (key.charAt(0) != "_") {
            this.headings.push(key);
            let headerObj = { title: this.formatTitle(key), placeholder: this.formatTitle(key) };
            this.table.data.headings[key] = headerObj;
          }
        }
        this.table.data.columns = this.getTableColumns();
      }, err => {
        this.common.loading--;
        this.common.showError();
      });
    } else {
      this.api.get(this.viewObj.api)
      .subscribe(res => {
        this.common.loading--;
        if(res['code']===0) { this.common.showError(res['msg']); return false;};
        if (res['code'] == 3) {
          this.common.showError(res['data']);
          this.activeModal.close();

        } else {
        this.data = res['data'];
        console.log(this.data);
        if (this.data == null) {
          this.data = [];
          this.table = null;
          return;
        }
        let first_rec = this.data[0];
        for (var key in first_rec) {
          if (key.charAt(0) != "_") {
            if (this.common.params.data['actionRequired'] && key == 'action') {
                continue;
            }
            this.headings.push(key);
            let headerObj = { title: key, placeholder: this.common.formatTitle(key) };
            this.table.data.headings[key] = headerObj;
          }
        }
        this.table.data.columns = this.getTableColumns();
      }
      }, err => {
        this.common.loading--;
        this.common.showError();
      });
    
    }
    
  }

  formatTitle(title) {
    return title.charAt(0).toUpperCase() + title.slice(1)
  }
  getTableColumns() {
    let columns = [];
    this.data.map(doc => {
      this.valobj = {};
      for (let i = 0; i < this.headings.length; i++) {
        if ( this.headings[i] == "action") {
          let icons = [];
          if (this.deleteObj.api)
            // icons.push({ class: 'fa fa-trash', action: this.delete.bind(this, doc) });
          if (this.viewModalObj.api)
            // icons.push({ class: 'fa fa-eye', action: this.viewModal.bind(this, doc) });
          if (icons.length != 0)
            this.valobj[this.headings[i]] = { value: "", action: null, icons: icons };
        } else {
          this.valobj[this.headings[i]] = { value: doc[this.headings[i]], class: 'black', action: '' };
        }
      }
      columns.push(this.valobj);
    });
    return columns;
  }
  closeModal() {
    this.activeModal.close();
  }

}
