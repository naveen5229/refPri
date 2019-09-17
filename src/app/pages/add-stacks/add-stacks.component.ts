import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';

@Component({
  selector: 'ngx-add-stacks',
  templateUrl: './add-stacks.component.html',
  styleUrls: ['./add-stacks.component.scss']
})
export class AddStacksComponent implements OnInit {

  stacks=[];
  stackParentId=null;
  stackchildId=null;
  stackChilds=[];
  stackParent=null;

  constructor(public common:CommonService,
    public api:ApiService) { 
      this.getStacks();
      this.getStacksChilds();
      this.common.refresh = this.refresh.bind(this);
    }

    refresh(){
      this.getStacks();
      this.getStacksChilds();
    }

  ngOnInit() {
  }

  getStacks() {
    this.common.loading++;
    this.api.get('Projects/getAllStack')
      .subscribe(res => {
        this.common.loading--;
        console.log("list", res);
        this.stacks = res['data'];
      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }

  addStack() {
    if(this.stackParentId==null){
      this.common.showError("Stack name is Missing")
    }
   else  if(this.stackchildId==null){
      this.common.showError("Stack child name is Missing")
    }else{
      let params = {
        stackParentId:this.stackParentId,
        stackChildName:this.stackchildId,
      }
      this.common.loading++;
      this.api.post('Projects/addStack', params)
        .subscribe(res => {
          this.common.loading--;
          if (res['success']) {
            this.common.showToast(res['msg']);
            this.stackchildId=null;
            this.getStacksChilds();
          }
        }, err => {
          this.common.loading--;
          console.log(err);
          this.common.showError();
        });
    }   
  }

  getStacksChilds() {
    this.common.loading++;
    this.api.get('Projects/getAllStackChilds')
      .subscribe(res => {
        this.common.loading--;
        this.stackChilds=res['data'];
      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }
  
  deletestackChild(stackchildId,rowId){
    let params = {
      stackChildId:stackchildId
    }
    this.common.loading++;
    this.api.post('Projects/deleteStackChild', params)
      .subscribe(res => {
        this.common.loading--;
        console.log("res", res);
        if (res['success']) {
          this.common.showToast(res['msg']);
          this.stackChilds.splice(rowId,1);
        }
      }, err => {
        this.common.loading--;
        console.log(err);
        this.common.showError();
      });
  }

}
