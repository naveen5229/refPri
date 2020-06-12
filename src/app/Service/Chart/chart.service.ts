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
    console.log(charDatas);
    charDatas.forEach(chartData => {
      charts.push(new Chart(chartData.canvas.getContext('2d'), {
        type: 'pie',
        data: {
          labels: chartData.labels,
          datasets: [{
            label: 'Counts',
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
          }
    }
      }));
    })
    return charts;
  }

  generateBarChart(charDatas) {
    let charts = [];
    console.log(charDatas);
    charDatas.forEach(chartData => {
      charts.push(new Chart(chartData.canvas.getContext('2d'), {
        type: 'horizontalBar',
        data: {
          labels: chartData.labels,
          datasets: [{
            order: 0,
            label: '# of Votes',
            data: chartData.data,
            backgroundColor: chartData.bgColor ? chartData.bgColor : [
             '#FFD700',
             '#FFD700',
             '#FFD700'
            ],
            // borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          display: true,
          legend: {
            display: chartData.showLegend,
          },
          scales: {
            xAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
      }));
    })
    console.log(charts);
    return charts;
  }

}