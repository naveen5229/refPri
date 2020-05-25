import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { RowContext } from '@angular/cdk/table';

@Component({
  selector: 'ngx-info-matrix',
  templateUrl: './info-matrix.component.html',
  styleUrls: ['./info-matrix.component.scss']
})
export class InfoMatrixComponent implements OnInit {

  title = '';
  campaignId = null;
  campTargetId = null;
  requestId = null;
  isEdit = false;
  formData = [
    {
      param: '',
      order: null,
      type: 'text',
      id: null
    }
  ]
  unSortedformList = [];
  formList = [];
  enableForm = false;


  constructor(public activeModal: NgbActiveModal, public common: CommonService, public api: ApiService) {
    if (this.common.params && this.common.params.campaignId && this.common.params.title == 'Info Matrix') {
      this.title = this.common.params.title;
      this.campaignId = this.common.params.campaignId;
      this.getFormData(this.campaignId);
    }
    if (this.common.params && this.common.params.enableForm) {
        this.title = this.common.params.title;
        this.campaignId = this.common.params.campaignId;
        this.enableForm = this.common.params.enableForm;
        this.campTargetId = this.common.params.campaignTargetId;
        this.getFilledData(this.campTargetId);
    }
  }

  ngOnInit() {
  }


  closeModal(response) {
    this.activeModal.close({ response: response });
  }


  addMoreVehical(form) {
    if (form.param != '' && form.order != null) {
      this.formData.unshift(
        {
          param: '',
          order: null,
          type: 'text',
          id: null
        }
      );
    } else {
      this.common.showError("Field Name and Order Number is required");
    }
  }

  removeVehical(index) {
    this.formData.splice(index, 1);
  }

  submitFormData() {
    if(this.formData.length == 1 && (this.formData[0]['param'] == '' || this.formData[0]['order'] == null)) {
        this.common.showError('Please Fill All The Field');
    }  else {
      if (this.formData.length > 1 && (this.formData[0]['param'] == '' || this.formData[0]['order'] == null)) {
              this.formData.shift();
      }
    let params = {
      campaignId: this.campaignId,
      matrixInfo: JSON.stringify(this.formData.map(item => {
        return {
          param: item.param,
          order: item.order,
          type: item.type,
          id: item['_id']
        }
      })),
      requestId: this.requestId

    }
    this.common.loading++;
          this.api.post('Campaigns/saveCampaignPrimaryInfoMatrix', params)
            .subscribe(res => {

              this.common.loading--;

              if (res['code'] == 1) {
                if (res['data'][0]['y_id'] > 0) {
                  this.common.showToast(res['data'][0].y_msg);

                  setTimeout( (() => this.getFormData(this.campaignId)), 2000);

                  this.formData = [{
                    param: '',
                    order: null,
                    type: 'text',
                    id:null
                  }]
                  
                } else {
                  this.common.showError(res['data'][0].y_msg)
                }
              } else {
                this.common.showError(res['msg']);
              }

            }, err => {
              this.common.loading--;
              console.log('Error: ', err);
            });
    }
  }

  orderSorting(a, b){
    if(a.order < b.order){
            return -1;
    }else if(a.order > b.order){
            return 1;
    }else{
            return 0;
    }
  }

  getFormData(campaignId) {
                let params = 'campaignId=' + campaignId
                this.common.loading++;
                this.api.get('Campaigns/getCampaignPrimaryInfoMatrix?'+ params)
                  .subscribe(res => {
                      console.log(res);
                      if (res['data'][0]['param'] == '' || res['data'][0]['order'] == null){
                          this.formList = [];
                      } else {
                      this.unSortedformList = res['data'];
                      this.formList = this.unSortedformList.sort(this.orderSorting);
                      }
                    this.common.loading--;
                    this.common.showToast(res['msg']);
                  }, err => {
                    this.common.loading--;
                    console.log('Error: ', err);
                  });
  }


  checkValue(obj) {
    return obj.value != '';
  }

  submitFormDataWithValue() {
    console.log(this.formList)
    let obj = {}
    this.formList.map(form => {
      obj[form.param] = form.value;
    });
    console.log(obj);

    let params = {
      campTargetId: this.campTargetId,
      primaryInfo: JSON.stringify(obj),
      requestId: this.requestId
    }
    console.log(params);
    this.common.loading++;
    this.api.post('Campaigns/saveCampaignTargetPrimaryInfo', params)
      .subscribe(res => {
        console.log(res);
        this.activeModal.close();
        this.common.loading--;
        this.common.showToast(res['msg']);
      }, err => {
        this.common.loading--;
        console.log('Error: ', err);
      });
      if (obj['Name'] == undefined || obj['Job'] == undefined || obj['Contact'] == undefined) {
            this.common.showError('Please Fill All The Field');
      }
      else {
          let params = {campTargetId: this.campTargetId,
                  primaryInfo: JSON.stringify(obj),
                     requestId: this.requestId
                    }
                this.common.loading++;
                this.api.post('Campaigns/saveCampaignTargetPrimaryInfo', params)
                  .subscribe(res => {
                      console.log(res);
                      this.activeModal.close();
                    this.common.loading--;
                    this.common.showToast(res['msg']);
                  }, err => {
                    this.common.loading--;
                    console.log('Error: ', err);
                  });
          }
  }

  getFilledData(campTargetId) {
    let params = 'campTargetId=' + campTargetId
    this.common.loading++;
    this.api.get('Campaigns/getCampaignTargetPrimaryInfo?' + params)
      .subscribe(res => {
        this.common.loading--;
        console.log(res);
        if (res['data'] && res['data'].length > 0 && res['data'][0]._id > 0) {
          this.requestId = res['data'][0]._id;
          if (res['data'][0]['info'].length > 0) {
            this.formList = res['data'][0]['info'];
            console.log("first if");
          } else {
            this.getFormData(this.campaignId);
            console.log("first else");
          }
        } else {
          this.requestId = null;
          this.getFormData(this.campaignId);
        }
      }, err => {
        this.common.loading--;
        console.log('Error: ', err);
      });
  }

  editField() {
    this.formData = this.formData.concat(this.formList);
    this.isEdit = true;
    this.requestId = 1;

  }

  resetForm() {
    this.formData = [{
                    param: '',
                    order: null,
                    type: 'text',
                    id:null
                  }]
  }

}
