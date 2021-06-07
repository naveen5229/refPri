import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../../@core/mock/users.service';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { Options } from '@angular-slider/ngx-slider';
import { parse } from 'querystring';
import * as moment from 'moment';

@Component({
  selector: 'ngx-available-time-slot',
  templateUrl: './available-time-slot.component.html',
  styleUrls: ['./available-time-slot.component.scss']
})
export class AvailableTimeSlotComponent implements OnInit {
  type = 'time';
  title = 'Available Slot';
  today = new Date();
  value: number = 1;
  highValue: number = 2;
  options: Options = {
    floor: 1,
    ceil: 24,
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
    }
  };

  busySchedules = [];


  constructor(public activeModal: NgbActiveModal,
    public api: ApiService,
    public common: CommonService,
    public modalService: NgbModal,
    public userService: UserService) {
    console.log('params', this.common.params, moment(this.today).format("HH"));
    this.title = this.common.params.title;

    if (this.common.params.preBookedScheduler && this.common.params.preBookedScheduler.length > 0) this.busySchedules = this.common.params.preBookedScheduler;
    let bookedSchedules = [];
    this.common.params.preBookedScheduler.map(schedule => {
      if (schedule['schedule'] && schedule['schedule'].length > 0) {
        schedule['schedule'].map(data => bookedSchedules.push(data));
      }
    });
    console.log(bookedSchedules);

    this.options.getTickColor = (value: number): string => {
      for (let i = 0; i < bookedSchedules.length; i++) {
        if (value >= bookedSchedules[i].fromTime && value <= bookedSchedules[i].toTime) {
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
        default: slotFrom = this.setMinTime();
      }
      switch (this.common.params.selectedTime.to.mm) {
        case '15': slotTo = (this.common.params.selectedTime.to.hh + '.25'); break;
        case '30': slotTo = (this.common.params.selectedTime.to.hh + '.50'); break;
        case '45': slotTo = (this.common.params.selectedTime.to.hh + '.75'); break;
        // default: slotTo = this.common.params.selectedTime.to.hh ? this.common.params.selectedTime.to.hh : this.setMinTime() + 1;
        default: slotTo = this.setMinTime() + 1;
      }
      this.value = slotFrom;
      this.highValue = slotTo;
      console.log('after time assign', this.value, this.highValue);
    }

    //if time restricted
    if (this.common.params.timeRestrict) {
      this.value = this.setMinTime();
      this.highValue = this.setMinTime() + 1;
      this.options.minLimit = this.setMinTime();
    }
  }

  ngOnInit() {
  }

  closeModal(res, range = null) {
    this.activeModal.close({ response: res, range: range });
  }

  setMinTime() {
    let min = parseInt(moment(this.today).format("mm"));
    console.log(min);
    if (min > 1 && min <= 15) {
      return parseFloat(moment(this.today).format("HH") + '.25');
    } else if (min > 15 && min <= 30) {
      return parseFloat(moment(this.today).format("HH") + '.50');
    } else if (min > 30 && min <= 45) {
      return parseFloat(moment(this.today).format("HH") + '.75');
    } else {
      return parseInt(moment(this.today).format("HH")) + 1;
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

      console.log(from[1], to[1]);
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
      console.log('fromTime:', fromTime, 'toTime:', toTime, 'timeDuration', timeDuration);
      this.closeModal(true, interval)
    }
  }

}
