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
  moduleName = [];
  // moduleId=null;
  segmentData = [];
  segment = {
    moduleId: null,
    name: null,
    moduleName: '',
    projectName: ''
  }
  filteredItems = []
  id = null;
  constructor(public common: CommonService,
    public api: ApiService,
    public modalService: NgbModal) {
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
  getModuleList() {
    this.common.loading++;

    this.api.get('Suggestion/getModules')
      .subscribe(res => {
        this.common.loading--;
        if(res['code']===0) { this.common.showError(res['msg']); return false;};
        this.moduleName = res['data'];
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
  }

  changeModule(event) {
    console.log("item", event)
    this.segment.moduleId = event.module_id;
    this.segment.moduleName = event.modulename;
    this.segment.projectName = event.projectname;
    this.filterItem();
  }

  getSegment() {
    this.api.get("Segment/getAllSegments").subscribe(res => {
      if(res['code']===0) { this.common.showError(res['msg']); return false;};
      this.segmentData = res['data'] || [];
      this.filterItem();
    },err => {
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  saveSegment() {
    //console.log(this.modules);
    if (this.segment.moduleId == null) {
      return this.common.showError("Module name is missing")
    } else if (!this.segment.name) {
      return this.common.showError("Segment name is missing")
    }
    else if (this.id) {
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
        if (res['success'] == false) {
          this.common.showError(res['msg']);
        }
        else {
          this.common.showToast(res['msg']);
          this.segment = {
            moduleId: null,
            name: null,
            moduleName: '',
            projectName: ''
          }
          this.getSegment()

        }
      },
        err => {
          this.common.loading--;
          this.common.showError(err['msg']);
          console.log('Error: ', err);
        });
    }
  }

  updateSegment() {
    const params = {
      moduleId: this.segment.moduleId,
      name: this.segment.name,
      segmentId: this.id,
    }
    this.common.loading++;
    this.api.post('Segment/updateSegment', params).subscribe(res => {
      this.common.loading--;
      if(res['code']===0) { this.common.showError(res['msg']); return false;};
      this.common.showToast(res['msg'])
      this.getSegment()
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
    this.segment.name = segmentData.name
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
            if (res['success']) {
              this.common.showToast(res['msg']);
              this.getSegment();
            }else{
              this.common.showError(res['msg']);
            }
          }, err => {
            this.common.loading--;
            console.log(err);
            this.common.showError();
          });

      }
    });
  }

  filterItem(search?) {
    if (!this.segment.name && !this.segment.moduleName) {
      this.filteredItems = this.segmentData;
      return;
    }
    let txt = search || this.segment.moduleName;
    this.filteredItems = this.segmentData.filter(item => {
      if (search)
        return item.name.toLowerCase().includes(txt.trim().toLowerCase())
      else
        return item.module_name.toLowerCase().includes(txt.toLowerCase())
    });

  }


  unselectModule() {
    if (this.segment.moduleName) {
      document.getElementById('moduleName')['value'] = '';
      this.segment.moduleId = null;
      this.segment.moduleName = null;
      this.segment.projectName = null;
      this.filterItem();
    }
  }

}
