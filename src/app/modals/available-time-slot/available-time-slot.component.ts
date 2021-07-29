import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../../@core/mock/users.service';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { Options } from '@angular-slider/ngx-slider';
import { parse } from 'querystring';
import * as moment from 'moment';
import { scheduled } from 'rxjs';

@Component({
  selector: 'ngx-available-time-slot',
  templateUrl: './available-time-slot.component.html',
  styleUrls: ['./available-time-slot.component.scss']
})
export class AvailableTimeSlotComponent implements OnInit {
  detailedSlot = null;
  type = 'time';
  title = 'Available Slot';
  today = new Date();
  value: number = 1;
  highValue: number = 2;
  options: Options = {
    floor: 7,
    ceil: 22,
    step: 0.25,
    showTicks: true,
    minLimit: 1,
    translate: (value: number): string => {
      switch (value - parseInt(JSON.stringify(value))) {
        case 0.25: return `${parseInt(JSON.stringify(value))}.15`; break;
        case 0.5: return `${parseInt(JSON.stringify(value))}.30`; break;
        case 0.75: return `${parseInt(JSON.stringify(value))}.45`; break;
        default: return `${parseInt(JSON.stringify(value))}`;
      }
    },
   };

  busySchedules = [];
  seperateInfo = {
    name: '',
    option: {},
    schedule: [],
    userid: null
  };
  timeRangeSlotSwitch = [];
  rangePos = 1;


  constructor(public activeModal: NgbActiveModal,
    public api: ApiService,
    public common: CommonService,
    public modalService: NgbModal,
    public userService: UserService) {

    this.title = this.common.params.title;

    this.timeRangeSlotSwitch = this.common.params.freeSlots;

    if (this.common.params.preBookedScheduler && this.common.params.preBookedScheduler.length > 0) this.busySchedules = this.common.params.preBookedScheduler;
    console.log('this.common.params.preBookedScheduler: ', this.common.params.preBookedScheduler);

this.common.params.preBookedScheduler.forEach((element:any,mainindex:number,mainarray:any) => {
mainarray.forEach((item:any,index:number,array:any)=>{
console.log('item: ', item);
console.log('item.schedule[0].meeting_host',item.schedule[0].meeting_host);
 element.option.ticksTooltip = (val: any): any => `Host: ${item.schedule[0].meeting_host}`;
})

});


    let bookedSchedules = [];
    this.common.params.preBookedScheduler.map(schedule => {

      if (schedule['schedule'] && schedule['schedule'].length > 0) {
        schedule['schedule'].map(data => bookedSchedules.push(data));
      }
    });




    this.common.params.preBookedScheduler.map((item:any)=>{
    item.option.translate((value:any)=>{

    });
    });

  for(let item of this.common.params.preBookedScheduler){

  }


    this.options.getTickColor = (value: number): string => {
      for (let i = 0; i < bookedSchedules.length; i++) {
        if (value >= bookedSchedules[i].fromTime && value <= bookedSchedules[i].toTime && !bookedSchedules[i].is_todo) {
          return 'blue';
        } else if (value >= bookedSchedules[i].fromTime && value <= bookedSchedules[i].toTime && bookedSchedules[i].is_todo) {
          return 'red';
        }
      }
    }

    //if edit previous time selected
    if (this.common.params.selectedTime) {
      let slotFrom = null;
      let slotTo = null;
      switch (this.common.params.selectedTime.from.mm) {
        case '15': slotFrom = (this.common.params.selectedTime.from.hh + '.25'); break;
        case '30': slotFrom = (this.common.params.selectedTime.from.hh + '.50'); break;
        case '45': slotFrom = (this.common.params.selectedTime.from.hh + '.75'); break;
        // default: slotFrom = this.common.params.selectedTime.from.hh ? this.common.params.selectedTime.from.hh : this.setMinTime();
        default: slotFrom = (this.timeRangeSlotSwitch && this.timeRangeSlotSwitch.length > 0) ? this.setMinTime(this.timeRangeSlotSwitch[0].start) : this.setMinTime(this.today);
      }
      switch (this.common.params.selectedTime.to.mm) {
        case '15': slotTo = (this.common.params.selectedTime.to.hh + '.25'); break;
        case '30': slotTo = (this.common.params.selectedTime.to.hh + '.50'); break;
        case '45': slotTo = (this.common.params.selectedTime.to.hh + '.75'); break;
        // default: slotTo = this.common.params.selectedTime.to.hh ? this.common.params.selectedTime.to.hh : this.setMinTime() + 1;
        default: slotTo = (this.timeRangeSlotSwitch && this.timeRangeSlotSwitch.length > 0) ? this.setMinTime(this.timeRangeSlotSwitch[0].to) : this.setMinTime(this.today) + 1;
      }
      this.value = slotFrom;
      this.highValue = slotTo;

    }

    //if time restricted
    if (this.common.params.timeRestrict) {
      this.value = (this.timeRangeSlotSwitch && this.timeRangeSlotSwitch.length > 0) ? this.setMinTime(this.timeRangeSlotSwitch[0].start) : this.setMinTime(this.today);
      this.highValue = (this.timeRangeSlotSwitch && this.timeRangeSlotSwitch.length > 0) ? this.setMinTime(this.timeRangeSlotSwitch[0].end) : this.setMinTime(this.today) + 1;
      this.options.minLimit = (this.timeRangeSlotSwitch && this.timeRangeSlotSwitch.length > 0) ? this.setMinTime(this.timeRangeSlotSwitch[0].start) : this.setMinTime(this.today);
    }
  }

