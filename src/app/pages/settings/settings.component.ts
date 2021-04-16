import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ngx-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  settingMediumOptions = [
    { id: 1, type: 'Attendance', checked: false }
  ];

  settingTypeOptions = [
    { id: 1, type: 'Company' },
    { id: 2, type: 'Department' },
    { id: 3, type: 'Groups' },
    { id: 4, type: 'Users' }
  ];

  constructor() { }

  ngOnInit() {
  }

}
