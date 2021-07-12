import { Component, OnInit,ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { from, Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { CommonService } from './../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { TableService } from './../../Service/Table/table.service';
import { ImageViewComponent } from '../image-view/image-view.component';

@Component({
  selector: 'ngx-unmapped-visit',
  templateUrl: './unmapped-visit.component.html',
  styleUrls: ['./unmapped-visit.component.scss']
})
export class UnmappedVisitComponent implements OnInit, OnDestroy, AfterViewInit {
  startDate = this.common.getDate(-6);
  endDate = this.common.getDate();
  allUsers = [];
  selectedUser = {id: null, name: null};
  listType = 1;
  dataList = [];
  @ViewChild(DataTableDirective, {static: false})
  dtElement: any;
  dtOptions =  this.tableService.options(10,5,'visit_report');
  dtTrigger: Subject<any> = new Subject<any>();
  constructor(public activeModal: NgbActiveModal, public modalService: NgbModal, public api: ApiService,
    public common: CommonService, public tableService:TableService) {
      this.common.refresh = this.refreshPage.bind(this);
    }

  ngOnInit() {}
  

  ngAfterViewInit() {
    this.dtTrigger.next();
    this.getUnMappedOnsiteImages();
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  refreshPage(){
    this.getUnMappedOnsiteImages();
  }

  closeModal(response) {
    this.activeModal.close({
      response: response
    });
  }

  getUnMappedOnsiteImages() {
    let params = "?type="+this.listType+"&startDate="+this.common.dateFormatter(this.startDate)+"&endDate="+this.common.dateFormatter(this.endDate);
    this.common.loading++;
    let apiName = 'Admin/getUnMappedOnsiteImages'
    this.api.get(apiName+params).subscribe(res => {
        this.common.loading--;
        if (res['code'] > 0) {
          this.dataList = res['data'] || [];
          this.renderTable();
        } else {
          this.common.showError(res['msg']);
        }
      }, err => {
        console.error(err);
        this.common.showError();
        this.common.loading--;
      });
  }

  renderTable() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.clear();
      dtInstance.destroy();
      this.dtTrigger.next();
    });
  }

  viewImage(url) {
    if(url && url.trim()!==""){
      let images:any = [{name:"Visit Image",image:url}];
      const activeModal = this.modalService.open(ImageViewComponent, { size: 'lg', container: 'nb-layout' });
      activeModal.componentInstance.imageList = { images, title: 'Image' };
    }
  }

}
