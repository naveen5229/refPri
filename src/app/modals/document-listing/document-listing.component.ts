import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PdfVersioningComponent } from '../process-modals/pdf-versioning/pdf-versioning.component';
import { saveAs } from 'file-saver';

@Component({
  selector: 'ngx-document-listing',
  templateUrl: './document-listing.component.html',
  styleUrls: ['./document-listing.component.scss']
})
export class DocumentListingComponent implements OnInit {
  attachmentList = [];
  transId = null;

  tableDocuments = {
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
    public activeModal: NgbActiveModal, public modalService: NgbModal) {
    this.transId = this.common.params.transId;
    this.getAttachmentByLead();
  }

  ngOnInit() {
  }

  getAttachmentByLead() {
    this.attachmentList = [];
    this.common.loading++;
    this.api.get('Processes/getAttachmentByLead?ticketId=' + this.transId + '&type=1').subscribe(res => {
      this.common.loading--;
      if (res['code'] == 1) {
        this.attachmentList = res['data'] || [];
        this.setDocTable();
      } else {
        this.common.showError(res['msg'])
      }
    }, err => {
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  // start: Documents
  setDocTable() {
    this.tableDocuments.data = {
      headings: this.generateHeadingsDoc(),
      columns: this.getTableColumnsDoc()
    };
    console.log(this.tableDocuments, 'table written')
    return true;
  }

  generateHeadingsDoc() {
    let headings = {};
    for (var key in this.attachmentList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    return headings;
  }

  getTableColumnsDoc() {
    let columns = [];
    this.attachmentList.map(lead => {
      console.log("🚀 ~ file: document-listing.component.ts ~ line 75 ~ DocumentListingComponent ~ getTableColumnsDoc ~ lead", lead)
      let column = {};
      for (let key in this.generateHeadingsDoc()) {
        if (key.toLowerCase() == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            // icons: this.actionIcons(lead, type)
          };
        }
        else if (key == 'name') {
          // column[key] = {isHTML: true, value: lead['_doc_url'] ? `<a href="${lead['_doc_url']}" target="_blank">${lead[key] || lead['_doc_url']}</a>` : lead[key] || lead['_doc_url'], class: 'black', action: '',}
          column[key] = { isHTML: true, value: lead['_doc_url'] ? `<span class="blue cursor-pointer">${lead[key] || lead['_doc_url']}</span>` : lead[key] || lead['_doc_url'], class: 'black', action: this.getFiles.bind(this, lead['_doc_url'], lead[key]), }
        } else if (key == 'param_title') {
          column[key] = { isHTML: true, value: lead['_doc_url'] ? `<span class="blue cursor-pointer">${lead[key] || lead['_doc_url']}</span>` : lead[key] || lead['_doc_url'], class: 'black', action: this.getVersioning.bind(this, lead), }
        } else {
          column[key] = { value: lead[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    });
    return columns;
  }
  // end: Documents

  getFiles(url, name) {
    this.common.checkFile(url, name)
  }

  getVersioning(lead) {
    console.log("lead", lead)
    let url = lead._doc_url;
    let name = lead.name;
    let docsId = lead._doc_id;
    var ext = url.split('.').pop();
    let formats = ['pdf'];
    console.log("ext:", ext);
    let files = [{ name: name, url: url, docId: docsId }];
    if (formats.includes(ext.toLowerCase())) {
      this.openImageView(files);
    } else {
      this.common.getFile(files);
    }
  }

  openImageView(files) {
    console.log("openImageView", files);
    this.common.convertFileToBase64(files).then(res => {
      let getFiles: any = res;
      let img = getFiles.map(x => { return { image: x.base64, name: x.name } });
      this.common.params = { images: files[0].url, title: 'Image', docId: files[0].docId };
      const activeModal = this.modalService.open(PdfVersioningComponent, { size: 'xl', container: 'nb-layout', backdrop: 'static' });
      // activeModal.componentInstance.imageList = { images:img, title: 'Image' };
      // activeModal.componentInstance.isDownload = true;
      activeModal.result.then((data) => {
        if (data.response) {
          let selectedImg = res[data.index];
          var blob = this.common.base64ToBlob(selectedImg['base64'], 'text/plain');
          saveAs(blob, selectedImg['name']);
        }
      });
    });
  }

  closeModal(response) {
    this.activeModal.close({ response: response });
  }


}
