import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../../Service/Api/api.service';
import { CommonService } from '../../../Service/common/common.service';

@Component({
  selector: 'ngx-add-process-property',
  templateUrl: './add-process-property.component.html',
  styleUrls: ['./add-process-property.component.scss']
})
export class AddProcessPropertyComponent implements OnInit {
  Title = "Process Property";
  claimStatusData = [
    { id: 0, name: 'Disable' },
    { id: 1, name: 'Enable' }
  ];
  processPropertyForm = {
    actionId: '',
    priCatId: { id: null, name: '' },
    SecCatId: { id: null, name: '' },
    typeId: { id: null, name: '' },
    allocationAuto: { id: 0, name: 'Disable' },
    esclationAuto: { id: 0, name: 'Disable' },
    escTime: '',
    complRemTime: '',
    complEscTime: '',
    isUrgent: false,
    isActive: true,
    callRequired: false,
    claim: false,
    callingBenchmark: null,
    completionBenchmark: null,
    requestId: null
  }
  constructor(public activeModal: NgbActiveModal,public api: ApiService, public common: CommonService, public modalService: NgbModal) { 
    this.processPropertyForm.actionId = this.common.params.ref.id;
    const prefilledData = this.common.params.prefilled;
    console.log("🚀 ~ file: add-process-property.component.ts ~ line 38 ~ AddProcessPropertyComponent ~ constructor ~ prefilledData", prefilledData)
    this.processPropertyForm = {
      actionId: prefilledData._action_id,
      priCatId: { id: null, name: '' },
      SecCatId: { id: null, name: '' },
      typeId: { id: null, name: '' },
      allocationAuto: { id: prefilledData._allocation_auto, name: prefilledData._allocation_auto_name },
      esclationAuto: { id: prefilledData._escalation_auto, name: prefilledData._esclation_auto_name },
      escTime: prefilledData._esc_time_ack,
      complRemTime: prefilledData._comp_rem_time,
      complEscTime: prefilledData._esc_time_comp,
      isUrgent: prefilledData._is_urgent,
      isActive: prefilledData._is_active,
      callRequired: prefilledData._is_call_required,
      claim: prefilledData._claim,
      callingBenchmark: prefilledData._calling_benchmark,
      completionBenchmark: prefilledData._completion_benchmark,
      requestId: prefilledData._property_id
    }
  }

  ngOnInit() {
  }

  close(response){
    this.activeModal.close({ response: response });
  }

  savePropertyList(){
    let params = {
      actionId:this.processPropertyForm.actionId,
      priCatId:this.processPropertyForm.priCatId.id,
      SecCatId:this.processPropertyForm.SecCatId.id, 
      typeId:this.processPropertyForm.typeId.id, 
      escTime:this.processPropertyForm.escTime, 
      complRemTime:this.processPropertyForm.complRemTime, 
      complEscTime:this.processPropertyForm.complEscTime, 
      allocationAuto:this.processPropertyForm.allocationAuto.id, 
      esclationAuto:this.processPropertyForm.esclationAuto.id, 
      callingBenchmark:this.processPropertyForm.callingBenchmark, 
      completionBenchmark:this.processPropertyForm.completionBenchmark, 
      isUrgent:this.processPropertyForm.isUrgent, 
      isActive:this.processPropertyForm.isActive, 
      callRequired:this.processPropertyForm.callRequired, 
      claimAction:this.processPropertyForm.claim, 
      requestId:this.processPropertyForm.requestId
    }
    this.common.loading++;
    this.api.post('Processes/saveActionProperty', params).subscribe(res => {
      this.common.loading--;
      if (res['code'] == 1) {
        if (res['data'][0].y_id > 0) {
          this.common.showToast(res['data'][0].y_msg);
          this.close(true)
        } else {
          this.common.showError(res['data'][0].y_msg);
        }
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error:', err)
    });
  }
}
