import { Component, OnInit } from '@angular/core';
import { MapService } from '../../Service/map/map.service';

@Component({
  selector: 'ngx-distance-calculate',
  templateUrl: './distance-calculate.component.html',
  styleUrls: ['./distance-calculate.component.scss']
})
export class DistanceCalculateComponent implements OnInit {

  startDate = new Date();
  endDate = new Date();

  constructor(public mapService: MapService) {
   
   }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.mapService.mapIntialize("map", 18, 25, 75, true);
  }

}
