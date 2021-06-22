import { Injectable } from '@angular/core';
import jsPDF from "jspdf";

interface jrxPdfOptions {
  logo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor() { }

  /**
     * Print Pdf from multi tables
     * @param tableIds Table id's
     * @param fileName File name
     * @param details In Format = [['Customer: Elogist']]
     */
  jrxTablesPDF(tableIds: string[], fileName: string = 'report', details?: any, options?: jrxPdfOptions) {
    let tablesHeadings = [];
    let tablesRows = [];
    tableIds.map(tableId => {
      tablesHeadings.push(this.findTableHeadings(tableId));
      tablesRows.push(this.findTableRows(tableId));
    });

    /**************** PDF Size ***************** */
    let maxHeadingLength = 0;
    tablesHeadings.map(tblHeadings => {
      if (maxHeadingLength < tblHeadings[0].length)
        maxHeadingLength = tblHeadings[0].length;
    });
    let pageOrientation = "Portrait";
    if (maxHeadingLength >= 7) {
      pageOrientation = "Landscape";
    }
    let doc = new jsPDF({
      orientation: pageOrientation,
      unit: "px",
      format: "a4"
    });


    /********************* Logo ************* */
    try {
      let eltimg = document.createElement("img");
      eltimg.src = (options && options.logo) ? options.logo : "assets/images/elogist.png";
      doc.addImage(eltimg, 'JPEG', parseInt(doc.internal.pageSize.width) - 55, 15, 30, 30, 'logo', 'NONE', 0);
    } catch (e) {
      console.error('Unable to add logo:', e);
    }

    if (details && details.length) {
      let firstColumLength = details[0].length;
      let maxLength = Math.max(...details.map(detail => detail.length));
      if (maxLength !== firstColumLength) {
        for (let i = firstColumLength; i < maxLength; i++) {
          details[0].push('');
        }
      }
      let tempLineBreak = { fontSize: 10, cellPadding: 0, minCellHeight: 11, minCellWidth: 11, maxCellWidth: 80, valign: 'middle', halign: 'left' };

      doc.autoTable({
        body: details,
        theme: 'plain',
        styles: tempLineBreak
      });
    }

    tablesHeadings.map((tableHeadings, index) => {
      if (tableHeadings[0][0] == '') tableHeadings[0][0] = '#';
      doc = this.addTableInDoc(doc, tableHeadings, tablesRows[index]);
    });

    doc.save(fileName + '.pdf');
  }

  findTableHeadings(tableId) {
    let tblelt = document.getElementById(tableId);
    if (tblelt.nodeName != "TABLE") {
      tblelt = document.querySelector("#" + tableId + " table");
    }

    let hdg_coll = [];
    let hdgs = [];
    let hdgCols = tblelt.querySelectorAll("th");
    console.log("hdgcols:", hdgCols);
    console.log(hdgCols.length);
    if (hdgCols.length >= 1) {
      for (let i = 0; i < hdgCols.length; i++) {
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
    return hdg_coll;
  }

  findTableRows(tableId) {
    //remove table cols with del class
    let tblelt = document.getElementById(tableId);
    if (tblelt.nodeName != "TABLE") {
      tblelt = document.querySelector("#" + tableId + " table");
    }

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
          if (rowCols[j].querySelector("input")) {
            let eltinput = rowCols[j].querySelector("input");
            let attrval = eltinput.getAttribute("placeholder");
            rowdata.push(attrval);
          } else if (rowCols[j].querySelector("img")) {
            let eltinput = rowCols[j].querySelector("img");
            let attrval = eltinput.getAttribute("title");
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
            let plainText = rowCols[j].innerText;
            rowdata.push(plainText);
          }
        }
        rows.push(rowdata);
      }
    }
    return rows;
  }

  addTableInDoc(doc, headings, rows) {
    let tempLineBreak = { fontSize: 8, cellPadding: 2, minCellHeight: 11, minCellWidth: 10, valign: 'middle', halign: 'center' };
    doc.autoTable({
      head: headings,
      body: rows,
      theme: 'grid',
      didDrawPage: this.didDrawPage,
      margin: { top: 20, bottom: 20 },
      rowPageBreak: 'avoid',
      headStyles: {
        fontSize: 8,
        halign: 'center',
        valign: 'middle'
      },
      styles: tempLineBreak,
      columnStyles: { 0: { minCellWidth: 10, halign: 'center', valign: 'middle' } },

    });
    return doc;
  }

  didDrawPage(data) {
    let doc = data.doc;
    // FOOTER
    let str = "Page " + data.pageCount;

    doc.setFontSize(8);
    doc.text(
      str,
      data.settings.margin.left,
      doc.internal.pageSize.height - 10
    );
  }

}