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
    let charts = [];
    charDatas.forEach(chartData => {
      charts.push(new Chart(chartData.canvas.getContext('2d'), {
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
          display: true,
          legend: {
            display: chartData.showLegend,
            labels: [1,2,3,4,5]
          },
          plugins: {
            labels: {
              // render 'label', 'value', 'percentage', 'image' or custom function, default is 'percentage'
              render: 'label',
        }
      }
    }
      }));
    })
    return charts;
  }
}