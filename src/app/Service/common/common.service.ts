import { Injectable } from '@angular/core';
import { NbGlobalPhysicalPosition, NbToastrService } from '@nebular/theme';
import { DatePipe } from '@angular/common';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import { Angular5Csv } from "angular5-csv/dist/Angular5-csv";
import { Router } from '@angular/router';
import { ApiService } from '../../Service/Api/api.service';
import { DomSanitizer } from '@angular/platform-browser';

// import { Http, Headers } from '@angular/http';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  loading = 0;
  refresh = null;
  tempLineBreak = {};

  params = null;
  taskBgColor = {
    pending: "#fff",
    ack: "yellow",
    complete: "#32cd32b3",
    reject: "red",
    hold: "antiquewhite",
  }
  constructor(private toastrService: NbToastrService,
    private datePipe: DatePipe,public router: Router, public api: ApiService, private sanitizer: DomSanitizer) { }

  showError(msg?, err?) {
    let message = msg || 'Something went wrong! try again.';
    message += err ? ' Error Code: ' + err.status : '';
    this.showToast(message, "danger");
  }
  generateArray(length) {
    let generatedArray = [];
    for (let i = 0; i < length; i++) {
      generatedArray.push(i + 1);
    }
    return generatedArray;
  }
  showToast(body, type?, duration?, title?) {
    // toastTypes = ["success", "info", "warning", "primary", "danger", "default"]
    const config = {
      status: type || "success",
      destroyByClick: true,
      duration: duration || 5000,
      hasIcon: true,
      position: NbGlobalPhysicalPosition.TOP_RIGHT,
      preventDuplicates: false
    };
    this.toastrService.show(body, title || "Alert", config);
  }


  loaderHandling(action = 'hide') {
    if (this.loading == 0 && action == 'hide') return;
    else if (this.loading < 0) {
      this.loading = 0;
      return;
    } else if (action == 'show') this.loading++;
    else this.loading--;
  }

  ucWords(str) {
    str = str.toLowerCase();
    var words = str.split(' ');
    str = '';
    for (var i = 0; i < words.length; i++) {
      var word = words[i];
      word = word.charAt(0).toUpperCase() + word.slice(1);
      if (i > 0) { str = str + ' '; }
      str = str + word;
    }
    return str;
  }
  downloadPdf(divId, isLandscape?) {
    // this.loading++;
    console.log("loder++");

    var data = document.getElementById(divId);
    console.log(data);
    html2canvas(data, {
      useCORS: true,
      scale: 2
    }).then(canvas => {
      var imgData = canvas.toDataURL('image/png');
      // var imgWidth = isLandscape ? 295 : 208;
      // var pageHeight = isLandscape ? 208 : 295;
      // let imgHeight = isLandscape ? 208 : 295;
      // var heightLeft = imgHeight;

      var imgWidth = 210;
      var pageHeight = 295;
      var imgHeight = canvas.height * imgWidth / canvas.width;
      var heightLeft = imgHeight;

      let doc = new jsPDF(isLandscape ? 'l' : 'p', 'mm', 'a4');
      var position = 0;

      doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      console.log(heightLeft);
      heightLeft -= pageHeight;
      console.log(heightLeft);
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        doc.addPage();
        doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      doc.save('file.pdf');
      console.log("loder--");
      this.loading--;
      this.showToast("pdf sucessfully download");
    });

  }
  handleModalSize(type, name, size, sizeType = "px", position = 0) {
    setTimeout(() => {
      if (type == "class" && document.getElementsByClassName(name)[position]) {
        if (document.getElementsByClassName(name)[position]["style"]) {
          document.getElementsByClassName(name)[position]["style"].maxWidth =
            size + sizeType;
        }
      }
    }, 10);
  }
  handleModalheight(type, name, size, sizeType = "px", position = 0) {
    setTimeout(() => {
      if (type == "class") {
        document.getElementsByClassName(name)[position]["style"].minHeight =
          size + sizeType;
      }
    }, 10);
  }

  dateFormatter(date, type = "YYYYMMDD", isTime = true, separator = "-") {
    let d = new Date(date);
    let year = d.getFullYear();
    let month = d.getMonth() < 9 ? "0" + (d.getMonth() + 1) : d.getMonth() + 1;
    let dat = d.getDate() <= 9 ? "0" + d.getDate() : d.getDate();

    // console.log(dat + separator + month + separator + year);
    if (type == "ddMMYYYY") {
      return (
        year +
        separator +
        month +
        separator +
        dat +
        (isTime ? " " + this.timeFormatter(date) : "")
      );
    } else {
      return (
        year +
        separator +
        month +
        separator +
        dat +
        (isTime ? " " + this.timeFormatter(date) : "")
      );
    }
  }

  dateFormatter1(date) {
    let d = new Date(date);
    let year = d.getFullYear();
    let month = d.getMonth() < 9 ? "0" + (d.getMonth() + 1) : d.getMonth() + 1;
    let dat = d.getDate() <= 9 ? "0" + d.getDate() : d.getDate();

    console.log(year + "-" + month + "-" + dat);

    //return dat + "-" + month + "-" + year;
    return year + "-" + month + "-" + dat;
  }

  dateFormatter2(date, type = "YYYYMMDD", isTime = true, separator = "-") {
    let d = new Date(date);
    let year = d.getFullYear();
    let month = d.getMonth() < 9 ? "0" + (d.getMonth() + 1) : d.getMonth() + 1;
    let dat = d.getDate() <= 9 ? "0" + d.getDate() : d.getDate();

    // console.log(dat + separator + month + separator + year);
    if (type == "ddMMYYYY") {
      return (
        year +
        separator +
        month +
        separator +
        dat +
        (isTime ? " " + this.timeFormatter(date) : "")
      );
    } else {
      return (
        year +
        separator +
        month +
        separator +
        dat +
        (isTime ? " " + this.timeFormatter(date) : "")
      );
    }
  }

  timeToSecond(date) {
    let d = new Date(date);
    let hours = d.getHours() < 9 ? "0" + d.getHours() : d.getHours();
    let minutes = d.getMinutes() < 9 ? "0" + d.getMinutes() : d.getMinutes();
    let seconds = d.getSeconds() < 9 ? "0" + d.getSeconds() : d.getSeconds();

    var hms = hours + ":" + minutes + ":" + seconds;
    var a = hms.split(':');
    return (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);

  }

  timeFormatter(date) {
    let d = new Date(date);
    let hours = d.getHours() <= 9 ? "0" + d.getHours() : d.getHours();
    let minutes = d.getMinutes() <= 9 ? "0" + d.getMinutes() : d.getMinutes();
    let seconds = d.getSeconds() <= 9 ? "0" + d.getSeconds() : d.getSeconds();

    return hours + ":" + minutes + ":" + seconds;
  }

  timeFormatter1(date) {
    let d = new Date(date);
    let hours = d.getHours() <= 9 ? "0" + d.getHours() : d.getHours();
    let minutes = d.getMinutes() <= 9 ? "0" + d.getMinutes() : d.getMinutes();
    let seconds = d.getSeconds() <= 9 ? "0" + d.getSeconds() : d.getSeconds();

    return hours + ":" + minutes + ":" + seconds;
  }

  getStartShift(date) {
    let d = new Date(date);
    let hours = d.getHours() <= 9 ? "0" + d.getHours() : d.getHours();
    let minutes = d.getMinutes() <= 9 ? "0" + d.getMinutes() : d.getMinutes();
    let seconds = d.getSeconds() <= 9 ? "0" + d.getSeconds() : d.getSeconds();

    return hours + ":" + minutes + ":" + seconds;
  }
  getEndShift(date) {
    let d = new Date(date);
    let hours = d.setHours(9);
    let minutes = d.setMinutes(30);
    // let seconds = d.getSeconds() <= 9 ? "0" + d.getSeconds() : d.getSeconds();

    return hours + ":" + minutes + ":";
  }
  // changeDateformate(date) {
  //   let d = new Date(date);
  //   return this.datePipe.transform(date, "dd-MMM-yyyy");
  // }
  changeDateformate(date, type = 'dd-MMM-yyyy hh:mm a') {
    let d = new Date(date);
    if (type === 'dd-MMM-yyyy hh:mm a') {
      return this.datePipe.transform(date, type);
    } else {
      return this.datePipe.transform(date, type);
    }
  }
  changeDateformat(date) {
    let d = new Date(date);
    return this.datePipe.transform(date, "dd-MMM-yyyy hh:mm a");
  }
  changeDateformat2(date) {
    let d = new Date(date);
    return this.datePipe.transform(date, "dd-MMM HH:mm");
  }

  changeDateformat1(date) {
    let d = new Date(date);
    return this.datePipe.transform(date, "dd-MMM-yyyy hh:mm a");
  }

  changeDateformat3(date) {
    let d = new Date(date);
    return this.datePipe.transform(date, "dd");
  }

  getBase64(files) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(files);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  dateFormatternew(date, type = "YYYYMMDD", isTime = true, separator = "-") {
    let d = new Date(date);
    let year = d.getFullYear();
    let month = d.getMonth() < 9 ? "0" + (d.getMonth() + 1) : d.getMonth() + 1;
    let dat = d.getDate() <= 9 ? "0" + d.getDate() : d.getDate();

    // console.log(dat + separator + month + separator + year);
    if (type == "ddMMYYYY") {
      return (
        dat +
        separator +
        month +
        separator +
        year

      );
    } else {
      return (
        dat +
        separator +
        month +
        separator +
        year

      );
    }
  }


  getPDFFromTableId(tblEltId, left_heading?, center_heading?, doNotIncludes?, time?, lower_left_heading?, options?, Title?) {
    // console.log("Action Data:", doNotIncludes); return;
    //remove table cols with del class
    let tblelt = document.getElementById(tblEltId);
    if (tblelt.nodeName != "TABLE") {
      tblelt = document.querySelector("#" + tblEltId + " table");
    }

    let hdg_coll = [];
    let hdgs = [];
    let hdgCols = tblelt.querySelectorAll("th");
    console.log("hdgcols:", hdgCols);
    // console.log(hdgCols.length);
    if (hdgCols.length >= 1) {
      for (let i = 0; i < (hdgCols.length - 1); i++) {
        let isBreak = false;
        for (const donotInclude in doNotIncludes) {
          if (doNotIncludes.hasOwnProperty(donotInclude)) {
            const thisNotInclude = doNotIncludes[donotInclude];
            if (hdgCols[i].innerHTML.toLowerCase().includes("title=\"" + thisNotInclude.toLowerCase() + "\"")) {
              isBreak = true;
              break;
            }
          }
        }
        if (isBreak)
          continue;
        if (hdgCols[i].innerHTML.toLowerCase().includes(">image<"))
          continue;
        if (hdgCols[i].classList.contains('del'))
          continue;
        let elthtml = hdgCols[i].innerHTML;
        if (elthtml.indexOf('<input') > -1) {
          let eltinput = hdgCols[i].querySelector("input");
          let attrval = eltinput.getAttribute("placeholder");
          hdgs.push(attrval);

        } else if (elthtml.indexOf('<img') > -1) {
          let eltinput = hdgCols[i].querySelector("img");
          let attrval = eltinput.getAttribute("title");


          hdgs.push(attrval);
        } else if (elthtml.indexOf('href') > -1) {
          let strval = hdgCols[i].innerHTML;
          hdgs.push(strval);
        } else {
          let plainText = elthtml.replace(/<[^>]*>/g, "");
          console.log("hdgval:" + plainText);
          hdgs.push(plainText);
        }
      }
    }
    hdg_coll.push(hdgs);
    let rows = [];
    let tblrows = tblelt.querySelectorAll('tbody tr');
    if (tblrows.length >= 1) {
      for (let i = 0; i < tblrows.length; i++) {
        if (tblrows[i].classList.contains('cls-hide'))
          continue;
        let rowCols = tblrows[i].querySelectorAll('td');
        let rowdata = [];
        for (let j = 0; j < rowCols.length; j++) {
          if (rowCols[j].classList.contains('del'))
            continue;
          let colhtml = rowCols[j].innerHTML;
          if (colhtml.indexOf('input') > -1) {
            let eltinput = rowCols[j].querySelector("input");
            let attrval = eltinput.getAttribute("placeholder");
            rowdata.push(attrval);

          } else if (colhtml.indexOf('img') > -1) {
            let eltinput = rowCols[j].querySelector("img");
            let attrval = eltinput && eltinput.getAttribute("title");
            rowdata.push(attrval);
          } else if (colhtml.indexOf('href') > -1) {
            let strval = rowCols[j].innerHTML;
            rowdata.push(strval);
          } else if (colhtml.indexOf('</i>') > -1) {
            let pattern = /<i.* title="([^"]+)/g;
            let match = pattern.exec(colhtml);
            if (match != null && match.length)
              rowdata.push(match[1]);
          } else {
            let plainText = colhtml.replace(/<[^>]*>/g, "");
            rowdata.push(plainText);
          }
        }
        rows.push(rowdata);
      }
    }

    let eltimg = document.createElement("img");
    eltimg.src = "assets/images/elogist.png";
    eltimg.alt = "logo";

    let pageOrientation = "Portrait";
    if (hdgCols.length > 7) {
      pageOrientation = "Landscape";
    }
    let doc = new jsPDF({
      orientation: pageOrientation,
      unit: "px",
      format: "a4"
    });

    var pageContent = function (data) {
      //header
      let x = 35;
      let y = 40;

      //if(left_heading != "undefined" &&  center_heading != null && center_heading != '') {

      doc.setFontSize(14);
      doc.setFont("times", "bold");
      doc.text("elogist Solutions ", x, y);

      //}
      let pageWidth = parseInt(doc.internal.pageSize.width);
      if (left_heading != "undefined" && left_heading != null && left_heading != '') {
        x = pageWidth / 2;
        let hdglen = left_heading.length / 2;
        let xpos = x - hdglen - 50;
        y = 40;
        doc.setFont("times", "bold", "text-center");
        doc.text(left_heading, xpos, y);
      }
      if (center_heading != "undefined" && center_heading != null && center_heading != '') {
        x = pageWidth / 2;
        y = 50;
        let hdglen = center_heading.length / 2;
        doc.setFontSize(14);
        doc.setFont("times", "bold", "text-center");
        doc.text(center_heading, x - hdglen - 50, y);
      }
      // if (lower_left_heading != "undefined" && lower_left_heading != null && lower_left_heading != '') {
      //   let xpos = 35;
      //   y = 65;
      //   doc.setFont("times", "bold", "text-center");
      //   doc.text(lower_left_heading, xpos, y);
      // }
      // doc.text(time, 30, 60);
      // y = 15;
      doc.addImage(eltimg, 'JPEG', (pageWidth - 110), 15, 50, 50, 'logo', 'NONE', 0);
      doc.setFontSize(12);

      doc.line(20, 70, pageWidth - 20, 70);

      // FOOTER
      var str = "Page " + data.pageCount;

      doc.setFontSize(10);
      doc.text(
        str,
        data.settings.margin.left,
        doc.internal.pageSize.height - 10
      );
    };

    if (hdgCols.length < 7) {
      this.tempLineBreak = { fontSize: 10, cellPadding: 6, minCellHeight: 11, minCellWidth: 10, cellWidth: 70, valign: 'middle', halign: 'center' };
    }
    else {
      this.tempLineBreak = { fontSize: 10, cellPadding: 3, minCellHeight: 11, minCellWidth: 10, cellWidth: 40, valign: 'middle', halign: 'center' };

    }

    doc.autoTable({
      head: hdg_coll,
      body: rows,
      theme: 'grid',
      didDrawPage: pageContent,
      margin: { top: 80 },
      rowPageBreak: 'avoid',
      headStyles: {
        fillColor: [98, 98, 98],
        fontSize: 10,
        halign: 'center',
        valign: 'middle'

      },
      styles: this.tempLineBreak,
      columnStyles: { text: { cellWidth: 40, halign: 'center', valign: 'middle' } },

    });


    doc.save(`${Title}.pdf`);
  }
  getCSVFromTableId(tblEltId, left_heading?, center_heading?, doNotIncludes?, time?, lower_left_heading?) {
    let tblelt = document.getElementById(tblEltId);
    if (tblelt.nodeName != "TABLE") {
      tblelt = document.querySelector("#" + tblEltId + " table");
    }

    let organization = { "elogist Solutions": "elogist Solutions" };
    let blankline = { "": "" };

    let leftData = { left_heading };
    let centerData = { center_heading };
    // let lowerLeft = lower_left_heading ? { lower_left_heading } : {};
    let doctime = { time };

    let info = []; lower_left_heading
    let hdgs = {};
    let arr_hdgs = [];
    // info.push(organization);
    // info.push(blankline);
    // info.push(leftData);
    // info.push(centerData, doctime);
    // info.push(lowerLeft);
    let hdgCols = tblelt.querySelectorAll('th');
    if (hdgCols.length >= 1) {
      for (let i = 0; i < hdgCols.length; i++) {
        let isBreak = false;
        for (const donotInclude in doNotIncludes) {
          if (doNotIncludes.hasOwnProperty(donotInclude)) {
            const thisNotInclude = doNotIncludes[donotInclude];
            if (hdgCols[i].innerHTML.toLowerCase().includes("title=\"" + thisNotInclude.toLowerCase() + "\"")) {
              isBreak = true;
              break;
            }
          }
        }
        if (isBreak)
          continue;


        if (hdgCols[i].innerHTML.toLowerCase().includes(">image<"))
          continue;
        if (hdgCols[i].classList.contains('del'))
          continue;
        let elthtml = hdgCols[i].innerHTML;
        if (elthtml.indexOf('<input') > -1) {
          let eltinput = hdgCols[i].querySelector("input");
          let attrval = eltinput.getAttribute("placeholder");
          hdgs[attrval] = attrval;
          arr_hdgs.push(attrval);
        } else if (elthtml.indexOf('<img') > -1) {
          let eltinput = hdgCols[i].querySelector("img");
          let attrval = eltinput.getAttribute("title");
          hdgs[attrval] = attrval;
          arr_hdgs.push(attrval);
        } else if (elthtml.indexOf('href') > -1) {
          let strval = hdgCols[i].innerHTML;
          hdgs[strval] = strval;
          arr_hdgs.push(strval);
        } else {
          let plainText = elthtml.replace(/<[^>]*>/g, '');
          let plainIndex = (tblEltId == "attendanceSummary") ? '"' + plainText + '"' : plainText;
          hdgs[plainIndex] = plainText;
          arr_hdgs.push(plainIndex);
        }
      }
    }
    info.push(hdgs);

    let tblrows = tblelt.querySelectorAll('tbody tr');
    if (tblrows.length >= 1) {
      for (let i = 0; i < tblrows.length; i++) {
        if (tblrows[i].classList.contains('cls-hide'))
          continue;
        let rowCols = tblrows[i].querySelectorAll('td');
        let rowdata = [];
        for (let j = 0; j < rowCols.length; j++) {
          if (rowCols[j].classList.contains('del'))
            continue;
          let colhtml = rowCols[j].innerHTML;
          if (colhtml.indexOf('input') > -1) {
            let eltinput = rowCols[j].querySelector("input");
            let attrval = eltinput.getAttribute('placeholder');
            rowdata[arr_hdgs[j]] = attrval;
          } else if (colhtml.indexOf('img') > -1) {
            let eltinput = rowCols[j].querySelector("img");
            let attrval = eltinput && eltinput.getAttribute('title');
            rowdata[arr_hdgs[j]] = attrval;
          } else if (colhtml.indexOf('href') > -1) {
            let strval = rowCols[j].innerHTML;
            rowdata[arr_hdgs[j]] = strval;
          } else if (colhtml.indexOf('</i>') > -1) {
            let pattern = /<i.* title="([^"]+)/g;
            let match = pattern.exec(colhtml);
            if (match != null && match.length)
              rowdata[arr_hdgs[j]] = match[1];
          } else {
            let plainText = colhtml.replace(/<[^>]*>/g, '');
            let tdIndexTemp = (tblEltId == "attendanceSummary") ? '"' + arr_hdgs[j] + '"' : arr_hdgs[j];
            rowdata[tdIndexTemp] = plainText;
          }
        }
        info.push(rowdata);
      }
    }
    new Angular5Csv(info, "report.csv");
  }

  findRemainingTime(time) {
    if (time <= 0) {
      return "0:0:0";
    }
    let seconds = time;
    let days = Math.floor(seconds / (3600 * 24));
    seconds -= days * 3600 * 24;
    let hrs = Math.floor(seconds / 3600);
    seconds -= hrs * 3600;
    let mnts = Math.floor(seconds / 60);
    seconds -= mnts * 60;
    let due_time = "";
    if (days > 0) {
      due_time = days + " days, " + hrs + ":" + mnts + ":" + seconds;
      return due_time;
    } else {
      due_time = hrs + ":" + mnts + ":" + seconds;
      return due_time;
    }
    // console.log("due_time:", due_time);
    // if (time > 59) {
    //   let minutes = Math.floor((time / 60));
    //   return minutes + ' mins'
    // } else if (time > 44) {
    //   return '45 secs'
    // } else if (time > 29) {
    //   return '30 secs'
    // } else if (time > 14) {
    //   return '15 secs'
    // } else {
    //   return '0 sec'
    // }
  }

  taskStatusBg(status) {
    let bg_color = this.taskBgColor.pending;
    if (status == -1) {
      bg_color = this.taskBgColor.reject;
    } else if (status == 2) {
      bg_color = this.taskBgColor.ack;
    } else if (status == 5) {
      bg_color = this.taskBgColor.complete;
    } else if (status == 3) {
      bg_color = this.taskBgColor.hold;
    }
    return bg_color;
  }

  formatTitle(strval) {
    let pos = strval.indexOf('_');
    if (pos > 0) {
      return strval.toLowerCase().split('_').map(x => x[0].toUpperCase() + x.slice(1)).join(' ')
    } else {
      return strval.charAt(0).toUpperCase() + strval.substr(1);
    }
  }

  getDate(days = null, addType = null) {
    let tempDate = new Date();
    if (days && days != "") {
      if (addType && addType == 'minus') {
        tempDate.setDate(tempDate.getDate() - days);
      } else {
        tempDate.setDate(tempDate.getDate() + days);
      }
    }
    return tempDate;
  }

  // start: csv export from data
  getCSVFromDataArray(dataArray, dataHeader, fileName, titles?, doNotIncludes?) {
    let organization = { "elogist Solutions": "elogist Solutions" };
    let name = (fileName && fileName != "") ? fileName : 'report';

    let info = [];
    let blankline = { "": "" };
    if (titles && titles.length > 0) {
      info.push(titles);
      info.push(blankline);
    }
    console.log("given data array:", dataArray);
    console.log("dataHeader:", dataHeader);
    if (dataArray.length > 0) {
      let objectKeys = Object.keys;
      let thArray = [];
      let thArg = [];
      for (let heading of objectKeys(dataHeader)) {
        console.log("heading in array:", heading);
        let dataHeaderTemp = dataHeader[heading].title;
        if (dataHeaderTemp == '' || dataHeaderTemp == 'Action' || dataHeaderTemp == 'action')
          continue;

        thArg.push(dataHeaderTemp);
        thArray.push(this.formatTitle(dataHeaderTemp));
      }

      // console.log("thArray:", thArray);
      info.push(thArray);

      dataArray.map(column => {
        let tdArray = [];
        for (let heading of thArg) {
          let columnTemp = (column[heading]) ? column[heading] : '';
          tdArray.push(columnTemp);
        }
        info.push(tdArray);
      })
    }
    // console.log("csv data array:", info);
    new Angular5Csv(info, name);
  }
  // end: csv export from data

  // start: download by url
  downloadFile(file, text) {
    //creating an invisible element 
    var element = document.createElement('a');
    element.setAttribute('href',
      'data:text/plain;charset=utf-8, '
      + encodeURIComponent(text));
    element.setAttribute('download', file);

    // Above code is equivalent to 
    // <a href="path of file" download="file name"> 
    document.body.appendChild(element);
    //onClick property 
    element.click();
    document.body.removeChild(element);
  }
  // end: download by url

  gotoPage(route) {
    if (route) {
      this.router.navigate([route]);
    }
  }

  getFormatedString(str, match) { //match="wwww."
    let splitedMsg2 = str.split(" ");
    splitedMsg2.forEach((element2, index2) => {
      let splitedMsg = element2.split("\n");
      splitedMsg.forEach((element, index) => {
        if (match == "www." && (element.match(match) || element.match('http://') || element.match('https://') || element.substr(element.indexOf('.')).match('.com') || element.substr(element.indexOf('.')).match('.in'))) {
          // let fullURL = (element.match('http')) ? element : "http://" + element;
          // let href_temp = '<a target="_blank" href=' + fullURL + '>' + element + '</a>';
          let indexHTTP = element.indexOf("http://");
          let indexHTTPS = element.indexOf("https://");
          let indexWWW = element.indexOf("www.");
          let str1 = "";
          let str2 = element;
          if(indexHTTP !== -1){
            if(indexHTTP>0){
              str1 = element.substr(0,indexHTTP);
              str2 = element.substr(indexHTTP);
            }
          }else if(indexHTTPS !== -1){
            if(indexHTTPS>0){
              str1 = element.substr(0,indexHTTPS);
              str2 = element.substr(indexHTTPS);
            }
          }else if(indexWWW !== -1){
            if(indexWWW>0){
              str1 = element.substr(0,indexWWW);
              str2 = element.substr(indexWWW);
            }
          }
          let fullURL = (str2.match('http')) ? str2 : "http://" + str2;
          let href_temp = str1+'<a target="_blank" href=' + fullURL + '>' + str2 + '</a>';
          splitedMsg[index] = href_temp;
        }
      });
      splitedMsg2[index2] = splitedMsg.join("\n");
    });
    let formatedMsg = splitedMsg2.join(" ");
    return formatedMsg;
  }

  checkMentionedUser(userList, str) {
    let mentionUserList = [];
    userList.forEach((element, index) => {
      if (str.match(element.name)) {
        // console.log("element:", element);
        mentionUserList.push(element);
      }
    });
    return (mentionUserList.length > 0) ? mentionUserList : null;
  }

  getFile(url,name){
    let params = {
      url: url,
      name: name
    };
    this.api.post('Processes/downloadFileWithCustomName',params,"I").subscribe(res => {
      if(res['code']==1){
        let b64encodedString = res['data']['base64'];
        let fileName = res['data']['name'];
        var blob = this.base64ToBlob(b64encodedString, 'text/plain');
        saveAs(blob, fileName);
      }else{
        this.showError(res['data']);
      }
    }, err => {
      this.showError();
      console.log('Error: ', err);
    });
  }

  public base64ToBlob(b64Data, contentType='', sliceSize=512) {
    b64Data = b64Data.replace(/\s/g, ''); //IE compatibility...
    let byteCharacters = atob(b64Data);
    let byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        let slice = byteCharacters.slice(offset, offset + sliceSize);

        let byteNumbers = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
        let byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, {type: contentType});
  }

  fileLinkHandler(selector) {
    let ele = document.getElementById(selector);
    let links = ele.querySelectorAll('a');
    for (let i = 0; i < links.length; i++) {
      links[i].onclick = (eve: any) => {
        let url = eve.target.href;
        let name = eve.target.innerText;
        console.log('Name:', name);
        if (url.includes('elogist-prime.s3.ap-south-1.amazonaws.com/') || url.includes('edocs.elogist.in/')) {
          eve.preventDefault();
          this.getFile(url,name);
          console.log('--------------------ITS FILE--------------------');
        }
        // console.log('url:', url)
        // console.log('eve', eve);
      }
    }
  }

  async searchString(value,messageList) {
    let searchTerm = value.trim();
    let searchedIndex = [];
    if (searchTerm && searchTerm!="" && searchTerm!=".") {
      if (searchTerm.indexOf(' ') == 0) {
        return;
      }
      // console.log("🚀 ~ file: task-message.component.ts ~ line 907 ~ TaskMessageComponent ~ searchChat ~ this.searchTerm", searchTerm, messageList)
      let final = "";
      let caseSensitive = false;
      let splitFlag = null;
      let matchFlag = null
      if (!caseSensitive) {
        splitFlag = "i";
        matchFlag = "gi";
      } else {
        splitFlag = "";
        matchFlag = "g";
      }
      let searchPattern = new RegExp(searchTerm, splitFlag);
      let matchpattern = new RegExp(searchTerm, matchFlag);

      for (let i = messageList.length - 1; i >= 0; i--) {
        let msg = messageList[i].comment;
        // console.log("🚀 ~ file: task-message.component.ts ~ line 936 ~ TaskMessageComponent ~ searchChat ~ msg", msg, searchTerm)
        if ((msg.toLowerCase()).match(searchTerm.toLowerCase()) && !msg.match(/<a.*?<\/a>/g)) {
          searchedIndex.push(i);
          let separatedText = msg.split(searchPattern);
          let separatedSearchedText = msg.match(matchpattern);
          if (
            separatedSearchedText != null &&
            separatedSearchedText.length > 0
          ) {
            for (let j = 0; j < separatedText.length; j++) {
              if (j <= separatedSearchedText.length - 1) {
                final +=
                  separatedText[j] +
                  `<span class="text-highlight" id="focusOn-${i}">` +
                  separatedSearchedText[j] +
                  `</span>`;
              } else {
                final += separatedText[j];
              }
            }
          }
          messageList[i].comment = this.sanitizer.bypassSecurityTrustHtml(final);
          messageList = messageList;
          final = '';
        }
      }
    }
    let result = {
      value: searchTerm,
      messageList: messageList,
      searchedIndex: searchedIndex
    }
    return result;
  }

}


