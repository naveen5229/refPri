import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { ConfirmComponent } from '../../modals/confirm/confirm.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'ngx-segment',
  templateUrl: './segment.component.html',
  styleUrls: ['./segment.component.scss']
})
export class SegmentComponent implements OnInit {
moduleName=[];
// moduleId=null;
segmentData=[];
segment = {
  moduleId: null,
  name: null,
  moduleName: '',
  projectName:''
}
id=null;
  constructor( public common:CommonService,
    public api:ApiService,
    public modalService:NgbModal) {
      this.getSegment()
      this.getModuleList()
      this.common.refresh = this.refresh.bind(this);

     }

  ngOnInit() {
  }

  
  refresh() {
    this.getSegment()
    this.getModuleList()
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
    this.segment.moduleId = event.module_id;
  }

  getSegment() {
    this.api.get("Segment/getAllSegments").subscribe(res => {

      this.segmentData = res['data'] || [];

    },
      err => {
        this.common.showError();
        console.log('Error: ', err);
      });
  }

  saveSegment(){
    //console.log(this.modules);
    if (this.segment.moduleId == null) {
      return this.common.showError("Module name is missing")
    } else if (!this.segment.name) {
      return this.common.showError("Segment name is missing")
    }
    else if(this.id){
      this.updateSegment()
    }
     else if (this.id == null) {
      const params = {
        moduleId: this.segment.moduleId,
        name: this.segment.name
      }
      this.common.loading++;
      this.api.post('Segment/addSegment', params).subscribe(res => {
        this.common.loading--;
        this.common.showToast(res['msg'])
        this.segment = {
          moduleId: null,
          name: null,
          moduleName: '',
          projectName:''
        }
        this.getSegment()
      },
        err => {
          this.common.loading--;
          this.common.showError(err['msg']);
          console.log('Error: ', err);
        });
     } 
  }

  updateSegment(){
      const params = {
        moduleId: this.segment.moduleId,
        name: this.segment.name,
        segmentId: this.id,
      }
      
      this.common.loading++;
      this.api.post('Segment/updateSegment', params).subscribe(res => {
        this.common.loading--;

        this.common.showToast(res['msg'])
     
        //this.segment.name=null;
        // this.modules.projectName=null;
        // this.modules.projectId=null;
        // this.segment = {
        //   moduleId: null,
        //   name: null,
        //   moduleName: '',
        //   projectName:''
        // }
        // this.id=null;
        this.getSegment()
       // console.log('modules:::',this.modules)
      
      },
        err => {
          this.common.loading--;

          this.common.showError();
          console.log('Error: ', err);
        });
  }

  editSegment(segmentData) {
    console.log("modata", segmentData)
    this.segment.moduleName = segmentData.module_name

    this.segment.moduleId = segmentData.module_id
    this.segment.projectName = segmentData.project_name
    this.id = segmentData.id
    this.segment.name =segmentData.name
  } 

  deleteSegment(userId, rowIndex) {
    this.common.params = {
      title: 'Delete Task',
      description: 'Are you sure you want to delete this module?',
      btn2: "No",
      btn1: 'Yes'
    };
    const activeModal = this.modalService.open(ConfirmComponent, { size: "sm", container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      console.log('res', data);
      if (data.response) {
        let params = {
          segmentId: userId
        }
        console.log("user", params)
        this.common.loading++;
        this.api.post('Segment/deleteSegment', params)
          .subscribe(res => {
            this.common.loading--;
            console.log("res", res);
            if (res['success']) {
              this.common.showToast(res['msg']);
              this.getSegment();
              //  this.module.splice(rowIndex, 1);
            }
          }, err => {
            this.common.loading--;
            console.log(err);
            this.common.showError();
          });

      }
    });
  }
}
