import { TableService } from './../../Service/Table/table.service';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { Component, OnInit, ChangeDetectorRef, Input, Output, HostListener, EventEmitter, ViewChild } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';


@Component({
  selector: 'custom-smart-table',
  templateUrl: './custom-smart-table.component.html',
  styleUrls: ['./custom-smart-table.component.scss']
})
export class CustomSmartTableComponent implements OnInit {
 @ViewChild(DataTableDirective, {static: false})
  dtElement: any;
  // dtOptions: DataTables.Settings = {};
  dtOptions =  this.table.options(10,7,'USER EXPENSES');
  dttrigger: Subject<any> = new Subject<any>();


  @Input() data: any;
  @Input() settings: any;
  @Output() action = new EventEmitter();
  objectKeys = Object.keys;
  headings = null;
  columns = [];
  sortType = '';
  activeRow = -1;
  activeRows = [];
  customPagevalue = true;
  search = {
    key: '',
    txt: ''
  };

  pages = {
    count: 0,
    active: 1,
    limit: 10,
  };
  isTableHide = false;
  edit = {
    row: -1,
    column: null,
    heading: ''
  };
  selectedRow = 0;

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event) {
    this.keyHandler(event);
  }
  constructor(private cdr: ChangeDetectorRef,
    public common: CommonService, public table:TableService) { }

  ngOnInit() {
  }

  ngOnChanges(changes) {
    console.log('columns',this.columns,this.headings)
    console.log('Changes: ', changes);
    this.data = changes.data.currentValue;
    if (changes.settings)
      this.settings = changes.settings.currentValue;
    console.log('Data', this.data);
    this.setData();
    this.activeRow = -1;
  }

  ngAfterViewInit() {
    this.setData();
    this.selectedRow = (this.settings && this.settings.arrow) ? 0 : -20;
    console.log('settings', this.settings);
  }

  keyHandler(event) {
    const key = event.key.toLowerCase();
    let activeId = document.activeElement.id;

    if (this.columns.length && (this.settings && this.settings.arrow)) {
      // console.log('selected row data',this.selectedRow,'row count ',this.columns[this.selectedRow]);
      if((key.includes('arrowup') || key.includes('arrowdown'))){
        if (key == 'arrowup' && this.selectedRow != 0) this.selectedRow--;
        else if (this.selectedRow != this.columns.length - 1) this.selectedRow++;
      }
      if(key.includes('enter')){
        let selectRow = this.columns[this.selectedRow];
        this.action.emit({ 'data': this.columns[this.selectedRow], 'rowcount': this.selectedRow,'smartId':selectRow._smartId });
      }
    }
  }
  setData() {
    console.log('smart table render time start');
    console.time();
    this.headings = this.data.headings;
    this.handlePagination(this.pages.active);
    // this.columns = this.data.columns
    console.log(this.headings);
    console.log(this.columns);
    this.cdr.detectChanges();
    if (this.search.txt && this.search.key) {
      this.headings[this.search.key].value = this.search.txt;
      this.filterData(this.search.key)
    };
    this.pages.count = Math.floor(this.data.columns.length / this.pages.limit);
    if (this.data.columns.length % this.pages.limit) {
      this.pages.count++;
    }
    this.columns.map((column, index) => column._smartId = index);
    console.log('smart table render time end');
    console.timeEnd();
  }

  filterData(key) {
    this.selectedRow = (this.settings && this.settings.arrow) ? 0 : -20;
    console.log("filterData:",this.selectedRow);
    let search = this.headings[key].value.toLowerCase();
    this.search = { key, txt: search };
    this.columns = this.data.columns.filter(column => {
      if (!search.length) return true;
      let value = column[key].value;
      if (search.includes('>') || search.includes('<') || search.includes('!')) {
        if (search.length == 1) return true;
        if (search[0] == '>') return value && value > search.split('>')[1]
        else if (search[0] == '<') return value && value < search.split('<')[1];
        else if (search[0] == '!') return value && value != search.split('!')[1];
      } else if (value && value.toString().toLowerCase().includes(search.toLowerCase())) return true;
      return false;
    });

    if (search.includes('>') || search.includes('<') || search.includes('!')) {
      if (search.includes('>')) this.sortColumn(key, 'asc')
      else this.sortColumn(key, 'desc')
    }
    if(!search.length) this.setData();
  }

  sortColumn(key, sortType?) {
    let counts = {
      object: 0,
      string: 0,
      number: 0,
      time: 0,
      date: 0
    };

    const numberPattern = new RegExp(/^[+-]?\d+(\.\d+)?$/);
    // const numberPattern = new RegExp(/^([0-9])*(\.)([0-9])*$/);
    const datePattern = new RegExp(/([0-2][0-9]|(3)[0-1])( |\/|-|)([a-zA-Z]{3})( |\/|-|)(([0-1][0-9])|([2][0-3]){2})(:)([0-5][0-9])$/);
    const timePattern = new RegExp(/^([0-9])*(\:)([0-9])*$/);

    this.columns.forEach(column => {
      let value = column[key].value
      if (datePattern.test(value)) counts.date++
      else if (numberPattern.test(value)) counts.number++;
      else if (timePattern.test(value)) counts.time++;
      else if (typeof value == 'string') counts.string++;
      else counts.object++;
    });


    this.columns.sort((a, b) => {
      if (this.headings[key].type === 'date') {
        let firstDate: any = a[key].value ? this.common.dateFormatter(a[key].value) : 0;
        let secondDate: any = b[key].value ? this.common.dateFormatter(b[key].value) : 0;
        return firstDate > secondDate ? 1 : -1;
      } else if (counts.time > counts.number) {
        let firstValue = a[key].value ? parseFloat(a[key].value.replace(':', '.')) : 0;
        let secondValue = b[key].value ? parseFloat(b[key].value.replace(':', '.')) : 0;
        return firstValue - secondValue;
      } else if (!counts.number) {
        let firstValue = a[key].value ? a[key].value.toLowerCase() : '';
        let secondValue = b[key].value ? b[key].value.toLowerCase() : '';
        if (firstValue < secondValue) //sort string ascending
          return -1
        if (firstValue > secondValue)
          return 1
        return 0
      } else {
        return a[key].value - b[key].value;
      }
    });

    if (sortType == 'desc' || this.sortType == 'desc') this.columns.reverse();
    this.sortType = this.sortType == 'desc' ? 'asc' : 'desc';
  }

  handleRowClick(event,column, index) {
    if (column.rowActions.click == 'selectRow') this.activeRow = column._smartId;
    else if (column.rowActions.click == 'selectMultiRow') {
      if (this.activeRows.indexOf(column._smartId) === -1) {
        this.activeRows.push(column._smartId);
      } else {
        this.activeRows.splice(this.activeRows.indexOf(column._smartId), 1);
      }
    } else {
      if(column.rowActions && column.rowActions.stopPropagation){
        event.stopPropagation();
      }
      column.rowActions.click();
    }
  }

  isItActive(column) {
    if (column.rowActions)
      if (column.rowActions.click == 'selectRow' && column._smartId === this.activeRow)
        return true;
      else if (column.rowActions.click == 'selectMultiRow' && this.activeRows.indexOf(column._smartId) !== -1)
        return true;
    return false;
  }


  handleColDoubleClick(column, heading) {
    console.log('Column :', column);
    if (column[heading].colActions && column[heading].colActions.dblclick) {
      column[heading].colActions.dblclick()
    }
  }

  handleMouseHover(column, heading) {
    if (column[heading] && column[heading].colActions && column[heading].colActions.mouseover) {
      column[heading].colActions.mouseover()
    }
  }

  /**
   *
   * @param column Previous Column
   * @param heading Column key
   */
  handleMouseOut(column, heading) {
    if (column[heading] && column[heading].colActions && column[heading].colActions.mouseout) {
      column[heading].colActions.mouseout()
    }
  }

  /**
   * @param page Clicked Page
   */
  handlePagination(page) {
    this.pages.active = page;
    let startIndex = this.pages.limit * (this.pages.active - 1);
    let lastIndex = (this.pages.limit * this.pages.active);
    this.columns = this.data.columns.slice(startIndex, lastIndex);
  }

  customPage() {
    this.common.loading++;
    this.isTableHide = true;
    this.setData();
    setTimeout(() => {
      this.common.loading--;
      this.isTableHide = false;
    }, 100);
  }

  /**
   * @param column Table Column
   * @param heading Table Heading Name
   * @param rowIndex Clicked row index
   */
  handleColumnClick(event, column: any, heading: string, rowIndex: number) {
    if (column[heading].isCheckbox || column[heading].isAutoSuggestion) {
      event.stopPropagation();
      return;
    };
    if (column[heading].action) {
      event.stopPropagation();
      column[heading].action();
    } else if (this.settings.editable) {
      event.stopPropagation();
      this.edit.row = rowIndex;
      this.edit.column = JSON.parse(JSON.stringify(column));
      this.edit.heading = heading;
    } else if (heading.toLowerCase() === 'action') {
      event.stopPropagation();
    }
  }

  /**
   * @param column Current Value
   */
  resetColumn(column?) {
    this.columns[this.edit.row] = column || this.edit.column;
    this.edit.row = -1;
    this.edit.column = null;
    this.edit.heading = '';
  }

  /**
   * @param editedColumn Current Values of column
   */
  saveEdit(editedColumn: any) {
    this.settings.editableAction({ current: editedColumn, old: this.edit.column });
    this.resetColumn(editedColumn);
  }

  /**
   * Hanle row selection
   * @param event - Checkbox change event
   * @param action - Action to perform on checkbox click
   */
  handleCheckboxChange(event, action) {
    action(event.target.checked);
    event.stopPropagation();
  }

  isEventBinding(column, property, event) {
    column[property] && column[property](event);
  }

  isPropertyBinding(column, property, byDefault = '') {
    if (column[property]) return column[property];
    return byDefault;
  }


}
