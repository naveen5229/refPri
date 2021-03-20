import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../../Service/user/user.service';

@Component({
  selector: 'ngx-addentityfields',
  templateUrl: './addentityfields.component.html',
  styleUrls: ['./addentityfields.component.scss']
})
export class AddentityfieldsComponent implements OnInit {
  entityContactFieldsTitle = '';
  modalType = null;
  entityTypes = [];
  entityTypeForm = {
    name: null,
    requestId: null
  }

  entityListForm = {
    name: null,
    entityType: { id: null, name: null },
    requestId: null
  }

  contactForm = {
    entityId: null,
    name: null,
    contactNo: null,
    email: null,
    association: null,
    requestId: null
  }

  constructor(public common:CommonService,
    public api:ApiService,
    public activeModal:NgbActiveModal,
    public modalSService:NgbModal,
    public user: UserService) {
      console.log('AddentityfieldsComponent:',this.common.params);
      if(this.common.params){
        this.entityContactFieldsTitle = this.common.params.entityContactFieldsTitle;
        this.modalType = this.common.params.modalType;
        this.entityTypes = (this.common.params.entityTypes) ? this.common.params.entityTypes : [];
        if(this.common.params.editData && this.common.params.editData.requestId>0){
          if(this.modalType==1){
            this.entityTypeForm = {
              name: this.common.params.editData.typeName,
              requestId: this.common.params.editData.requestId
            }
          }else if(this.modalType==2){
            this.entityListForm = {
              name: this.common.params.editData.entityName,
              entityType: { id: this.common.params.editData.typeId, name: this.common.params.editData.typeName },
              requestId: this.common.params.editData.requestId
            }
          }else if(this.modalType==3){
            this.contactForm = {
              entityId: this.common.params.editData.entityId,
              name: this.common.params.editData.contactName,
              contactNo: this.common.params.editData.contactNo,
              email: this.common.params.editData.email,
              association: this.common.params.editData.association,
              requestId: this.common.params.editData.requestId
            }
          }
        }
        console.log('AddentityfieldsComponent form data:',this.entityTypeForm,this.entityListForm,this.contactForm);
      }

     }

  ngOnInit() {}

  closeModal(res) {
    this.activeModal.close(res);
  }

  save() {
    let params = {};
    let apiBase = '';
    switch (this.modalType) {
      case 1: apiBase = `Entities/saveEntityType`, params = this.entityTypeForm;
        break;
      case 2: apiBase = `Entities/saveEntity`, params = { name: this.entityListForm.name, entityTypeId: this.entityListForm.entityType.id, requestId: this.entityListForm.requestId };
        break;
      case 3: apiBase = `Entities/saveEntityContact`, params = this.contactForm;
        break;
    }
    console.log('final data',apiBase,params);return;
    this.common.loading++;
    this.api.post(apiBase, params).subscribe(res => {
      this.common.loading--;
      if (res['code'] == 1) {
        this.common.showToast(res['msg']);
        // if (type == 1) {
        //   this.getEntityType();
        // } else if (type == 2) {
        //   this.getEntitiesList();
        // } else if (type == 3) {
        //   this.contact({_id:this.contactForm.entityId});
        // }
        // this.closeEntityContactFields();
        this.closeModal(true);
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
    console.log(apiBase, params);
  }
}
