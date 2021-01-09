import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem, CdkDragRelease, CdkDragEnd, CdkDragStart } from '@angular/cdk/drag-drop';
import { ApiService } from '../../Service/Api/api.service';
import { ChartService } from '../../Service/Chart/chart.service';
import { CommonService } from '../../Service/common/common.service';

@Component({
  selector: 'ngx-kanban-board',
  templateUrl: './kanban-board.component.html',
  styleUrls: ['./kanban-board.component.scss']
})
export class KanbanBoardComponent implements OnInit {
  dashboardState = false;
  processList = [];
  processListTable = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  }
  cards = [];

  constructor(
    public common: CommonService,
    public api: ApiService,
    public chart: ChartService) {
    this.getProcessListByUser();
  }

  ngOnInit() {
  }

  getProcessListByUser() {
    this.common.loading++;
    this.api.get(`Processes/getProcessListByUser`).subscribe((res) => {
      this.common.loading--;
      if (res['code'] == 1) {
        this.processList = res['data'] || [];
        this.setProcessList();
      } else {
        this.common.showError(res['msg']);
      }
    }, (err) => {
      this.common.loading--;
      this.common.showError(err);
    });
  }

  setProcessList() {
    this.processListTable.data = {
      headings: this.generateHeadingsProcessList(),
      columns: this.getTableColumnsProcessList()
    };
    return true;
  }

  generateHeadingsProcessList() {
    let headings = {};
    for (var key in this.processList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
      if (key === "addtime" || key === "action_addtime") {
        headings[key]["type"] = "date";
      }
    }
    return headings;
  }

  getTableColumnsProcessList() {
    let columns = [];
    this.processList.map(process => {
      let column = {};
      for (let key in this.generateHeadingsProcessList()) {
        if (key.toLowerCase() == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(process),
            _data: process
          };
        } else {
          column[key] = { value: process[key], class: 'black', action: '' };
        }

        // column['style'] = { 'background': this.common.taskStatusBg(process._status) };
      }
      columns.push(column);
    });
    return columns;
  }

  actionIcons(lead) {
    let Icons = [{
      class: "fa fa-eye",
      action: this.goToBoard.bind(this, lead),
      txt: "",
      title: "add child task",
    }];

    return Icons
  }

  goToBoard(lead) {
    console.log("🚀 ~ file: kanban-board.component.ts ~ line 177 ~ KanbanBoardComponent ~ goToBoard ~ lead", lead);
    let params = `processId=${lead._id}&filter=null`
    this.common.loading++;
    this.api.get(`Processes/getProcessBoardView?` + params).subscribe((res) => {
      this.common.loading--;
      this.cards = res['data'] || [];
      this.dashboardState = true;
    }, (err) => {
      this.common.loading--;
      this.common.showError(err);
    });
  }

  onDragStarted(event: CdkDragStart<string[]>) {
    console.log("onDragStarted:", event);
    let connTo = JSON.parse(JSON.stringify(event.source.dropContainer.connectedTo));
    if (connTo) {
      connTo.forEach(e2 => {
        document.getElementById(e2).style.border = 'inset';
        document.getElementById(e2).style.borderColor = 'gray';
        // console.log(document.getElementById(e2).children[4]);
        // document.getElementById(e2).children[4].classList.add('dragStyle');
      });
    }
  };
  onDragEnded(event: CdkDragEnd<string[]>) {
    console.log("onDragEnded:", event);
    let connTo = JSON.parse(JSON.stringify(event.source.dropContainer.connectedTo));
    if (connTo) {
      connTo.forEach(e2 => {
        console.log("connTo:", e2);
        document.getElementById(e2).style.border = null;
        document.getElementById(e2).style.borderColor = null;
        // document.getElementById(e2).children[4].classList.remove('dragStyle');
      });
    }
  };

  drop(event: CdkDragDrop<string[]>) {
    console.log("🚀 ~ file: kanban-board.component.ts ~ line 86 ~ KanbanBoardComponent ~ drop ~ event", event);

    if (event.previousContainer === event.container) {
      // moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);

    } else {
      console.log('Pd', event.previousContainer.data)
      // transferArrayItem(event.previousContainer.data,
      //                   event.container.data,
      //                   event.previousIndex,
      //                   event.currentIndex);
      if (event.container['_disabled']) {
        return;
      }
      this.cards.forEach(data => {
        if (data.id === event.container.id) {
          data.data.push(JSON.parse(JSON.stringify(event.previousContainer.data[event.previousIndex])));
        }
        setTimeout(() => {
          if (data.id === event.previousContainer.id) {
            data.data.splice(event.previousIndex, 1);
          }
        }, 200);
      })
    }

    console.log("🚀 ~ file: kanban-board.component.ts ~ line 86 ~ KanbanBoardComponent ~ drop ~ event", this.cards)
  }

  applyStyle() {

  }

}
