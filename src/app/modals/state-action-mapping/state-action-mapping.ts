import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';

@Component({
  selector: 'ngx-add-process-action',
  templateUrl: './state-action-mapping.html',
  styleUrls: ['./state-action-mapping.scss']
})
export class stateActionMapping implements OnInit {
  title = 'State/Action Mapping';
  button = 'save';
  states = [];
  nextActionList = [];
  PrerequisiteActionList = [];
  stateActionMatrixList = [];
  stateActionTable = {
    data: {
      headings: {},
      columns: [],
    },
    settings: {
      hideHeader: true
    }
  }
  mappingForm = {
    processId: null,
    actionId: null,
    states: [],
    nextState: [],
    nextAction: [],
    prerequisite: [],
    autoStateChange: false,
    autoActionChange: false,
    acType: null,
    reqId: null
  }
  constructor(public common: CommonService,
    public api: ApiService,
    public activeModal: NgbActiveModal,
    public modalService: NgbModal) {
    this.states = this.common.params.states;
    this.PrerequisiteActionList = this.common.params.PrerequisiteActionList;
    this.mappingForm.processId = this.common.params.ref.processId;
    this.title = this.common.params.ref.title;
    this.mappingForm.actionId = this.common.params.ref.id;
    this.nextActionList = [...this.PrerequisiteActionList];
    console.log("🚀 ~ file: state-action-mapping.ts ~ line 26 ~ stateActionMapping ~ this.common.params.states", this.common.params.states);
    this.getPreFilledMatrix(this.mappingForm.actionId);

  }

  ngOnInit() {
  }

  resetStateActionTable() {
    this.stateActionTable = {
      data: {
        headings: {},
        columns: [],
      },
      settings: {
        hideHeader: true
      }
    };
  }

