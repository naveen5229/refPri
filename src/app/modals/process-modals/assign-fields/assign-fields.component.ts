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
  tableData:any;
  closeResult:any;
  fielddata:any;


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


setfieldRequired(index:number){

let isrequired = this.tableData._param_child[index].r_isdashboard_info;
isrequired = !isrequired;
}

gettablefields(item:any,content:any,index:number){
// this.fielddata = item;

console.log('this.fielddata: ', this.fielddata);
this.tableData = {};
this.tableData = item;
console.log('this.tableData: ', this.tableData);
this.tableData.r_selected = true;
this.tableData.coltitle = item.r_coltitle;

if(this.tableData._param_child){
  this.common.params = { process: { id: this.processId, name: null } };

    const activeModal = this.modalService.open(content, { size: 'md', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
    console.log('data: ', data);
      activeModal.close();
    });
}

else{
 this.common.showError('No data for this fields');
}

}


  getFields() {
    this.common.loading++;
    let api = this.formType == 11 ? 'Ticket/getTicketMatrixCalAssigned?' : 'Processes/getProcessFormField?';
    let params = "processId=" + this.processId + "&refId=" + this.refId + "&refType=" + this.refType

    this.api.get(api + params)
      .subscribe(res => {
        this.common.loading--;
        if (res['code'] === 0) { this.common.showError(res['msg']); return false; };
        this.fields = res['data'] || [];
        console.log('this.fields : ', this.fields );

        this.fields.map((item:any)=>{
        item._param_child =  JSON.parse(item._param_child);
        });
        this.colinitialization();
      }, err => {
        this.common.loading--;
        this.common.showError();
      });
  }

  drop(event: CdkDragDrop<string[]>) {

    if (event.previousContainer === event.container) {
      if (event.container.id == "unassign")
        return;

      if (event.previousContainer.id == event.container.id) {
        if (event.previousContainer.id === 'assign-left') {

          if (this.formType==11 && (this.assign.right[event.currentIndex] || this.assign.right[event.previousIndex]) && ((this.assign.left[event.previousIndex] && this.assign.left[event.previousIndex].param_type === "table") || (this.assign.left[event.currentIndex] && this.assign.left[event.currentIndex].param_type === "table"))) {

            this.common.showError('can not drop type table corresponding to other');
            return;
            // this.assign.right[event.currentIndex + 1] = this.unassign[event.previousIndex];
          } else {

            if (this.assign.left[event.currentIndex]) {
              let completeLeft = JSON.parse(JSON.stringify(this.assign.left));
              completeLeft[event.previousIndex] = this.assign.left[event.currentIndex];
              completeLeft[event.currentIndex] = this.assign.left[event.previousIndex];
              this.assign.left = JSON.parse(JSON.stringify(completeLeft));
            } else {
              let completeLeft = JSON.parse(JSON.stringify(this.assign.left));
              completeLeft[event.previousIndex] = null;
              completeLeft[event.currentIndex] = this.assign.left[event.previousIndex];
              this.assign.left = JSON.parse(JSON.stringify(completeLeft));
            }
          }
        } else if (event.previousContainer.id === 'assign-right') {

          if (this.formType==11 && this.assign.left[event.currentIndex] && this.assign.left[event.currentIndex].param_type === "table") {
            this.common.showError('can not drop corresponding to type table');
            return;
            // this.assign.right[event.currentIndex + 1] = this.unassign[event.previousIndex];
          } else {

            if (this.assign.right[event.currentIndex]) {
              let completeRight = JSON.parse(JSON.stringify(this.assign.right));
              completeRight[event.previousIndex] = this.assign.right[event.currentIndex];
              completeRight[event.currentIndex] = this.assign.right[event.previousIndex];
              this.assign.right = JSON.parse(JSON.stringify(completeRight));
            } else {
              let completeRight = JSON.parse(JSON.stringify(this.assign.right));
              completeRight[event.previousIndex] = null;
              completeRight[event.currentIndex] = this.assign.right[event.previousIndex];
              this.assign.right = JSON.parse(JSON.stringify(completeRight));
            }
          }
        }

      }
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else if (event.previousContainer.id == "unassign") {
      if (event.container.id == "assign-left") {
        if (this.assign.left[event.currentIndex] == null) {
          if (this.formType==11 && this.assign.right[event.currentIndex] && this.unassign[event.previousIndex].param_type === "table") {
            this.common.showError('can not drop type table corresponding to other');
            return;
            // this.assign.right[event.currentIndex + 1] = this.unassign[event.previousIndex];
          } else {
            this.assign.left[event.currentIndex] = this.unassign[event.previousIndex];
          }
          this.unassign.splice(event.previousIndex, 1);
        }
      } else if (event.container.id == "assign-right") {
        if (this.assign.right[event.currentIndex] == null) {
          if (this.unassign[event.previousIndex].param_type === "table") return this.common.showError('table type can only be assigned in Left');
          if (this.formType==11 && this.assign.left[event.currentIndex] && this.assign.left[event.currentIndex].param_type === "table") {
            this.common.showError('can not drop corresponding to type table');
            return;
            // this.assign.right[event.currentIndex + 1] = this.unassign[event.previousIndex];
          } else {
            this.assign.right[event.currentIndex] = this.unassign[event.previousIndex];
          }
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
    }
    // else if (event.previousContainer.id == "assign-left" && event.container.id == "assign-right") {
    //   if (this.assign.right[event.currentIndex] != null) {
    //     return this.common.showError('can not replace columns')
    //   } else {
    //     if (this.assign.left[event.previousIndex].param_type === "table") return this.common.showError('table type can only be assigned in Left')
    //     this.assign.right[event.currentIndex] = this.assign.left[event.previousIndex];
    //     this.assign.left.splice(event.previousIndex, 1);
    //   }
    //   // if(this.assign.left[event.previousIndex].param_type === "table") return this.common.showError('table type can only be assigned in Left')
    //   // let val = this.assign.right[event.currentIndex];
    //   // this.assign.right[event.currentIndex] = this.assign.left[event.previousIndex];
    //   // this.assign.left[event.previousIndex] = val;
    // } else if (event.previousContainer.id == "assign-right" && event.container.id == "assign-left") {
    //   if (this.assign.left[event.currentIndex] != null) {
    //     return this.common.showError('can not replace columns')
    //   } else {
    //     this.assign.left[event.currentIndex] = this.assign.right[event.previousIndex];
    //     this.assign.right.splice(event.previousIndex, 1);
    //   }
    //   // if (this.assign.left[event.previousIndex].param_type === "table") return this.common.showError('table type can only be assigned in Left')
    //   // let val = this.assign.left[event.currentIndex];
    //   // this.assign.left[event.currentIndex] = this.assign.right[event.previousIndex];
    //   // this.assign.right[event.previousIndex] = val;
    // }


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


saveRequired(){
// let extarray =   JSON.stringify(this.assignOrder());
let updatedarray = this.assignOrder()

let dummyarray = [];
updatedarray.map(item => dummyarray.push(item.r_colid));
let arrindex = dummyarray.indexOf(this.tableData.r_colid);
updatedarray[arrindex]._param_child = this.tableData._param_child;
updatedarray[arrindex].r_selected = true;
console.log('updatedarray[arrindex].r_selected: ', updatedarray[arrindex].r_selected);

console.log('this.assignOrder() after json parsing',updatedarray);

    let apiBase = this.formType == 11 ? 'Ticket/saveTicketMatrixCalAssign' : 'Processes/saveProcessMatrixCalAssign';
    let params = {
      refId: this.refId,
      refType: this.refType,
      info: JSON.stringify(updatedarray),
    };

    console.log('params: ', params);

    this.common.loading++;
    this.api.post(apiBase, params)
      .subscribe((res:any) => {
      console.log('save response : ', res.info);
        this.common.loading--;
        if (res['code'] == 1) {
          if (res['data'][0].y_id > 0) {
            this.common.showToast(res['data'][0].y_msg);
            // this.activeModal.close(true);
            this.getFields();
          } else {
            this.common.showError(res['data'][0].y_msg);
          }

        } else {
          this.common.showError(res['msg']);
        }
      }, err => {
        this.common.loading--;
        this.common.showError();

      });
}


  saveColumns() {
    let apiBase = this.formType == 11 ? 'Ticket/saveTicketMatrixCalAssign' : 'Processes/saveProcessMatrixCalAssign';
    let params = {
      refId: this.refId,
      refType: this.refType,
      info: JSON.stringify(this.assignOrder()),
    }

    // return;
    this.common.loading++;
    this.api.post(apiBase, params)
      .subscribe(res => {
      console.log('res: ', res);
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

    this.unassign.map((col,index) => {
      col.r_selected = false;
      col.r_colorder = -1;
    });

    return [...selected, ...this.unassign];
  }

  markImportant(item) {

    item.r_isdashboard_info = !item.r_isdashboard_info;
  }

  addGlobalfield() {
    this.common.params = { process: { id: this.processId, name: null } };
    const activeModal = this.modalService.open(AddGlobalFieldComponent, { size: 'xl', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      this.getFields();
    });
  }

}

