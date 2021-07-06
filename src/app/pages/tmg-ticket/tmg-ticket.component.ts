import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericModelComponent } from '../../modals/generic-model/generic-model.component';

@Component({
  selector: 'ngx-tmg-ticket',
  templateUrl: './tmg-ticket.component.html',
  styleUrls: ['./tmg-ticket.component.scss']
})

export class TmgTicketComponent implements OnInit {
  @Input() pageType: string = "Tmg-Task";
  @Input() deptId: string = null;
  constructor(public api: ApiService,
    public common: CommonService,
    private modalService: NgbModal) {
    this.common.refresh = this.refresh.bind(this);
    console.log("page type", this.pageType);
  }
  ticketTrend = [];
  openTicketCount = [];
  incompleteUserWise30D = [];
  completetionTatPeriod = [];
  completetionTatUserWise = [];
  completetionTatProcess30D = [];
  longestPendingTicket = [];
  callingTatPeriod = [];
  callingTatUser30D = [];
  callingTatProcess30D = [];
  longestCallingPending = [];
  claimTatPeriod = [];
  claimTatUser30D = [];
  claimTatProcess30D = [];
  longestClaimPending = [];
  acknowledgeTatPeriod = [];
  acknowledgeTatUser30D = [];
  acknowledgeTatProcess30D = [];
  longestAcknowledgePending = [];

  ngOnDestroy() { }
  ngOnInit() { }

  ngAfterViewInit() {
    console.log("ngAfterViewInit");
    // this.refresh();
  }

  ngOnChanges(changes) {
    console.log("ngOnChanges deptId:", this.deptId, changes);
    this.refresh();
  }

  refresh() {
    this.getTicketTrend();
    this.getOpenTicketCount();
    this.getIncompleteUserWise30D();
    this.getCompletetionTatPeriod();
    this.getCompletetionTatUserWise();
    this.getCompletetionTatProcess30D()
    this.getLongestPendingTicket();
    this.getCallingTatPeriod();
    this.getCallingTatUser30D();
    this.getCallingTatProcess30D();
    this.getLongestCallingPending();
    this.getClaimTatPeriod();
    this.getClaimTatUser30D();
    this.getClaimTatProcess30D();
    this.getLongestClaimPending();
    this.getAcknowledgeTatPeriod();
    this.getAcknowledgeTatUser30D();
    this.getAcknowledgeTatProcess30D();
    this.getLongestAcknowledgePending();
  }

  getTicketTrend() {
    this.ticketTrend = [];
    let days = 30;
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
    this.showLoader(0);
    let apiname = 'AdminTask/getTmgProcessCompletionTat?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;;
    this.api.get(apiname)
      .subscribe(res => {
        this.hideLoader(0);
        if (res['data']) {
          res['data'].map((val, index1) => {
            if (index1 < 3) {
              this.ticketTrend.push(val);
            } else {
              return false;
            }
          });

        }
      }, err => {
        this.hideLoader(0);
        console.log('Err:', err);
      });
  }

  getOpenTicketCount() {
    this.openTicketCount = [];
    let days = 30;
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
    this.showLoader(1);
    let apiname = 'AdminTask/getTmgProcessCompletionTat?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;;
    this.api.get(apiname)
      .subscribe(res => {
        this.hideLoader(1);
        if (res['data']) {
          res['data'].map((val, index1) => {
            if (index1 < 3) {
              this.openTicketCount.push(val);
            } else {
              return false;
            }
          });

        }
      }, err => {
        this.hideLoader(1);
        console.log('Err:', err);
      });
  }

  getIncompleteUserWise30D() {
    this.incompleteUserWise30D = [];
    let days = 30;
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
    this.showLoader(2);
    let apiname = 'AdminTask/getTmgProcessCompletionTat?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;;
    this.api.get(apiname)
      .subscribe(res => {
        this.hideLoader(2);
        if (res['data']) {
          res['data'].map((val, index1) => {
            if (index1 < 3) {
              this.incompleteUserWise30D.push(val);
            } else {
              return false;
            }
          });

        }
      }, err => {
        this.hideLoader(2);
        console.log('Err:', err);
      });
  }

