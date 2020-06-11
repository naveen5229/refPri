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
  qrCode = null;
  elementType: 'url' | 'canvas' | 'img' = 'url';
  listenOTP = false;
  otpCount = 0;
  loginType = 1;
  interval = null;
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
    this.qrCode = Math.floor(Math.random() * 1000000);
    if (this.qrCode.length != 6) {
      this.qrCode = Math.floor(Math.random() * 1000000);
    }
    this.qrCode = this.qrCode.toString();
    console.log("OTP", this, this.qrCode);
    let params = {
      mobileno: this.userDetails.mobile,
      qrcode: this.qrCode
    }
    this.common.loading++;
    this.api.post('Login/login', params)
      .subscribe(res => {
        this.common.loading--;
        if (res['success']) {
          this.listenOTP = true;
          this.otpCount = 30;
          this.qrCodeRegenrate();
          this.otpResendActive();
          this.common.showToast(res['msg']);
        } else {
          this.common.showError(res['msg']);
        }
      }, err => {
        this.common.loading--;
        this.common.showError();
      });
  }

  qrCodeRegenrate() {
    setTimeout(() => {
      this.listenOTP = false;
      this.otpCount = 0;
      this.formSubmit = false;
      this.qrCode = null;
    }, 120000);
    this.interval = setInterval(() => {
      this.login();
    }, 5000);
  }

  otpResendActive() {
    --this.otpCount
    if (this.otpCount > 0) {
      setTimeout(this.otpResendActive.bind(this), 1000);
    }
  }

  login() {
    if (this.otpCount <= 0) {
      clearInterval(this.interval);
    }
    let params = {
      mobileno: this.userDetails.mobile,
      qrcode: this.qrCode
    }
    this.common.loading++;
    this.api.post('Login/verifyOtp', params)
      .subscribe(res => {
        this.common.loading--;
        if (res['success']) {
          this.common.showToast(res['msg']);
          clearInterval(this.interval);
          localStorage.setItem('ITRM_USER_TOKEN', res['data'][0]['authkey']);
          localStorage.setItem('ITRM_USER_DETAILS', JSON.stringify(res['data'][0]));
          this.user._details = res['data'][0];
          this.user._token = res['data'][0]['authkey'];
          this.getUserPagesList();
          // this.router.navigate(['/pages/dashboard']);
          // this.router.navigate(['/pages/task']);
        }
      },
        err => {
          this.common.loading--;
          this.common.showError();
        });
  }


  getUserPagesList() {
    this.user._pages = null;
    let userTypeId = this.user._loggedInBy == 'admin' ? 1 : 3;
    const params = {
      userId: this.user._details.id,
      userType: userTypeId
    };
    this.common.loading++;
    this.api.get('UserRole/getUserPages.json?adminId=' + this.user._details.id)
      .subscribe(res => {
        console.log(res);
        this.common.loading--;
        this.user._pages = res['data'].filter(page => { return page._userid; });
        console.log(this.user._pages);
        localStorage.setItem('ITRM_USER_PAGES', JSON.stringify(this.user._pages));
        this.user.filterMenu("pages", "pages");
        this.router.navigate(['/pages/task']);
      }, err => {
        this.common.loading--;
        console.log('Error: ', err);
      })
  }

  backToLogin() {
    this.listenOTP = false;
    this.otpCount = 0;
    this.qrCode = null;
    this.formSubmit = false;
    clearInterval(this.interval);
  }
}
