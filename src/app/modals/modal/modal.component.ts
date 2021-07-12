import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'ngx-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {
  // Output() modalClose : EventEmitter<any> = new EventEmitter<any>();
  // constructor(private router : Router) { }

  ngOnInit() {
  }

  // closeModal( $event ) {
  //   this.router.navigate([{outlets: {modal: null}}]);
  //   this.modalClose.next($event);
  // }

  @Input() photo;

  getLargeImageUrl(imageId) {
    return `https://picsum.photos/500?image=${imageId}`;
  }

}
