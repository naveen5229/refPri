import { Subject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {
visitlistView:boolean = false;
visitDetailView:boolean = false;
expensdetail:any = [];
private subject = new Subject<any>();

constructor() { }

sendClickEvent() {
  this.subject.next();
}
getClickEvent(): Observable<any>{
  return this.subject.asObservable();
}


}


