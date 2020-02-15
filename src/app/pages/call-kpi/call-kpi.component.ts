import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as Chart from 'chart.js'

@Component({
  selector: 'ngx-call-kpi',
  templateUrl: './call-kpi.component.html',
  styleUrls: ['./call-kpi.component.scss']
})
export class CallKpiComponent implements OnInit {

  title = 'angular8chartjs';
  canvas1: any;
  canvas2: any;
  canvas3: any;
  canvas: any;
  ctx: any;
  myChart1: any;
  myChart2: any;
  myChart3: any;
  endTime = new Date();
  startTime = new Date();
  shiftStart = new Date();
  shiftEnd = new Date();
  showLabel = false;
  callKpiList = [];

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
    public api: ApiService) {
     this.startTime.setDate(this.startTime.getDate()-1) 
     this.startTime.setHours(0);
     this.startTime.setMinutes(0);
     this.startTime.setSeconds(0);
     this.endTime.setDate(this.endTime.getDate()-1)
     this.endTime.setHours(23);
     this.endTime.setMinutes(59);
     this.endTime.setSeconds(59);
     this.shiftStart.setHours(9)
     this.shiftStart.setMinutes(30)
     this.shiftEnd.setHours(18)
     this.shiftEnd.setMinutes(30)
     this.getCallKpi();
     setTimeout(() => {
      this.showdata(this.callKpiList[0]);
     }, 3000);
    //  const doc = this.getCallKpi();
      // this.shiftStart.setDate(this.endTime.getDate()-1)
      // this.endTime.setDate(this.endTime.getDate()-1)
      // console.log(this.shiftStart.getTime());
    }

  ngOnInit() {
  }

  getCallKpi() {
    console.log(this.startTime, this.endTime);
    this.callKpiList = [];
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
    let shiftStart = this.common.timeFormatter1(this.shiftStart);
    let shiftEnd = this.common.timeFormatter1(this.shiftEnd);

    const params =
      "startDate=" + startdate +
      "&endDate=" + enddate +
      "&shiftStart="  + shiftStart +
      "&shiftEnd=" + shiftEnd;
      console.log(params);
      console.log(shiftStart);
      console.log(typeof(shiftStart));
    this.common.loading++;
    this.api.get('Users/getAdminCallKpis.json?' + params)
      .subscribe(res => {
        this.common.loading--;
        // console.log('res:', res);
        this.callKpiList = res['data'] || [];
        console.log(this.callKpiList);
        
        this.callKpiList.length ? this.setTable() : this.resetTable();
        return this.callKpiList[0];
        console.log(this.callKpiList);

      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }

  resetTable() {
    this.table.data = {
      headings: {},
      columns: []
    };
  }
  generateHeadings() {
    // console.log(this.dailyReportList);
    let headings = {};
    for (var key in this.callKpiList[0]) {
      // console.log(key.charAt(0));

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
    console.log(this.generateHeadings());
    let columns = [];
    this.callKpiList.map(ticket => {
      let column = {};
      for (let key in this.generateHeadings()) {
        if(key == "Admin Name")
        {
          column[key] ={value:ticket[key], class:'blue',isHTML:true, action: this.showdata.bind(this, ticket)}

        }
        else if (key == "Tk. Cnt." || key == "Tk. Dur.") {
          column[key] = { value: ticket[key], class: 'pink', action: '' };
        }
        else if (key == "FO Cnt." || key == "FO Dur.") {
          column[key] = { value: ticket[key], class: 'sky', action: '' };
        }
        else if (key == "Pt. Cnt." || key == "Pt. Dur.") {
          column[key] = { value: ticket[key], class: 'yellow', action: '' };
        }
        else if (key == "Ad. Cnt." || key == "Ad. Dur.") {
          column[key] = { value: ticket[key], class: 'green', action: '' };
        }
        else if (key == "Ot. Cnt." || key == "Ot. Dur.") {
          column[key] = { value: ticket[key], class: 'light', action: '' };
        }
        
        else if (key == 'Action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            // icons: this.actionIcons(pending)
          };
        } else {
          column[key] = { value: ticket[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    });
    return columns;

  }

  showdata(doc)
  {

    this.canvas = document.getElementById('myChart1');
    this.ctx = this.canvas.getContext('2d');
    let data = [doc['_type_cnt']['incoming'], doc['_type_cnt']['outgoing'], doc['_type_cnt']['missed'], doc['_type_cnt']['other']];
    console.log('Data:', data);
    this.myChart1 = new Chart(this.ctx, {
      type: 'pie',
      data: {
          labels: ["Incoming", "Outgoing", "Missed", "Others"],
          datasets: [{
              label: '# of Votes',
              data: [doc['_type_cnt']['incoming'], doc['_type_cnt']['outgoing'], doc['_type_cnt']['missed'], doc['_type_cnt']['other']],
              backgroundColor: [
                  'rgba(255, 99, 132, 1)',
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 206, 86, 1)',
                  'rgba(34, 139, 34, 1)',                
                  'rgba(138, 43, 226, 1)'
              ],
              borderWidth: 1
          }]
      },
      options: {
        responsive: true,
        display:true,
        legend: {
          display: true
        },
        
      }
    });


    this.canvas = document.getElementById('myChart2');
    this.ctx = this.canvas.getContext('2d');
    this.myChart2 = new Chart(this.ctx, {
      type: 'pie',
      data: {
        labels: ["Tickets", "FO", "Partner", "Admin", "Others"],
        datasets: [{
              label: '# of Votes', 
              data: [doc['_call_cnt']['tickets'], doc['_call_cnt']['fo'], doc['_call_cnt']['partner'], doc['_call_cnt']['admin'],  doc['_call_cnt']['other']],
              backgroundColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(34,139,34)',                
                'rgba(138, 43, 226, 1)'
              ],
              borderWidth: 1
          }]
      },
      options: {
        responsive: true,
        display:true,
        legend: {
          display: false
        },
      }
    });
    console.log(this.myChart2);


    this.canvas = document.getElementById('myChart3');
    this.ctx = this.canvas.getContext('2d');
    this.myChart3 = new Chart(this.ctx, {
      type: 'pie',
      data: {
          labels: ["Tickets", "FO", "Partner", "Admin", "Others"],
          datasets: [{
              label: '# of Votes',
              data: [doc['_call_dur']['tickets'], doc['_call_dur']['fo'], doc['_call_dur']['partner'], doc['_call_dur']['admin'],  doc['_call_dur']['other']],
              backgroundColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(34,139,34)',                
                'rgba(138, 43, 226, 1)'
              ],
              borderWidth: 1
          }]
      },
      options: {
        responsive: true,
        display:true,
        legend: {
          display: false
        },
      }
    });
    
    this.showLabel = true;
    console.log("----------123123:", doc);

  }


}
