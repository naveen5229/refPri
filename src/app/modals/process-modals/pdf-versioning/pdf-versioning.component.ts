
import { Component, OnInit } from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
// import { TextLayerBuilder } from 'pdfjs-dist/lib/web/text_layer_builder';
// import * as $ from 'jquery'
import { fabric } from 'fabric';
import jspdf from 'jspdf';
import html2canvas from 'html2canvas';
import { literalMap } from '@angular/compiler';
import { CommonService } from '../../../Service/common/common.service';
import { ApiService } from '../../../Service/Api/api.service';
import { UserService } from '../../../Service/user/user.service';
import { filter } from 'rxjs/operators';
import { ConfirmComponent } from '../../confirm/confirm.component';
import _ from 'lodash';

@Component({
  selector: 'ngx-pdf-versioning',
  templateUrl: './pdf-versioning.component.html',
  styleUrls: ['./pdf-versioning.component.scss']
})
export class PdfVersioningComponent implements OnInit {
  selectedAction: 'TX' | 'RA' | 'CR' | 'LN' | '' = '';
  pdf = null;
  currentPage = 1;
  zoomPercent: string = '1';
  zoom = 1;
  isDisplayBox = false;
  records = []
  xPos = 0;
  yPos = 0;
  content = '';
  isTextLayerSet = false;
  counter = 0;
  cValues = {
    width: 0,
    height: 0
  }
  zoomer = 5;
  // rectangles = JSON.parse(localStorage.getItem('rectangles')) || [];
  rectangles = [];
  circles = [];
  freeCanvas: any = null;
  editorContent = "";
  isShow = {
    textbox: false,
  }
  // contents = JSON.parse(localStorage.getItem('contents')) || [];
  contents = [];
  cordinates = {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  }
  imageList;
  isDownload = false;
  images = null;
  index = 0;
  activeImage = '';
  title = '';
  url = '';
  docId = null;
  versioningDataInitTime = [];
  versioningDataModifiTime = [];
  userTable = [];
  chronologyTable = [];
  collapse = 'user';
  userFilter = [];
  choronolgyFilter = [];

  constructor(public activeModal: NgbActiveModal, public common: CommonService, public api: ApiService, public userService: UserService, public modalService: NgbModal) {
    console.log('common service', this.common.params);
    this.url = this.common.params.images;
    this.title = this.common.params['title'];
    this.docId = this.common.params['docId'];
    //this.activeImage = this.images[this.index];
    console.log('user_detail', this.userService._details)
    console.log("🚀 ~ file: pdf-versioning.component.ts ~ line 68 ~ PdfVersioningComponent ~ constructor ~ images", this.images);
    this.getLoadedVersioning();
  }

  ngOnInit(): void {
    // if (JSON.parse(localStorage.getItem('contents')) || JSON.parse(localStorage.getItem('rectangles'))) {
    //   localStorage.removeItem("contents");
    //   localStorage.removeItem("rectangles");
    // }
    // this.contents = JSON.parse(localStorage.getItem('contents')) || [];
    // this.rectangles = JSON.parse(localStorage.getItem('rectangles')) || [];
  }

  ngAfterViewInit() {
    this.getPDF();
    this.freeCanvas = new fabric.Canvas('c', { selection: false });
    this.drawFree();
  }

  selectAction(type: 'TX' | 'RA' | 'CR' | 'LN' | '') {
    if (this.selectedAction == type) {
      this.selectedAction = ''
    } else {
      this.selectedAction = type;
    }
  }

