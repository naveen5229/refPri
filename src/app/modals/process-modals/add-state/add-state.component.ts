import { Component, OnInit } from '@angular/core';
import { ConfirmComponent } from '../../confirm/confirm.component';
import { ApiService } from '../../../Service/Api/api.service';
import { CommonService } from '../../../Service/common/common.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddFieldComponent } from '../add-field/add-field.component';

@Component({
  selector: 'ngx-add-state',
  templateUrl: './add-state.component.html',
  styleUrls: ['./add-state.component.scss']
})
export class AddStateComponent implements OnInit {
  states = [];
  nextStates = [];
  nextState = null;
  typeId =null;
  stateName = null;
  processId = null;
  requestId = null;

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
      this.processId = this.common.params.process.id;
    this.getStates();
  }

  ngOnInit() {
  }

  closeModal() {
    this.activeModal.close();
  }

  Add() {
    console.log("type:", this.typeId);
    let ns = [];
    let params = {
      processId:this.processId,
      name: this.stateName,
      type: this.typeId,
      nextStates:  JSON.stringify(this.nextStates),
      requestId:this.requestId
    }
    console.log("params", params);
    this.common.loading++;
    this.api.post('Processes/addProcessState', params)
      .subscribe(res => {
        this.common.loading--;
        console.log(res);
        if (res['data'][0].y_id > 0) {
          this.common.showToast("Successfully added");
          this.getStates();
        }
        else {
          this.common.showError(res['data'][0].y_msg);
        }

      }, err => {
        this.common.loading--;
        this.common.showError(err);
        console.log('Err:', err);
      });
  }


  getStates() {
    this.common.loading++;
    let params = "processId="+this.processId;
    this.api.get('Processes/getProcessState?'+params)
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
        this.states = res['data'];
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
        class: "fas fa-edit edit",
        action: this.setData.bind(this, row),
      },
      {
        class: "fas fa-trash-alt",
        action: this.deleteRow.bind(this, row),
      },

      {
        class: "fas fa-edit",
        action: this.openFieldModal.bind(this, row),
      },


      
    )
    return icons;
  }
  deleteRow(row) {
    let params = {
      stateId: row._state_id,
    }
    if (row._state_id) {
      this.common.params = {
        title: 'Delete  ',
        description: `<b>&nbsp;` + 'Are Sure To Delete This Record' + `<b>`,
      }
      const activeModal = this.modalService.open(ConfirmComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
      activeModal.result.then(data => {
        if (data.response) {
          this.common.loading++;
          this.api.post('Processes/deleteProcessState', params)
            .subscribe(res => {
              this.common.loading--;
              console.log("Result:", res['data'][0].y_msg);
              if (res['data'][0].y_id > 0) {
                this.common.showToast("Delete SuccessFully");
                this.getStates();
              }
              else {
                this.common.showError(res['data'][0].y_msg);
              }

            }, err => {
              this.common.loading--;
              console.log('Error: ', err);
            });
        }
      });
    }
  }


 

  setData(data) {
    
    this.typeId = data._type_id;
    this.stateName = data.name;
    this.nextState = data._nextstate && (data._nextstate.length)?data._nextstate:[];
    this.processId = this.processId;
    this.requestId = data._state_id;
    this.btn1 = "Update";
    this.nextStates=this.nextStates
    console.log("this.nextStates",this.nextStates)

  }
  resetData(data) {
  
    this.typeId = null;
    this.stateName = null;
    this.nextStates = null;
    this.nextState = null; 
    this.processId = null;
    this.requestId = null; 
    this.btn1 = "Add";
  }
  

   addNextState(event) {
    if (event && event.length) {
      this.nextStates = event.map(ns => { console.log("---",ns);
        return {id: ns._state_id}  });
    } else {
      this.nextStates = [];
    }
    console.log("nextStates",this.nextStates)
  }

  openFieldModal(data){
    let refData={
      id:data._state_id,
      type:0
    }
    this.common.params = {ref:refData };
    const activeModal = this.modalService.open(AddFieldComponent   , { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        console.log(data.response);
      }
    });
  }
}


