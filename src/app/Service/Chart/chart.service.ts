import { Injectable } from '@angular/core';
import * as Chart from 'chart.js'

@Injectable({
  providedIn: 'root'
})
export class ChartService {
  myChart: any;
  ctx: any;
  constructor() { }

  generatePieChart(charDatas) {

    charDatas.forEach(chartData => {
      this.ctx = chartData.canvas.getContext('2d');
    this.myChart = new Chart(this.ctx, {
      type: 'pie',
      data: {
          labels: chartData.labels,
          datasets: [{
              label: '# of Votes',
              data: chartData.data,
              backgroundColor: chartData.bgColor ? chartData.bgColor : [
                'purple',
                'green',
                'red',
                'brown',                
                'magenta'
            ],
              borderWidth: 1
          }]
      },
      options: {
        responsive: true,
        display:true,
        legend: {
          display: chartData.showLegend
        },
        
      }
    });
    });
  }
}