  getPreFilledMatrix(actionId) {
    this.api.get(`Processes/getStateActionMapping?actionId=${actionId}`).subscribe(res => {
      this.resetStateActionTable();
      if (res['code'] > 0) {
        if (res['data']) {
          // this.setPreFilledMatrix(res['data'][0]);
          this.stateActionMatrixList = res['data'];
          // this.setStateActionTable();
          this.getTypeData(0);
        }
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  getTypeData(type) {
    console.log("🚀 ~ file: state-action-mapping.ts ~ line 88 ~ stateActionMapping ~ getTypeData ~ type", type, this.stateActionMatrixList);
    const FilterData = [...this.stateActionMatrixList];
    if (FilterData.length > 0) {
      const finalData = FilterData.filter(data => {
        return data._ac_type == type;
      })
      console.log("🚀 ~ file: state-action-mapping.ts ~ line 94 ~ stateActionMapping ~ getTypeData ~ finalData", finalData,finalData[0]['_state_id'])
      this.mappingForm = {
        processId: this.mappingForm.processId,
        actionId: finalData[0]['_action_id'],
        states: finalData[0]['_state_id'][0] == null ? [] : finalData[0]['_state_id'],
        nextState: finalData[0]['_next_state_id'][0] == null ? [] : finalData[0]['_next_state_id'],
        nextAction: finalData[0]['_next_actionid'][0] == null ? [] : finalData[0]['_next_actionid'],
        prerequisite: finalData[0]['_prerequisite_actionid'][0] == null ? [] : finalData[0]['_prerequisite_actionid'],
        autoStateChange: finalData[0]['auto_state_change'] != null ? finalData[0]['auto_state_change'] : false,
        autoActionChange: finalData[0]['auto_action_change'] != null ? finalData[0]['auto_action_change'] : false,
        acType: JSON.stringify(finalData[0]['_ac_type']),
        reqId: finalData[0]['_action_id']
      }
    }
    console.log("🚀 ~ file: state-action-mapping.ts ~ line 96 ~ stateActionMapping ~ getTypeData ~ this.mappingForm", this.mappingForm)
  }


  // setStateActionTable() {
  //   this.stateActionTable.data = {
  //     headings: this.generateStateActionTableHeadings(),
  //     columns: this.getStateActionTableColumns()
  //   };
  //   return true;
  // }

  // generateStateActionTableHeadings() {
  //   let headings = {};
  //   for (var key in this.stateActionMatrixList[0]) {
  //     if (key.charAt(0) != "_") {
  //       headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
  //     }
  //   }
  //   return headings;
  // }

  // getStateActionTableColumns() {
  //   let columns = [];
  //   this.stateActionMatrixList.map(esclation => {
  //     let column = {};
  //     for (let key in this.generateStateActionTableHeadings()) {
  //       if (key.toLowerCase() == 'action') {
  //         column[key] = {
  //           value: "",
  //           isHTML: false,
  //           action: null,
  //           icons: this.esclationIcons(esclation)
  //         };
  //       } else {
  //         column[key] = { value: esclation[key], class: 'black', action: '' };
  //       }
  //     }
  //     columns.push(column);
  //   })

  //   return columns;
  // }

  // esclationIcons(property) {
  //   let icons = [
  //     { class: 'fas fa-trash-alt', title: "Delete Action", action: this.deleteAction.bind(this, property) },
  //   ];
  //   return icons;
  // }


  getNextActionList() {
    this.nextActionList = [];
    this.mappingForm.nextAction = [];
    console.log(this.mappingForm.nextState);
    if (this.mappingForm.nextState.length == 1) {
      console.log('api call sucsess')
      // return
      this.common.loading++;
      let params = "processId=" + this.mappingForm.processId + "&stateId=" + this.mappingForm.nextState[0].id;
      this.api.get('Processes/getProcessActionByState?' + params)
        .subscribe(res => {
          console.log("🚀 ~ file: state-action-mapping.ts ~ line 147 ~ stateActionMapping ~ getNextActionList ~ res", res)
          this.common.loading--;
          if (!res['data']) return;
          let data = res['data'] || [];
          this.nextActionList = data.map(x => { return { id: x._action_id, name: x.name } });
        }, err => {
          this.common.loading--;
          console.log(err);
        });
    } else {
      this.nextActionList = [...this.PrerequisiteActionList]
    }

    console.log('next action list', this.nextActionList);
  }

  closeModal(res) {
    this.activeModal.close({ response: false });
  }

  save() {
    console.log(this.mappingForm);

    // return;
    let params = {
      processId: this.mappingForm.processId,
      actionId: this.mappingForm.actionId,
      acType: parseInt(this.mappingForm.acType),
      stateId: JSON.stringify(this.mappingForm.states),
      nextStateId: JSON.stringify(this.mappingForm.nextState),
      nextActionId: JSON.stringify(this.mappingForm.nextAction),
      preRequisiteActionId: JSON.stringify(this.mappingForm.prerequisite),
      autoSc: this.mappingForm.autoStateChange,
      autoAc: this.mappingForm.autoActionChange,
      requestId: this.mappingForm.reqId
    }
    this.common.loading++;
    this.api.post('Processes/saveStateActionMapping', params).subscribe(res => {
      this.common.loading--;
      if (res['code'] == 1) {
        if (res['data'][0].y_id > 0) {
          this.common.showToast(res['data'][0].y_msg);
          this.getPreFilledMatrix(this.mappingForm.actionId);
          this.resetMappingForm();
        } else {
          this.common.showError(res['data'][0].y_msg);
        }
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.loading--;
      console.log('Error:', err)
    });
  }

  resetMappingForm() {
    this.mappingForm = {
      processId: this.mappingForm.processId,
      actionId: this.mappingForm.actionId,
      states: [],
      nextState: [],
      nextAction: [],
      prerequisite: [],
      autoStateChange: false,
      autoActionChange: false,
      acType: '0',
      reqId: null
    }
  }
}
