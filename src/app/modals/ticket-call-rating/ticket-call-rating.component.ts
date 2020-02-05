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

  currentRate = null;
  isFutureRef =  false;
  ticketId = '';
  rating = '';
  constructor(public common:CommonService,
    public api:ApiService,
    public activeModal:NgbActiveModal,
    public modalSService:NgbModal) {
      this.currentRate = this.common.params.rating;
      this.ticketId = this.common.params.ticketId;
     }

  ngOnInit() {
  }
  closeModal(currentRate) {
    // console.log(response);
    this.activeModal.close(currentRate);
  }

  SendRating() {
    const params = {
      ticketId: this.ticketId,
      currentRate: this.currentRate,
      isFutureRef: this.isFutureRef
    };
    this.closeModal(this.currentRate);

      this.common.loading++
    this.api.post('Users/setUserTicketRating', params).subscribe( res => {
        this.common.loading--
        this.common.showToast[res['msg']];
        console.log(res);
    }, err => {
      this.common.loading--;
      console.log(err);
    });
  }

}
