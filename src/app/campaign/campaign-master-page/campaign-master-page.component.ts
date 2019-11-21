import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'ngx-campaign-master-page',
  templateUrl: './campaign-master-page.component.html',
  styleUrls: ['./campaign-master-page.component.scss']
})
export class CampaignMasterPageComponent implements OnInit {
  activeTab = "productMaster";
  constructor(public api: ApiService,
    public common: CommonService,
    public modalService: NgbModal) {
  }
  ngOnInit() {
  }

  refresh() {

  }
  getTask() {
    this.common.loading++;
    this.api.get("Task/getTaskWrtStatus").subscribe(res => {
      this.common.loading--;
      console.log("data", res['data'])

      // this.taskList = res['data']["AssignForMe"] || [];
      // this.assigned = res['data']["AssignByMe"] || [];
      // this.complateTask = res['data']["CompleteTask"] || [];
      // this.review = res['data']["WaitingForReview"] || [];
      // this.changeReview = res['data']["ReviewButChange"] || [];
      // this.pendingReview = res['data']["WaitingList"] || [];
      // this.pendingReview.map(date=>{
      //    return date.review_time=date.review_time ? new Date(this.common.dateFormatter(date.review_time)):new Date();
      //   });



    },
      err => {
        this.common.loading--;

        this.common.showError();
        console.log('Error: ', err);
      });
  }



}
