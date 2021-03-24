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
  };

  entityList = [];
  filterdEntityList = [];
  ticketContactForm = {
    type: 0,
    entityType: null,
    entityId: null,
    name: null,
    contactNo: null,
    email: null,
  }

  constructor(public common:CommonService,
    public api:ApiService,
    public activeModal:NgbActiveModal,
    public modalSService:NgbModal,
    public user: UserService) {
      // console.log('AddentityfieldsComponent:',this.common.params);
      if(this.common.params){
        this.entityContactFieldsTitle = this.common.params.entityContactFieldsTitle;
        this.modalType = this.common.params.modalType;
        this.entityTypes = (this.common.params.entityTypes && this.common.params.entityTypes.length>0) ? this.common.params.entityTypes : [];
        this.entityList = (this.common.params.entitylist && this.common.params.entitylist.length>0) ? this.common.params.entitylist : [];
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
        if(this.modalType==4){
          this.ticketContactForm = {
            type: 0,
            entityType: null,
            entityId: null,
            name: (this.common.params.editData.contactName) ? this.common.params.editData.contactName : null,
            contactNo: (this.common.params.editData.contactNo) ? this.common.params.editData.contactNo : null,
            email: (this.common.params.editData.email) ? this.common.params.editData.email : null,
          }
          this.getEntitiesList();
          this.getEntityType();
        }
        // console.log('AddentityfieldsComponent form data:',this.entityTypeForm,this.entityListForm,this.contactForm);
      }

     }

  ngOnInit() {}

  closeModal(res) {
    this.activeModal.close(res);
  }

  getEntityType() {
    this.common.loading++;
    this.api.get('Entities/getEntityTypes').subscribe(res => {
        this.common.loading--;
        if(res['code']>0) { 
          if (!res['data']) return;
          let entityTypes = res['data'] || [];
          this.entityTypes = (entityTypes && entityTypes.length>0) ? entityTypes.map(data => { return { id: data._id, name: data.type } }) : [];
        }else{
          this.common.showError(res['msg']);
        }
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
  }

  getEntitiesList() {
    this.common.loading++;
    this.api.get('Entities/getEntities').subscribe(res => {
        this.common.loading--;
        if(res['code']>0) {
          if (!res['data']) return;
          this.entityList = res['data'] || [];
        }else{
          this.common.showError(res['msg']);
        }
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
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
    // console.log('final data on save',apiBase,params);return;
    this.common.loading++;
    this.api.post(apiBase, params).subscribe(res => {
      this.common.loading--;
      if (res['code'] == 1) {
        if(res['data'][0]['y_id']>0){
          this.common.showToast(res['msg']);
          if (this.modalType == 2 && this.ticketContactForm.contactNo) {
            this.ticketContactForm.entityId = res['data'][0]['y_id'];
            this.opentContactModal();
          }else{
            this.closeModal(true);
          }
        }else{
          this.common.showError(res['msg']);
        }
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  onNext(){
    if(!this.ticketContactForm.type){
      this.modalType = 2;
    }else if(this.ticketContactForm.type==1 && this.ticketContactForm.entityId>0){
      this.opentContactModal();
    }else{
      this.common.showError("Entity is missing");
    }
  }

  opentContactModal(){
    this.modalType = 3;
    this.contactForm = {
      entityId: this.ticketContactForm.entityId,
      name: this.ticketContactForm.name,
      contactNo: this.ticketContactForm.contactNo,
      email: this.ticketContactForm.email,
      association: null,
      requestId: null
    }
  }

  onSelectContactEntityType(){
    this.filterdEntityList = [];
    this.ticketContactForm.entityId = null;
    if(this.ticketContactForm.entityType>0 && this.entityList && this.entityList.length>0){
      this.filterdEntityList = this.entityList.filter(x=>x._entity_type_id==this.ticketContactForm.entityType);
    }
  }

}