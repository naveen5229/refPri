import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../../@core/mock/users.service';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';

@Component({
  selector: 'ngx-table-view',
  templateUrl: './table-view.component.html',
  styleUrls: ['./table-view.component.scss']
})
export class TableViewComponent implements OnInit {
  @Input() additionalFields = [];
  @Input() tableHeader = null;
  @Input() isDisabled = false;
  @Output() tableUpdate = new EventEmitter();


  constructor(public activeModal: NgbActiveModal, public common: CommonService, public api: ApiService, public modalService: NgbModal, public userService: UserService) {

  }

  ngOnInit() {
    if (this.additionalFields && this.additionalFields.length > 0) {
      this.additionalFields.forEach(element => {
        element.forEach(e => {
          e["isNotBindFixedvalue"] = (e["isNotBindFixedvalue"]) ? e["isNotBindFixedvalue"] : false;
          e["notBindFixedvalue"] = (e["notBindFixedvalue"]) ? e["notBindFixedvalue"] : null;
          if (e.param_type == 'date') {
            e.param_value = (e.param_value) ? new Date(e.param_value) : new Date();
          }else if (e.param_type == 'entity') {
            if (e.param_value > 0 && e.param_info && e.param_info.length) {
              let entity_value = e.param_info.find(x => { return x._id == e.param_value });
              e['entity_value'] = (entity_value) ? entity_value.option : null;
            } else {
              e['entity_value'] = null;
            }
          }else if (e.param_value && e.param_info && e.param_info.length) { // for not bind dropdown
            let notBindFixedvalue = e.param_info.find(x => { return x.option == e.param_value });
            if (!notBindFixedvalue) {
              let notBindOption = e.param_info.find(x => x.isNonBind);
              e["isNotBindFixedvalue"] = true;
              e["notBindFixedvalue"] = e.param_value;
              e["param_value"] = (notBindOption && notBindOption.option) ? notBindOption.option : null;
            }
          }
        });
      });
    }

    let attr = document.getElementById('option');
    console.log('attr:',attr)
    console.log("additionalFields:", this.tableHeader, this.additionalFields);
  }


splicetrash(arr:any,index:number){
let remove = () =>{
arr[0].map((item:any)=>{
  item.param_value = null;
  item.entity_value = null
})
};
arr.length > 1 ? arr.splice(index,1):remove();

}

  onSelectNotBind(event, row) {
    console.log(event)
    let selectEl = event.target;
    let testval = selectEl.options[selectEl.selectedIndex].getAttribute('isNotBind');
    console.log(testval)
    row.isNotBindFixedvalue = false;
    if (JSON.parse(testval)) {
      row.isNotBindFixedvalue = true;
    }
  }

  AddTableRow() {
    let temp = JSON.parse(JSON.stringify(this.tableHeader));
    temp.forEach(e => {
      e.param_value = (e.param_type == 'date') ? new Date() : null;
    });
    this.additionalFields.push(temp);
  }

  addTransaction() {
    console.log("additionalFields:", this.additionalFields);
    this.additionalFields.forEach(element => {
      element.forEach(element2 => {
        if (element2['isNotBindFixedvalue']) {
          element2['param_value'] = element2['notBindFixedvalue'];
        }
      });
    });
    this.tableUpdate.next(this.additionalFields);
    // this.tableUpdate.next(details);
  }
}
