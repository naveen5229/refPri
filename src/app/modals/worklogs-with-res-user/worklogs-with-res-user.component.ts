import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';

@Component({
  selector: 'ngx-worklogs-with-res-user',
  templateUrl: './worklogs-with-res-user.component.html',
  styleUrls: ['./worklogs-with-res-user.component.scss']
})
export class WorklogsWithResUserComponent implements OnInit {

  constructor(public common:CommonService,
    public api:ApiService) {
console.log("thisssssssssssss",this.common.params)
    this.userWorklogs;
   }

  ngOnInit() {
  }

  userWorklogs(){
    const params={
      userId:this.common
    }
this.api.post("Report/getWorkLogsWrtUser",params)
  }

}
