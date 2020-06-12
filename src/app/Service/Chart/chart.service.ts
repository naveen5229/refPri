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
          labels: chartData.labels[0],
          datasets: [{
            label: 'Counts',
            data: chartData.data[0],
            backgroundColor: chartData.bgColor ? chartData.bgColor : ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6', 
            '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
            '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A', 
            '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
            '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC', 
            '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
            '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680', 
            '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
            '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3', 
            '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'],
            borderWidth: 1
          }]
        },
        options: {
          maintainAspectRatio: false,
          aspectRatio: 1.5,
          responsive: true,
          display: true,
          legend: {
            display: true,
            labels: {
              fontColor: 'rgb(255, 99, 132)'
          }          }
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
            label: 'Counts',
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