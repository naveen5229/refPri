import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';

@Component({
  selector: 'ngx-stack-report',
  templateUrl: './stack-report.component.html',
  styleUrls: ['./stack-report.component.scss']
})
export class StackReportComponent implements OnInit {
 userID='';
 stackDetail=[]
  constructor(public activeModal:NgbActiveModal,
    public common:CommonService,
    public api:ApiService) {
      this.common.handleModalSize('class', 'modal-lg', '1000');
      console.log("common",this.common.params) 
    this.userID=this.common.params.empId;
    this.userWorklogs()
  }

  ngOnInit() {
  }

  closeModal(response) {
    this.activeModal.close({ response: response });
  }

  userWorklogs(){
    const params={
      userId:this.userID,
      date:this.common.params.stackDate,
      stackId:this.common.params.stackId
    }
    this.common.loading++
this.api.post("Report/getWorkLogsWrtUserStack",params).subscribe(res => {
  this.common.loading--;
  console.log("res", res['data']);
  this.stackDetail = res['data'];
}, err => {
  this.common.loading--;
  console.log(err);
  this.common.showError();
});
  }
}
