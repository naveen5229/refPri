import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'ngx-modal-container',
  templateUrl: './modal-container.component.html',
  styleUrls: ['./modal-container.component.scss']
})
export class ModalContainerComponent implements OnDestroy  {

  destroy = new Subject<any>();
  currentDialog = null;

  constructor(
    private modalService: NgbModal,
    route: ActivatedRoute,
    router: Router
  ) {
    route.params.pipe(takeUntil(this.destroy)).subscribe(params => {

        // When router navigates on this component is takes the params and opens up the modal component
        this.currentDialog = this.modalService.open(ModalComponent, {centered: true});
        this.currentDialog.componentInstance.photo = params.id;

        // Go back to home page after the modal is closed
        this.currentDialog.result.then(result => {
            router.navigateByUrl('pages/leave-type-management');
        }, reason => {
            router.navigateByUrl('pages/leave-type-management');
        });
    });
  }

  ngOnDestroy() {
    this.destroy.next();
  }

}
