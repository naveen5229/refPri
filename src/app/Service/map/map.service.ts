import { Injectable } from '@angular/core';
import { CommonService } from '../common/common.service';
declare let google: any;
declare let MarkerClusterer: any;

@Injectable({
  providedIn: 'root'
})
export class MapService {

  poly = null;
  polyVertices = [];
  map = null;
  mapDiv = null;
  markers = [];
  bounds = null;
  infoStart = null;
  infoWindow = null;
  polygon = null;
  polygons = [];
  isMapLoaded = false;
  mapLoadDiv = null;
  cluster = null;
  lineSymbol = {
    path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW
  };
  lineSymbolBack = {
    path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW
  };

  polygonPath = null;
  polygonPathVertices = [];
  isDrawAllow = false;
  designsDefaults = [
    "M  0,0,  0,-5,  -5,-5,-5,-13 , 5,-13 ,5,-5, 0,-5 z",///Rect
    "M  0,0,  0,-5,  -5,-13 , 5,-13 , 0,-5 z"//Pin
  ];
  options = null;
  heatmap = null;
  polygonPaths = [];
  polygonPathsVertices = [[]];
  constructor(public common: CommonService) {
  }

  autoSuggestion(elementId, setLocation?) {
    let options = {
      types: ['(cities)'],
      componentRestrictions: { country: "in" }
    };
    let ref = document.getElementById(elementId);//.getElementsByTagName('input')[0];
    let autocomplete = new google.maps.places.Autocomplete(ref, options);
    google.maps.event.addListener(autocomplete, 'place_changed', this.updateLocation.bind(this, elementId, autocomplete, setLocation));
  }

  updateLocation(elementId, autocomplete, setLocation?) {
    let placeFull = autocomplete.getPlace();
    console.log('placeFullNAme', placeFull);
    let lat = placeFull.geometry.location.lat();
    let lng = placeFull.geometry.location.lng();
    let place = placeFull.formatted_address.split(',')[0];
    setLocation && setLocation(place, lat, lng, placeFull.formatted_address);
  }

  zoomAt(latLng, level = 18) {
    this.map.panTo(latLng);
    if (level != this.map.getZoom())
      this.zoomMap(level);
  }

  centerAt(latLng) {
    this.map.panTo(latLng);
  }

  zoomMap(zoomValue) {
    this.map.setZoom(zoomValue);
    if (zoomValue <= 14) {
      this.map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
    } else if (zoomValue > 14) {
      this.map.setMapTypeId(google.maps.MapTypeId.HYBRID);

    }
  }

  setMultiBounds(bounds, isReset = false) {
    if (isReset)
      this.resetBounds();
    for (let index = 0; index < bounds.length; index++) {
      const thisPoint = bounds[index];
      this.setBounds(this.createLatLng(thisPoint.lat, thisPoint.lng));
    }
  }

  createSingleMarker(latLng, defaultIcon = false) {
    var icon = {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 4,
      fillColor: "#000000",
      fillOpacity: 1,
      strokeWeight: 1
    };
    var marker = new google.maps.Marker({
      icon: (defaultIcon) ? google.maps.Animation.DROP : icon,
      position: latLng,
      map: this.map,
      // animation: google.maps.Animation.DROP,
    });
    return marker;
  }

  mapIntialize(div = "map", zoom = 12, lat = 25, long = 75, showUI = false) {
    if (this.isMapLoaded) {
      // document.getElementById(div).innerHTML="";
      // document.getElementById(div).append(this.mapLoadDiv.innerHTML);
      // this.setMapType(0);
      // return;
    }
    this.mapDiv = document.getElementById(div);
    let latlng = new google.maps.LatLng(lat, long);
    let opt =
    {
      center: latlng,
      zoom: zoom,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      scaleControl: true,
      disableDefaultUI: showUI,
      styles: [{
        featureType: 'all',
        elementType: 'labels',
        stylers: [{
          visibility: 'on'
        }]
      }]
    };
    //let ("#"+mapId).heigth(height);
    this.map = new google.maps.Map(this.mapDiv, opt);
    this.mapLoadDiv = this.map.getDiv();
    this.bounds = new google.maps.LatLngBounds();
    this.isMapLoaded = true;
  }

  createLatLng(lat, lng) {
    return new google.maps.LatLng(lat, lng);
  }
  createInfoWindow() {
    return new google.maps.InfoWindow();
  }

