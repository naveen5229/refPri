import { Injectable } from '@angular/core';
import {
  NbGlobalLogicalPosition,
  NbGlobalPhysicalPosition,
  NbGlobalPosition,
  NbToastrService,
  NbThemeService
} from "@nebular/theme";
@Injectable({
  providedIn: 'root'
})
export class CommonService {
loading=0;
  constructor(private toastrService:NbToastrService) { }

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
}
