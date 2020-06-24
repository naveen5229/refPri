import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericModelComponent } from '../../modals/generic-model/generic-model.component';
import { TicketCallRatingComponent } from '../../modals/ticket-call-rating/ticket-call-rating.component';

@Component({
  selector: 'ngx-ticket-call-mapping',
  templateUrl: './ticket-call-mapping.component.html',
  styleUrls: ['./ticket-call-mapping.component.scss']
})
export class TicketCallMappingComponent implements OnInit {
  endTime = new Date();
  startTime = new Date();
  currentRate = '';
  ticketList = [];
  filteredValue = 1;
  filterDataList = [];
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
    let headings = {};
    for (var key in this.ticketList[0]) {

      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.formatTitle(key) };
      }
    }
    return headings;
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
    this.ticketList.map((ticket, index) => {
      let column = {};
      for (let key in this.generateHeadings()) {
        if (key == 'Action') {
          column[key] = {
            value: ticket._rating,
            isHTML: true,
            action: null,
            icons: this.actionIcons(ticket, index)
          };
        } else {
          column[key] = { value: ticket[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    });
    return columns;

  }
  actionIcons(request, index) {
    // request._rating = this.currentRate;

    let icons = [
      {
        class: "icon fas fa-star",
        action: this.editData.bind(this, request, index),
        value: request._rating
      },
      // {
      //   class: "icon fa fa-check green",
      //   // action: this.openConfirmModal.bind(this, request),
      // },

    ];
    return icons;


  }

  editData(request, index) {

    console.log(typeof (request._rating));
    console.log(typeof (request._rating) == 'number');
    if (typeof (request._rating) == 'number') {
      console.log(request);

      this.common.params = {
        rating: request._rating,
        ticketId: request._id,
        remark: request._remark
      };
    }
    else {
      console.log(request);
      console.log(typeof (request._rating) == 'number');


      this.common.params = {
        rating: request._rating.rating,
        ticketId: request._id,
        remark: request._rating.remark
      };
    }

    const activeModal = this.modalService.open(TicketCallRatingComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(response => {
      console.log(response);
      if (typeof (response) == 'object') {
        request._rating = response.rating;
      } else {
        request._rating = response;
      }
      if (!response) {
        return;
      }
      console.log(this.ticketList);
      this.table.data.columns[index].Action.value = response.rating;
      this.ticketList.map(e => {
        console.log(e);
        if (e._id == request._id) {
          e._remark = response.remark;
        }
      });
      console.log(this.ticketList);
      // this.table.data.columns[index].Action.value = response.remark;
      console.log(this.table.data);
      this.currentRate = response.rating;
      // if (response.response) {
      //   console.log(response);
      //   // this.getTicketData();
      // }
    });
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
    this.common.loading++;
    this.api.get('Users/getUserTicketCallMapping.json?' + params)
      .subscribe(res => {
        this.common.loading--;
        this.ticketList = res['data'] || [];
        this.filterDataList = res['data'] || [];
        console.log(this.ticketList);
        this.ticketList.length ? this.setTable() : this.resetTable();


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

  filterData(state) {
    console.log(state);
    if (state == 1) {
      this.ticketList = this.filterDataList;
    } else if (state == 2) {
      this.ticketList = this.filterDataList.filter(inv => {
        if (inv._rating != 0) {
          return true;
        }
        return false;
      });
    } else if (state == 3) {
      this.ticketList = this.filterDataList.filter(inv => {
        if (inv._rating == 0) {
          return true;
        }
        return false;
      });
    }
    this.setTable();
  }

  missedCallLogs() {
    let dataparams = {
      view: {
        api: 'Admin/getCallMissReport.json',
        param: {
          // startDate: getStartTime,
          // endDate: getEndTime,
          // type: id
        }
      },
      title: "Missed Call Log Details",
      type: "transtruck"
    }
    // this.common.handleModalSize('class', 'modal-lg', '1100');
    this.common.params = { data: dataparams };
    const activeModal = this.modalService.open(GenericModelComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
  }
}
