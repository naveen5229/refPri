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

  stackId=null;
  moduleList=[];
  moduleId=null;
  componentName=null;

  constructor(public activeModel:NgbActiveModal,
    public common:CommonService,
    public api:ApiService) {
      this.common.handleModalSize('class', 'modal-sm', '500');
      this.getModuleList();
     }

  ngOnInit() {
  }

  dismiss(){
    this.activeModel.close();
  }

  getModuleList(){
    this.common.loading++;
    this.api.get('Suggestion/getModulesList')
    .subscribe(res => {
      this.common.loading--;
      console.log("list",res);
      this.moduleList = res['data'];
    }, err => {
      this.common.loading--;
      console.log(err);
    });
  }

  addcomponent(){
    let params={
      stackId:this.stackId,
      moduleId:this.moduleId,
      componentName:this.componentName
    }
    this.common.loading++;
    this.api.post('Components/addComponent',params)
    .subscribe(res => {
     this.common.loading--;
    }, err => {
      this.common.loading--;
      console.log(err);
    });

  }

}
