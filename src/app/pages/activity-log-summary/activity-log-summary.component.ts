import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
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

  activityLogSummaryList = [
    {
        "name": "IT-Support",
        "count": 1,
        "spend_hour": "17:24:23",
        "datetime": "2020-03-21"
    },
    {
        "name": "IT-Support",
        "count": 1,
        "spend_hour": "13:42:39",
        "datetime": "2020-03-22"
    },
    {
        "name": "AT-Operation",
        "count": 17,
        "spend_hour": "27:02:06",
        "datetime": "2020-03-23"
    },
    {
        "name": "CRM",
        "count": 17,
        "spend_hour": "16:31:15",
        "datetime": "2020-03-23"
    },
    {
        "name": "IT-Development",
        "count": 3,
        "spend_hour": "07:00:00",
        "datetime": "2020-03-23"
    },
    {
        "name": "IT-Support",
        "count": 5,
        "spend_hour": "24:33:01",
        "datetime": "2020-03-23"
    },
    {
        "name": "Walle8-Operations",
        "count": 1,
        "spend_hour": "09:00:48",
        "datetime": "2020-03-23"
    },
    {
        "name": "Accounts",
        "count": 15,
        "spend_hour": "33:07:59",
        "datetime": "2020-03-24"
    },
    {
        "name": "Admin",
        "count": 1,
        "spend_hour": "09:00:00",
        "datetime": "2020-03-24"
    },
    {
        "name": "AT-Operation",
        "count": 13,
        "spend_hour": "23:11:28",
        "datetime": "2020-03-24"
    },
    {
        "name": "Billing",
        "count": 9,
        "spend_hour": "03:35:39",
        "datetime": "2020-03-24"
    },
    {
        "name": "CRM",
        "count": 13,
        "spend_hour": "01:09:00",
        "datetime": "2020-03-24"
    },
    {
        "name": "Customer Success",
        "count": 12,
        "spend_hour": "15:10:00",
        "datetime": "2020-03-24"
    },
    {
        "name": "HR",
        "count": 3,
        "spend_hour": "06:00:41",
        "datetime": "2020-03-24"
    },
    {
        "name": "IT-Development",
        "count": 8,
        "spend_hour": "20:00:00",
        "datetime": "2020-03-24"
    },
    {
        "name": "IT-Support",
        "count": 18,
        "spend_hour": "33:10:59",
        "datetime": "2020-03-24"
    },
    {
        "name": "Partner Relationship",
        "count": 5,
        "spend_hour": "09:30:31",
        "datetime": "2020-03-24"
    },
    {
        "name": "Sales",
        "count": 6,
        "spend_hour": "10:25:00",
        "datetime": "2020-03-24"
    },
    {
        "name": "Support",
        "count": 1,
        "spend_hour": "09:00:09",
        "datetime": "2020-03-24"
    },
    {
        "name": "Walle8-Operations",
        "count": 5,
        "spend_hour": "25:41:34",
        "datetime": "2020-03-24"
    },
    {
        "name": "Accounts",
        "count": 13,
        "spend_hour": "31:36:16",
        "datetime": "2020-03-25"
    },
    {
        "name": "Admin",
        "count": 1,
        "spend_hour": "08:30:00",
        "datetime": "2020-03-25"
    },
    {
        "name": "AT-Operation",
        "count": 13,
        "spend_hour": "42:35:08",
        "datetime": "2020-03-25"
    },
    {
        "name": "Billing",
        "count": 14,
        "spend_hour": "03:38:32",
        "datetime": "2020-03-25"
    },
    {
        "name": "Channel Sales",
        "count": 11,
        "spend_hour": "38:09:16",
        "datetime": "2020-03-25"
    },
    {
        "name": "CRM",
        "count": 17,
        "spend_hour": "26:00:50",
        "datetime": "2020-03-25"
    },
    {
        "name": "Customer Success",
        "count": 15,
        "spend_hour": "19:03:13",
        "datetime": "2020-03-25"
    },
    {
        "name": "HR",
        "count": 7,
        "spend_hour": "10:33:01",
        "datetime": "2020-03-25"
    },
    {
        "name": "IT-Development",
        "count": 7,
        "spend_hour": "22:30:00",
        "datetime": "2020-03-25"
    },
    {
        "name": "IT-Support",
        "count": 15,
        "spend_hour": "38:36:14",
        "datetime": "2020-03-25"
    },
    {
        "name": "Partner Relationship",
        "count": 5,
        "spend_hour": "12:00:00",
        "datetime": "2020-03-25"
    },
    {
        "name": "Sales",
        "count": 6,
        "spend_hour": "11:54:07",
        "datetime": "2020-03-25"
    },
    {
        "name": "Support",
        "count": 1,
        "spend_hour": "18:44:02",
        "datetime": "2020-03-25"
    },
    {
        "name": "Walle8-Operations",
        "count": 3,
        "spend_hour": "36:40:13",
        "datetime": "2020-03-25"
    },
    {
        "name": "Accounts",
        "count": 4,
        "spend_hour": "29:16:11",
        "datetime": "2020-03-26"
    },
    {
        "name": "Admin",
        "count": 1,
        "spend_hour": "18:08:35",
        "datetime": "2020-03-26"
    },
    {
        "name": "AT-Operation",
        "count": 17,
        "spend_hour": "32:06:25",
        "datetime": "2020-03-26"
    },
    {
        "name": "Billing",
        "count": 11,
        "spend_hour": "06:02:00",
        "datetime": "2020-03-26"
    },
    {
        "name": "Channel Sales",
        "count": 14,
        "spend_hour": "59:03:15",
        "datetime": "2020-03-26"
    },
    {
        "name": "CRM",
        "count": 17,
        "spend_hour": "09:18:42",
        "datetime": "2020-03-26"
    },
    {
        "name": "Customer Success",
        "count": 15,
        "spend_hour": "20:10:00",
        "datetime": "2020-03-26"
    },
    {
        "name": "HR",
        "count": 3,
        "spend_hour": "07:42:53",
        "datetime": "2020-03-26"
    },
    {
        "name": "IT-Development",
        "count": 7,
        "spend_hour": "13:10:00",
        "datetime": "2020-03-26"
    },
    {
        "name": "IT-Support",
        "count": 21,
        "spend_hour": "48:08:18",
        "datetime": "2020-03-26"
    },
    {
        "name": "Partner Relationship",
        "count": 4,
        "spend_hour": "14:30:00",
        "datetime": "2020-03-26"
    },
    {
        "name": "Sales",
        "count": 12,
        "spend_hour": "12:35:00",
        "datetime": "2020-03-26"
    },
    {
        "name": "Walle8-Operations",
        "count": 2,
        "spend_hour": "18:01:42",
        "datetime": "2020-03-26"
    },
    {
        "name": "Accounts",
        "count": 5,
        "spend_hour": "18:32:43",
        "datetime": "2020-03-27"
    },
    {
        "name": "AT-Operation",
        "count": 18,
        "spend_hour": "78:42:10",
        "datetime": "2020-03-27"
    },
    {
        "name": "Billing",
        "count": 15,
        "spend_hour": "06:39:00",
        "datetime": "2020-03-27"
    },
    {
        "name": "Channel Sales",
        "count": 10,
        "spend_hour": "32:06:00",
        "datetime": "2020-03-27"
    },
    {
        "name": "CRM",
        "count": 15,
        "spend_hour": "06:12:00",
        "datetime": "2020-03-27"
    },
    {
        "name": "Customer Success",
        "count": 8,
        "spend_hour": "11:00:00",
        "datetime": "2020-03-27"
    },
    {
        "name": "HR",
        "count": 5,
        "spend_hour": "33:02:38",
        "datetime": "2020-03-27"
    },
    {
        "name": "IT-Development",
        "count": 3,
        "spend_hour": "12:30:00",
        "datetime": "2020-03-27"
    },
    {
        "name": "IT-Support",
        "count": 14,
        "spend_hour": "19:22:37",
        "datetime": "2020-03-27"
    },
    {
        "name": "Partner Relationship",
        "count": 4,
        "spend_hour": "13:30:00",
        "datetime": "2020-03-27"
    },
    {
        "name": "Sales",
        "count": 8,
        "spend_hour": "05:48:51",
        "datetime": "2020-03-27"
    }
]
  constructor(public common: CommonService,
    public modalService: NgbModal,
    public api: ApiService) {}

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
        console.log('res:', res);
        this.activityLogSummaryList = res['data'] || [];
        this.filterData = _.groupBy(this.activityLogSummaryList, 'datetime');
          console.log(this.filterData);
          Object.keys(this.filterData).map(key => {
            this.filteredActivityLogSummaryList.push({date: key, data: this.filterData[key]});
          })
          console.log(this.filteredActivityLogSummaryList[0]['data']);

      }, err => {
        this.common.loading--;
        console.log(err);
      });


  }

}
