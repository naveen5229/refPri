import {Component, OnDestroy} from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import { takeWhile } from 'rxjs/operators' ;
import { SolarData } from '../../@core/data/solar';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ListOfEmployeeComponent } from '../../modals/list-of-employee/list-of-employee.component';

interface CardSettings {
  title: string;
  iconClass: string;
  type: string;
}

@Component({
  selector: 'ngx-dashboard',
  styleUrls: ['./dashboard.component.scss'],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnDestroy {

  
  dashboard=[];
  constructor(public common: CommonService,
    public api: ApiService,
    public modalService:NgbModal) {
      this.dashboardDetail();
  }

  ngOnDestroy() {
  }

  dashboardDetail(){
    this.common.loading++;
    this.api.get("Projects/getProjectsWrtStatus").subscribe(res =>{
      this.common.loading--;
      if(res['code']===0) { this.common.showError(res['msg']); return false;};
      this.dashboard=res['data'] || [];
    },err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  countWorkingEmployee(){
    this.modalService.open( ListOfEmployeeComponent,{size:'lg',container:'nb-layout' ,backdrop:'static'})
  }
  
}
