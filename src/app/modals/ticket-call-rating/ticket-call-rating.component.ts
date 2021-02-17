import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'ngx-ticket-call-rating',
  templateUrl: './ticket-call-rating.component.html',
  styleUrls: ['./ticket-call-rating.component.scss']
})
export class TicketCallRatingComponent implements OnInit {
  isNegetive = false;
  currentRate = null;
  isFutureRef =  false;
  ticketId = '';
  rating = '';
  remark = '';
  constructor(public common:CommonService,
    public api:ApiService,
    public activeModal:NgbActiveModal,
    public modalSService:NgbModal) {
     

      if(this.common.params && this.common.params.rating < 0) {
        this.isNegetive = true;
        this.currentRate = (this.common.params.rating) * -1 ;

      } else {
        this.currentRate = this.common.params.rating;
      }
      this.ticketId = this.common.params.ticketId;
      this.remark = this.common.params.remark;


     
      console.log(this.isNegetive);
      console.log(this.currentRate);
     }

  ngOnInit() {
  }
  closeModal(currentRate) {
    // console.log(response);
    if (currentRate > 0) {
      if (this.isNegetive) {
        this.activeModal.close({rating: this.currentRate * -1, remark: this.remark});

      }
      else {
        this.activeModal.close({rating: this.currentRate, remark: this.remark});

      }

    } else {
      this.activeModal.close(currentRate);
    }
  }

  SendRating() {
    if (this.isNegetive) {
      this.currentRate = -this.currentRate
    }
    const params = {
      ticketId: this.ticketId,
      currentRate: this.currentRate,
      isFutureRef: this.isFutureRef,
      remark: this.remark
    };
    console.log(params);
if (this.currentRate != 0) {
  this.closeModal({rating: this.currentRate, remark: this.remark});
  this.common.loading++
  this.api.post('Users/setUserTicketRating', params).subscribe( res => {
      this.common.loading--
      if(res['code']===0) { this.common.showError(res['msg']); return false;};
      this.common.showToast[res['msg']];
  }, err => {
    this.common.loading--;
    this.common.showError();
    console.log(err);
  });
} else {
  this.common.showError('Rate First');
}
     

  }

}
