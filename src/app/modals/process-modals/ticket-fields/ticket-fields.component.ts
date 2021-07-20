import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ngx-ticket-fields',
  templateUrl: './ticket-fields.component.html',
  styleUrls: ['./ticket-fields.component.scss']
})
export class TicketFieldsComponent implements OnInit {

  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit() {

  }

}