  getLoadedVersioning() {
    this.api.get(`Admin/getPdfVersioningByDocId?docId=${this.docId}`).subscribe(res => {
      if (res['code'] > 0) {
        if (res['data'] && res['data'].length > 0) {
          this.versioningDataInitTime = res['data'].map(ele => {
            return {
              addtime: this.common.dateFormatter(ele.addtime),
              aduser_id: ele.aduser_id,
              entrymode: ele.entrymode,
              height: parseFloat(ele.height),
              id: ele.id,
              radius: ele.radius ? parseFloat(ele.radius) : null,
              text: ele.text,
              type: ele.type,
              updatetime: ele.updatetime,
              user: ele.user,
              width: parseFloat(ele.width),
              x: parseFloat(ele.x),
              y: parseFloat(ele.y),
              selectable: false
            }
          });
          this.versioningDataModifiTime = JSON.parse(JSON.stringify(this.versioningDataInitTime));

          this.getUserFilterFields(this.versioningDataInitTime);
          this.getChronologyFilterFields(this.versioningDataInitTime);
          console.log("userTable", this.userTable, this.userFilter);
          this.distributeCanvas(this.versioningDataInitTime);
        }
        console.log(this.contents, this.rectangles, this.circles);
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  getUserFilterFields(versioningData) {
    this.userTable = [];
    this.userFilter = [];
    versioningData.forEach(element => {
      this.userTable.push({ userId: element.aduser_id, user: element.user, addTime: element.addtime, type: element.type });
    });
    this.userTable = this.common.arrayUnique(this.userTable, 'userId');
    this.userTable.map(id => this.userFilter.push(id.userId));
  }

  getChronologyFilterFields(versioningData) {
    console.log(" versioningData", versioningData)
    this.chronologyTable = [];
    // this.chronologyTable = versioningData.filter(a => {
    //   var key = a.aduser_id + '|' + a.addtime;
    //   console.log('here me key',key,this[key])
    //   if (!this[key]) {
    //     this[key] = true;
    //     return true;
    //   }
    // }, Object.create(null));
    this.chronologyTable = _.uniqBy(versioningData, (x) => x.aduser_id && x.addtime);
    console.log('chronology filter:', this.chronologyTable);
  }

  distributeCanvas(distributionArray) {
    this.contents = [];
    this.rectangles = [];
    this.circles = [];
    distributionArray.map(plotted => {
      switch (plotted.type) {
        case 'text': this.contents.push(plotted);
          break;
        case 'rectangle': this.rectangles.push(plotted);
          break;
        case 'circle': this.circles.push(plotted);
          break;
      }
    });
    this.drawCanwas();
  }

  getPDF() {
    let url = this.url;
    // console.log('me hu url', url);
    // let url = 'https://elogist-prime.s3.ap-south-1.amazonaws.com/docs/202103/process_docs/194-attachment-1614664156.pdf';
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'assets/pdf_worker/pdf.worker.js';
    // Asynchronous download of PDF
    let loadingTask = pdfjsLib.getDocument(url);
    loadingTask.promise.then((pdf) => {
      console.log("🚀 ~ file: toolbar.component.ts ~ line 76 ~ ToolbarComponent ~ loadingTask.promise.then ~ pdf", pdf)
      this.pdf = pdf;
      this.render();
    }, error => {
      console.log("getPDF::", error);
    })
  }

  render() {
    this.pdf.getPage(this.currentPage).then((page) => {
      console.log('page:', page)
      let canvas: any = document.getElementById("pdf_renderer");
      let ctx = canvas.getContext('2d');

      let viewport = page.getViewport({ scale: this.zoom });

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      this.cValues.width = viewport.width;
      this.cValues.height = viewport.height;


      let renderTask = page.render({
        canvasContext: ctx,
        viewport: viewport
      });
      // this.drawRectangles();
      this.drawCanwas();
      // this.writeContents();
    });
  }


  goPrevious() {
    if (this.pdf == null || this.currentPage == 1)
      return;
    this.currentPage -= 1;
    this.render();
  }

  goNext() {
    if (this.pdf == null || this.currentPage > this.pdf._pdfInfo.numPages)
      return;
    this.currentPage += 1;
    this.render();
  }

  currentPageHandling(e) {
    if (this.pdf == null) return;

    // Get key code
    var code = (e.keyCode ? e.keyCode : e.which);

    // If key code matches that of the Enter key
    if (code == 13) {
      if (this.currentPage >= 1 && this.currentPage <= this.pdf._pdfInfo.numPages) {
        this.render();
      } else {
        this.currentPage = 1;
        this.render();
      }
    }
  }

  zoomIn() {
    if (this.pdf == null) return;
    this.zoom += 0.50;
    this.zoom = parseFloat(this.zoom.toFixed(2));
    this.counter++;
    this.render();
  }

  zoomOut() {
    if (this.pdf == null) return;
    this.zoom -= 0.50;
    this.zoom = parseFloat(this.zoom.toFixed(2));
    this.counter--;
    this.render();
  }


  drawFree() {
    let data = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      radius: null,
      type: null,
      aduser_id: null,
      addtime: null,
      user: null,
      selectable: true
    }
    var drowType, rect, isDown, origX, origY;



    this.freeCanvas.on('mouse:down', (o) => {
      // console.log('this.rectangles', this.rectangles);
      console.log("mouse:down", o)
      if (!this.selectedAction) { return; }
      // return this.activeObj = { x: this.freeCanvas.getActiveObject().left, y: this.freeCanvas.getActiveObject().top, radius: this.freeCanvas.getActiveObject().radius };
      // } else {
      //   if (o.target)
      //     return this.activeObj = { x: this.freeCanvas.getActiveObject().left, y: this.freeCanvas.getActiveObject().top, radius: this.freeCanvas.getActiveObject().radius };
      // };
      console.log('seletecaction:', this.selectedAction)
      isDown = true;
      var pointer = this.freeCanvas.getPointer(o.e);
      origX = pointer.x;
      origY = pointer.y;

      switch (this.selectedAction) {
        case 'TX':
          data = {
            x: origX,
            y: origY,
            width: pointer.x - origX,
            height: pointer.y - origY,
            radius: null,
            type: 'text',
            aduser_id: this.userService._details.id,
            addtime: this.common.dateFormatter(this.common.getDate()),
            user: this.userService._details.name,
            selectable: true
          }

          drowType = new fabric.Rect({
            left: origX,
            top: origY,
            originX: 'left',
            originY: 'top',
            width: pointer.x - origX,
            height: pointer.y - origY,
            angle: 0,
            fill: 'rgba(255,255,255,0.1)',
            transparentCorners: false,
            stroke: 'black',
            strokeWidth: 0.3,
          });


          break;


        case 'RA':
          let id = 'index_' + this.rectangles.length;
          data = {
            x: origX,
            y: origY,
            width: pointer.x - origX,
            height: pointer.y - origY,
            radius: null,
            type: 'rectangle',
            aduser_id: this.userService._details.id,
            addtime: this.common.dateFormatter(this.common.getDate()),
            user: this.userService._details.name,
            selectable: true
            // id: id
          }

          drowType = new fabric.Rect({
            left: origX,
            top: origY,
            originX: 'left',
            originY: 'top',
            width: pointer.x - origX,
            height: pointer.y - origY,
            angle: 0,
            fill: 'rgba(255,255,255,0.1)',
            transparentCorners: false,
            stroke: 'black',
            strokeWidth: 0.3,
          });

          break;

        case 'CR':
          data = {
            x: origX,
            y: origY,
            width: pointer.x - origX,
            height: pointer.y - origY,
            radius: o.radius,
            type: 'circle',
            aduser_id: this.userService._details.id,
            addtime: this.common.dateFormatter(this.common.getDate()),
            user: this.userService._details.name,
            selectable: true
          }
          drowType = new fabric.Circle({
            left: origX,
            top: origY,
            radius: 1,
            fill: 'rgba(255,255,255,0.1)',
            selectable: true,
            originX: 'center',
            originY: 'center',
            stroke: 'black',
            strokeWidth: 0.3,
            hasControls: false,
          });

          drowType.hasRotatingPoint = true;
          console.log("🚀 ~ file: toolbar.component.ts ~ line 200 ~ ToolbarComponent ~ this.freeCanvas.on ~ drowType", drowType, data)
          break;
      }
      // rect = new fabric.Rect({
      //   left: origX,
      //   top: origY,
      //   originX: 'left',
      //   originY: 'top',
      //   width: pointer.x - origX,
      //   height: pointer.y - origY,
      //   angle: 0,
      //   fill: 'rgba(255,255,255,0.1)',
      //   transparentCorners: false,
      //   stroke: 'black',
      //   strokeWidth: 0.3
      // });

      this.freeCanvas.add(drowType);
    });

    this.freeCanvas.on('mouse:move', (o) => {
      // console.log("🚀 ~ file: toolbar.component.ts ~ line 226 ~ ToolbarComponent ~ this.freeCanvas.on ~ o", o)
      if (!isDown || !this.selectedAction) return;
      var pointer = this.freeCanvas.getPointer(o.e);

      switch (this.selectedAction) {
        case 'TX':
          if (origX > pointer.x) {
            data.x = Math.abs(pointer.x);
            drowType.set({ left: Math.abs(pointer.x) });
          }
          if (origY > pointer.y) {
            data.y = Math.abs(pointer.y);
            drowType.set({ top: Math.abs(pointer.y) });
          }
          data.width = Math.abs(origX - pointer.x);
          data.height = Math.abs(origY - pointer.y);

          drowType.set({ width: Math.abs(origX - pointer.x) });
          drowType.set({ height: Math.abs(origY - pointer.y) });
          break;

        case 'RA':
          if (origX > pointer.x) {
            data.x = Math.abs(pointer.x);
            drowType.set({ left: Math.abs(pointer.x) });
          }
          if (origY > pointer.y) {
            data.y = Math.abs(pointer.y);
            drowType.set({ top: Math.abs(pointer.y) });
          }
          data.width = Math.abs(origX - pointer.x);
          data.height = Math.abs(origY - pointer.y);

          drowType.set({ width: Math.abs(origX - pointer.x) });
          drowType.set({ height: Math.abs(origY - pointer.y) });
          break;

        case 'CR':
          data.radius = Math.abs(origX - pointer.x);

          drowType.set({ radius: Math.abs(origX - pointer.x) });
          break
      }



      this.freeCanvas.renderAll();
    });


    // this.freeCanvas.on("object:scaling", function (e) {
    //   console.log("scaling", e)
    //   console.log('this.rectangles', this.rectangles);

    // });

    // this.freeCanvas.on("object:moved", (e) => {
    //   console.log("moved", e);
    //   console.log('thi', this.freeCanvas.getActiveObject());

    // });


    this.freeCanvas.on("object:modified", (e) => {
      console.log("modified", e)
      if (!this.selectedAction) {
        // return ((e.target.data.radius) ? this.manageCircles(data, e) : this.manageRectangles(data, e));
        if (e.target.data.type === 'circle') {
          this.manageCircles(data, e);
        } else if (e.target.data.type === 'rectangle') {
          this.manageRectangles(data, e);
        } else if (e.target.data.type === 'text') {
          this.manageText(data, e);
        }
      };
    });

    this.freeCanvas.on('text:changed', (opt) => {
      var t1 = opt.target;
      console.log("t1", t1);
      if (t1.data.aduser_id === this.userService._details.id) {
        this.contents.forEach(ele => {
          if (ele.x === t1.data.x && ele.y === t1.data.y) {
            console.log('true match');
            ele.text = t1.text;
          }
        });
        console.log('content', this.contents);
      }
      // if (t1.width > t1.fixedWidth) {
      //   t1.fontSize *= t1.fixedWidth / (t1.width + 1);
      //   t1.width = t1.fixedWidth;
      // }
    });

    this.freeCanvas.on('mouse:up', (o) => {
      // console.log("mouse:up", o)
      // this.pushState = (o.target) ? false : true;
      // if (!this.selectedAction) {
      //   (data.radius) ? this.manageCircles(data, o) : this.manageRectangles(data, o);
      //   return;
      // };
      if (!this.selectedAction || o.target) return;
      isDown = false;
      this.freeCanvas.clear();
      if (data.x) {
        data.x = data.x / this.zoom;
        data.y = data.y / this.zoom;
        data.width = data.width / this.zoom;
        data.height = data.height / this.zoom;
        data.radius = data.radius / this.zoom;
        this.cordinates = data;
        this.handlerSelection(data, o);
      }
    });
  }

  handlerSelection(data, updatePointer) {
    console.log('____handlerSelection', data, updatePointer);
    if (this.selectedAction === 'TX') {
      let ele = document.getElementById('editor');
      this.isShow.textbox = true;
      ele.style.top = this.cordinates.y * this.zoom + 'px';
      ele.style.left = this.cordinates.x * this.zoom + 'px';
      let ele2 = document.getElementById('editor-box');
      ele2.style.width = this.cordinates.width * this.zoom + 'px';
      ele2.style.height = this.cordinates.height * this.zoom + 'px';
    } else if (this.selectedAction === 'RA') {
      this.manageRectangles(data, updatePointer);
    } else if (this.selectedAction === 'CR') {
      this.manageCircles(data, updatePointer);
    }
    this.drawCanwas();
    // this.drawRectangles();
    // this.drawCircles();
    // this.drawCanwas();
  }

  manageRectangles(data, updatePointer) {
    // if (this.pushState) {
    //   this.rectangles.push(data);
    // } else {
    var targetCanvas = updatePointer.target;
    (this.rectangles.length && targetCanvas) ?
      this.rectangles.forEach(ele => {
        // var pointer = this.freeCanvas.getPointer(updatePointer.e);
        // console.log("🚀 ~ file: pdf-versioning.component.ts ~ line 381 ~ PdfVersioningComponent ~ manageRectangles ~ pointer", updatePointer, this.activeObj, pointer)
        console.log("targetCanvas", targetCanvas);
        if (ele.x === targetCanvas.data.x && ele.y === targetCanvas.data.y) {
          console.log('scale:', updatePointer.target.scaleX, updatePointer.target.scaleY)
          ele.x = targetCanvas.left;
          ele.y = targetCanvas.top;
          ele.width = (targetCanvas.scaleX) ? (Math.abs(ele.width * targetCanvas.scaleX)) / this.zoom : ele.width;
          ele.height = (targetCanvas.scaleY) ? (Math.abs(ele.height * targetCanvas.scaleY)) / this.zoom : ele.height;
        }
      }) :
      // this.rectangles.push(data);
      this.versioningDataModifiTime.push(data);
    this.distributeCanvas(this.versioningDataModifiTime);
    this.getUserFilterFields(this.versioningDataModifiTime);
    this.getChronologyFilterFields(this.versioningDataModifiTime);
    // }
    console.log('rectangles', this.rectangles);
    localStorage.setItem('rectangles', JSON.stringify(this.rectangles));
    data = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      radius: 0
    }
  }

  manageText(data, updatePointer) {
    var targetCanvas = updatePointer.target;
    if(this.contents.length && targetCanvas){
      this.contents.forEach(ele => {
        console.log("targetCanvas", targetCanvas);
        if (ele.x === targetCanvas.data.x && ele.y === targetCanvas.data.y) {
          console.log('scale:', updatePointer.target.scaleX, updatePointer.target.scaleY)
          ele.x = targetCanvas.left;
          ele.y = targetCanvas.top;
          ele.width = (targetCanvas.scaleX) ? (Math.abs(ele.width * targetCanvas.scaleX)) / this.zoom : ele.width;
          ele.height = (targetCanvas.scaleY) ? (Math.abs(ele.height * targetCanvas.scaleY)) / this.zoom : ele.height;
        }
      })
    }
    console.log('contents', this.contents);
  }

  manageCircles(data, updatePointer) {
    // if (this.pushState) {
    //   this.circles.push(data);
    // } else {
    var targetCanvas = updatePointer.target;
    (this.circles.length && targetCanvas) ? this.circles.forEach(ele => {
      // var pointer = this.freeCanvas.getPointer(updatePointer.e);
      if (targetCanvas && ele.x === targetCanvas.data.x && ele.y === targetCanvas.data.y && ele.radius === targetCanvas.data.radius) {
        ele.x = targetCanvas.left;
        ele.y = targetCanvas.top;
      }
    }) :
      // this.circles.push(data);
      this.versioningDataModifiTime.push(data);
    this.distributeCanvas(this.versioningDataModifiTime);
    this.getUserFilterFields(this.versioningDataModifiTime);
    this.getChronologyFilterFields(this.versioningDataModifiTime);    // }
    console.log('circles', this.circles);
    localStorage.setItem('circles', JSON.stringify(this.circles));
    data = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      radius: 0
    }
  }

  drawCanwas() {
    this.freeCanvas.clear();
    this.freeCanvas.setHeight(792 * this.zoom);
    this.freeCanvas.setWidth(612 * this.zoom);

    if (this.rectangles.length > 0) {
      this.rectangles.map(rectangle => {
        let rect = new fabric.Rect({
          left: rectangle.x * this.zoom,
          top: rectangle.y * this.zoom,
          originX: 'left',
          originY: 'top',
          width: rectangle.width * this.zoom,
          height: rectangle.height * this.zoom,
          angle: 0,
          fill: 'rgba(255,0,0,0.5)',
          transparentCorners: false,
          selectable: rectangle.selectable,
          data: rectangle,
          // name: 'jrx',
          // includeDefaultValues: true,
          // id: 1
        });

        this.freeCanvas.add(rect);
      })
    }


    if (this.circles.length > 0) {
      this.circles.map(circle => {
        let crcl = new fabric.Circle({
          left: circle.x * this.zoom,
          top: circle.y * this.zoom,
          originX: 'center',
          originY: 'center',
          fill: 'rgba(255,0,0,0.5)',
          radius: circle.radius * this.zoom,
          selectable: circle.selectable,
          data: circle,
        });

        this.freeCanvas.add(crcl);
      })
    }

    // (this.contents.length > 0) ? this.writeContents() : null;
    if (this.contents.length > 0) {
      this.contents.map(content => {
        var textbox = new fabric.Textbox(content.text, {
          height: content.height,
          width: content.width,
          editable: content.selectable,
          selectable: content.selectable,
          top: content.y,
          left: content.x,
          fontSize: 16,
          textAlign: 'center',
          data: content
        });
        this.freeCanvas.add(textbox);
      });
    }
    this.selectedAction = '';
  }

  // drawRectangles() {
  //   this.freeCanvas.clear();
  //   this.freeCanvas.setHeight(792 * this.zoom);
  //   this.freeCanvas.setWidth(612 * this.zoom);

  //   this.rectangles.map(rectangle => {
  //     let rect = new fabric.Rect({
  //       left: rectangle.x * this.zoom,
  //       top: rectangle.y * this.zoom,
  //       originX: 'left',
  //       originY: 'top',
  //       width: rectangle.width * this.zoom,
  //       height: rectangle.height * this.zoom,
  //       angle: 0,
  //       fill: 'rgba(255,0,0,0.5)',
  //       transparentCorners: false
  //     });

  //     this.freeCanvas.add(rect);
  //   })
  // }

  // drawCircles() {
  //   this.freeCanvas.clear();
  //   this.freeCanvas.setHeight(792 * this.zoom);
  //   this.freeCanvas.setWidth(612 * this.zoom);
  //   this.freeCanvas.set({ radius: 12 })

  //   this.circles.map(circle => {
  //     let crcl = new fabric.Circle({
  //       left: circle.x * this.zoom,
  //       top: circle.y * this.zoom,
  //       originX: 'center',
  //       originY: 'center',
  //       fill: 'rgba(255,0,0,0.5)',
  //       radius: circle.radius * this.zoom,
  //       selectable: true,
  //     });

  //     this.freeCanvas.add(crcl);
  //   })
  // }

  writeContents() {
    let ele = document.getElementById('ctx');
    ele.innerHTML = '';

    this.contents.map(content => {
      let div = document.createElement('div');
      div.style.position = 'absolute';
      div.style.top = content.y * this.zoom + 'px';
      div.style.left = content.x * this.zoom + 'px';
      div.style.width = content.width * this.zoom + 'px';
      div.style.height = content.height * this.zoom + 'px';
      div.style.fontSize = 12 * this.zoom + 'px';
      // div.style.color = 'Yellow';
      div.style.fontWeight = 'bold';
      // div.style.zIndex = '999999999';
      div.innerHTML = content.text;
      div.className = 'content-div';
      // div.style.background = "#fff";
      ele.appendChild(div);
    });
  }

  saveContent(event) {
    event.preventDefault();
    event.stopPropagation();
    let data = {
      text: this.editorContent,
      x: this.cordinates.x,
      y: this.cordinates.y,
      width: this.cordinates.width,
      height: this.cordinates.height,
      type: 'text',
      aduser_id: this.userService._details.id,
      addtime: this.common.dateFormatter(this.common.getDate()),
      user: this.userService._details.name,
      selectable: true
    };
    console.log('data:', data);
    // this.contents.push(data);
    this.versioningDataModifiTime.push(data);
    this.distributeCanvas(this.versioningDataModifiTime);
    this.getUserFilterFields(this.versioningDataModifiTime);
    this.getChronologyFilterFields(this.versioningDataModifiTime);
    localStorage.setItem('contents', JSON.stringify(this.contents))
    // this.writeContents();
    this.drawCanwas();
    this.clearContents(event);
  }

  clearContents(event) {
    event.preventDefault();
    event.stopPropagation();
    this.cordinates = {
      x: 0,
      y: 0,
      width: 0,
      height: 0
    };
    this.isShow.textbox = false;
    this.editorContent = '';
    let ele: any = document.getElementById('editor-box');
    ele.innerText = '';
  }

  checkValues(event) {
    console.log('event', event);
  }

  handleZoom() {
    if (this.pdf == null) return;
    this.zoom = parseFloat(this.zoomPercent);
    this.zoom = parseFloat(this.zoom.toFixed(2));
    this.counter++;
    this.render();
  }

  closeModal(res) {
    if (this.versioningDataModifiTime.length > this.versioningDataInitTime.length) {
      this.common.params = {
        title: 'Save',
        description: `<b>&nbsp;` + 'Would You Like To Save Changes' + `<b>`,
        btn1: 'Save',
        btn2: 'Close'
      }

      const activeModal = this.modalService.open(ConfirmComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
      activeModal.result.then(data => {
        console.log(data);
        if (data.response) {
          this.saveDocVersioning();
        } else {
          if (data.apiHit === 0) this.activeModal.close(res);
        }
      });
    } else {
      this.activeModal.close(res);
    }
    // this.activeModal.close(res);
  }


  saveDocVersioning() {
    if (this.versioningDataInitTime.length > 0) {
      for (var i = this.versioningDataModifiTime.length - 1; i >= 0; i--) {
        for (var j = 0; j < this.versioningDataInitTime.length; j++) {
          if (this.versioningDataModifiTime[i] && (this.versioningDataModifiTime[i].id === this.versioningDataInitTime[j].id)) {
            this.versioningDataModifiTime.splice(i, 1);
          }
        }
      }
    }
    console.log(this.versioningDataModifiTime, 'filtered');
    // return;

    if (this.docId) {
      let params = {
        docId: this.docId,
        requestId: null,
        // info: JSON.stringify(this.contents.concat(this.circles, this.rectangles)),
        info: JSON.stringify(this.versioningDataModifiTime)
      }
      console.log("params", params);
      // return;
      this.common.loading++;
      this.api.post('Admin/savePdfVersioningByDocId', params).subscribe(res => {
        this.common.loading--;
        if (res['code'] == 1) {
          if (res['data'][0].y_id > 0) {
            this.common.showToast(res['msg']);
            // this.getProcessLeadByType(type);
            this.getLoadedVersioning();
            this.activeModal.close(res);
          } else {
            this.common.showError(res['msg']);
          }
        } else {
          this.common.showError(res['msg']);
        }
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
    } else {
      this.common.showError("Document ID Not Available");
    }
  }

  filterUserWise(user, isChecked) {
    console.log("isChecked", isChecked, this.versioningDataModifiTime)
    if (isChecked) {
      this.userFilter.push(user.userId);
    } else {
      if (this.userFilter.length > 0) {
        let findExist = this.userFilter.indexOf(user.userId);
        if (findExist >= 0) {
          this.userFilter.splice(findExist, 1);
        }
      }
    }
    console.log('userFilter:', this.userFilter)
    let filteredCanvas = this.versioningDataModifiTime.filter(ele => { return this.userFilter.includes(ele.aduser_id) });
    console.log("filteredCanvas", filteredCanvas)
    this.distributeCanvas(filteredCanvas);
  }

  filterChronoligyWise(filterObj, isChecked) {
    console.log("isChecked", filterObj, isChecked, this.versioningDataModifiTime)
    if (isChecked) {
      this.choronolgyFilter.push({ userId: filterObj.aduser_id, addtime: filterObj.addtime });
    } else {
      if (this.choronolgyFilter.length > 0) {
        let findExist = this.choronolgyFilter.findIndex(ele => (ele.userId === filterObj.aduser_id && ele.addtime.match(filterObj.addtime)));
        if (findExist >= 0) {
          this.choronolgyFilter.splice(findExist, 1);
        }
      }
    }
    console.log('choronolgyFilter:', this.choronolgyFilter);
    let filteredCanvas = [];
    if (this.choronolgyFilter.length > 0) {
      filteredCanvas = this.versioningDataModifiTime.filter(ele => {
        return this.choronolgyFilter.some((fil) => {
          return fil.userId === ele.aduser_id && fil.addtime === ele.addtime;
        });
      });
    } else {
      filteredCanvas = this.versioningDataModifiTime;
    }
    console.log("filteredCanvas", filteredCanvas)
    this.distributeCanvas(filteredCanvas);
  }
}
