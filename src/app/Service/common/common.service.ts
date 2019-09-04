import { Injectable } from '@angular/core';
import { NbGlobalPhysicalPosition, NbToastrService } from '@nebular/theme';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  loading = 0;
  params=null;
  constructor(private toastrService: NbToastrService,
    private datePipe: DatePipe) { }

  showError(msg?, err?) {
    let message = msg || 'Something went wrong! try again.';
    message += err ? ' Error Code: ' + err.status : '';
    this.showToast(message, "danger");
  }

  showToast(body, type?, duration?, title?) {
    // toastTypes = ["success", "info", "warning", "primary", "danger", "default"]
    const config = {
      status: type || "success",
      destroyByClick: true,
      duration: duration || 5000,
      hasIcon: true,
      position: NbGlobalPhysicalPosition.TOP_RIGHT,
      preventDuplicates: false
    };
    this.toastrService.show(body, title || "Alert", config);
  }


  loaderHandling(action = 'hide') {
    if (this.loading == 0 && action == 'hide') return;
    else if (this.loading < 0) {
      this.loading = 0;
      return;
    } else if (action == 'show') this.loading++;
    else this.loading--;
  }

  ucWords(str) {
    str = str.toLowerCase();
    var words = str.split(' ');
    str = '';
    for (var i = 0; i < words.length; i++) {
      var word = words[i];
      word = word.charAt(0).toUpperCase() + word.slice(1);
      if (i > 0) { str = str + ' '; }
      str = str + word;
    }
    return str;
  }

  handleModalSize(type, name, size, sizeType = "px", position = 0) {
    setTimeout(() => {
      if (type == "class" && document.getElementsByClassName(name)[position]) {
        if (document.getElementsByClassName(name)[position]["style"]) {
          document.getElementsByClassName(name)[position]["style"].maxWidth =
            size + sizeType;
        }
      }
    }, 10);
  }
  handleModalheight(type, name, size, sizeType = "px", position = 0) {
    setTimeout(() => {
      if (type == "class") {
        document.getElementsByClassName(name)[position]["style"].minHeight =
          size + sizeType;
      }
    }, 10);
  }

  dateFormatter(date) {
    let d = new Date(date);
    let year = d.getFullYear();
    let month = d.getMonth() < 9 ? "0" + (d.getMonth() + 1) : d.getMonth() + 1;
    let dat = d.getDate() <= 9 ? "0" + d.getDate() : d.getDate();
    console.log(year + "-" + month + "-" + dat);
    return year + "-" + month + "-" + dat;
  }

  changeDateformate(date) {
    let d = new Date(date);
    return this.datePipe.transform(date, "dd-MMM-yyyy");
  }

}


