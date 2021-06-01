import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../../@core/mock/users.service';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { Options } from '@angular-slider/ngx-slider';

@Component({
  selector: 'ngx-available-time-slot',
  templateUrl: './available-time-slot.component.html',
  styleUrls: ['./available-time-slot.component.scss']
})
export class AvailableTimeSlotComponent implements OnInit {
  title = 'Available Slot';
  value: number = 1;
  highValue: number = 2;
  options: Options = {
    floor: 1,
    ceil: 24,
    step: 0.25,
    showTicks: true
  };

  busySchedules = [
    {id:1,name:'Naveen',schedule:[{fromTime:8,toTime:8.75},{fromTime:9,toTime:11}]},
    {id:2,name:'Sunil',schedule:[{fromTime:6,toTime:7.75},{fromTime:11,toTime:12.50}]},
    {id:3,name:'Bhavya',schedule:[{fromTime:13,toTime:15.25},{fromTime:16,toTime:17}]}
  ]


  constructor(public activeModal: NgbActiveModal,
    public api: ApiService,
    public common: CommonService,
    public modalService: NgbModal,
    public userService: UserService) {
    this.title = this.common.params.title;
  }

  ngOnInit() {
  }

  closeModal(res) {
    this.activeModal.close(res);
  }

  addTime() {
    console.log('value:', this.value, 'highvalue:', this.highValue);
  }

}
