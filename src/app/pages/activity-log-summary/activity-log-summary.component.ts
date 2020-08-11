import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from "lodash";
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'ngx-activity-log-summary',
  templateUrl: './activity-log-summary.component.html',
  styleUrls: ['./activity-log-summary.component.scss']
})
export class ActivityLogSummaryComponent implements OnInit {

  endTime = new Date();
  startTime = new Date();
  // activityLogSummaryList = [];
  filteredActivityLogSummaryList = [];
  departments = [];
  filterData: any;
  activityLogSummaryList = [];
  constructor(public common: CommonService,
    public modalService: NgbModal,
    public api: ApiService,
  ) {}

  ngOnInit() {
  }

  getActivityLogSummary() {
    this.filteredActivityLogSummaryList = [];

    let startdate = this.common.dateFormatter1(this.startTime);
    let enddate = this.common.dateFormatter1(this.endTime);

    const params =
      "?startDate=" + startdate +
      "&endDate=" + enddate;
    // console.log(params);
    this.common.loading++;
    this.api.get('Admin/getActivityLogSummaryDepartmentwise' + params)
      .subscribe(res => {
        this.common.loading--;
        if (res['code'] == 3) {
          this.common.showError(res['data']);

        } else {
        console.log('res:', res);
        this.activityLogSummaryList = res['data'] || [];
        this.filterData = _.groupBy(this.activityLogSummaryList, 'datetime');
          console.log(this.filterData);
          Object.keys(this.filterData).map(key => {
            this.filteredActivityLogSummaryList.push({date: key, data: _.sortBy(this.filterData[key], 'name')});
          })
          console.log(this.filteredActivityLogSummaryList[0]['data']);

      }
    }
      , err => {
        this.common.loading--;
        console.log(err);
      });


  }

}
