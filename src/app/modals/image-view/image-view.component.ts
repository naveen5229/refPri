import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';

@Component({
  selector: 'ngx-image-view',
  templateUrl: './image-view.component.html',
  styleUrls: ['./image-view.component.scss']
})
export class ImageViewComponent implements OnInit {
  refId = null;
  refType = null;
  docType = null;
  title = '';
  images = [];
  refdata = [];
  activeImage = '';
  params = "";
  index = 0 ;
  constructor(public api: ApiService,
    public common: CommonService,
    private activeModal: NgbActiveModal) {
      
     
    let ref = this.common.params.refdata;

    if (this.common.params.refdata && this.common.params.refdata.refid) {
      this.params = "refType=" + ref.reftype + "&refId=" + ref.refid + "&docTypeId=" + ref.doctype;
      this.viewImage();
    }
    else if (this.common.params.refdata && this.common.params.refdata.docid) {
      this.params = "docId=" + this.common.params.refdata.docid;
      this.viewImage();
    }
    else {
      console.log("image", this.common.params.images)
      this.images= this.common.params.images.map(image => image.image);
      this.title = this.common.params.title;
      this.activeImage = this.images[this.index];
    }

  }

  viewImage() {
    this.common.loading++;
    this.api.get('Documents/getRepositoryImages?' + this.params)
      .subscribe(res => {
        this.common.loading--;
        console.log(res['data']);
        if (res['data']) {
          res['data'].map(img =>
            this.images.push(img.url)
          )
          this.activeImage = this.images[this.index];
        }
      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }

  ngOnInit() {
  }

  closeModal() {
    this.activeModal.close();
  }

  nextMove(){
    this.index++;
   if(this.index>this.images.length-1){
     this.activeImage = this.images[0];
  }else{
    this.activeImage = this.images[this.index];
  }
}
  backMove(){
    this.index--;
    if(this.index<0){
      this.activeImage = this.images[this.images.length-1];
   }else{
     this.activeImage = this.images[this.index];
   }
  }

}
