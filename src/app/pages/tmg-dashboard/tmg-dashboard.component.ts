import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ngx-tmg-dashboard',
  templateUrl: './tmg-dashboard.component.html',
  styleUrls: ['./tmg-dashboard.component.scss']
})
export class TmgDashboardComponent  implements OnInit {
  seletionsArray = ['Tmg-Task','Tmg-worklog'];
  selectedDashboard = 'Tmg-Task';
  constructor() {

  }

  ngOnDestroy(){}

  ngOnInit() { }
  
  getIndex() {
    for (let i = 0; i <= this.seletionsArray.length; i++) {
      if (this.seletionsArray[i] == this.selectedDashboard) {
        return i;
      }
    }
  }
  
  forwardMove() {
    let index = this.getIndex();
    if (index == this.seletionsArray.length-1) {
      this.selectedDashboard = this.seletionsArray[0];
    } else {
      this.selectedDashboard = this.seletionsArray[index + 1];
    }
  }
  
  backwardMove() {
    let index = this.getIndex();
    if (index == 0) {
      this.selectedDashboard = this.seletionsArray[this.seletionsArray.length-1];
    } else {
      this.selectedDashboard = this.seletionsArray[index - 1];
    }
  }

}
