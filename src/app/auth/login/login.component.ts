import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../Service/Api/api.service';
import { UserService } from '../../Service/user/user.service';
import { Router } from '@angular/router';
import { CommonService } from '../../Service/common/common.service';

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

  constructor(public api: ApiService,
    public router: Router,
    public common: CommonService,
    public user: UserService) {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.removeDummy();
  }

  removeDummy() {
    let allTags = document.getElementsByTagName('nb-card-header');
    document.getElementsByTagName('nb-layout-column')[0]['style']['padding'] = '0px';
    allTags[0]['style'].display = 'none';
    console.log('All Tags: ', allTags);
    let nbCard = document.getElementsByTagName('nb-card')[0];
    // nbCard['style']['backgroundColor'] = "#000";
    //nbCard['style']['backgroundImage'] = "url('https://images.unsplash.com/photo-1541233349642-6e425fe6190e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&w=1000&q=80')";
    nbCard['style']['backgroundImage'] = "url('http://elogist.in./images/app-login-bg.jpg')";
    nbCard['style']['backgroundSize'] = 'cover';
    nbCard['style']['backgroundRepeat'] = 'no-repeat';
    nbCard['style']['backgroundPosition'] = 'bottom';
    nbCard['style']['height'] = '100%';

  }

  sendOTP() {
    console.log("OTP");
    let params = {
      mobileno: this.userDetails.mobile
    }
    this.common.loading++;
    this.api.post('Login/login', params)
      .subscribe(res => {
        this.common.loading--;
        if (res['success']) {
          this.listenOTP = true;
          this.otpCount = 30;
          this.otpResendActive();
          this.common.showToast(res['msg']);
        } else {
          this.common.showError(res['msg']);
        }
      },
        err => {
          this.common.loading--;
          this.common.showError();
        });
  }

  otpResendActive() {
    if (this.otpCount > 0) {
      setTimeout(this.otpResendActive.bind(this, --this.otpCount), 1000);
    }
  }

  login() {
    let params = {
      mobileno: this.userDetails.mobile,
      otp: this.userDetails.otp
    }
    this.common.loading++;
    this.api.post('Login/verifyOtp', params)
      .subscribe(res => {
        this.common.loading--;;
        if (res['success']) {
          localStorage.setItem('ITRM_USER_TOKEN', res['data'][0]['authkey']);
          localStorage.setItem('ITRM_USER_DETAILS', JSON.stringify(res['data'][0]));
          this.user._details = res['data'][0];
          this.user._token = res['data'][0]['authkey'];
          this.common.showToast(res['msg']);
          this.router.navigate(['/pages/dashboard']);
        }
      },
        err => {
          this.common.loading--;
          this.common.showError();
        });
  }


}
