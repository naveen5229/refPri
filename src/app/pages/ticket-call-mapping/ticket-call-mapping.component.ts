import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericModelComponent } from '../../modals/generic-model/generic-model.component';
@Component({
  selector: 'ngx-ticket-call-mapping',
  templateUrl: './ticket-call-mapping.component.html',
  styleUrls: ['./ticket-call-mapping.component.scss']
})
export class TicketCallMappingComponent implements OnInit {
  endTime = new Date();
  startTime = new Date();

  ticketList = [];

  table = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  constructor(public common: CommonService,
    public modalService: NgbModal,
    public api: ApiService) { }

  ngOnInit() {
  }


  resetTable() {
    this.table.data = {
      headings: {},
      columns: []
    };
  }
  generateHeadings() {
    console.log(this.ticketList);
    let headings = {};
    for (var key in this.ticketList[0]) {
      console.log(key.charAt(0));

      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.formatTitle(key) };
      }
    }
    return headings;
    // console.log(headings);
  }

  formatTitle(strval) {
    let pos = strval.indexOf('_');
    if (pos > 0) {
      return strval.toLowerCase().split('_').map(x => x[0].toUpperCase() + x.slice(1)).join(' ')
    } else {
      return strval.charAt(0).toUpperCase() + strval.substr(1);
     }
  }

  setTable() {
    this.table.data = {
      headings: this.generateHeadings(),
      columns: this.getTableColumns()
    };
    return true;
  }

  getTableColumns() {
    let columns = [];
    this.ticketList.map(ticket => {
      let column = {};
      for (let key in this.generateHeadings()) {
        if (key == 'Action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            // icons: this.actionIcons(pending)
          };
        } else {
          column[key] = { value: ticket[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    });
      console.log(columns);
    return columns;

  }

  getTicketData() {
    this.ticketList = [];
    this.table = {
      data: {
        headings: {},
        columns: []
      },
      settings: {
        hideHeader: true
      }
    };
    let startdate = this.common.dateFormatter(this.startTime);
    let enddate = this.common.dateFormatter(this.endTime);

    const params =
      "startDate=" + startdate +
      "&endDate=" + enddate;
      console.log(params);
    this.common.loading++;
    this.api.get('Users/getUserTicketCallMapping.json?' + params)
      .subscribe(res => {
        this.common.loading--;
        console.log('res:', res);
        this.ticketList = res['data'] || [];
        this.ticketList.length ? this.setTable() : this.resetTable();

        console.log(this.ticketList);

      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }

  callLogs() {
    let dataparams = {
      view: {
        api: 'Users/getLastContactTime',
        param: {
          // startDate: getStartTime,
          // endDate: getEndTime,
          // type: id
        }
      },
      // viewModal: {
      //   api: 'TripExpenseVoucher/getRouteTripSummaryDril',
      //   param: {
      //     startDate: '_start',
      //     endDate: '_end',
      //     type: '_type',
      //     levelId: '_id'
      //   }
      // }
      title: "Call Log Details"
    }
    this.common.handleModalSize('class', 'modal-lg', '1100');
    this.common.params = { data: dataparams };
    const activeModal = this.modalService.open(GenericModelComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
  }
}
