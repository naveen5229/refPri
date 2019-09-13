import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';

@Component({
  selector: 'ngx-add-component',
  templateUrl: './add-component.component.html',
  styleUrls: ['./add-component.component.scss']
})
export class AddComponentComponent implements OnInit {
  stacks = [];
  modules = [];
  component = {
    name: '',
    stack: null,
    module: null
  };
  isFormSubmit = false;


  constructor(public activeModel: NgbActiveModal,
    public common: CommonService,
    public api: ApiService) {
    this.common.handleModalSize('class', 'modal-sm', '500');
    this.getModules();
    this.getStacks();
  }

  ngOnInit() {
  }

  getModules() {
    this.common.loading++;
    this.api.get('Suggestion/getModulesList')
      .subscribe(res => {
        this.common.loading--;
        console.log("list", res);
        this.modules = res['data'];
      }, err => {
        this.common.loading--;
        console.log(err);
        this.common.showError();
      });
  }

  getStacks() {
    this.common.loading++;
    this.api.get('Projects/getAllStack')
      .subscribe(res => {
        this.common.loading--;
        console.log("list", res);
        this.stacks = res['data'];
      }, err => {
        this.common.loading--;
        console.log(err);
        this.common.showError();
      });
  }

  addComponent() {
    let params = {
      stackId: this.component.stack,
      moduleId: this.component.module,
      componentName: this.component.name
    };
    console.log("")
    this.common.loading++;
    this.api.post('Components/addComponent', params)
      .subscribe(res => {
        this.common.loading--;
        if (res['success']) {
          this.common.showToast(res['msg']);
          this.activeModel.close({ response: res['data'] });
        }
      }, err => {
        this.common.loading--;
        console.log(err);
        this.common.showError();
      });
  }

  dismiss() {
    this.activeModel.close();
  }

}