  createPolygon(latLngs, options?) {// strokeColor = '#', fillColor = '#') {
    const defaultOptions = {
      paths: latLngs,
      strokeColor: '#228B22',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      clickable: false,
      fillColor: '#ADFF2F',
      fillOpacity: 0.35
    };
    this.polygon = new google.maps.Polygon(options || defaultOptions);
    this.polygon.setMap(this.map);
  }
  createPolygons(latLngsMulti, options?) {// strokeColor = '#', fillColor = '#') {
    let index = 0;

    latLngsMulti.forEach(latLngs => {
      let colorBorder;
      let colorFill;
      let isMain = false;
      if (latLngs.isSec) {
        colorBorder = '#f00';
        colorFill = '#f88';
      } else if (latLngs.isMain) {
        colorBorder = '#0f0';
        colorFill = '#8f8';
      } else {
        colorBorder = '#00f';
        colorFill = '#88f';
      }
      const defaultOptions = {
        paths: latLngs.data,
        strokeColor: colorBorder,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        clickable: !latLngs.isMain,
        fillColor: colorFill,
        fillOpacity: 0.35
      };
      let polygon = new google.maps.Polygon(options || defaultOptions);
      this.polygons.push(polygon);
      polygon.setMap(this.map);
      let infoWindow = new google.maps.InfoWindow();
      infoWindow.opened = false;
      let showContent = latLngs.show;
      google.maps.event.addListener(polygon, 'mouseover', function (evt) {
        infoWindow.setContent("Info: " + showContent);
        infoWindow.setPosition(evt.latLng); // or evt.latLng
        infoWindow.open(this.map);
      });
      google.maps.event.addListener(polygon, 'mouseout', function (evt) {
        infoWindow.close();
        infoWindow.opened = false;
      });
      index++;
    });
  }

  addListerner(element, event, callback) {
    if (element)
      google.maps.event.addListener(element, event, callback);
  }

  getLatLngValue(markerData) {
    let latLng = { lat: 0, lng: 0 }
    let keys = Object.keys(markerData);
    latLng.lat = parseFloat(markerData[keys.find((element) => {
      return element == "lat" || element == "y_lat" || element == "x_lat" || element == "x_tlat" || element == "_lat" || element == "base_lat" || element == "_base_lat";
    })]);
    latLng.lng = parseFloat(markerData[keys.find((element) => {
      return element == "lng" || element == "long" || element == "x_long" || element == "x_tlong" || element == "_long" || element == "base_long" || element == "_base_long";
    })]);
    return latLng;
  }

