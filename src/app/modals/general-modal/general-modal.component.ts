import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';

@Component({
  selector: 'ngx-general-modal',
  templateUrl: './general-modal.component.html',
  styleUrls: ['./general-modal.component.scss']
})
export class GeneralModalComponent implements OnInit {
  numbers: any = [];
  data: any = [];
  items: any;
  apiURL: any;
  parameters = null;
  title = 'Detail';
  isBtn = false;
  constructor(public api: ApiService,
    public common: CommonService,
    private modalService: NgbModal,
    private activeModal: NgbActiveModal) {
    if (this.common.params.details) {
      this.title = this.common.params.title;
      this.viewData(this.common.params.details);

    } else if (this.common.params.apiURL) {
      this.apiURL = this.common.params.apiURL;
      this.title = this.common.params.title;
      this.parameters = this.common.params.params;
      this.isBtn = this.common.params.isBtn;
    }


  }
  ngOnDestroy() { }
  ngOnInit() {

  }
  getData() {

    this.common.loading++;
    this.api.post(this.apiURL, this.parameters)
      .subscribe((res: any) => {
        this.common.loading--;
        this.viewData(res['data'])
      }, (err: any) => {
        this.common.loading--;

      });
  }
  viewData(detail: any) {

    let headings = Object.keys(detail[0]);

    for (let index = 0; index < headings.length; index++) {
      if(headings[index]!='action'){
      const header = headings[index];
      const value = header=="password"?"-----":detail[0][header]?detail[0][header]:"null";
      const heading =this.camel2title(header.replace("workType","processType"));
      if (!header.startsWith("_") &&!header.endsWith("Id")&&!header.endsWith("By")&&!header.endsWith("Date") && value) {
        if (typeof (value) != 'object') {
          this.data.push({ head: header, value: value, heading: heading });
        } else if (typeof (value) == 'object') {
          let headings1 = Object.keys(value);
          for (let index = 0; index < headings1.length; index++) {
            const header1 = headings1[index];
            const value1 = header1=="password"?"-----":value[header1];
            const heading1 = this.camel2title(header1.replace("workType","processType"));
            if (!header1.startsWith("_")&&!header1.endsWith("Id")&&!header1.endsWith("By")&&!header1.endsWith("Date") && value) {
              if (typeof (value1) != 'object') {
                this.data.push({ head: header1, value: value1, heading: heading1 });
              }
            }
          }
        }
      }
    }
  }
    this.items = detail[0]['_itemsdetails'];
    for (let index = 0; index < Math.ceil(this.data.length / 2); index++) {
      this.numbers.push(index);
    }

  }


  closeModal(isFatal: any) {
    this.activeModal.close({ response: isFatal });
  }
 camel2title(camelCase:any) {
    // no side-effects
    return camelCase
      // inject space before the upper case letters
      .replace(/([A-Z])/g, function(match:any) {
         return " " + match;
      })
      // replace first char with upper case
      .replace(/^./, function(match:any) {
        return match.toUpperCase();
      });
  }
}
