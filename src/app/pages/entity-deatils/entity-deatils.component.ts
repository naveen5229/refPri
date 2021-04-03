import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddentityfieldsComponent } from '../../modals/addentityfields/addentityfields.component';
import { EntityFormComponent } from '../../modals/entity-form/entity-form.component';
import { AddGlobalFieldComponent } from '../../modals/process-modals/add-global-field/add-global-field.component';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';

@Component({
  selector: 'ngx-entity-deatils',
  templateUrl: './entity-deatils.component.html',
  styleUrls: ['./entity-deatils.component.scss']
})
export class EntityDeatilsComponent implements OnInit {
  activeTab = 'entityType';
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

  entityTypeData = [];
  entityType = {
    data: {
      headings: {},
      columns: [],
    },
    settings: {
      hideHeader: true
    }
  };

  entitiesData = []
  entitiesList = {
    data: {
      headings: {},
      columns: [],
    },
    settings: {
      hideHeader: true
    }
  };

  contactDataList = [];
  contactData = {
    data: {
      headings: {},
      columns: [],
    },
    settings: {
      hideHeader: true
    }
  }

  entityFormFields = [{"_matrixid":null,"param_name":"Entity Name","param_code":"Entity_Name"}];
  searchFormatForm = {
    entityId:null,
    value:[],
    separator:null
  }

  constructor(public api: ApiService, public common: CommonService, public modalService: NgbModal) {
    this.getEntityType();
    this.common.refresh = this.refresh.bind(this);
  }

  ngOnInit() {}

  refresh() {
    this.activeTab = 'entityType';
    this.getEntityType();
  }

  resetAllFieldForms() {
    this.entityTypeForm = {
      name: null,
      requestId: null
    }
    this.entityListForm = {
      name: null,
      entityType: { id: null, name: null },
      requestId: null
    }
    this.contactForm = {
      entityId: this.contactForm.entityId,
      name: null,
      contactNo: null,
      email: null,
      association: null,
      requestId: null
    }
  }