  createMarkers(markers, dropPoly = false, changeBounds = true, infoKeys?, afterClick?, infoOnMouse = false) {
    let thisMarkers = [];
    let infoWindows = [];
    console.log("Markers", markers);
    for (let index = 0; index < markers.length; index++) {
      let subType = markers[index]["subType"];
      let design = markers[index]["type"] == "site" ? this.designsDefaults[0] :
        markers[index]["type"] == "subSite" ? this.designsDefaults[1] : null;
      let text = markers[index]["text"] ? markers[index]["text"] : " ";
      let pinColor = markers[index]["color"] ? markers[index]["color"] : "FFFF00";
      let latLng = this.getLatLngValue(markers[index]);
      let lat = latLng.lat;
      let lng = latLng.lng;
      let title = markers[index]["title"] ? markers[index]["title"] : "Untitled";
      let latlng = new google.maps.LatLng(lat, lng);
      let pinImage;
      //pin Image
      if (design) {
        pinImage = {
          path: design,
          // set custom fillColor on each iteration
          fillColor: "#" + pinColor,
          fillOpacity: 1,
          scale: 1.3,
          strokeColor: pinColor,
          strokeWeight: 2
        };
      } else {
        if (subType == 'marker')
          pinImage = "http://chart.apis.google.com/chart?chst=d_map_xpin_letter&chld=pin|" + (index + 1) + "|" + pinColor + "|000000";
        else //if(subType=='circle')
          pinImage = {
            path: google.maps.SymbolPath.CIRCLE,
            scale: this.options ? this.options.circle.scale : 6,
            fillColor: "#" + pinColor,
            fillOpacity: 0.8,
            strokeWeight: 1
          };
      }


      let marker = null;
      if (dropPoly)
        this.drawPolyMF(latlng);
      if ((lat && lng)) {
        marker = new google.maps.Marker({
          position: latlng,
          flat: true,
          icon: pinImage,
          map: this.map,
          title: title
        });
        let displayText = '';
        if (infoKeys) {
          let infoWindow = this.createInfoWindow();
          infoWindows.push(infoWindow);
          infoWindow.opened = false;
          console.log(infoWindow);
          if (typeof (infoKeys) == 'object') {
            infoKeys.map((display, indexx) => {
              if (indexx != infoKeys.length - 1) {
                displayText += this.common.ucWords(display) + " : " + markers[index][display] + ' <br> ';
              } else {
                displayText += this.common.ucWords(display) + " : " + markers[index][display];
              }
            });
          } else {
            displayText = this.common.ucWords(infoKeys) + " : " + markers[index][infoKeys];
          }
          google.maps.event.addListener(marker, 'click', function (evt) {
            this.infoStart = new Date().getTime();
            for (let infoIndex = 0; infoIndex < infoWindows.length; infoIndex++) {
              const element = infoWindows[infoIndex];
              if (element)
                element.close();
            }
            infoWindow.setContent("<span style='color:blue'>Info</span> <br> " + displayText);
            infoWindow.setPosition(evt.latLng); // or evt.latLng
            infoWindow.open(this.map);
            afterClick(markers[index]);
          });

          if (infoOnMouse) {// start:showInfowindow on mouserover by sunil-26-02-2020
            google.maps.event.addListener(marker, 'mouseover', function (evt) {
              this.infoStart = new Date().getTime();
              for (let infoIndex = 0; infoIndex < infoWindows.length; infoIndex++) {
                const element = infoWindows[infoIndex];
                if (element)
                  element.close();
              }
              infoWindow.setContent("<span style='color:blue'>Info</span> <br> " + displayText);
              infoWindow.setPosition(evt.latLng); // or evt.latLng
              infoWindow.open(this.map);
            });
            google.maps.event.addListener(marker, 'mouseout', function (evt) {
              // this.infoStart = new Date().getTime();
              infoWindow.close();
              infoWindow.opened = false;
            });
          }
        }
        if (changeBounds)
          this.setBounds(latlng);
      }
      this.markers.push(marker);
      thisMarkers.push(marker);

      //  marker.addListener('mouseover', this.infoWindow.bind(this, marker, show ));

      //  marker.addListener('click', fillSite.bind(this,item.lat,item.long,item.name,item.id,item.city,item.time,item.type,item.type_id));
      //  marker.addListener('mouseover', showInfoWindow.bind(this, marker, show ));


    }
    return thisMarkers;
  }



  createCirclesOnPostion(center, radius) {
    console.log("center,radius", center, radius);
    return new google.maps.Circle({
      strokeColor: '#0000FF',
      strokeOpacity: 1,
      strokeWeight: 2,
      fillColor: '#0000FF',
      fillOpacity: 0.2,
      map: this.map,
      center: center,
      radius: radius
    });
  }

  toggleBounceMF(id, evtype = 1) {
    //console.log("Bounce marker",id);
    //console.log("index",index);
    //.log("test",test);
    //console.log("item",item);
    // console.log('Evtype:', evtype);
    if (this.markers[id]) {
      if (this.markers[id].getAnimation() == null && evtype == 1) {
        this.markers[id].setAnimation(google.maps.Animation.BOUNCE);
      }
      else if (evtype == 2 && this.markers[id].getAnimation() != null) {
        this.markers[id].setAnimation(null);
      }
    }
  }

  createPoint(x, y) {
    return new google.maps.Point(x, y);
  }

  clearAll(reset = true, boundsReset = true, resetParams = { marker: true, polygons: true, polypath: true }) {

    resetParams.marker && this.resetMarker(reset, boundsReset);
    resetParams.polygons && this.resetPolygons();
    resetParams.polypath && this.resetPolyPath();
    this.options ? this.options.polypaths && this.resetPolyPaths() : '';
    this.options ? this.options.clearHeat && this.resetHeatMap() : '';
  }
  resetHeatMap() {
    if (this.heatmap) {
      this.heatmap.setMap(null);
      this.heatmap = null;
    }
  }

  resetMarker(reset = true, boundsReset = true, markers?) {
    let actualMarker = markers || this.markers;
    for (let i = 0; i < actualMarker.length; i++) {
      if (actualMarker[i])
        console.log("reset");

      actualMarker[i].setMap(null);
    }
    if (reset)
      actualMarker = [];
    if (boundsReset) {
      this.bounds = new google.maps.LatLngBounds();
    }
  }

