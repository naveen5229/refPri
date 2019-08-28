import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'ngx-work-log',
  templateUrl: './work-log.component.html',
  styleUrls: ['./work-log.component.scss']
})
export class WorkLogComponent implements OnInit {

  constructor(private activeModal: NgbActiveModal) { }

  ngOnInit() {
  }

  dismiss(){
    this.activeModal.close();
  }

}
