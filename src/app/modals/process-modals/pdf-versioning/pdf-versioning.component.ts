
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

  constructor(public activeModal: NgbActiveModal, public common: CommonService,) {
    console.log('common service', this.common.params);
    this.url = this.common.params.images;
    this.title = this.common.params['title'];
    //this.activeImage = this.images[this.index];
    console.log("🚀 ~ file: pdf-versioning.component.ts ~ line 68 ~ PdfVersioningComponent ~ constructor ~ images", this.images)
  }

  ngOnInit(): void {
    if (JSON.parse(localStorage.getItem('contents')) || JSON.parse(localStorage.getItem('rectangles'))) {
      localStorage.removeItem("contents");
      localStorage.removeItem("rectangles");
    }
    this.contents = JSON.parse(localStorage.getItem('contents')) || [];
    this.rectangles = JSON.parse(localStorage.getItem('rectangles')) || [];
  }

  ngAfterViewInit() {
    this.getPDF();
    this.freeCanvas = new fabric.Canvas('c', { selection: false });
    this.drawFree();
  }

  getPDF() {
    let url = 'https://elogist-prime.s3.ap-south-1.amazonaws.com/docs/202103/process_docs/194-attachment-1614664156.pdf';
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/pdf_worker/pdf.worker.js';
    // Asynchronous download of PDF
    let loadingTask = pdfjsLib.getDocument(url);
    loadingTask.promise.then((pdf) => {
      console.log("🚀 ~ file: toolbar.component.ts ~ line 76 ~ ToolbarComponent ~ loadingTask.promise.then ~ pdf", pdf)
      this.pdf = pdf;
      this.render();
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
      this.writeContents();
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
      radius: null
    }
    var drowType, rect, isDown, origX, origY;

    this.freeCanvas.on('mouse:down', (o) => {
      console.log("🚀 ~ file: toolbar.component.ts ~ line 162 ~ ToolbarComponent ~ this.freeCanvas.on ~ o", o)
      if (!this.selectedAction) return;
      console.log('seletecaction:', this.selectedAction)
      isDown = true;
      var pointer = this.freeCanvas.getPointer(o.e);
      console.log("🚀 ~ file: toolbar.component.ts ~ line 167 ~ ToolbarComponent ~ this.freeCanvas.on ~ pointer", pointer)
      origX = pointer.x;
      origY = pointer.y;
      var pointer = this.freeCanvas.getPointer(o.e);
      switch (this.selectedAction) {
        case 'RA' && 'TX':
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

          data = {
            x: origX,
            y: origY,
            width: pointer.x - origX,
            height: pointer.y - origY,
            radius: null
          }
          break;

        case 'CR':
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
            hasControls: false
          });

          data = {
            x: origX,
            y: origY,
            width: pointer.x - origX,
            height: pointer.y - origY,
            radius: o.radius
          }
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
        case 'RA' && 'TX':
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

    this.freeCanvas.on('mouse:up', (o) => {
      if (!this.selectedAction) return;
      isDown = false;
      this.freeCanvas.clear();
      if (data.x) {
        data.x = data.x / this.zoom;
        data.y = data.y / this.zoom;
        data.width = data.width / this.zoom;
        data.height = data.height / this.zoom;
        data.radius = data.radius / this.zoom;
        this.cordinates = data;
        this.handlerSelection(data);
      }
      this.freeCanvas.off('mouse:down');
      this.freeCanvas.off('mouse:move');
      this.freeCanvas.off('mouse:up');
    });
  }

  handlerSelection(data) {
    console.log('____handlerSelection');
    if (this.selectedAction === 'TX') {
      let ele = document.getElementById('editor');
      this.isShow.textbox = true;
      ele.style.top = this.cordinates.y * this.zoom + 'px';
      ele.style.left = this.cordinates.x * this.zoom + 'px';
      let ele2 = document.getElementById('editor-box');
      ele2.style.width = this.cordinates.width * this.zoom + 'px';
      ele2.style.height = this.cordinates.height * this.zoom + 'px';
    } else if (this.selectedAction === 'RA') {
      this.rectangles.push(data);
      localStorage.setItem('rectangles', JSON.stringify(this.rectangles));
      data = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        radius: 0
      }
    } else if (this.selectedAction === 'CR') {
      this.circles.push(data);
      console.log('circles', this.circles)
      localStorage.setItem('circles', JSON.stringify(this.circles));
      data = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        radius: 0
      }
    }
    // this.drawRectangles();
    // this.drawCircles();
    this.drawCanwas();
  }

  drawCanwas() {
    this.freeCanvas.clear();
    if (this.rectangles.length > 0) {
      this.freeCanvas.setHeight(792 * this.zoom);
      this.freeCanvas.setWidth(612 * this.zoom);

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
          transparentCorners: false
        });

        this.freeCanvas.add(rect);
      })
    }


    if (this.circles.length > 0) {
      this.freeCanvas.setHeight(792 * this.zoom);
      this.freeCanvas.setWidth(612 * this.zoom);

      this.circles.map(circle => {
        let crcl = new fabric.Circle({
          left: circle.x * this.zoom,
          top: circle.y * this.zoom,
          originX: 'center',
          originY: 'center',
          fill: 'rgba(255,0,0,0.5)',
          radius: circle.radius * this.zoom,
          selectable: true,
        });

        this.freeCanvas.add(crcl);
      })
    }
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
      with: this.cordinates.width,
      height: this.cordinates.height,
    };
    console.log('data:', data);
    this.contents.push(data);
    localStorage.setItem('contents', JSON.stringify(this.contents))
    this.writeContents();
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
    this.activeModal.close(res);
  }
}