  resetBounds() {
    this.bounds = new google.maps.LatLngBounds();
    for (let index = 0; index < this.markers.length; index++) {
      if (this.markers[index]) {
        let pos = this.markers[index].position;
        if (pos.lat() != 0 && this.markers[index].getMap())
          this.setBounds(pos);
      }
    }
  }
  resetPolygons() {
    if (this.polygon) {
      this.polygon.setMap(null);
      this.polygon = null;
    }
    if (this.polygons.length > 0) {
      this.polygons.forEach(polygon => {
        polygon.setMap(null);
      });
      this.polygons = [];
    }
  }
  resetPolyPaths() {
    if (this.polygonPaths.length > 0) {
      this.polygonPaths.forEach(path => {
        path.setMap(null);
      });
      this.polygonPaths = [];
    }
    if (this.polygonPathsVertices.length > 0) {
      this.polygonPathsVertices.forEach(polyPathVertices => {
        if (polyPathVertices.length > 0) {
          polyPathVertices.forEach(polyPathVertix => {
            polyPathVertix.setMap(null);
          });
        }
      });
      this.polygonPathsVertices = [[]];
    }
  }
  resetPolyPath() {
    if (this.polygonPath) {
      this.polygonPath.setMap(null);
      this.polygonPath = null;
    }
    if (this.polygonPathVertices.length > 0) {
      this.polygonPathVertices.forEach(polyPathVertix => {
        polyPathVertix.setMap(null);
      });
      this.polygonPathVertices = [];
    }
  }

  createPolygonPath(polygonOptions?, drawVertix?) {
    google.maps.event.addListener(this.map, 'click', (event) => {
      if (this.isDrawAllow) {
        this.createPolyPathManual(event.latLng, polygonOptions, drawVertix);
      }
    });
  }
  createPolyPathManual(latLng, polygonOptions?, drawVertix?) {
    if (!this.polygonPath) {
      const defaultPolygonOptions = {
        strokeColor: '#000000',
        strokeOpacity: 1,
        strokeWeight: 3,
        icons: [{
          icon: this.lineSymbol,
          offset: '100%'
        }]
      };
      this.polygonPath = new google.maps.Polyline(polygonOptions || defaultPolygonOptions);
      this.polygonPath.setMap(this.map);
    }
    let path = this.polygonPath.getPath();
    path.push(latLng);
    drawVertix && this.polygonPathVertices.push(this.createSingleMarker(latLng));
    return this.polygonPath;
  }
  createPolyPathDetached(latLng, polygonOptions?, drawVertix?) {
    if (!this.poly) {
      const defaultPolygonOptions = {
        strokeColor: '#FF0000',
        strokeOpacity: 1,
        strokeWeight: 3,
        icons: [{
          icon: this.lineSymbol,
          offset: '100%'
        }]
      }
      this.poly = new google.maps.Polyline(polygonOptions || defaultPolygonOptions);
      this.poly.setMap(this.map);
    }
    let path = this.poly.getPath();
    path.push(this.createLatLng(latLng.lat, latLng.lng));
    drawVertix && this.polyVertices.push(this.createSingleMarker(latLng));
    return this.poly;
  }
  undoPolyPath(polyLine?) {
    let path = polyLine ? polyLine.getPath() : this.polygonPath.getPath();
    path.pop();
  }



  createPolyPathsManual(latLngsAll, afterClick?, drawVertix?) {
    latLngsAll.forEach((latLngAll) => {
      console.log("hereout");
      this.poly = null;
      this.polyVertices = [];
      latLngAll.latLngs.forEach((latLng) => {
        console.log("herein");
        this.createPolyPathDetached(latLng);
      });
      this.polygonPaths.push(this.poly);
      drawVertix && this.polygonPathsVertices.push(this.polyVertices);
      this.addListerner(this.poly, 'click', function (event) { afterClick(latLngAll, event); });
      console.log(this.polygonPaths);

    });
  }


  setMapType(typeIndex) {
    let types = ['roadmap', 'satellite', 'hybrid', 'terrain'];
    this.map.setMapTypeId(types[typeIndex]);
  }