  getCompletetionTatPeriod() {
    this.completetionTatPeriod = [];
    let days = 30;
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
    this.showLoader(4);
    let apiname = 'AdminTask/getTmgProcessCompletionTat?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;;
    this.api.get(apiname)
      .subscribe(res => {
        this.hideLoader(4);
        if (res['data']) {
          res['data'].map((val, index1) => {
            if (index1 < 3) {
              this.completetionTatPeriod.push(val);
            } else {
              return false;
            }
          });

        }
      }, err => {
        this.hideLoader(4);
        console.log('Err:', err);
      });
  }

  getCompletetionTatUserWise() {
    this.completetionTatUserWise = [];
    let days = 30;
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
    this.showLoader(5);
    let apiname = 'AdminTask/getTmgProcessCompletionTat?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;;
    this.api.get(apiname)
      .subscribe(res => {
        this.hideLoader(5);
        if (res['data']) {
          res['data'].map((val, index1) => {
            if (index1 < 3) {
              this.completetionTatUserWise.push(val);
            } else {
              return false;
            }
          });

        }
      }, err => {
        this.hideLoader(5);
        console.log('Err:', err);
      });
  }

  getCompletetionTatProcess30D() {
    this.completetionTatProcess30D = [];
    let days = 30;
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
    this.showLoader(6);
    let apiname = 'AdminTask/getTmgProcessCompletionTat?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;;
    this.api.get(apiname)
      .subscribe(res => {
        this.hideLoader(6);
        if (res['data']) {
          res['data'].map((val, index1) => {
            if (index1 < 3) {
              this.completetionTatProcess30D.push(val);
            } else {
              return false;
            }
          });

        }
      }, err => {
        this.hideLoader(6);
        console.log('Err:', err);
      });
  }

  getLongestPendingTicket() {
    this.longestPendingTicket = [];
    let days = 30;
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
    this.showLoader(7);
    let apiname = 'AdminTask/getTmgProcessCompletionTat?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;;
    this.api.get(apiname)
      .subscribe(res => {
        this.hideLoader(7);
        if (res['data']) {
          res['data'].map((val, index1) => {
            if (index1 < 3) {
              this.openTicketCount.push(val);
            } else {
              return false;
            }
          });

        }
      }, err => {
        this.hideLoader(7);
        console.log('Err:', err);
      });
  }

  getCallingTatPeriod() {

  }

  getCallingTatUser30D() {

  }

  getCallingTatProcess30D() {

  }

  getLongestCallingPending() {

  }

  getClaimTatPeriod() {

  }

  getClaimTatUser30D() {

  }

  getClaimTatProcess30D() {

  }

  getLongestClaimPending() {

  }

  getAcknowledgeTatPeriod() {

  }

  getAcknowledgeTatUser30D() {

  }

  getAcknowledgeTatProcess30D() {

  }

  getLongestAcknowledgePending() {

  }

  getDetails(url, params, value = 0, type = 'days') {
    let dataparams = {
      view: {
        api: url,
        param: params,
        type: 'post'
      },

      title: 'Details'
    }
    if (value) {
      let startDate = type == 'months' ? new Date(new Date().setMonth(new Date().getMonth() - value)) : new Date(new Date().setDate(new Date().getDate() - value));
      let endDate = new Date();
      dataparams.view.param['startDate'] = this.common.dateFormatter(startDate);
      dataparams.view.param['endDate'] = this.common.dateFormatter(endDate);
      dataparams.view.param['deptId'] = this.deptId;
    }
    console.log("dataparams=", dataparams);
    this.common.handleModalSize('class', 'modal-lg', '1100');
    this.common.params = { data: dataparams };
    const activeModal = this.modalService.open(GenericModelComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
  }

  showLoader(index) {
    // if(document.getElementsByClassName("outer")[index].getElementsByClassName('loader')[0]) return;
    try {
      let outers = document.getElementsByClassName("outer");
      let ele = outers[index].getElementsByClassName('loader')[0];
      if (ele) return;
    } catch (e) {
      console.log('Exception', e);
    }
    setTimeout(() => {
      let outers = document.getElementsByClassName("outer");
      let loader = document.createElement('div');
      loader.className = 'loader';
      outers[index].appendChild(loader);
    }, 50);
  }

  hideLoader(index) {
    try {
      let outers = document.getElementsByClassName("outer");
      let ele = outers[index].getElementsByClassName('loader')[0];
      outers[index].removeChild(ele);
    } catch (e) {
      console.log('Exception', e);
    }
  }

}
