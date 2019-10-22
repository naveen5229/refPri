import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';

@Component({
  selector: 'ngx-component-report',
  templateUrl: './component-report.component.html',
  styleUrls: ['./component-report.component.scss']
})
export class ComponentReportComponent implements OnInit {
  components=[];
  componentId='';
  componentData=[]
  startDate = new Date();
  endDate = new Date();
  constructor( public common:CommonService,
    public api:ApiService) {
      this.getComponents();
     }

  ngOnInit() {
  }

  getComponents() {
    this.common.loading++;
    this.api.get("Components/getAllComponents")
      .subscribe(res => {
        this.common.loading--;
        console.log("res", res['data'])
        this.components = res['data'];
      },
        err => {
          this.common.loading--;
          this.common.showError();
          console.log('Error: ', err);
        });
  }



  componentReport(){
    let params ="componentId=" +this.componentId + "&startDate=" + this.common.dateFormatter(this.startDate) +"&endDate=" +this.common.dateFormatter(this.endDate)
    
    this.common.loading++;
    this.api.get('Report/getReportWrtComponent?' + params).subscribe(res => {
      this.common.loading--;
      this.componentData = res['data'];
        this.common.showToast(res['msg'])
    
    },
      err => {
        this.common.loading--;
    
        this.common.showError();
        console.log('Error: ', err);
      });
      }

}
