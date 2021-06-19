import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { MapService } from '../../Service/map/map.service';
import { UserService } from '../../Service/user/user.service';

@Component({
  selector: 'ngx-sites',
  templateUrl: './sites.component.html',
  styleUrls: ['./sites.component.scss']
})
export class SitesComponent implements OnInit {
  table = null;
  showTable = false;
  LatLongData = null;
  path = '';
  companyId = null;
  Sites = [];
  site = {
    sitename: null,
    sitetype: 1,
    name: null,
    id: null
  }
  remainingList = [];
  circle = null;
  routeId = null;
  siteLatLng = { lat: 0, lng: 90 };
  typeId = 1;
  siteLoc = '';
  siteName = null;
  tempData = [];
  isUpdate = false;
  mergeSiteId = null;
  position = null;
  final = null;
  meterRadius = 20;
  lat = null;
  long = null;
  isHeatAble = false;
  kmsShow = null;
  Location = null;
  typeIds = [{
    description: 'loading/unloading',
    id: '1'
  }, {
    description: 'Petrol Pump',
    id: '101'
  },
  {
    description: 'Dhaba',
    id: '111'
  }, {
    description: 'My Office Site',
    id: '121'
  },
  {
    description: 'Workshop',
    id: '131'
  }, {
    description: 'otherSite',
    id: '201'

  }];
  typeID = null;

  constructor(public common: CommonService,
    public api: ApiService,
    public mapService: MapService,
    public user: UserService) {
    this.companySites();
    this.site.name = "Add";
    this.common.refresh = this.refresh.bind(this);
  }

  ngOnInit() {
  }

  refresh() {
    this.companySites();
  }


  ngAfterViewInit() {
    this.mapService.mapIntialize("map", 10);
    setTimeout(() => {
      this.mapService.setMapType(0);
    }, 2000);
    this.mapService.isDrawAllow = true;
    this.mapService.createPolygonPath();
    this.mapService.addListerner(this.mapService.map, 'click', (event) => {
      if (this.mapService.isDrawAllow) {
        console.log("Event", event);
      }
    })

    // setTimeout(() => {
    //   if (this.common.params != null) {
    //     let latitude = this.common.params.vehicle.latitude;
    //     let longitude = this.common.params.vehicle.longitude;
    //     let marker = [{
    //       lat: latitude,
    //       long: longitude,
    //       address: this.common.params.vehicle.Address,
    //     }];
    //     this.mapService.createMarkers(marker, false, true, ["address"]);
    //   }
    // }, 3000);

  }

  //Save Sites
  submitPolygon() {
    let url;
    if (this.mapService.polygonPath) {
      this.path = "(";
      var latLngs = this.mapService.polygonPath.getPath().getArray();
      if (latLngs.length < 4) {
        this.common.showError("Site Should Have More Than 3 points Atleast");
        this.mapService.isDrawAllow = true;
        return;
      }

      for (var i = 0; i < latLngs.length; i++) {
        //if (i == Math.floor(latLngs.length / 2))
        this.lat = latLngs[i].lat();
        this.long = latLngs[i].lng();
        this.path += latLngs[i].lat() + " " + latLngs[i].lng() + ",";
      }
      this.path += latLngs[0].lat() + " " + latLngs[0].lng() + ",";
      this.path = this.path.substr(0, this.path.length - 1);
      this.path += ")";
      console.log("latlong:", this.path)
    }
    if (this.site.sitename == "") {
      this.common.showError("Please fill Site Name.")
    } else {
      let params = {
        siteId: this.site.id,
        siteName: this.site.sitename,
        polygon: this.path,
        siteLoc: this.Location,
        typeId: this.typeID
      };
      let url = this.site.id ? 'SiteFencing/updateSiteFence' : 'SiteFencing/createSiteAndFenceWrtFo';
      this.common.loading++;
      this.api.post(url, params)
        .subscribe(res => {
          this.common.loading--;
          console.log("Success:", res);
          if (res['code'] > 0) {
            this.common.showToast("success!!");
            this.mapService.clearAll();
            this.site.name = "Add";
            this.Location = null;
            this.typeID = null;
            this.site.sitename = '';
            document.getElementById('location')['value'] = '';
            this.companySites();
          }
          if (res['code'] < 0) {
            this.common.showError(res['msg']);
            this.companySites();
          }
        }, err => {
          this.common.loading--;
          console.log(err);
        });
    }
  }

