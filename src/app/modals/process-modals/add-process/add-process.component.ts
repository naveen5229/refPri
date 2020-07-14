import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../../Service/common/common.service';
import { ApiService } from '../../../Service/Api/api.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'ngx-add-process',
  templateUrl: './add-process.component.html',
  styleUrls: ['./add-process.component.scss']
})
export class AddProcessComponent implements OnInit {
  title = "Add Process";
  button = "Submit";
  processForm = {
    name: '',
    startTime: this.common.getDate(),
    endTime: this.common.getDate(2)
  };

  constructor(public common: CommonService,
    public api: ApiService,
    public activeModal: NgbActiveModal,
    public modalSService: NgbModal) { }

  ngOnInit() {
  }

  closeModal(res) {
    this.activeModal.close({ response: res });
  }


  saveProcess() {
    console.log("processForm:", this.processForm);
  }

}