  addEntity(type) {
    this.resetAllFieldForms();
    switch (type) {
      case 'entityType': this.entityContactFieldsTitle = 'Add Entity Type', this.modalType = 1
        break;
      case 'entityList': this.entityContactFieldsTitle = 'Add Entity', this.modalType = 2
        break;
      case 'contact': this.entityContactFieldsTitle = 'Add Contact', this.modalType = 3
        break;
      default: this.entityContactFieldsTitle = '';
    }
    // document.getElementById('entityContactFields').style.display = 'block';

    this.common.params = {
      entityTypes: this.entityTypes,
      entityContactFieldsTitle: this.entityContactFieldsTitle,
      modalType: this.modalType,
      editData: null
    }
    const activeModal = this.modalService.open(AddentityfieldsComponent, { size: 'md', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
    activeModal.result.then(data => {
      if (this.modalType == 1) {
        this.getEntityType();
      } else if (this.modalType == 2) {
        this.getEntitiesList();
      } else if (this.modalType == 3) {
        this.contact({_id:this.contactForm.entityId});
      }
    });
  }

  getEntityType() {
    this.common.loading++;
    this.api.get('Entities/getEntityTypes').subscribe(res => {
        this.common.loading--;
        if(res['code']===0) { this.common.showError(res['msg']); return false;};
        if (!res['data']) return;
        this.entityTypeData = res['data'];
        let entityForManuplation = res['data'];
        this.entityTypes = entityForManuplation.map(data => { return { id: data._id, name: data.type } })
        this.entityTypeData.length ? this.setEntityType() : this.resetEntityType();

      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
  }

  setEntityType() {
    this.entityType.data = {
      headings: this.generateHeadingsEntityType(),
      columns: this.getTableColumnsEntityType()
    };
    return true;
  }

  generateHeadingsEntityType() {
    let headings = {};
    for (var key in this.entityTypeData[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
      if (key === "addtime") {
        headings[key]["type"] = "date";
      }
    }
    return headings;
  }

  getTableColumnsEntityType() {
    let columns = [];
    this.entityTypeData.map(entity => {
      let column = {};
      for (let key in this.generateHeadingsEntityType()) {
        if (key.toLowerCase() == 'action') {
          column[key] = {
            value: "",
            isHTML: false,
            action: null,
            icons: this.actionIcons(entity, 'entityType')
          };
        } else {
          column[key] = { value: entity[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    })
    return columns;
  }

  resetEntityType() {
    this.entityType.data = {
      headings: {},
      columns: []
    };
  }

  getEntitiesList() {
    this.common.loading++;
    this.api.get('Entities/getEntities').subscribe(res => {
        this.common.loading--;
        if(res['code']===0) { this.common.showError(res['msg']); return false;};
        if (!res['data']) return;
        this.entitiesData = res['data'];
        this.entitiesData.length ? this.setEntitiesData() : this.resetEntitiesData();
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
  }
  setEntitiesData() {
    this.entitiesList.data = {
      headings: this.generateHeadingsEntitiesList(),
      columns: this.getTableColumnsEntitiesList()
    };
    return true;
  }

  generateHeadingsEntitiesList() {
    let headings = {};
    for (var key in this.entitiesData[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
      if (key === "addtime") {
        headings[key]["type"] = "date";
      }
    }
    return headings;
  }

  getTableColumnsEntitiesList() {
    let columns = [];
    this.entitiesData.map(entity => {
      let column = {};
      for (let key in this.generateHeadingsEntitiesList()) {
        if (key.toLowerCase() == 'action') {
          column[key] = {
            value: "",
            isHTML: false,
            action: null,
            icons: this.actionIcons(entity, 'entityList')
          };
        } else {
          column[key] = { value: entity[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    })
    return columns;
  }

  resetEntitiesData() {
    this.entitiesList.data = {
      headings: {},
      columns: []
    };
  }

  actionIcons(entity, type) {
    let icons = [
      { class: "fas fa-edit", action: this.edit.bind(this, entity, type), txt: '', title: "Edit" },
    ];
    if (type === 'entityList') {
      icons.push({ class: "fas fa-phone", action: this.contact.bind(this, entity), txt: '', title: "View Contacts" });
      icons.push({ class: "fab fa-wpforms", action: this.addEntityFormMatrix.bind(this, entity, type), txt: '', title: "Open Entity Form" });
    }else if(type === 'entityType') {
      icons.push({ class: "fas fa-plus-square text-primary", action: this.addGlobalfield.bind(this, entity, type), txt: '', title: "Add Field" });
      icons.push({ class: "fas fa-plus-square text-info", action: this.openAddSearchFormatModal.bind(this, entity, type), txt: '', title: "Add Search Format" });
    }
    return icons;
  }

  edit(entity, type) {
    if (type === 'entityType') {
      this.entityContactFieldsTitle = 'Update Entity Type';
      this.modalType = 1;
    } else if (type === 'entityList') {
      this.entityContactFieldsTitle = 'Update Entity List';
      this.modalType = 2;
    } else if (type === 'contact') {
      this.entityContactFieldsTitle = 'Update Contact';
      this.modalType = 3;
    } else {
      this.entityContactFieldsTitle = '';
    }
    this.setData(this.modalType, entity);
    // document.getElementById('entityContactFields').style.display = 'block';
  }

  closeEntityContactFields() {
    document.getElementById('entityContactFields').style.display = 'none';
  }

  setData(storeType, entity) {
    let editDataModal = {
      typeName: null,
      typeId: null,
      entityName: null,
      entityId: null,
      contactName: null,
      contactId: null,
      contactNo: null,
      email: null,
      association: null,
      requestId: null
    }
    switch (storeType) {
      case 1: 
        this.entityTypeForm.name = entity.type;
        this.entityTypeForm.requestId = entity._id;
        
        editDataModal.typeName = entity.type;
        editDataModal.typeId = entity._id;
        editDataModal.requestId = entity._id;
        break;
      case 2: 
        this.entityListForm.name = entity.name;
        this.entityListForm.entityType = { id: entity._entity_type_id, name: entity.entity_type };
        this.entityListForm.requestId = entity._id;

        editDataModal.typeName = entity.entity_type;
        editDataModal.typeId = entity._entity_type_id;  
        editDataModal.entityName = entity.name;
        editDataModal.entityId = entity._id;
        editDataModal.requestId = entity._id;
        break;
      case 3: 
        this.contactForm.name = entity._contact_name;
        this.contactForm.contactNo = entity._contact_no;
        this.contactForm.email = entity._email;
        this.contactForm.entityId = entity._entity_id;
        this.contactForm.requestId = entity._id;
        this.contactForm.association = entity._association;

        editDataModal.entityId = entity._entity_id;  
        editDataModal.contactName = entity._contact_name;
        editDataModal.contactId = entity._id;  
        editDataModal.contactNo = entity._contact_no;
        editDataModal.email = entity._email;
        editDataModal.association = entity._association;
        editDataModal.requestId = entity._id;
        break;
    }
    this.common.params = {
      entityTypes: this.entityTypes,
      entityContactFieldsTitle: this.entityContactFieldsTitle,
      modalType: this.modalType,
      editData: editDataModal
    }
    const activeModal = this.modalService.open(AddentityfieldsComponent, { size: 'md', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
    activeModal.result.then(data => {
      if (this.modalType == 1) {
        this.getEntityType();
      } else if (this.modalType == 2) {
        this.getEntitiesList();
      } else if (this.modalType == 3) {
        this.contact({_id:this.contactForm.entityId});
      }
    });
  }

  contact(entity) {
    this.contactForm.entityId = entity._id;
    const param = `?entityId=${entity._id}`
    this.common.loading++;
    this.api.get('Entities/getEntityContact' + param)
      .subscribe(res => {
        this.common.loading--;
        if(res['code']===0) { this.common.showError(res['msg']); return false;};
        if (!res['data']) return;
        this.contactDataList = res['data'];
        this.contactDataList.length ? this.setcontactData() : this.resetcontactData();
        document.getElementById('contactDetails').style.display = 'block';

      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
  }

  closeContactDetails() {
    document.getElementById('contactDetails').style.display = 'none';
  }

  setcontactData() {
    this.contactData.data = {
      headings: this.generateHeadingsContactList(),
      columns: this.getTableColumnsContactList()
    };
    return true;
  }

  generateHeadingsContactList() {
    let headings = {};
    for (var key in this.contactDataList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
      if (key === "addtime") {
        headings[key]["type"] = "date";
      }
    }
    return headings;
  }

  getTableColumnsContactList() {
    let columns = [];
    this.contactDataList.map(contact => {
      let column = {};
      for (let key in this.generateHeadingsContactList()) {
        if (key.toLowerCase() == 'action') {
          column[key] = {
            value: "",
            isHTML: false,
            action: null,
            icons: this.actionIcons(contact, 'contact')
          };
        } else {
          column[key] = { value: contact[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    })
    return columns;
  }

  resetcontactData() {
    this.contactData.data = {
      headings: {},
      columns: []
    };
  }

  save(createType, type) {
    let params = {};
    let apiBase = '';
    switch (type) {
      case 1: apiBase = `Entities/saveEntityType`, params = this.entityTypeForm;
        break;
      case 2: apiBase = `Entities/saveEntity`, params = { name: this.entityListForm.name, entityTypeId: this.entityListForm.entityType.id, requestId: this.entityListForm.requestId };
        break;
      case 3: apiBase = `Entities/saveEntityContact`, params = this.contactForm;
        break;
    }
    // console.log('final data',apiBase,params);return;
    this.common.loading++;
    this.api.post(apiBase, params).subscribe(res => {
      this.common.loading--;
      if (res['code'] == 1) {
        this.common.showToast(res['msg']);
        if (type == 1) {
          this.getEntityType();
        } else if (type == 2) {
          this.getEntitiesList();
        } else if (type == 3) {
          this.contact({_id:this.contactForm.entityId});
        }
        this.closeEntityContactFields();
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

  addGlobalfield(entity,type){
    this.common.params = {process:{id:entity._id,name:entity.name},fromPage:3};
    const activeModal = this.modalService.open(AddGlobalFieldComponent, { size: 'xl', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
      }
    });
  }

  addEntityFormMatrix(entity,type){
    this.common.params = {entity:{id:entity._id,name:entity.name,entity_type_id:entity._entity_type_id,isDisabled:false},title:"Entity Form"};
    const activeModal = this.modalService.open(EntityFormComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
      }
    });
  }

  closeSearchFormatModal(){
    document.getElementById('searchFormatModal').style.display = 'none';
    this.entityFormFields = [{"_matrixid":null,"param_name":"Entity Name","param_code":"Entity_Name"}];
    this.searchFormatForm = {
      entityId:null,
      value:[],
      separator:null
    }
  }

  openAddSearchFormatModal(entityType,type){
    this.searchFormatForm.entityId = entityType._id;
    this.searchFormatForm.value = (entityType._search_format) ? JSON.parse(entityType._search_format) : [];
    this.searchFormatForm.separator = (entityType._separator) ? entityType._separator : null;
    console.log("searchFormatForm:",this.searchFormatForm);
    document.getElementById('searchFormatModal').style.display = 'block';
    this.getEntityGlobalField();
  }

  getEntityGlobalField() {
    this.entityFormFields = [{"_matrixid":null,"param_name":"Entity Name","param_code":"Entity_Name"}];
    let params = "?processId=" + this.searchFormatForm.entityId;
    this.common.loading++;
    this.api.get("Entities/getEntityGlobalField" + params).subscribe(res => {
        this.common.loading--;
        if(res['code']===0) { this.common.showError(res['msg']); return false;};
        let entityFormFields =  res['data'] || [];
        if(entityFormFields && entityFormFields.length){
          for(let i=0;i< entityFormFields.length;i++){
            this.entityFormFields.push({"_matrixid":entityFormFields[i]['_matrixid'],"param_name":entityFormFields[i]['param_name'],"param_code":entityFormFields[i]['param_code']});
          }
        }
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
  }

  saveSearchFormat() {
    if(!this.searchFormatForm.entityId){
      this.common.showError("Entity Type is missing");
      return false;
    }else if(!this.searchFormatForm.separator || this.searchFormatForm.separator.trim()==""){
      this.common.showError("Separator is missing");
      return false;
    }
    let searchFormat = this.searchFormatForm.value.map(x=>{return {_matrixid:x._matrixid,param_name:x.param_name,param_code:x.param_code}});
    let params = {
      entityTypeId: this.searchFormatForm.entityId,
      format: (searchFormat.length) ? JSON.stringify(searchFormat):null,
      separator: this.searchFormatForm.separator
    }
    // console.log("saveSearchFormat:",params);return false;
    this.common.loading++;
    this.api.post('Entities/saveSearchFormat',params).subscribe(res => {
        this.common.loading--;
        if (res['code']==1){
          if(res['data'][0].y_id>0){
          this.common.showToast(res['data'][0].y_msg);
          this.closeSearchFormatModal();
          this.getEntityType();
          }else{
            this.common.showError(res['data'][0].y_msg);
          }
        }else{
          this.common.showError(res['msg']);
        }
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
  }

}
