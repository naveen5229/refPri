import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import * as _ from "lodash";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { WorklogsWithResUserComponent } from '../../modals/worklogs-with-res-user/worklogs-with-res-user.component';


@Component({
  selector: 'ngx-employee-monthly-report',
  templateUrl: './employee-monthly-report.component.html',
  styleUrls: ['./employee-monthly-report.component.scss']
})
export class EmployeeMonthlyReportComponent implements OnInit {
  formattedAttendances=[]
  formattedAttendancesDate=[]
  formattedAttendancesHours=[]
  dates = {
    start: '',
    end: ''
  };
  //table = null;
  table = {
    data: {
      headings: {
        Name: { placeholder: 'Employee' },
        Hours: { placeholder: 'Hours', editable: true, hideSearch: true },
        date:{ placeholder: 'Date', editable: true, hideSearch: true }
      },
      columns: []
    },
    settings: {
      //hideHeader: true
      hideHeader: true,
      editable: true,
    }
  };
  attendances=[];
  formattedAttendancesUser=[]
  constructor(public common:CommonService,
    public api:ApiService,
    public modalService:NgbModal) { }

  ngOnInit() {
  }

  showMonthlyWork(){
    this.formattedAttendances=[]
    this.formattedAttendancesDate=[]
    this.formattedAttendancesHours=[]
     this.table = {
      data: {
        headings: {
          Name: { placeholder: 'Employee' },
          Hours: { placeholder: 'Hours', editable: true, hideSearch: true },
          date:{ placeholder: 'Date', editable: true, hideSearch: true }

        },
        columns: []
      },
      settings: {
        //hideHeader: true
        hideHeader: true,
        editable: true,
      }
    };
    let params = {
     
      startDate: this.dates.start,
      endDate: this.dates.end
    };
    
    this.common.loading++;
    this.api.post('Report/getEmployeeMonthlyReport', params).subscribe(res => {
      this.common.loading--;
      this.attendances = res['data'];
      //this.table = this.setTable();
      this.table.data.columns = this.getTableColumns(this.formattData());
      this.common.showToast(res['msg'])
  
    },
      err => {
        this.common.loading--;

        this.common.showError();
        console.log('Error: ', err);
      });
  }

  setTable(){

  }

  formattData() {
    let EmployeAttendanceGroups = _.groupBy(this.attendances, 'Name');
    console.log("++++++++++++++++",EmployeAttendanceGroups)
  
    Object.keys(EmployeAttendanceGroups).map(key => {
      this.formattedAttendances.push({
        name: key,
     data: EmployeAttendanceGroups[key],
       // Date:EmployeAttendanceGroups[key][0].Date
      });
      this.formattedAttendancesDate.push({
        date:EmployeAttendanceGroups[key].map(date=>
          date.Date)
      });
      this.formattedAttendancesHours.push({
        hour:EmployeAttendanceGroups[key].map(hour=>
          hour.Hour)
    }); 
    this.formattedAttendancesUser.push({
        user:EmployeAttendanceGroups[key].map(user=>
        user._empid),
        date:EmployeAttendanceGroups[key].map(user=>
          user._date)
  }); 
  });

 
    this.formattedAttendancesDate=  this.formattedAttendancesDate[0].date
   

    console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++",this.formattedAttendancesUser)
    //   };

    // });
    console.log('formattdata', this.formattedAttendances);
    return this.formattedAttendances;
  }

  
  getTableColumns(formattedAttendances) {
    let columns = [];

    formattedAttendances.map(formattedAttendance => {
      let column = {
        Name: { value: formattedAttendance.Name },
        Hours: { value: formattedAttendance.Hours },
        Date : { value: formattedAttendance.Hours, Date: formattedAttendance.Date }

      };
   
    
      column['params'] = formattedAttendance;
     
      columns.push(column);
      console.log("***********", columns)
    });
    return columns;
  }

  workLogUser(emp,userDate){
    this.common.params={emp,userDate}
    const activeModal = this.modalService.open(WorklogsWithResUserComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        this.showMonthlyWork()
      }
    });
  }
}