  clearMapServices() {
    if (this.site.name == "Update") {
      this.mapService.resetPolygons();
      this.mapService.clearAll();
      this.path = "";
    } else {
      this.mapService.clearAll();
    }
  }

  cancelMapServices() {
    this.site.sitename = "";
    this.path = "";
    this.site.id = "";
    this.mapService.resetPolygons();
    this.site.name = "Add";
    this.Location = null;
    document.getElementById('location')['value'] = '';
    this.typeID = null;
  }

  //Display Sites record in table 
  companySites() {
    this.mapService.clearAll();
    this.common.loading++;
    this.api.get('SiteFencing/getLocalFoSites')
      .subscribe(res => {
        this.common.loading--;
        console.log(res);
        this.Sites = res['data'];
        if (this.Sites != null) {
          this.showTable = true;
          this.table = this.setTable();
        } else {
          this.showTable = false;
          this.common.showToast('Record Not Found!!');
        }
      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }


  showdata(datas) {
    console.log("Data", datas);
    this.path = datas.fences;
    this.mapService.resetPolygons();
    let latlong = datas.latlongs;
    this.mapService.setMultiBounds(latlong, true);
    for (let index = 0; index < latlong.length; index++) {
      const thisData = latlong[index];
      latlong[index] = { lat: thisData.lat, lng: thisData.lng };
    }

    let latLngsMulti = [{
      data: latlong,
      isMain: true,
      isSec: false,
      show: datas.name
    }];
    this.site.name = "Update";
    this.site.sitename = datas.name;
    this.site.sitetype = datas.type;
    this.site.id = datas.id;
    this.Location = datas.loc_name;
    this.typeID = datas._type_id;
    this.mapService.resetPolygons();
    this.mapService.createPolygons(latLngsMulti);
  }

  setTable() {
    let headings = {
      name: { title: 'Site Name', placeholder: 'Site Name' },
      loc_name: { title: 'Loc Name', placeholder: 'Loc Name' },
      Type: { title: 'SiteType', placeholder: 'SiteType' },
      Delete: { title: 'Delete', placeholder: 'Delete', hideSearch: true, class: 'tag' },
    };
    return {
      data: {
        headings: headings,
        columns: this.getTableColumns()
      },
      settings: {
        hideHeader: true,
        tableHeight: "auto"

      }
    }
  }

  getTableColumns() {
    let columns = [];
    this.Sites.map(res => {
      let column = {
        name: { value: res.name, action: this.showdata.bind(this, res) },
        loc_name: { value: res.loc_name, action: this.showdata.bind(this, res) },
        Type: { value: res.Type, action: this.showdata.bind(this, res) },
        Delete: this.user.permission.delete && { value: '<i class="fa fa-trash text-danger"></i>', isHTML: true, action: this.deleteRecord.bind(this, res), class: 'icon text-center del' },
        rowActions: {
          click: 'selectRow'
        }
      };
      columns.push(column);
    });
    return columns;
  }

  //Delete Sites
  deleteRecord(row) {
    if (confirm("do you really want to delete this Site: " + row.name + "?")) {
      let params = {
        rowId: row.id,
      }
      this.mapService.clearAll();
      this.common.loading++;
      this.api.post('SiteFencing/deleteSiteAndFenceWrtFo', params)
        .subscribe(res => {
          this.common.loading--;
          console.log(res);
          this.Sites = res['data'];
          if (res['code'] > 0) {
            this.common.showToast("site deleted !!");
            this.companySites();
          }
          else {
            this.common.showError(res['msg']);
          }
        }, err => {
          this.common.loading--;
          this.common.showError(err);
          console.log(err);
        });
    }
  }
  selectLocation(res) {
    console.log(res);
    this.Location = res && res.location ? res.location : null;
    if (this.Location)
      this.mapService.zoomAt(this.mapService.createLatLng(res.lat, res.long), 12);
  }

  getLatLng() {
    if (!this.Location) {
      let ltlngString = (<HTMLInputElement>document.getElementById('moveto')).value;
      console.log("ltlngString", ltlngString);
      let lat = ltlngString.split(',')[0];
      let lng = ltlngString.split(',')[1];
      console.log("lat,lng", lat, lng);
      this.mapService.zoomAt(this.mapService.createLatLng(lat, lng), 18);
    }
  }


}