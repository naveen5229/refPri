import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../../Service/Api/api.service';
import { CommonService } from '../../../Service/common/common.service';

@Component({
  selector: 'ngx-user-esclation',
  templateUrl: './user-esclation.component.html',
  styleUrls: ['./user-esclation.component.scss']
})
export class UserEsclationComponent implements OnInit {
  Title = 'Process User Matrix';
  button = 'Save';
  adminList = [];
  esclationMatrix = {
    processID: '',
    actionId: '',
    userId: { id: null, name: '' },
    seniorUserId: { id: null, name: '' },
    userLevel: null,
    fromTime: this.common.getDate(),
    toTime: this.common.getDate(),
    requestId: ''
  }

  esclationMatrixList = [];

  esclationTable = {
    data: {
      headings: {},
      columns: [],
    },
    settings: {
      hideHeader: true
    }
  }

  constructor(public activeModal: NgbActiveModal, public api: ApiService, public common: CommonService, public modalService: NgbModal) {
    console.log(this.common.params.ref.id);
    this.esclationMatrix.processID = this.common.params.ref.processId;
    this.Title = this.common.params.ref.title;
    this.esclationMatrix.actionId = this.common.params.ref.id;
    this.adminList = this.common.params.adminList;
    this.getPreFilledMatrix(this.esclationMatrix.actionId);
    // this.getPreFilledMatrix(this.esclationMatrix.tpPropertyId);
  }

  ngOnInit() {
  }

  getPreFilledMatrix(actionId) {
    this.api.get(`Processes/getActionUserMapping?actionId=${actionId}`).subscribe(res => {
      this.resetEsclationTable();
      if (res['code'] > 0) {
        if (res['data']) {
          // this.setPreFilledMatrix(res['data'][0]);
          this.esclationMatrixList = res['data'];
          this.setesclationTable();
        }
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.showError();
      console.log('Error: ', err);
    });
  }


  setesclationTable() {
    this.esclationTable.data = {
      headings: this.generateesclationTableHeadings(),
      columns: this.getesclationTableColumns()
    };
    return true;
  }

  generateesclationTableHeadings() {
    let headings = {};
    for (var key in this.esclationMatrixList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    return headings;
  }

  getesclationTableColumns() {
    let columns = [];
    this.esclationMatrixList.map(esclation => {
      let column = {};
      for (let key in this.generateesclationTableHeadings()) {
        if (key.toLowerCase() == 'action') {
          column[key] = {
            value: "",
            isHTML: false,
            action: null,
            icons: this.esclationIcons(esclation)
          };
        } else {
          column[key] = { value: esclation[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    })

    return columns;
  }

  esclationIcons(esclation) {
    let icons = [
      { class: "fas fa-edit", title: "Edit Esclation", action: this.editEsclation.bind(this, esclation) },
      // { class: 'fas fa-trash-alt', title: "Delete Esclation", action: this.deleteEsclation.bind(this, esclation) },
    ];
    return icons;
  }

  editEsclation(esclation) {
    console.log("🚀 ~ file: user-esclation.component.ts ~ line 119 ~ UserEsclationComponent ~ editEsclation ~ esclation", esclation)
    this.esclationMatrix.userId = { id: esclation._user_id, name: esclation.user_name },
      this.esclationMatrix.seniorUserId = { id: esclation._senior_user_id, name: esclation.senior_user },
      this.esclationMatrix.userLevel = esclation.user_level,
      this.esclationMatrix.fromTime = this.common.getDate(),
      this.esclationMatrix.toTime = this.common.getDate(),
      this.esclationMatrix.requestId = esclation._id
  }

  deleteEsclation(esclation) {
    console.log("🚀 ~ file: user-esclation.component.ts ~ line 118 ~ UserEsclationComponent ~ deleteAction ~ esclation", esclation)

  }


  resetEsclationTable() {
    this.esclationTable = {
      data: {
        headings: {},
        columns: [],
      },
      settings: {
        hideHeader: true
      }
    };
  }

  close(response) {
    this.activeModal.close({ response: response });
  }

  saveEsclation() {
    console.log(this.esclationMatrix);
    // return;
    let params = {
      processId: this.esclationMatrix.processID,
      actionId: this.esclationMatrix.actionId,
      userId: this.esclationMatrix.userId.id,
      seniorUserId: this.esclationMatrix.seniorUserId.id,
      userLevel: this.esclationMatrix.userLevel,
      fromTime: this.common.timeFormatter(this.esclationMatrix.fromTime),
      toTime: this.common.timeFormatter(this.esclationMatrix.toTime),
      requestId: this.esclationMatrix.requestId
    }
    this.common.loading++;
    this.api.post(' Processes/saveActionUserMapping', params).subscribe(res => {
      this.common.loading--;
      if (res['code'] == 1) {
        if (res['data'][0].y_id > 0) {
          this.common.showToast(res['data'][0].y_msg);
          this.getPreFilledMatrix(this.esclationMatrix.actionId);
          this.resetEsclationMatrix()
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

  resetEsclationMatrix() {
    this.esclationMatrix = {
      processID: this.esclationMatrix.processID,
      actionId: this.esclationMatrix.actionId,
      userId: { id: null, name: '' },
      seniorUserId: { id: null, name: '' },
      userLevel: null,
      fromTime: this.common.getDate(),
      toTime: this.common.getDate(),
      requestId: ''
    }
  }
}