  setBounds(latLng, reset = false) {
    if (!this.bounds) this.bounds = this.map.getBounds();
    this.bounds.extend(latLng);
    this.map.fitBounds(this.bounds);
  }
  getMapBounds() {
    if (this.map) {
      let boundsx = this.map.getBounds();
      let ne = boundsx.getNorthEast(); // LatLng of the north-east corner
      let sw = boundsx.getSouthWest(); // LatLng of the south-west corder
      let lat2 = ne.lat();
      let lat1 = sw.lat();
      let lng2 = ne.lng();
      let lng1 = sw.lng();
      return { lat1: lat1, lat2: lat2, lng1: lng1, lng2: lng2 };
    }
  }
  drawPolyMF(to) {
    if (!this.polygonPath) {
      this.polygonPath = new google.maps.Polyline({
        strokeColor: '#000000',
        strokeOpacity: 1,
        strokeWeight: 2,
        icons: [{
          icon: { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW },
          offset: '100%',
          repeat: '20px'
        }]
      });
      this.polygonPath.setMap(this.map);
    }
    var path = this.polygonPath.getPath();
    path.push(to);
  }
  createHeatMap(points, changeBounds = true) {
    var googlePoints = [];
    for (const point in points) {
      if (points.hasOwnProperty(point)) {
        const thisPoint = points[point];
        var latLng = this.getLatLngValue(thisPoint);
        var googleLatLng = this.createLatLng(latLng.lat, latLng.lng);
        googlePoints.push(googleLatLng);
        if (changeBounds)
          this.setBounds(googleLatLng);
      }
    }
    if (googlePoints.length != 0) {
      this.heatmap = new google.maps.visualization.HeatmapLayer({
        data: googlePoints,
        map: this.map
      });
    }
  }

  distanceBtTwoPoint(startLat, startLong, endLat, endLong) {
    return new Promise((resolve, reject) => {
      let origin = new google.maps.LatLng(startLat, startLong);
      let destination = new google.maps.LatLng(endLat, endLong);
      let service = new google.maps.DistanceMatrixService();
      service.getDistanceMatrix({
        origins: [origin],
        destinations: [destination],
        travelMode: 'DRIVING',
        avoidHighways: false,
        avoidTolls: false,
      }, (response, status) => {
        console.log("response:", response);

        if (status != google.maps.DistanceMatrixStatus.OK) {
          reject(-1)
        } else {
          resolve(response.rows[0].elements[0].distance.value);
        }
      });
    });
  }

  createMarkerCluster(markers, isShow: boolean, infoKeys) {
    let marker = [];
    for (let index = 0; index < markers.length; index++) {
      let displayText = '';
      let latLng = this.getLatLngValue(markers[index]);
      // let markerT = new google.maps.marker(latLng);
      if (typeof (infoKeys) == 'object') {
        infoKeys.map((display, indexx) => {
          if (indexx != infoKeys.length - 1) {
            displayText += this.common.ucWords(display) + " : " + markers[index][display] + ' <br> ';
          } else {
            displayText += this.common.ucWords(display) + " : " + markers[index][display];
          }
        });
      } else {
        displayText = this.common.ucWords(infoKeys) + " : " + markers[index][infoKeys];
      }

      var icon = {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 6,
        fillColor: "#FFFF00",
        fillOpacity: 0.8,
        strokeWeight: 1
      };

      let markert = new google.maps.Marker({
        position: latLng,
        title: displayText,
        // flat: true,
        icon: icon,
      });
      marker.push(markert);
    }
    if (this.cluster) this.cluster.clearMarkers();
    // if (!isShow) {
    //   this.markers.map(marker => marker.marker.setMap(this.mapService.map));
    //   return;
    // }
    let options = {
      gridSize: 40,
      maxZoom: 18,
      zoomOnClick: false,
      imagePath: "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m"
    };

    this.cluster = new MarkerClusterer(this.map, marker, options);
    google.maps.event.addListener(this.cluster, 'clusterclick', (cluster) => {
      console.log("cluster:", cluster.getMarkers());
      let content = '<div style="color:#000">' + cluster.getMarkers()
        .map((maker, index) => `${index + 1}. ${maker.title}`)
        .join('&nbsp;&nbsp;') + '</div>';
      console.log('content:', content);
      if (this.map.getZoom() <= this.cluster.getMaxZoom()) {
        if (!this.infoWindow)
          this.infoWindow = new google.maps.InfoWindow({ content });

        this.infoWindow.setContent(content);
        this.infoWindow.setPosition(cluster.getCenter());
        this.infoWindow.open(this.map, '');
      }
    });

  }

}