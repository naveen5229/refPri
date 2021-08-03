import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../../Service/common/common.service';
import { ApiService } from '../../../Service/Api/api.service';
import { UserService } from '../../../Service/user/user.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'ngx-form-data-table',
  templateUrl: './form-data-table.component.html',
  styleUrls: ['./form-data-table.component.scss']
})
export class FormDataTableComponent implements OnInit {
  additionalFields = [];
  tableHeader = null;
  isDisabled = false;
  constructor(public activeModal: NgbActiveModal, public common: CommonService, public api: ApiService, public modalService: NgbModal, public userService: UserService) {
    console.log('you are intable');
    this.additionalFields = this.common.params.additionalform;
    this.isDisabled = common.params.isDisabled;
    console.log("additionalFields:", this.additionalFields);
    // if (this.additionalFields && this.additionalFields.length > 0) {
    //   this.tableHeader = JSON.parse(JSON.stringify(this.additionalFields[0]));
    //   this.additionalFields.forEach(element => {
    //     element.forEach(e => {
    //       if (e.param_type == 'date') {
    //         e.param_value = (e.param_value) ? new Date(e.param_value) : new Date();
    //       }
    //     });
    //   });
    // }

    if (this.additionalFields && this.additionalFields.length > 0) {
      this.tableHeader = JSON.parse(JSON.stringify(this.additionalFields[0]));
      this.additionalFields.forEach(element => {
        element.forEach(e => {
          e["isNotBindFixedvalue"] = (e["isNotBindFixedvalue"]) ? e["isNotBindFixedvalue"] : false;
          e["notBindFixedvalue"] = (e["notBindFixedvalue"]) ? e["notBindFixedvalue"] : null;
          if (e.param_type == 'date') {
            e.param_value = (e.param_value) ? new Date(e.param_value) : new Date();
          } else if (e.param_type == 'entity') {
            if (e.param_value > 0 && e.param_info && e.param_info.length) {
              let entity_value = e.param_info.find(x => { return x._id == e.param_value });
              e['entity_value'] = (entity_value) ? entity_value.option : null;
            } else {
              e['entity_value'] = null;
            }
          } else if (e.param_value && e.param_info && e.param_info.length) { // for not bind dropdown
            let notBindFixedvalue = e.param_info.find(x => { return x.option == e.param_value });
            if (!notBindFixedvalue) {
              let notBindOption = e.param_info.find(x => x.isNonBind);
              e["isNotBindFixedvalue"] = true;
              e["notBindFixedvalue"] = e.param_value;
              e["param_value"] = (notBindOption && notBindOption.option) ? notBindOption.option : null;
            }
          }

          //earlier code
          // if (e.r_value && e.param_info && e.param_info.length) { // for not bind dropdown
          //   let notBindFixedvalue = e.param_info.find(x => { return x.option == e.r_value });
          //   if (!notBindFixedvalue) {
          //     let notBindOption = e.param_info.find(x => x.isNonBind);
          //     e["isNotBindFixedvalue"] = true;
          //     e["notBindFixedvalue"] = e.r_value;
          //     e["r_value"] = (notBindOption && notBindOption.option) ? notBindOption.option : null;
          //   }
          // }
          //earlier code

        });
      });
    }
  }

  ngOnInit() { }

splicetrash(arr:any,index:number){
console.log('arr: ', arr);
let remove = () =>{
arr[0].map((item:any)=>{
  item.param_value = null;
  item.entity_value = null
})
};
arr.length > 1 ? arr.splice(index,1):remove();

}

  close(res) {
    this.activeModal.close({ response: res, data: (this.additionalFields && this.additionalFields.length > 0) ? this.additionalFields : null });
  }

  AddTableRow() {
    let temp = JSON.parse(JSON.stringify(this.tableHeader));
    temp.forEach(e => {
      e.param_value = (e.param_type == 'date') ? new Date() : null;
    });
    this.additionalFields.push(temp);
  }

  addTransaction() {
    // console.log("additionalFields:", this.additionalFields);
    this.close(true);
  }

  onSelectNotBind(event, row) {
    console.log(event, row)
    let selectEl = event.target;
    let testval = selectEl.options[selectEl.selectedIndex].getAttribute('isNotBind');
    console.log(testval)
    row.isNotBindFixedvalue = false;
    if (JSON.parse(testval)) {
      row.isNotBindFixedvalue = true;
    }
  }
}
