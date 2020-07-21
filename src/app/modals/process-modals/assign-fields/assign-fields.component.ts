import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonService } from '../../../Service/common/common.service';
import { ApiService } from '../../../Service/Api/api.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'ngx-assign-fields',
  templateUrl: './assign-fields.component.html',
  styleUrls: ['./assign-fields.component.scss']
})
export class AssignFieldsComponent implements OnInit {
  fields = [];
  unassign = [];
  refId= null;
  refType= null;
  assign = {
    left: [],
    right: []
  }
 

  constructor(
    public common: CommonService,
    public api: ApiService,
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,
  ) {
    this.common.handleModalSize('class', 'modal-lg','1100','px',1);
    if(this.common.params && this.common.params.ref){
    this.refId = this.common.params.ref.id;
    this.refType = this.common.params.ref.type;
    this.getFields();

  }

  }

  ngOnInit() {
  }
  closeModal() {
    this.activeModal.close();
  }


  getFields() {
    this.common.loading++;
    let params = "refId=" +this.refId+
      "&refType="+this.refType
    this.api.get('Processes/getProcessFormField?'+params)
      .subscribe(res => {
        this.common.loading--;
        console.log("getFields", res['data']);
        this.fields = res['data'] || [];
        this.colinitialization();
      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }



 
  drop(event: CdkDragDrop<string[]>) {
    console.log("drop", event);
    if (event.previousContainer === event.container) {
      if (event.container.id == "unassign")
        return;
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else if (event.previousContainer.id == "unassign") {
      if (event.container.id == "assign-left") {
        if (this.assign.left[event.currentIndex] == null) {
          this.assign.left[event.currentIndex] = this.unassign[event.previousIndex];
          this.unassign.splice(event.previousIndex, 1);
        }
      } else if (event.container.id == "assign-right") {
        if (this.assign.right[event.currentIndex] == null) {
          this.assign.right[event.currentIndex] = this.unassign[event.previousIndex];
          this.unassign.splice(event.previousIndex, 1);
        }
      }
    } else if (event.container.id == "unassign") {
      if (event.previousContainer.id == "assign-left") {
        if (this.assign.left[event.previousIndex] != null) {
          this.unassign.splice(event.previousIndex, 0, this.assign.left[event.previousIndex]);
          this.assign.left[event.previousIndex] = null;
        }
      } else if (event.previousContainer.id == "assign-right") {
        if (this.assign.right[event.previousIndex] != null) {
          this.unassign.splice(event.previousIndex, 0, this.assign.right[event.previousIndex]);
          this.assign.right[event.previousIndex] = null;
        }
      }
    } else if (event.previousContainer.id == "assign-left" && event.container.id == "assign-right") {
      let val = this.assign.right[event.currentIndex];
      this.assign.right[event.currentIndex] = this.assign.left[event.previousIndex];
      this.assign.left[event.previousIndex] = val;
    } else if (event.previousContainer.id == "assign-right" && event.container.id == "assign-left") {
      let val = this.assign.left[event.currentIndex];
      this.assign.left[event.currentIndex] = this.assign.right[event.previousIndex];
      this.assign.right[event.previousIndex] = val;
    }

  }

  colinitialization() {
    this.unassign = this.fields.filter(column => { return !column.r_selected; });
    this.assign.left = [];
    this.assign.right = [];
    let count = 1;

    for (let i = 0; i < this.fields.length; i++) {
      this.assign.left.push(this.fields.find(col1 => {
        if (col1.r_colorder == (i + count) && col1.r_selected) return true;
        return false;
      }) || null);

      this.assign.right.push(this.fields.find(col2 => {
        if (col2.r_colorder == (i + count + 1) && col2.r_selected) return true;
        return false;
      }) || null);

      count++;
    }

  }


  saveColumns() {
    let params = {
      refId : this.refId,
      refType: this.refType,
    }
    console.log("Params", params)
    this.common.loading++;

    this.api.post('LorryReceiptsOperation/saveLrInvoiceFields', params)
      .subscribe(res => {
        this.common.loading--;
        console.log("saveColumns", res['data'][0].rtn_id);
        if (res['data'][0].rtn_id > 0) {
          this.common.showToast("Successfully Added");
          this.activeModal.close();
        }
        else {
          this.common.showError("res['data'][0].rtn_msg");
        }
      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }

 
  assignOrder() {
    let selected = [];
    let count = 1;

    for (let i = 0; i <= this.assign.left.length; i++) {
      if (this.assign.left[i]) {
        this.assign.left[i].r_colorder = i + count;
        this.assign.left[i].r_selected = true;
        selected.push(this.assign.left[i]);
      }

      if (this.assign.right[i]) {
        this.assign.right[i].r_colorder = i + count + 1;
        this.assign.right[i].r_selected = true;
        selected.push(this.assign.right[i]);
      }

      count++;
    }
    
    this.unassign.map(col => {
      col.r_selected = false;
      col.r_colorder = -1;
    });

    return [...selected, ...this.unassign];
  }
}

