import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../../Service/user/user.service';
import { ErrorReportComponent } from '../error-report/error-report.component';

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

  entityTypeName = null;
  getEntityType() {
    this.common.loading++;
    this.api.get('Entities/getEntityTypes').subscribe(res => {
      this.common.loading--;
      if (res['code'] > 0) {
        if (!res['data']) return;
        this.entityTypes = res['data'] || [];
        this.ticketContactForm.entityType = res['data'][0]._id;
        this.entityTypeName = res['data'][0].type;
      } else {
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

  setEntity(event){
    if(event._id){
      this.ticketContactForm.entityId=event._id;
    }else{
      this.saveEntity();
    }
  }
  

  saveEntity() {
    console.log(document.getElementById('entityId')['value']);
    let params = {
      name: document.getElementById('entityId')['value'],
      entityTypeId: this.ticketContactForm.entityType
    };

    let apiBase = `Entities/saveEntity`;
    // console.log('final data',apiBase,params);return;
    this.common.loading++;
this.api.post(apiBase, params).subscribe(res => {
  this.common.loading--;
  if (res['code'] == 1) {
    console.log(res);
    this.ticketContactForm.entityId = res['data'][0].y_id;
    this.common.showToast(res['msg']);
  } else {
    this.common.showError(res['msg']);
  }
}, err => {
  this.common.loading--;
  this.common.showError();
  console.log('Error: ', err);
});
console.log(apiBase, params)
  }

  save() {
    let params = {};
    let apiBase = '';
    switch (this.modalType) {
      case 1: apiBase = `Entities/saveEntityType`, params = this.entityTypeForm;
        break;
      case 2: 
      if(this.addType == "import"){
        console.log("import-----");
        this.uploadCsv();
        return;
      }else{
        apiBase = `Entities/saveEntity`, params = { name: this.entityListForm.name, entityTypeId: this.entityListForm.entityType.id, requestId: this.entityListForm.requestId };

      }
        break;
      case 3: apiBase = `Entities/saveEntityContact`, params = this.contactForm;
        break;
    }
    console.log("--withoutimport----")
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
  addType="individual";
  entityCsv =null;
  handleFileSelection(event) {
    this.common.loading++;
    this.common.getBase64(event.target.files[0])
      .then(res => {
        this.common.loading--;
        let file = event.target.files[0];
        console.log("file-type:", file.type);
        if (file.type == "application/vnd.ms-excel" || file.type == "text/csv") {
        }
        else {
          alert("valid Format Are : csv");
          return false;
        }

        res = res.toString().replace('vnd.ms-excel', 'csv');
        this.entityCsv = res;
      }, err => {
        this.common.loading--;
        console.error('Base Err: ', err);
      })
  }

  uploadCsv() {
    let params = {
      entityCsv: this.entityCsv,
      entityTypeId:this.entityListForm.entityType.id
    };
    if (!params.entityCsv) {
      return this.common.showError("CSV is missing");
    }
    this.common.loading++;
    this.api.post("Entities/importEntityCsv", params)
      .subscribe(res => {
        this.common.loading--;
        if (res["code"] > 0) {
          this.common.showToast(res["msg"]);
          let successData = res['data']['success'];
          let errorData = res['data']['fail'];
          alert(res["msg"]);
          this.common.params = { successData, errorData, title: 'csv Uploaded Data' };
          const activeModal = this.modalSService.open(ErrorReportComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
          activeModal.result.then(data => {
            if (data.response) {
              // this.activeModal.close({ response: true });
              this.entityCsv = null;
              this.getEntitiesList();
            }
          });
        } else {
          this.common.showError(res["msg"]);
        }
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
  }

  sampleCsv() {
    window.open('https://elogist.in/transtruck/partnerdashboard/api/entitySample.csv');
  }

}
