import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddNewCampaignComponent } from '../../modals/campaign-modals/add-new-campaign/add-new-campaign.component';

@Component({
  selector: 'ngx-add-campaign',
  templateUrl: './add-campaign.component.html',
  styleUrls: ['./add-campaign.component.scss']
})
export class AddCampaignComponent implements OnInit {

  constructor(public api: ApiService,
    public common: CommonService,
    public modalService: NgbModal) { }

  ngOnInit() {
  }

  addCampaign() {
    const activeModal = this.modalService.open(AddNewCampaignComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
      }
    });
  }

}
