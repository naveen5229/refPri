import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';

@Component({
  selector: 'month-picker',
  templateUrl: './month-picker.component.html',
  styleUrls: ['./month-picker.component.scss'],
  host: {
    '(document:click)': 'hideMonthPicker($event)'
  }
})
export class MonthPickerComponent implements OnInit {
  @Output() select = new EventEmitter();
  months = [
    { name: 'JAN', id: '01' },
    { name: 'FEB', id: '02' },
    { name: 'March', id: '03' },
    { name: 'APRIL', id: '04' },
    { name: 'MAY', id: '05' },
    { name: 'JUN', id: '06' },
    { name: 'JULY', id: '07' },
    { name: 'AUG', id: '08' },
    { name: 'SEPT', id: '09' },
    { name: 'OCT', id: '10' },
    { name: 'NOV', id: '11' },
    { name: 'DEC', id: '12' }
  ];

  theYear = new Date().getFullYear();
  currentYear = new Date().getFullYear();
  currentMonth = (new Date().getMonth() < 9 ? '0' : '') + (new Date().getMonth() + 1);
  selectedYear = new Date().getFullYear();

  selectedMonth = { name: '', id: '' };
  isVisible: boolean = false;

  constructor(public common: CommonService) {
    this.months.forEach(month => {
      if (month.id == this.currentMonth) this.selectedMonth = month;
    });
    setTimeout(this.selectMonth.bind(this, this.selectedMonth), 500);

  }

  ngOnInit() {
  }


  /**
   * @param month Month to be select
   */
  selectMonth(month: any) {

    this.selectedMonth = month;
    this.selectedYear = this.theYear;
    let monthId = new Date().getMonth();
    let end = '';
    let start = `${this.selectedYear}-${month.id}-01`;
    if (monthId + 1 == month.id) {
      end = this.common.dateFormatter(new Date(), '', false);
    } else {
      end = this.common.dateFormatter(new Date(this.selectedYear, month.id, 0), '', false);

    }
    this.isVisible = false;
    this.select.emit({ start, end });
  }

  resetData() {
    this.selectedMonth = {
      name: '',
      id: ''
    };
  }
  hideMonthPicker() {
    setTimeout(() =>
      this.isVisible = false, 5000);
  }

}
