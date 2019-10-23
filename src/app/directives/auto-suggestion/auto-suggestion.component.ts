import { CommonService } from '../../Service/common/common.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../Service/Api/api.service';
import { Component, OnInit, EventEmitter, Output, Input, ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'auto-suggestion',
  templateUrl: './auto-suggestion.component.html',
  styleUrls: ['./auto-suggestion.component.scss']
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
  @Input() name: string;
  @Input() parentForm: FormGroup;
  @Input() controlName: string;
  @Input() apiHitLimit: Number;
  @Input() isNoDataFoundEmit: boolean;
  @Input() isMultiSelect: boolean;
  @Input() bGConditions: any[] = [];

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


  constructor(public api: ApiService,
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    public common: CommonService) {
  }

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

  ngOnChanges(changes) {
    if (changes.preSelected) {
      this.preSelected = changes.preSelected.currentValue;
      this.preSelected && this.handlePreSelection();
    }

  }

  handlePreSelection() {
    if (this.isMultiSelect) {
      this.selectedSuggestions = JSON.parse(JSON.stringify(this.preSelected));
      return;
    }
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
    this.api.get(this.url + params)
      .subscribe(res => {
        this.suggestions = res['data'];
        if (this.isNoDataFoundEmit && !this.suggestions.length) this.noDataFound.emit({ search: this.searchText });
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
      displayText = suggestion ? suggestion[this.display] : '';
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
    } else if (key == 'arrowup') {
      if (this.activeSuggestion != 0) this.activeSuggestion--;
      else this.activeSuggestion = this.suggestions.length - 1;
      event.preventDefault();
    } else if (key == 'enter' || key == 'tab') {
      if (this.activeSuggestion !== -1) {
        this.selectSuggestion(this.suggestions[this.activeSuggestion]);
      } else {
        this.selectSuggestion(this.suggestions[0]);
      }
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
      if (suggestion[condition.key] == condition.value) {
        className = condition.class;
      }
    });
    return className;
  }

  showAllSuggestion() {
    this.showSuggestions = true;
    this.suggestions = this.data;
  }

  clearData() {
    console.log("cleardata");
    this.showSuggestions = false;
    this.suggestions = [];
  }

  removeSuggestion(index) {
    if (this.isMultiSelect) {
      this.selectedSuggestions.splice(index, 1)
      this.onSelected.emit(this.selectedSuggestions);
    }

  }

}

