import { Injectable } from '@angular/core';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { BehaviorSubject } from 'rxjs'
import { ApiService } from './Api/api.service';
import { UserService } from './user/user.service';

@Injectable({
  providedIn: 'root'
})
export class MessagingService {
  currentMessage = new BehaviorSubject(null);
  constructor(private angularFireMessaging: AngularFireMessaging,
    private userService: UserService,
    private api : ApiService) {
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
  webToken = null;
  requestPermission() {
    console.log("request permission");
  this.angularFireMessaging.requestToken.subscribe(
  (token) => {
  console.log("token",token);
  this.webToken = token;
    this.updateWebToken();
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
   console.log("new message received here. ", payload);
  this.currentMessage.next(payload);
  })
  // this.angularFireMessaging.messages.subscribe(
  //   (payload:any) => {
  //       console.log("new message received. ", payload);
  //       const NotificationOptions = {
  //               body: payload.notification.body,
  //               data: payload.data,
  //               icon: payload.notification.icon
  //             }
  //             navigator.serviceWorker.getRegistration('/firebase-cloud-messaging-push-scope').then(registration => {
  //               registration.showNotification(payload.notification.title, NotificationOptions);
  //             });
  //       this.currentMessage.next(payload);})
  }

  updateWebToken(){
      let params ={
        webToken:this.webToken
      }
      this.api.post('Admin/updateWebToken.json', params).subscribe(res => {
       console.log(res);
      }, err => {
        console.log(err);
      });
  }
  }