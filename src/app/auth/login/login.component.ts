import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ngx-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  userDetails = {
    mobile: '',
    otp: '',
  };

  listenOTP = false;
  otpCount = 0;
  formSubmit = false;

  constructor() { 
    this.showbackground();
  }

  ngOnInit() {
  }

  showbackground(){
    let nbCard = document.getElementsByTagName('nb-card')[0];
      nbCard['style']['backgroundImage'] = "url('http://elogist.in./images/app-login-bg.jpg')";
      nbCard['style']['backgroundSize'] = 'cover';
      nbCard['style']['backgroundRepeat'] = 'no-repeat';
      nbCard['style']['backgroundPosition'] = 'bottom';
      nbCard['style']['height'] = '100%';
  }

  sendOTP() {
    this.listenOTP=true;
    console.log("OTP");
   
  }


}
