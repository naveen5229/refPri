import {
  Component,
  OnInit,
  EventEmitter,
  ViewChild,
  Output,
  Input,
  ChangeDetectorRef,
  ElementRef
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import {
  ApiService
} from '../../Service/Api/api.service';
import {
  CommonService
} from '../../Service/common/common.service';



@Component({
  selector: 'auto-suggestion',
  templateUrl: './auto-suggestion.component.html',
  styleUrls: ['./auto-suggestion.component.scss'],
  host: {
    '(document:click)': 'hideSuggestions($event)'
  }
})
export class AutoSuggestionComponent implements OnInit {

  @Output() onSelected = new EventEmitter();
  @Output() unSelected = new EventEmitter();
  @Output() noDataFound = new EventEmitter();
  @Output() onChange = new EventEmitter();

  @Input() url: string;
  @Input() display: any;
  @Input() className: string;
  @Input() placeholder: string;
  @Input() preSelected: any;
  @Input() seperator: string;
  @Input() data: any;
  @Input() inputId: string;
  @Input() apiBase: string = 'I';
  @Input() name: string;
  @Input() parentForm: FormGroup;
  @Input() controlName: string;
  @Input() apiHitLimit: Number;
  @Input() isNoDataFoundEmit: boolean;
  @Input() isMultiSelect: boolean;
  @Input() bGConditions: any[] = [];
  @Input() apiMethod: string = 'get';
  counter = 0;
  searchText = '';
  showSuggestions = false;
  suggestions = [];
  selectedSuggestion = null;
  displayType = 'string';
  searchForm = null;
  activeSuggestion = -1;
  selectedSuggestions = [];
  isAllData = false;
  suggestionApiHitTimer: any = null;
  scrollIntoView: any;


  constructor(public api: ApiService,
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    public common: CommonService,
    public el: ElementRef) {}

  ngOnInit() {
    this.searchForm = this.formBuilder.group({
      search: ['']
    });
  }

  ngAfterViewInit() {
    if (this.preSelected) this.handlePreSelection();

    if (Array.isArray(this.display)) {
      this.displayType = 'array';
    }
    if (this.parentForm) {
      this.searchForm = this.parentForm;
    }
    this.cdr.detectChanges();

  }


  handlePreSelection() {
    this.selectedSuggestion = this.preSelected;
    this.searchText = '';
    if (typeof (this.display) != 'object')
      this.searchText = this.preSelected[this.display];
    else {
      let index = 0;
      for (const dis of this.display) {
        this.searchText += (index != 0 ? (" " + this.seperator + " ") : " ") + this.preSelected[dis];
        if (!this.searchText.replace(/[-]/g, '').trim()) {
          this.searchText = '';
        }
        index++;
      }
    }
  }

  getSuggestions() {
    this.onChange.emit(this.searchText);
    this.apiHitLimit = this.apiHitLimit ? this.apiHitLimit : 3;

    this.showSuggestions = true;
    if (this.data) {
      this.suggestions = this.data.filter(suggestion => {
        if (this.displayType === 'string') {
          return (suggestion[this.display] || '').toLowerCase().includes(this.searchText.toLowerCase())
        } else {
          return this.generateString(suggestion).toLowerCase().includes(this.searchText.toLowerCase());
        }
      });
      this.suggestions.splice(10, this.suggestions.length - 1);
      return;
    }
    if (this.searchText.length < this.apiHitLimit) return;

    clearTimeout(this.suggestionApiHitTimer);
    this.suggestionApiHitTimer = setTimeout(this.getSuggestionsFromApi.bind(this), 400);
  }

  getSuggestionsFromApi() {
    let params = '?';
    if (this.url.includes('?')) {
      params = '&'
    }
    params += 'search=' + this.searchText;
    console.log('jrx:', this.apiMethod, this.url, this.apiBase);
    this.api[this.apiMethod](this.url + params, this.apiBase)
      .subscribe(res => {
        this.suggestions = res['data'];
        if (this.isNoDataFoundEmit && !this.suggestions.length) this.noDataFound.emit({
          search: this.searchText
        });
      }, err => {
        console.error(err);
        this.common.showError();
      });
  }

  selectSuggestion(suggestion) {
    if (this.isMultiSelect) {
      this.selectedSuggestions.push(suggestion);
      this.onSelected.emit(this.selectedSuggestions);
      this.searchText = '';
    } else {
      this.selectedSuggestion = suggestion;
      this.onSelected.emit(suggestion);
      this.searchText = this.generateString(suggestion);
    }

    this.showSuggestions = false;
    this.activeSuggestion = -1;
  }

  generateString(suggestion) {
    let displayText = '';
    if (this.displayType == 'array') {
      this.display.map((display, index) => {

        if (index != this.display.length - 1) {
          displayText += suggestion[display] + ' ' + this.seperator + ' ';
        } else {
          displayText += suggestion[display];
        }
      });
    } else {
      displayText = suggestion[this.display];
    }
    return displayText;
  }


  handleKeyDown(event) {
    const key = event.key.toLowerCase();

    if (!this.showSuggestions) return;
    if (key == 'arrowdown') {
      if (this.activeSuggestion != this.suggestions.length - 1) this.activeSuggestion++;
      else this.activeSuggestion = 0;
      event.preventDefault();
      this.scrolintoView();
    } else if (key == 'arrowup') {
      if (this.activeSuggestion != 0) this.activeSuggestion--;
      else this.activeSuggestion = this.suggestions.length - 1;
      event.preventDefault();
      this.scrolintoView();

    } else if (key == 'enter' || key == 'tab') {
      if (this.activeSuggestion !== -1) {
        this.selectSuggestion(this.suggestions[this.activeSuggestion]);
      } else {
        this.selectSuggestion(this.suggestions[0]);
      }
    }

  }


  scrolintoView() {
    let suggestion = document.querySelectorAll('.suggestions .suggestion');
    if (this.activeSuggestion) {
      suggestion[this.activeSuggestion].scrollIntoView();
    } else {
      suggestion[this.activeSuggestion].scrollIntoView(false);
    }
  }



  handleUnselected() {
    setTimeout(() => {
      let isSelected = false;
      this.suggestions.map(suggestion => {
        if (this.searchText === this.generateString(suggestion) && this.generateString(this.selectedSuggestion) == this.generateString(suggestion)) {
          isSelected = true;
        }
      });
      if (!isSelected) this.unSelected.emit(null);
    }, 100);
  }

  classFinder(suggestion) {
    let className = '';
    this.bGConditions.forEach(condition => {
      if (condition.isExist && suggestion[condition.key]) {
        className = condition.class;
      } else if (!condition.isExist && suggestion[condition.key] == condition.value) {
        className = condition.class;
      }
    });
    return className;
  }

  showAllSuggestion(event) {
    event.stopPropagation();
    this.showSuggestions = true;
    this.suggestions = this.data;
  }

  clearData() {
    console.log("cleardata");
    this.showSuggestions = false;
    this.suggestions = [];
  }

  hideSuggestions() {
    setTimeout(() => this.showSuggestions = false, 300);
  }

  removeSuggestion(index) {
    if (this.isMultiSelect) {
      this.selectedSuggestions.splice(index, 1);
      this.onSelected.emit(this.selectedSuggestions);
    }
  }

  ngOnChanges() {
    setTimeout(() => {
      console.log(this.el.nativeElement.offsetWidth);
    })
  }

}
