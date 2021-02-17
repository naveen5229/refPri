import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonService } from '../../../Service/common/common.service';
import { ApiService } from '../../../Service/Api/api.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddGlobalFieldComponent } from '../add-global-field/add-global-field.component';

@Component({
  selector: 'ngx-assign-fields',
  templateUrl: './assign-fields.component.html',
  styleUrls: ['./assign-fields.component.scss']
})
export class AssignFieldsComponent implements OnInit {
  title = "Assign Columns";
  fields = [];
  unassign = [];
  processId = null;
  refId = null;
  refType = null;
  assign = {
    left: [],
    right: []
  }
  formType = null;


  constructor(
    public common: CommonService,
    public api: ApiService,
    public activeModal: NgbActiveModal,
    private modalService: NgbModal) {
    if (this.common.params && this.common.params.ref) {
      this.refId = this.common.params.ref.id;
      this.refType = this.common.params.ref.type;
      this.formType = this.common.params.formType;
      this.title = (this.common.params.title) ? this.common.params.title : "Assign Columns";
      this.processId = (this.common.params.processId) ? this.common.params.processId : null;
      this.getFields();
    }
  }

  ngOnInit() { }

  closeModal(res) {
    this.activeModal.close({ response: res });
  }

  getFields() {
    this.common.loading++;
    let api = this.formType == 11 ? 'Ticket/getTicketMatrixCalAssigned?' : 'Processes/getProcessFormField?';
    let params = "processId=" + this.processId +"&refId=" + this.refId +"&refType=" + this.refType
    this.api.get(api + params)
      .subscribe(res => {
        this.common.loading--;
        if(res['code']===0) { this.common.showError(res['msg']); return false;};
        this.fields = res['data'] || [];
        this.colinitialization();
      }, err => {
        this.common.loading--;
        this.common.showError();
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
    let apiBase = this.formType == 11 ? 'Ticket/saveTicketMatrixCalAssign' : 'Processes/saveProcessMatrixCalAssign';
    let params = {
      refId: this.refId,
      refType: this.refType,
      info: JSON.stringify(this.assignOrder()),
    }
    // console.log("Params", params)
    this.common.loading++;
    this.api.post(apiBase, params)
      .subscribe(res => {
        this.common.loading--;
        if (res['code'] == 1) {
          if (res['data'][0].y_id > 0) {
            this.common.showToast(res['data'][0].y_msg);
            this.activeModal.close(true);
          } else {
            this.common.showError(res['data'][0].y_msg);
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

  markImportant(item) {
    console.log("AssignFieldsComponent -> markImportant -> item", item)
    item.r_isdashboard_info = !item.r_isdashboard_info;
  }

  addGlobalfield(){
    this.common.params = {process:{id:this.processId,name:null}};
    const activeModal = this.modalService.open(AddGlobalFieldComponent, { size: 'xl', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      this.getFields();
    });
  }

}

