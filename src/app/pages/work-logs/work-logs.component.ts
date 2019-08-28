import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ngx-work-logs',
  templateUrl: './work-logs.component.html',
  styleUrls: ['./work-logs.component.scss']
})
export class WorkLogsComponent implements OnInit {

  startDate=new Date();

  constructor() { }

  ngOnInit() {
  }

}