  ngOnInit() {
  }

  closeModal(res, range = null) {
    this.activeModal.close({ response: res, range: range });
  }

  setMinTime(day) {
    let min = parseInt(moment(day).format("mm"));

    if(min == 0){
      return parseInt(moment(day).format("HH"));
    }else if (min >= 0 && min <= 15) {
      return parseFloat(moment(day).format("HH") + '.25');
    } else if (min > 15 && min <= 30) {
      return parseFloat(moment(day).format("HH") + '.50');
    } else if (min > 30 && min <= 45) {
      return parseFloat(moment(day).format("HH") + '.75');
    } else {
      return parseInt(moment(day).format("HH")) + 1;
    }
  }

  addTime() {
    if (this.type === 'time') {
      let from = JSON.stringify(this.value).split('.');
      let to = JSON.stringify(this.highValue).split('.');
      let interval = { from: { hh: null, mm: '00' }, to: { hh: null, mm: '00' }, duration: { hh: null, mm: '00' } }
      interval.from.hh = from[0];
      interval.to.hh = to[0];

      let fromTime = moment();
      let toTime = moment();
      fromTime.set({ hour: parseInt(from[0]) });
      toTime.set({ hour: parseInt(to[0]) });
      fromTime.set({ minute: 0 });
      toTime.set({ minute: 0 });


      switch (from[1]) {
        case '25': { interval.from.mm = '15', fromTime.set({ minute: 15 }); } break;
        case '5': { interval.from.mm = '30', fromTime.set({ minute: 30 }); } break;
        case '75': { interval.from.mm = '45', fromTime.set({ minute: 45 }); } break;
      }

      switch (to[1]) {
        case '25': { interval.to.mm = '15', toTime.set({ minute: 15 }); } break;
        case '5': { interval.to.mm = '30', toTime.set({ minute: 30 }); } break;
        case '75': { interval.to.mm = '45', toTime.set({ minute: 45 }); } break;
      }

      let timeDuration = moment.utc(toTime.diff(fromTime)).format('HH:mm:ss');
      interval.duration.hh = timeDuration.split(':')[0];
      interval.duration.mm = timeDuration.split(':')[1];

      this.closeModal(true, interval)
    }
  }

  // getSeperateInfo(event, schedule) {
  //
  //   this.seperateInfo = schedule;
  //   if (this.seperateInfo.schedule && this.seperateInfo.schedule.length > 1) {
  //     // let tooltipEle = document.getElementById('ngx-tooltip');
  //     // tooltipEle.style.display = 'block';
  //     // tooltipEle.style.top = event.y + 'px';
  //     this.detailedSlot = true;
  //   }
  // }
  // closeTooltip() {
  //   document.getElementById('ngx-tooltip').style.display = 'none';
  // }

  manageIcons(schedule, iconState) {
    this.busySchedules.forEach(ele => {

    ele.detaildIcon = true;
    ele.option.ticksTooltip = (val: string): string => `Host: ${ele.host}`;

      if (ele.userid == schedule.userid) {
        ele.detaildIcon = iconState
      }
    });

  }

  shiftSlot() {
    this.value = this.setMinTime(this.timeRangeSlotSwitch[this.rangePos].start);
    this.highValue = this.setMinTime(this.timeRangeSlotSwitch[this.rangePos].end);
    if (this.rangePos >= this.timeRangeSlotSwitch.length - 1) {
      this.rangePos = 0;
    } else {
      this.rangePos = this.rangePos + 1;
    }
  }
}

//  ticksTooltip: (val: number): string => `Tooltip: ${val}`,
