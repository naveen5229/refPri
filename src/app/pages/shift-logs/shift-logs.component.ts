import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { UserService } from '../../Service/user/user.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ShiftLogAddComponent } from '../../modals/shift-log-add/shift-log-add.component';
import { MapService } from '../../Service/map/map.service';
declare var google: any;

@Component({
  selector: 'ngx-shift-logs',
  templateUrl: './shift-logs.component.html',
  styleUrls: ['./shift-logs.component.scss']
})
export class ShiftLogsComponent implements OnInit {
  shiftLogList: any;
  date = new Date();
  today = new Date();

  table = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  constructor(public common: CommonService, public user: UserService, public api: ApiService, public modalService: NgbModal, public mapService: MapService) {
    this.getShiftLogs();
  }
  ngOnInit() { }

  getShiftLogs() {
    this.table = {
      data: {
        headings: {},
        columns: []
      },
      settings: {
        hideHeader: true
      }
    };

    let date = this.common.dateFormatter(this.date);
    const params = '?date=' + date;
    console.log(params);
    this.common.loading++;
    this.api.get('Admin/getUserShiftByDate' + params, 'I')
      .subscribe(res => {
        this.common.loading--;
        console.log('res:', res);
        if (res['data'] && res['data']) {
          this.shiftLogList = res['data'] || [];
          this.shiftLogList.length ? this.setTable() : this.resetTable();
          console.log(this.shiftLogList);
        }


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

  setTable() {
    this.table.data = {
      headings: this.generateHeadings(),
      columns: this.getTableColumns()
    };
    return true;
  }

  generateHeadings() {
    let headings = {};
    for (var key in this.shiftLogList[0]) {
      console.log(key.charAt(0));

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


  getTableColumns() {
    let columns = [];
    this.shiftLogList.map(shift => {
      let column = {};
      for (let key in this.generateHeadings()) {
        if (key == 'Action' || key == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            // icons: this.actionIcons(inventory)
          };
        } else if (key == "shift_start_time(Delay)") {
          column[key] = { value: shift[key], class: 'black', action: this.getUserShiftLogLocationByDate.bind(this, shift['_employee_id'], shift['_start_time']) };
        } else if (key == "shift_end_time(Delay)") {
          column[key] = { value: shift[key], class: 'black', action: this.getUserShiftLogLocationByDate.bind(this, shift['_employee_id'], shift['_end_time']) };
        } else {
          column[key] = { value: shift[key], class: 'black', action: '' };
        }
        if (shift['_employee_id'] == shift['_aduserid']) {
        } else {
          column['style'] = { 'background': 'antiquewhite' };
        }
      }
      columns.push(column);
    });
    console.log(columns);
    return columns;

  }

  showShiftLogPopup() {
    this.common.params = null;
    const activeModal = this.modalService.open(ShiftLogAddComponent, { size: 'md', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        this.getShiftLogs();
      }
    });
  }


  getUserShiftLogLocationByDate(userId, datetime) {
    let date = this.common.dateFormatter(datetime);
    const params = '?datetime=' + date + "&userId=" + userId;
    this.common.loading++;
    this.api.get('Admin/getUserShiftLogLocationByDate' + params)
      .subscribe(res => {
        this.common.loading--;
        console.log('res:', res, res['data'][0]['lat']);
        if (res['data'] && res['data'][0]['lat'] && res['data'][0]['long']) {
          this.showMap(res['data'][0]['lat'], res['data'][0]['long']);
        } else {
          this.common.showError("location not found");
        }
      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }
  geocoder: any;
  formatted_address = "";
  showMap(lat, long) {
    this.geocoder = new google.maps.Geocoder;
    this.mapService.mapIntialize('map', 14, lat, long);
    let singleMarker = this.mapService.createSingleMarker(new google.maps.LatLng(lat, long), true);
    document.getElementById("shiftMapModal").style.display = "block";

    this.geocoder.geocode({ 'location': singleMarker.getPosition() }, this.getAddress.bind(this));
    setTimeout(() => {

      console.log('formatted_address3:', this.formatted_address);
      let infoWindow = null;
      this.mapService.addListerner(singleMarker, 'mouseover', () => {
        console.log("mouseover:", this.formatted_address);
        let insideInfo = new Date().getTime();
        // if (infoWindow) {
        //   infoWindow.close();
        // }
        infoWindow = this.mapService.createInfoWindow();
        infoWindow.opened = false;
        infoWindow.setContent(`
          <span style='color:blue'>Info</span><br>
          <span style='max-width:200px;display: block'>address :${this.formatted_address}</span>`);
        infoWindow.setPosition(this.mapService.createLatLng(lat, long));
        infoWindow.open(this.mapService.map);

      })
      // this.mapService.addListerner(singleMarker, 'mouseout', () => {
      //   infoWindow.close();
      //   infoWindow.opened = false;
      // })
    }, 2000);

  }
  getAddress(results, status) {
    console.log('results', results);
    console.log("status:", status);
    this.formatted_address = results[0]['formatted_address'];

  }

  closeMapModal() {
    document.getElementById("shiftMapModal").style.display = "none";
  }


}
