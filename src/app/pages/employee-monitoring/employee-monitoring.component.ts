import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RouteMapperComponent } from '../../modals/route-mapper/route-mapper.component';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { MapService } from '../../Service/map/map.service';

interface report {
  name: string; // Abhishek Jangir axes
  department: string; // AT-Operation
  attendance: string; // Present
  mobile: number; // 7976410490
  lastFetch: string; // 30 Oct 20 18:16
  lat: number; // 26.577875
  lng: number; // 74.8395645
  loc: boolean; // true or false
  net: boolean; // true or false
  wifi: boolean; // true or false
  userId: number; // 160
  addTime: string; // 2020-10-30T18:16:23.793977
};

interface SmartTable {
  data: {
    headings: any,
    columns: any[]
  },
  settings: any;
};

@Component({
  selector: 'ngx-employee-monitoring',
  templateUrl: './employee-monitoring.component.html',
  styleUrls: ['./employee-monitoring.component.scss']
})
export class EmployeeMonitoringComponent implements OnInit {
  reports: report[] = [];
  table: SmartTable = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  selected = {
    employee: null,
    employees: [],
    markerCluster: false
  };
  markerInfoWindow: any;
  markers = [];
  map: any;
  viewOptions = [
    { id: 1, name: 'Both' },
    { id: 2, name: 'List' },
    { id: 3, name: 'Map' }
  ]

  constructor(private api: ApiService, private common: CommonService, private mapService: MapService, public modalService: NgbModal) {
    this.common.refresh = this.refresh.bind(this);
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.map = this.mapService.mapIntialize("map", 8, 26.9124336, 75.78727090000007);
    this.getReport();
  }

  refresh(){
    this.getReport();
  }

  viewClass = {
    table: 'col-8',
    map: 'col-4'
  }
  onViewChange(viewId) {
    console.log("viewId:", viewId);
    if (viewId == 1) {
      this.viewClass = {
        table: 'col-8',
        map: 'col-4'
      }
    } else if (viewId == 2) {
      this.viewClass = {
        table: 'col-12',
        map: 'col-0 height-none'
      }
    } else if (viewId == 3) {
      this.viewClass = {
        table: 'col-0 height-none',
        map: 'col-12'
      }
    }
  }

  getReport() {
    this.common.loading++;
    this.api.get('Admin/getEmployeeTrackingReports')
      .subscribe((res: any) => {
      console.log('report  result:', res);
        this.common.loading--;
        if(res['code']===0) { this.common.showError(res['msg']); return false;};
        this.reports = res.data.map(record => {

          return {
            name: record.name,
            department: record.department,
            attendance: record.attendance,
            mobile: record.mobile,
            lastFetch: record.last_fetch_time,
            lat: record.lat,
            lng: record.long,
            loc: record.loc,
            net: record.net,
            wifi: record.wifi,
            userId: record.aduserid,
            addTime: record.addtime
          }
        });

        this.setMarkers();
        this.setSmartTable();
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.error('__err:', err);
      })
  }

  setSmartTable() {
    this.table.data = {
      headings: this.getSmartTableHeadings(),
      columns: this.getSmartTableRows()
    }
  }

  getSmartTableHeadings() {
    return {
      checkbox: {
        isCheckbox: true,
        action: this.selectUnselectAllEmployees.bind(this),
        value: true,
        class: 'ckbox'
      },
      name: { placeholder: 'Name' },
      department: { placeholder: 'Department' },
      attendance: { placeholder: 'Attendance' },
      mobile: { placeholder: 'Mobile' },
      lastFetch: { placeholder: 'Last Fetch', type: "date" },
      loc: { placeholder: 'Location' },
      net: { placeholder: 'Internet' },
      wifi: { placeholder: 'Wifi' }
    };
  }

  getSmartTableRows() {
    return this.reports.map(report => {
      let row = {};
      for (let heading in this.getSmartTableHeadings()) {
        let action: any = null;
        let value = report[heading];

        if (heading === 'name') action = this.viewRoute.bind(this, report);

        row[heading] = { value, action };

        if (heading === 'checkbox') row[heading] = {
          isCheckbox: true,
          action: this.selectOrUnselectEmployee.bind(this, report),
          value: this.selected.employees.indexOf(report.userId) !== -1 ? true : false
        };

        if (!report.userId) {
          row["style"] = { background: this.common.taskBgColor.hold };
        }

      }
      return row;
    });
  }

  setMarkers() {
    if (!this.markerInfoWindow)
      this.markerInfoWindow = new google.maps.InfoWindow({ content: '' });

    this.markers.map(marker => marker.setMap(null));
    console.log('this.markers: ', this.markers);
    let reports = this.reports.filter(report => report.lat);
    console.log('let reports: ', reports);
    this.markers = this.mapService.createMarkers(reports, false, false)
      .map((marker, index) => {
        let report = reports[index];
        console.log('report: ', report);
        marker.setTitle(report.name);
        this.setMarkerEvents(marker, report);
        return { id: report.userId, marker: marker };
      });

    this.selected.employees = reports.map(report => report.userId);
  }

  setMarkerEvents(marker, report) {
    marker.addListener('click', () => {
      this.markerInfoWindow.setContent(this.generateMarkerInfoWindowContent(report))
      this.markerInfoWindow.open(this.map, marker);
    });
  }

  generateMarkerInfoWindowContent(report: report) {
    let str = "<span style='color:blue'>Info</span><br>" +
      "<span><b>Name: </b>" + report.name + "</span><br>" +
      "<span><b>Department: </b>" + report.department + "</span><br>" +
      "<span><b>Attendance: </b>" + report.attendance + "</span><br>" +
      "<span><b>Mobile: </b>" + report.mobile + "</span><br>" +
      "<span><b>Last Fetch: </b>" + report.lastFetch + "</span><br>" +
      "<span><b>Location: </b>" + report.loc + "</span><br>" +
      "<span><b>Internet: </b>" + report.net + "</span><br>" +
      "<span><b>Wifi: </b>" + report.wifi + "</span>";
    return str;
  };

  viewRoute(report) {
    report['startDate'] = (report.addTime) ? new Date(report.addTime) : new Date();
    report['endDate'] = (report.addTime) ? new Date(report.addTime) : new Date();
    this.common.params = report;
    this.modalService.open(RouteMapperComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    this.common.handleModalSize('class', 'modal-lg', '1200');

  }

  selectUnselectAllEmployees(status: boolean) {
    this.selected.employees = [];
    if (status) {
      this.selected.employees = this.reports.map(report => report.userId);
      this.table.data.columns.map(column => column.checkbox.value = true);
    } else {
      this.table.data.columns.map(column => column.checkbox.value = false);
    }
    this.handleMarkerVisibility();
  }

  selectOrUnselectEmployee(report) {
    let index = this.selected.employees.indexOf(report.userId);
    if (index !== -1) {
      this.selected.employees.splice(index, 1);
    } else {
      this.selected.employees.push(report.userId);
    }

    if (this.selected.employees.length === this.reports.length) {
      this.table.data.headings['checkbox'].value = true
    } else {
      this.table.data.headings['checkbox'].value = false
    }

    this.handleMarkerVisibility();

  }

  handleMarkerVisibility() {
    this.markers.forEach(marker => {
      if (this.selected.employees.indexOf(marker.id) !== -1) marker.marker.setMap(this.map)
      else marker.marker.setMap(null);
    });
  }

}
