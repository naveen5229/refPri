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

  constructor(private api: ApiService, private common: CommonService, private mapService: MapService, public modalService: NgbModal) {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.map = this.mapService.mapIntialize("map", 10);
    this.getReport();
  }

  getReport() {
    this.common.loading++;
    this.api.get('Admin/getEmployeeTrackingReports')
      .subscribe((res: any) => {
        this.common.loading--;
        console.log('__res:', res);
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
        console.log('Reports:', this.reports);
        this.setMarkers();
        this.setSmartTable();
      }, err => {
        this.common.loading--;
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
      lastFetch: { placeholder: 'Last Fetch' },
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

      }
      return row;
    });
  }

  setMarkers() {
    if (!this.markerInfoWindow)
      this.markerInfoWindow = new google.maps.InfoWindow({ content: '' });

    this.markers.map(marker => marker.setMap(null));
    let reports = this.reports.filter(report => report.lat);
    this.markers = this.mapService.createMarkers(reports, false, false)
      .map((marker, index) => {
        let report = reports[index];
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
    let str = `<div style="color:#000">${JSON.stringify(report)}`;
    return str;
  };

  viewRoute(report) {
    this.common.params = report;
    this.modalService.open(RouteMapperComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    this.common.handleModalSize('class', 'modal-lg', '1200');

  }

  selectUnselectAllEmployees(status: boolean) {
    // this.selected.employees = [];
    // if (this.selected.status && status) {
    //   this.filteredVehicles.forEach(vehicle => this.selected.vehicles.push(vehicle._vid));
    //   this.table.data.columns.map(column => column.checkbox.value = true);
    // } else if (status) {
    //   this.vehicles.forEach(vehicle => this.selected.vehicles.push(vehicle._vid));
    //   this.table.data.columns.map(column => column.checkbox.value = true);
    //   console.log("Data123:", this.table.data)
    // } else {
    //   this.table.data.columns.map(column => column.checkbox.value = false);
    // }
    // this.handleMarkerVisibility();
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
