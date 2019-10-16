import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'ngx-add-segment',
  templateUrl: './add-segment.component.html',
  styleUrls: ['./add-segment.component.scss']
})
export class AddSegmentComponent implements OnInit {
module=[];
moduleName=[]
segment=''

  constructor(public common:CommonService,
    public api:ApiService,
    public activeModal:NgbActiveModal,
    public modalSService:NgbModal) {
      this.getModuleList()
     }

  ngOnInit() {
  }

  getModuleList(){
    this.common.loading++;

    this.api.get('Suggestion/getModules')
    .subscribe(res => {
      this.common.loading--;
      console.log("list",res);
      this.moduleName = res['data'];
    }, err => {
      this.common.loading--;
      console.log(err);
    });
  }

  changeModule(event){
    console.log("item", event)
    this.module = event.module_id;
  }
  
  closeModal(response) {
    this.activeModal.close({response:response});
  }

   addSegment(){
  
      const params = {
        moduleId: this.module,
        name: this.segment
      }
      this.common.loading++;
      this.api.post('Segment/addSegment', params).subscribe(res => {
        this.common.loading--;
        this.common.showToast(res['msg'])
        this.closeModal(true);
       
      },
        err => {
          this.common.loading--;
          this.common.showError();
          console.log('Error: ', err);
        });
     } 
  }

