import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../../Service/common/common.service';
import { ApiService } from '../../../Service/Api/api.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { create } from 'domain';

@Component({
  selector: 'ngx-data-mapping',
  templateUrl: './data-mapping.component.html',
  styleUrls: ['./data-mapping.component.scss']
})
export class DataMappingComponent implements OnInit {
  title = "";
  button = "Add";
  apiUrl = null;
  listOfData = [];
  checkedList = [];
  updateUrl = "";
  updateParams = null;
  typeId = "";
  constructor(public common: CommonService,
    public api: ApiService,
    public activeModal: NgbActiveModal,
    public modalSService: NgbModal) {
    this.title = this.common.params.title ? this.common.params.title : 'State Mapping';
    this.button = this.common.params.button ? this.common.params.button : 'Add';

    if (this.common.params && this.common.params.data) {
      let str = "?";
      Object.keys(this.common.params.data.param).forEach(element => {
        if (str == '?')
          str += element + "=" + this.common.params.data.param[element];
        else
          str += "&" + element + "=" + this.common.params.data.param[element];
      });
      this.apiUrl = this.common.params.data.apiUrl + str;
      this.updateUrl = this.common.params.data.updateUrl;
      this.updateParams = this.common.params.data.updateParam;
      this.typeId = this.common.params.data.idType;
      this.getMappingData();
    }
  }

  closeModal() {
    this.activeModal.close({ response: false });
  }

  ngOnInit() {
  }
  ngOnDestroy() {
    this.common.params = null;
    this.updateParams = null;
    this.updateUrl = null;

  }
  getMappingData() {
    this.common.loading++;
    this.api.get(this.apiUrl)
      .subscribe(res => {
        this.common.loading--;
        this.listOfData = res['data'];
        this.listOfData.filter(ele => {
          if (this.typeId == "stateId") {
            if (ele.ismapped) {
              this.checkedList.push({ stateId: ele.id });
            }
          } else {
            if (ele.ismapped) {
              this.checkedList.push({ actionId: ele.id });
            }
          }

        })
        console.log("APi ", this.listOfData);
      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }

  onCheckboxChange(option, event) {

    if (event.target.checked) {
      this.checkedList.push({ stateId: option.id });
    } else {
      for (var i = 0; i < this.listOfData.length; i++) {
        if (this.checkedList[i]['id'] == option.id) {
          console.log("remove");
          return this.checkedList.splice(i, 1);
        }
      }

    }

  }

  selected(option, event) {
    if (event.target.checked) {
      this.checkedList.push({ actionId: option.id });
    } else {
      for (var i = 0; i < this.listOfData.length; i++) {
        if (this.checkedList[i]['id'] == option.id) {
          console.log("remove");
          return this.checkedList.splice(i, 1);
        }
      }

    }
  }

  addMapping() {
    if (this.typeId == "stateId") {
      this.updateParams.stateIdList = this.checkedList;
    } else {
      this.updateParams.actionIdList = this.checkedList;

    }
    console.log("selected Data", this.checkedList);
    this.common.loading++;
    this.api.post(this.updateUrl, this.updateParams)
      .subscribe(res => {
        this.common.loading--;
        console.log("APi data ", res['data']);
      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }


}
