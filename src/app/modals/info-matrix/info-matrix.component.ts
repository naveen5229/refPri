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

  infoType = 1;
  title = '';
  campaignId = null;
  campTargetId = null;
  requestId = null;
  isEdit = false;
  showOptions = false;
  formType = 'create';

  formData = [
    {
      param: '',
      order: null,
      type: 'text',
      id: null,
      isDropdown: false,
      showAddOption: false,
      param_info: [{
        option: null
      }]
    }
  ]
  dropdowOptions = [{
    option: null
  }]
  unSortedformList = [];
  formList = [];
  enableForm = false;


  constructor(public activeModal: NgbActiveModal, public common: CommonService, public api: ApiService) {
    if (this.common.params && this.common.params.campaignId && this.common.params.title == 'Info Matrix') {
      this.title = this.common.params.title;
      this.campaignId = this.common.params.campaignId;
      this.getFormData(this.campaignId, this.infoType);
    }
    if (this.common.params && this.common.params.enableForm) {
      console.log('-----------------------');
      this.title = this.common.params.title;
      this.campaignId = this.common.params.campaignId;
      this.enableForm = this.common.params.enableForm;
      this.campTargetId = this.common.params.campaignTargetId;
      this.getFilledData(this.campTargetId, this.campaignId, this.infoType);
    }
  }

  ngOnInit() {
  }

  // changeForm(infoType) {

  //     this.getFormData(this.campaignId, infoType);

  // }

  showAddOptions(dropdown, i) {

    console.log(dropdown);
    dropdown ? this.formData[i].showAddOption = true : this.formData[i].showAddOption = false;
    console.log(this.formData[i].showAddOption);
  }

  closeModal(response) {
    this.activeModal.close({ response: response });
  }


  addMoreVehical(form) {
    // form.isDropdown = false;
    form.showAddOption = false;
    console.log(form);
    if (form.param != '' && form.order != null) {
      if (form.isDropdown && form.param_info[0].option == null) {
        this.common.showError("Fill the Options");

      } else {
        this.formData.unshift(
          {
            param: '',
            order: null,
            type: 'text',
            id: null,
            isDropdown: false,
            showAddOption: false,
            param_info:
              [{
                option: null
              }]
          }
        );
        console.log(this.formData);
      }
    } else {
      this.common.showError("Field Name,  Order Number is required");
    }
  }

  removeVehical(index) {
    this.formData.splice(index, 1);
  }

  addOptions(dropdowOptions, index) {
    console.log(dropdowOptions);
    if (dropdowOptions.option != '') {
      this.formData[index].param_info.unshift(
        {
          option: null,
        }
      );
      console.log(this.formData)
    } else {
      this.common.showError("Option is required");
    }
  }

  removeOptions(i, j) {
    // this.dropdowOptions.splice(index, 1);
    this.formData[i].param_info.splice(j, 1);

  }

  submitFormData(infoType) {
    if (this.formData.length == 1 && (this.formData[0]['param'] == '' || this.formData[0]['order'] == null)) {
      this.common.showError('Please Fill All The Field');
    } else {
      if (this.formData.length > 1 && (this.formData[0]['param'] == '' || this.formData[0]['order'] == null)) {
        this.formData.shift();
      }
      let params = {
        campaignId: this.campaignId,
        infoType: this.infoType,
        matrixInfo: JSON.stringify(this.formData.map(item => {
          return {
            param: item.param,
            order: item.order,
            type: item.type,
            id: item['_id'],
            drpOption: item.param_info
          }
        })),
        requestId: this.requestId

      }
      console.log(params);
      this.common.loading++;
      this.api.post('Campaigns/saveCampaignPrimaryInfoMatrix', params)
        .subscribe(res => {

          this.common.loading--;

          if (res['code'] == 1) {
            if (res['data'][0]['y_id'] > 0) {
              this.common.showToast(res['data'][0].y_msg);

              setTimeout((() => this.getFormData(this.campaignId, infoType)), 2000);

              this.formData = [{
                param: '',
                order: null,
                type: 'text',
                id: null,
                isDropdown: false,
                showAddOption: false,
                param_info: [{
                  option: null
                }]
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

  orderSorting(a, b) {
    if (a.order < b.order) {
      return -1;
    } else if (a.order > b.order) {
      return 1;
    } else {
      return 0;
    }
  }

  getFormData(campaignId, infoType) {
    let params = 'campaignId=' + campaignId + '&infoType=' + infoType;
    this.common.loading++;
    this.api.get('Campaigns/getCampaignPrimaryInfoMatrix?' + params)
      .subscribe(res => {
        console.log(res);
        if (res['data'].length && (res['data'][0]['param'] == '' || res['data'][0]['order'] == null)) {
          this.formList = [];
        } else {
          this.unSortedformList = res['data'];
          this.unSortedformList.forEach(e => {
            e.param_info = JSON.parse(e.param_info)
            return e;
          });
          console.log(this.unSortedformList);
          this.formList = this.unSortedformList.sort(this.orderSorting);
          // this.formList.map(e => JSON.parse(e.param_info))
          console.log(this.formList);
        }
        this.common.loading--;
      }, err => {
        this.common.loading--;
        this.common.showError(err);
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
      requestId: this.requestId,
      infoType: this.infoType
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

  }

  getFilledData(campTargetId, campaignId, infoType) {
    let params = 'campTargetId=' + campTargetId + "&campaignId=" + campaignId + '&infoType=' + infoType;
    this.common.loading++;
    this.api.get('Campaigns/getCampaignTargetPrimaryInfo?' + params)
      .subscribe(res => {
        this.common.loading--;
        console.log(res);
        if (res['data'] && res['data'].length > 0) {
          this.requestId = res['data'][0]._id;
          if (res['data'][0]['info'] != null && res['data'][0]['info'].length > 0) {
            this.formType = 'dashboard'
            let data = res['data'][0]['info'];
            console.log(data);
            data.forEach(e => {
              e.option = JSON.parse(e.option);
              console.log(e);
              return e
            });
            console.log(data);
            console.log(this.formType);
            this.formList = data;
            console.log(this.formList);

            console.log("first if");
          }
          else {
            this.formList = []
          }
        }
        // else {
        //   this.requestId = null;
        //   this.getFormData(this.campaignId);
        // }
      }, err => {
        this.common.loading--;
        console.log('Error: ', err);
      });
  }

  editField() {
    console.log(this.formList);
    this.formList.forEach(e => {
      if (e['param_info'].length > 1) {
        console.log(e['param_info']);
        e['param_info'].unshift({ option: null });
      }

      e['showAddOption'] = true;
      console.log(e);
      return e
    });
    this.formData = this.formData.concat(this.formList);
    console.log(this.formList);
    this.isEdit = true;
    this.requestId = 1;

  }

  resetForm() {
    this.formData = [{
      param: '',
      order: null,
      type: 'text',
      id: null,
      isDropdown: false,
      showAddOption: false,
      param_info: [{
        option: null
      }]
    }]
  }

}
