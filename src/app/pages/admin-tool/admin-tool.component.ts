import { Component, OnInit } from '@angular/core';
import { SaveadminComponent } from '../../modals/saveadmin/saveadmin.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { SendmessageComponent } from '../../modals/sendmessage/sendmessage.component';
@Component({
  selector: 'ngx-admin-tool',
  templateUrl: './admin-tool.component.html',
  styleUrls: ['./admin-tool.component.scss']
})
export class AdminToolComponent implements OnInit {

  constructor(public common: CommonService,
    public api: ApiService,
    public modalService: NgbModal,
    ) { }

  ngOnInit() {
  }

  adminTools(){
    const activeModal = this.modalService.open(SaveadminComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
     }
    
  sendWwMsg() {
    const activeModal = this.modalService.open(SendmessageComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
  }
}
