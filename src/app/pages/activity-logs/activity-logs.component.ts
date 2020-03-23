import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { AddActivityLogsComponent } from '../../modals/add-activity-logs/add-activity-logs.component';
import { ConfirmComponent } from '../../modals/confirm/confirm.component';

@Component({
  selector: 'ngx-activity-logs',
  templateUrl: './activity-logs.component.html',
  styleUrls: ['./activity-logs.component.scss']
})
export class ActivityLogsComponent implements OnInit {

  activityLogsist = [];

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
    public api: ApiService,
    public modalService: NgbModal,
    ) { 
      this.getActivityLogsist();
    }

  ngOnInit() {
  }

  addActivityLog(){
    const activeModal = this.modalService.open(AddActivityLogsComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      console.log(data);
      if (data) {
        this.getActivityLogsist();
      }
    })
     }

    getActivityLogsist() {
      this.common.loading++;
      this.api.get('Admin/getActivityLogs')
        .subscribe(res => {
          this.common.loading--;
          // console.log('res:', res);
          this.activityLogsist = res['data'] || [];
          console.log(this.activityLogsist);
  
          this.activityLogsist.length ? this.setTable() : this.resetTable();
  
  
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
      for (var key in this.activityLogsist[0]) {
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
      this.activityLogsist.map(activity => {
        let column = {};
        for (let key in this.generateHeadings()) {
          if (key == 'Action' || key == 'action') {
            column[key] = {
              value: "",
              isHTML: true,
              action: null,
              icons: this.actionIcons(activity)
            };
          } else {
            column[key] = { value: activity[key], class: 'black', action: '' };
          }
        }
        columns.push(column);
      });
      return columns;
  
    }

    actionIcons(activity) {
      let icons = [
        // { class: "fa fa-edit", action: this.editActiveAdmin.bind(this, activity) },
        { class: "fa fa-trash", action: this.deleteActivity.bind(this, activity) },
      ];
      return icons;
    }

    deleteActivity(activity) {
      console.log(activity);
      if (activity._id) {
        let params =  '?activityId=' + activity._id
        this.common.params = {
          title: 'Delete Installer',
          description: `<b>&nbsp;` + 'Are You Sure To Delete This Record' + `<b>`,
        }
  
        const activeModal = this.modalService.open(ConfirmComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
        activeModal.result.then(data => {
          if (data.response) {
            this.common.loading++;
            this.api.get('Admin/deleteActivityLog'+ params)
              .subscribe(res => {
                this.common.loading--;
                this.common.showToast(res['msg']);
                this.getActivityLogsist();
              }, err => {
                this.common.loading--;
                console.log('Error: ', err);
              });
          }
        });
      } else {
        this.common.showError("Activity ID Not Available");
      }
    }
  
}