import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../../Service/common/common.service';
import { ApiService } from '../../../Service/Api/api.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'ngx-data-mapping',
  templateUrl: './data-mapping.component.html',
  styleUrls: ['./data-mapping.component.scss']
})
export class DataMappingComponent implements OnInit {
  title = "";
  button = "Add";
  apiUrl = "";
  listOfData = [];
  checkedList = [];
  constructor(public common: CommonService,
    public api: ApiService,
    public activeModal: NgbActiveModal,
    public modalSService: NgbModal) {
    this.title = this.common.params.title ? this.common.params.title : 'State Mapping';
    this.button = this.common.params.button ? this.common.params.button : 'Add';

    if (this.common.params && this.common.params.data) {
      this.apiUrl = this.common.params.data.apiUrl;
      this.getMappingData();
    }
  }

  closeModal() {
    this.activeModal.close({ response: false });
  }

  ngOnInit() {
  }
  ngDestory() {
    this.common.params = null;
  }
  getMappingData() {
    this.common.loading++;
    this.api.get(this.apiUrl)
      .subscribe(res => {
        this.common.loading--;
        this.listOfData = res['data'];
        console.log("APi ", this.listOfData);
      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }

  onCheckboxChange(option, event) {
    if (event.target.checked) {
      this.checkedList.push({ id: option.id });
    } else {
      for (var i = 0; i < this.checkedList.length; i++) {
        if (this.checkedList[i] == option.id) {
          this.checkedList.splice(i, 1);
        }
      }
    }
    //   console.log("event", event);
    // if (event && event.length) {
    //   this.targetAction.standardRemarkId = event.map(remark => { return { remarkId: remark.id } });
    //   console.log("ID", this.targetAction.standardRemarkId);
    // }

    console.log("selected Data", this.checkedList);
  }

  addMapping() {

  }


}
