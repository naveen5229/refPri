import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ngx-modules',
  templateUrl: './modules.component.html',
  styleUrls: ['./modules.component.scss']
})
export class ModulesComponent implements OnInit {
  //  modules={
  //    project:null,
  //   name:null
  //  }
  projectsName=0;
  modules = [{
    project: 'walle8',
    name: 'goutam'

  },
  {
    project: 'customer-dashboard',
    name: 'lalit'

  },
  {
    project: 'dashboard-admin',
    name: 'vishal'
  },
  {
    project: 'Walle8',
    name: 'rithik'

  }
  ]
  constructor() {
    this.getModule();
  }

  ngOnInit() {
  }


  saveModules() {
    // const params = {
    //   project: this.modules.project,
    //  name:this.modules.name

    // }
    // this.common.loading++;
    // this.api.post('', params).subscribe(res => {
    // this.common.loading--;
    // if (res['data'][0].y_id > 0) {
    //   this.common.showToast(res['data'][0].y_msg)
    //} },
    // err => {
    //   this.common.showError();
    // console.log('Error: ', err);
    // });
  }

  getModule() {
    // this.api.get("").subscribe(res =>{
    //   this.modules[]=res['data'] || [];
    //   this.common.showToast(res['data'][0].y_msg)
    // },
    // err => {
    //   this.common.showError();
    // console.log('Error: ', err);
    // });
    //   })
    // }

  }

}
