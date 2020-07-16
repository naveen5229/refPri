import { Component, OnInit } from '@angular/core';
import { ConfirmComponent } from '../../confirm/confirm.component';
import { ApiService } from '../../../Service/Api/api.service';
import { CommonService } from '../../../Service/common/common.service';
import { UserService } from '../../../Service/user/user.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'ngx-add-field',
  templateUrl: './add-field.component.html',
  styleUrls: ['./add-field.component.scss']
})
export class AddFieldComponent implements OnInit {
  stateType = null;
  refId =null;
  refType = null;
  formType = null
  types = [{
    id: null,
    name: null,
  }
  ];
  fixValues = [{
    option: ''
  }];
  isFixedValue = false;
  isRequired = false;
  fieldId = null;
  typeId = null;
  name = null;

  data = [];
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

  btn1 = "Add";
  btn2 = "Cancel";
  editable: true;
  constructor(public api: ApiService,
    public common: CommonService,
    public activeModal: NgbActiveModal,
    private modalService: NgbModal) {
      this.refId = this.common.params.ref.id ;
      this.refType = this.common.params.ref.type; 
    this.types = [{
      id: 'text',
      name: 'Text'
    },
    {
      id: 'number',
      name: 'Number'
    },
    {
      id: 'date',
      name: 'Date'
    }];
    this.getFieldName();
  }

  ngOnInit() {
  }

  closeModal() {
    this.activeModal.close();
  }

  Add() {
    let tmpJson = {
      param:this.name ,
      type:this.typeId,
      drpOption:this.fixValues,
      is_required :this.isRequired
       }
    console.log("type:", this.typeId);
    let params = {
      refid : this.refId,
      refType:this.refType,
      type:this.formType,
      info:JSON.stringify(tmpJson)
    }
    console.log("params", params);
    this.common.loading++;
    this.api.post('Processes/addProcessMatrix', params)
      .subscribe(res => {
        this.common.loading--;
        console.log(res);
        if (res['data'][0].r_id > 0) {
          this.common.showToast("Successfully added");
          this.getFieldName();
        }
        else {
          this.common.showError(res['data'][0].r_msg);
        }

      }, err => {
        this.common.loading--;
        this.common.showError(err);
        console.log('Err:', err);
      });
  }

  getFieldName() {
    this.common.loading++;
    let params = "refId="+this.refId+"&refType="+this.refType;
    
    this.api.get('Processes/getProcessMatrix?' + params)
      .subscribe(res => {
        this.common.loading--;
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

        if (!res['data']) return;
        this.data = res['data'];
        let first_rec = this.data[0];
        for (var key in first_rec) {
          if (key.charAt(0) != "_") {
            this.headings.push(key);
            let headerObj = { title: this.formatTitle(key), placeholder: this.formatTitle(key) };
            this.table.data.headings[key] = headerObj;
          }
        }
        let action = { title: this.formatTitle('action'), placeholder: this.formatTitle('action'), hideHeader: true };
        this.table.data.headings['action'] = action;


        this.table.data.columns = this.getTableColumns();



      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }

  getTableColumns() {
    let columns = [];
    this.data.map(doc => {
      this.valobj = {};
      for (let i = 0; i < this.headings.length; i++) {
        this.valobj[this.headings[i]] = { value: doc[this.headings[i]], class: 'black', action: '' };
      }
      this.valobj['action'] = { class: '', icons: this.Delete(doc) };
      columns.push(this.valobj);
    });

    return columns;
  }

  formatTitle(title) {
    return title.charAt(0).toUpperCase() + title.slice(1);
  }

  Delete(row) {
    let icons = [];
    icons.push(
      {
        class: "fas fa-trash-alt",
        action: this.deleteRow.bind(this, row),
      },
      {
        class: "fas fa-edit edit",
        action: this.setData.bind(this, row),
      },

    )
    return icons;
  }
  deleteRow(row) {
    let params = {
      id: row._id,
      stateType: this.stateType,
    }
    if (row._id) {
      this.common.params = {
        title: 'Delete  ',
        description: `<b>&nbsp;` + 'Are Sure To Delete This Record' + `<b>`,
      }
      const activeModal = this.modalService.open(ConfirmComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
      activeModal.result.then(data => {
        if (data.response) {
          this.common.loading++;
          this.api.post('LorryReceiptsOperation/lrDeleteFoField', params)
            .subscribe(res => {
              this.common.loading--;
              console.log("Result:", res['data'][0].y_msg);
              if (res['data'][0].y_id > 0) {
                this.common.showToast("Delete SuccessFull");
                this.getFieldName();
              }
              else {
                this.common.showToast(res['data'][0].y_msg);
              }

            }, err => {
              this.common.loading--;
              console.log('Error: ', err);
            });
        }
      });
    }
  }


  addFixValue() {
    this.fixValues.push({
      option: ''
    });
  }

 

  setData(data) {
    
    this.typeId = data.col_type;
    this.name = data.col_title;
    this.fixValues = data.newvalues ? JSON.parse(data.newvalues) : this.fixValues;
    this.isFixedValue = data.is_active;
    this.isRequired = data.is_autocalculate;
    this.btn1 = "Update";

  }
  resetData(data) {
  
    this.typeId = null;
    this.name = null;
    this.isFixedValue = false;
    this.isRequired = false
    this.fieldId = null;
    this.fixValues = [{
      option: ''
    }];
    this.btn1 = "Add";

  }
}

