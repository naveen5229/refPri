import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'ngx-list-of-employee',
  templateUrl: './list-of-employee.component.html',
  styleUrls: ['./list-of-employee.component.scss']
})
export class ListOfEmployeeComponent implements OnInit {
  assingnProject=[]
  constructor(public common:CommonService,
    public api:ApiService,
    public activeModal:NgbActiveModal) {
      this.common.handleModalSize('class', 'modal-lg', '1200');
    }

  ngOnInit() {
  }


  assingnEmployee(){
    this.api.get("").subscribe(res=>{
this.assingnProject=res['data'];
    },
    err=>{
this.common.showError(err['msg'])
    })
  }

  closeModal(response) {
    this.activeModal.close({response:response});
  }


}
