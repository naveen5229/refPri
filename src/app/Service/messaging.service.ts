import { Injectable } from '@angular/core';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { BehaviorSubject } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class MessagingService {
  currentMessage = new BehaviorSubject(null);
  constructor(private angularFireMessaging: AngularFireMessaging) {
  // this.angularFireMessaging.messaging.subscribe(
  // (_messaging) => {
  // _messaging.onMessage = _messaging.onMessage.bind(_messaging);
  // _messaging.onTokenRefresh = _messaging.onTokenRefresh.bind(_messaging);
  // }
  // )
  this.angularFireMessaging.messages.subscribe(
    (_messaging: any) => {
    _messaging.onMessage = _messaging.onMessage.bind(_messaging);
    _messaging.onTokenRefresh = _messaging.onTokenRefresh.bind(_messaging);
  })

  }
  requestPermission() {
    console.log("request permission");
  this.angularFireMessaging.requestToken.subscribe(
  (token) => {
  console.log("token",token);
  },
  (err) => {
  console.error('Unable to get permission to notify.', err);
  }
  );
  }
  receiveMessage() {
    console.log("receive Message");
  this.angularFireMessaging.messages.subscribe(
  (payload) => {
  console.log("new message received. ", payload);
  this.currentMessage.next(payload);
  })
  }
  }