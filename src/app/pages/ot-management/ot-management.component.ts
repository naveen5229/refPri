import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { GenericModelComponent } from '../../modals/generic-model/generic-model.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmComponent } from '../../modals/confirm/confirm.component';

@Component({
  selector: 'ngx-ot-management',
  templateUrl: './ot-management.component.html',
  styleUrls: ['./ot-management.component.scss']
})
export class OtManagementComponent implements OnInit {
  otList = [];
  date = new Date();
  today = new Date();

  tableOtList = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  constructor(public common: CommonService, public api: ApiService, public modalService: NgbModal) {
    this.getOtList();
    this.common.refresh = this.refresh.bind(this);
  }

  ngOnInit() {
  }

  refresh() {
    this.getOtList();
  }

  getOtList() {
    this.otList = [];
    this.resetTable();
    // let params = "?date=" + this.common.dateFormatter(this.common.getDate());
    let params = "?date=" + this.common.dateFormatter(this.date);
    this.common.loading++;
    this.api.get('Admin/getOtList.json' + params)
      .subscribe(res => {
        this.common.loading--;
        // console.log('res:', res);
        this.otList = res['data'] || [];
        console.log(this.otList);
        this.otList.length ? this.setTable() : this.resetTable();

      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }

  resetTable() {
    this.tableOtList.data = {
      headings: {},
      columns: []
    };
  }

  setTable() {
    this.tableOtList.data = {
      headings: this.generateHeadings(),
      columns: this.getTableColumns()
    };
    return true;
  }

  generateHeadings() {
    let headings = {};
    for (var key in this.otList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    return headings;
  }

  getTableColumns() {
    console.log(this.generateHeadings());
    let columns = [];
    this.otList.map(ticket => {
      let column = {};
      for (let key in this.generateHeadings()) {
        if (key == 'Action' || key == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: (!ticket._status && ticket['end_time']) ? this.actionIcons(ticket) : null
          };
        } else {
          column[key] = { value: ticket[key], class: '', action: '' };
        }
      }
      columns.push(column);
    });
    return columns;

  }

  actionIcons(ticket) {
    let icons = [
      { class: "fa fa-thumbs-up text-success", action: this.updateUserShiftStatus.bind(this, ticket, 1), txt: '', title: "Reject OT" },
      { class: "fa fa-times text-danger", action: this.updateUserShiftStatus.bind(this, ticket, -1), txt: '', title: "Approve OT" },
    ];
    return icons;
  }

  updateUserShiftStatus(ticket, status) {
    if (ticket._id) {
      let params = {
        shiftId: ticket._id,
        status: status
      }
      let text = (status == 1) ? 'Approve OT' : 'Reject OT'
      this.common.params = {
        title: text,
        description: `<b>` + 'Are You Sure You Want To ' + text + ' This Record' + `<b>`,
      }
      const activeModal = this.modalService.open(ConfirmComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
      activeModal.result.then(data => {
        if (data.response) {
          this.common.loading++;
          this.api.post('Admin/updateUserShiftStatus', params).subscribe(res => {
            this.common.loading--;
            if (res['code'] > 0) {
              this.common.showToast(res['msg']);
              this.getOtList();
            } else {
              this.common.showError(res['data']);
            }
          }, err => {
            this.common.loading--;
            this.common.showError();
            console.log('Error: ', err);
          });
        }
      });
    } else {
      this.common.showError("Invalid OT");
    }
  }

}
