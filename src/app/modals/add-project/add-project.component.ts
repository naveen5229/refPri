import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';

@Component({
  selector: 'ngx-add-project',
  templateUrl: './add-project.component.html',
  styleUrls: ['./add-project.component.scss']
})
export class AddProjectComponent implements OnInit {
  project = {
    projectDesc: "",
    ownerId: "",
    users: []
  };
  btn = 'Save';

  constructor(public activeModal: NgbActiveModal,
    public api: ApiService,
    public common: CommonService, ) {
    console.log("task list", this.common.params)
  }

  ngOnInit() {

  }

  closeModal(response) {
    this.activeModal.close({ response: response });
  }

  selectedOwner(event) {
    this.project.ownerId = event.id;
  }
  changeUsers(event) {
    console.log("changeCCUsers:", event);
    if (event && event.length) {
      this.project.users = event.map(user => { return { user_id: user.id } });
      console.log("ccUsers", this.project.users);
    }
  }

  saveProject() {
    if (this.project.projectDesc == '') {
      return this.common.showError("Description is missing")
    }
    else if (this.project.ownerId == '') {
      return this.common.showError("Owner is missing")
    }
    else if (this.project.users.length == 0) {
      return this.common.showError("Assign atleast one user")
    }
    else {
      const params = {
        projectDesc: this.project.projectDesc,
        ownerId: this.project.ownerId,
        users: JSON.stringify(this.project.users),
      }
      this.common.loading++;
      this.api.post('AdminTask/addProject', params).subscribe(res => {
        console.log(res);
        this.common.loading--;
        // this.closeModal(true);
        if (res['data'][0]['y_id'] > 0) {
          this.common.showToast(res['data'][0].y_msg)
          this.closeModal(true);
        }
        else {
          this.common.showError(res['data'][0].y_msg)
        }
      },
        err => {
          this.common.loading--;
          this.common.showError();
          console.log('Error: ', err);
        });
    }
  }

}
