import { Component, OnInit, ElementRef, ViewChild, ViewChildren, QueryList,HostListener } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
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

  isSearchFormat = false;
  searchFormatList = [];
  searchFormatIndex = 0;
  entityFormFields = [];
  searchFormatForm = {
    entityId:null,
    value:null
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event) {
    this.keyHandler(event);
  }
  @ViewChildren('searchFormatInput') searchFormatInput: QueryList<ElementRef>;
  @ViewChild('formatTextarea', { static: false }) private formatTextarea: ElementRef;
  constructor(public api: ApiService, public common: CommonService, public modalService: NgbModal) {
    this.getEntityType();
    this.common.refresh = this.refresh.bind(this);
  }

  ngOnInit() {}

  refresh() {
    this.activeTab = 'entityType';
    this.getEntityType();
  }

  keyHandler(event) {
    const key = event.key.toLowerCase();
    console.log(key)
    if (this.isSearchFormat) {
      if (key === 'arrowdown') {
        event.preventDefault();
        this.searchFormatIndex++;
        if (this.searchFormatList.length === this.searchFormatIndex) {
          this.searchFormatIndex = 0;
        }
      } else if (key === 'arrowup') {
        event.preventDefault();
        this.searchFormatIndex--;
        if (this.searchFormatIndex < 0) {
          this.searchFormatIndex = this.searchFormatList.length - 1;
        }
      } else if (key === 'enter') {
        event.preventDefault();
        this.onSelectFormField(this.searchFormatList[this.searchFormatIndex]);
        this.isSearchFormat = false;
      }
    }

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
      requestId: null
    }
  }

  addEntity(type) {
    this.resetAllFieldForms();
    switch (type) {
      case 'entityType': this.entityContactFieldsTitle = 'Add Entity Type', this.modalType = 1
        break;
      case 'entityList': this.entityContactFieldsTitle = 'Add Entity List', this.modalType = 2
        break;
      case 'contact': this.entityContactFieldsTitle = 'Add Contact', this.modalType = 3
        break;
      default: this.entityContactFieldsTitle = '';
    }
    document.getElementById('entityContactFields').style.display = 'block';
  }

  getEntityType() {
    this.common.loading++;
    this.api.get('Entities/getEntityTypes')
      .subscribe(res => {
        this.common.loading--;
        console.log("api data", res);
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
    this.api.get('Entities/getEntities')
      .subscribe(res => {
        this.common.loading--;
        console.log("api data", res);
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
    console.log("🚀 ~ file: entity-deatils.component.ts ~ line 233 ~ EntityDeatilsComponent ~ edit ~ entity", entity)
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
    document.getElementById('entityContactFields').style.display = 'block';
  }

  closeEntityContactFields() {
    document.getElementById('entityContactFields').style.display = 'none';
  }

  setData(storeType, entity) {
    console.log("🚀 ~ file: entity-deatils.component.ts ~ line 251 ~ EntityDeatilsComponent ~ setData ~ storeType", storeType,entity)
    switch (storeType) {
      case 1: this.entityTypeForm.name = entity.type, this.entityTypeForm.requestId = entity._id
        break;
      case 2: this.entityListForm.name = entity.name, this.entityListForm.entityType = { id: entity._entity_type_id, name: entity.entity_type }, this.entityListForm.requestId = entity._id
        break;
      case 3: this.contactForm.name = entity._contact_name, this.contactForm.contactNo = entity._contact_no, this.contactForm.email = entity._email, this.contactForm.entityId = entity._entity_id,this.contactForm.requestId = entity._id
        break;
    }
  }

  contact(entity) {
    console.log("🚀 ~ file: entity-deatils.component.ts ~ line 292 ~ EntityDeatilsComponent ~ contact ~ entity", entity)
    this.contactForm.entityId = entity._id;
    const param = `?entityId=${entity._id}`
    this.common.loading++;
    this.api.get('Entities/getEntityContact' + param)
      .subscribe(res => {
        this.common.loading--;
        console.log("api data", res);
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
    console.log("🚀 ~ file: entity-deatils.component.ts ~ line 320 ~ EntityDeatilsComponent ~ save ~ type", createType, type);
    switch (type) {
      case 1: apiBase = `Entities/saveEntityType`, params = this.entityTypeForm;
        break;
      case 2: apiBase = `Entities/saveEntity`, params = { name: this.entityListForm.name, entityTypeId: this.entityListForm.entityType.id, requestId: this.entityListForm.requestId };
        break;
      case 3: apiBase = `Entities/saveEntityContact`, params = this.contactForm;
        break;
    }

    console.log('final data',apiBase,params)
    // return;
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
        // this.getProcessLeadByType(type);
        this.closeEntityContactFields();
      } else {
        this.common.showError(res['data']);
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
    this.isSearchFormat = false;
    this.searchFormatList = [];
    this.searchFormatIndex = 0;
    this.entityFormFields = [];
    this.searchFormatForm = {
      entityId:null,
      value:null
    }
  }

  openAddSearchFormatModal(entityType,type){
    console.log("openAddFormatModal:",entityType);
    this.searchFormatForm.entityId = entityType._id;
    this.searchFormatForm.value = entityType._entity_search_format
    document.getElementById('searchFormatModal').style.display = 'block';
    this.getEntityGlobalField();
  }

  getEntityGlobalField() {
    let params = "?processId=" + this.searchFormatForm.entityId;
    this.common.loading++;
    this.api.get("Entities/getEntityGlobalField" + params).subscribe(res => {
        this.common.loading--;
        this.entityFormFields =  res['data'] || [];
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
  }

  onMessageType(e){
    let value = e.data;
    if (e && value && value == "@") {
      // console.log("onMessageType");
      this.isSearchFormat = true;
      this.searchFormatList = this.entityFormFields;
      setTimeout(() => {
        if(this.searchFormatInput){
          this.searchFormatInput.toArray()[0].nativeElement.focus();
        }
      }, 100);
    } else if (e && value && value == " " || this.searchFormatForm.value.trim()=="") {
      // console.log("onMessageType2");
      this.isSearchFormat = false;
    } else if (this.isSearchFormat) {
      let splieted = this.searchFormatForm.value.split('@');
      let searchableTxt = splieted[splieted.length - 1];
      this.searchFormatList = this.entityFormFields.filter(x => { return (x.param_name.toLowerCase()).includes(searchableTxt.toLowerCase()) });
      if (this.searchFormatIndex >= this.searchFormatList.length) {
        this.searchFormatIndex = 0;
      }
    }
  }

  onSelectFormField(field) {
    console.log("onSelectFormField:", field);
    let splieted = this.searchFormatForm.value.split('@');
    console.log(splieted);
    splieted.pop();
    console.log(splieted, splieted.join('@'));
    this.searchFormatForm.value = splieted.join('@') + '@' + field.param_code + '@,';
    this.formatTextarea.nativeElement.focus();
    console.log('searchFormatForm', this.searchFormatForm)
  }

  saveSearchFormat() {
    if(!this.searchFormatForm.entityId){
      this.common.showError("Entity Type is missing");
      return false;
    }
    let params = {
      entityTypeId: this.searchFormatForm.entityId,
      format: this.searchFormatForm.value.trim()
    }
    this.common.loading++;
    this.api.post('Entities/saveSearchFormat',params).subscribe(res => {
        this.common.loading--;
        if (res['code']==1){
          this.common.showToast(res['msg']);
          this.closeSearchFormatModal();
          this.getEntityType();
        }else{
          this.common.showToast(res['msg']);
        }
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
  }

}
