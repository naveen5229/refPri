import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../../@core/mock/users.service';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';

@Component({
  selector: 'ngx-ngx-generic-template',
  templateUrl: './ngx-generic-template.component.html',
  styleUrls: ['./ngx-generic-template.component.scss']
})
export class NgxGenericTemplateComponent implements OnInit {
templateVariable = [];
formVariable = {};
templateDetails = {};
  constructor(public api: ApiService,
    public common: CommonService,
    public user: UserService,
    private modalService: NgbModal,
    private activeModal: NgbActiveModal) {
     }

  ngOnInit() {
    console.log(this.templateVariable,this.templateDetails,this.formVariable)
  }

  closeModal(res,apihit){
    this.activeModal.close({res:res,params:this.formVariable,apiHit:apihit});
  }

  // cancelForm(){
  //   this.closeModal(false,0);
  // }

  submitForm(){
    console.log(this.formVariable);
    let errors = [];
    this.templateVariable.map(fields => {
      if(fields['isImp']){
        if(this.formVariable[fields['paramName']] == null || this.formVariable[fields['paramName']] == ''){
          errors.push(fields['colTitle']);
        }
      }
    });
    if(errors.length > 0){
      return this.common.showError(`${errors[0]} is Required Field.`);
    }
    console.log(errors);
    this.closeModal(true,1);
  }

}
