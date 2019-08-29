import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { WorkLogComponent } from '../../modals/work-log/work-log.component';

@Component({
  selector: 'ngx-work-logs',
  templateUrl: './work-logs.component.html',
  styleUrls: ['./work-logs.component.scss']
})
export class WorkLogsComponent implements OnInit {

  startDate=new Date();

  constructor(public modalService:NgbModal) { }

  ngOnInit() {
  }

  addWorkLogs(){
    const activeModal = this.modalService.open(WorkLogComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    // activeModal.result.then(data => {
    //   this.inventories[index].buydate = this.common.dateFormatter(data.date).split(' ')[0];
    //   console.log('Date:', this.inventories[index].buydate);
    // });
  }

}
