"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.LoginComponent = void 0;
var core_1 = require("@angular/core");
var LoginComponent = /** @class */ (function () {
    function LoginComponent(api, router, route, common, user, messageService) {
        this.api = api;
        this.router = router;
        this.route = route;
        this.common = common;
        this.user = user;
        this.messageService = messageService;
        this.userDetails = {
            mobile: '',
            otp: ''
        };
        this.qrCode = null;
        this.elementType = 'url';
        this.listenOTP = false;
        this.otpCount = 0;
        this.loginType = 2;
        this.interval = null;
        this.formSubmit = false;
        this.button = 'Send';
    }
    LoginComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.route.params.subscribe(function (params) {
            console.log(params);
            if (params.type && (params.type.toLowerCase() == 'admin')) {
                _this.button = 'Generate Qr-Code';
                _this.user._loggedInBy = params.type.toLowerCase();
            }
            else if (params.type) {
                _this.router.navigate(['/auth/login']);
                return;
            }
            else {
                _this.user._loggedInBy = 'customer';
                _this.button = 'Send';
            }
            console.log("Login By", _this.user._loggedInBy);
        });
    };
    LoginComponent.prototype.ngAfterViewInit = function () {
        this.removeDummy();
    };
    LoginComponent.prototype.removeDummy = function () {
        var allTags = document.getElementsByTagName('nb-card-header');
        document.getElementsByTagName('nb-layout-column')[0]['style']['padding'] = '0px';
        allTags[0]['style'].display = 'none';
        console.log('All Tags: ', allTags);
        var nbCard = document.getElementsByTagName('nb-card')[0];
        // nbCard['style']['backgroundColor'] = "#000";
        //nbCard['style']['backgroundImage'] = "url('https://images.unsplash.com/photo-1541233349642-6e425fe6190e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&w=1000&q=80')";
        nbCard['style']['backgroundImage'] = "url('http://elogist.in./images/app-login-bg.jpg')";
        nbCard['style']['backgroundSize'] = 'cover';
        nbCard['style']['backgroundRepeat'] = 'no-repeat';
        nbCard['style']['backgroundPosition'] = 'bottom';
        nbCard['style']['height'] = '100%';
    };
    LoginComponent.prototype.sendOTP = function () {
        var _this = this;
        console.log("Login By", this.user._loggedInBy);
        this.qrCode = Math.floor(Math.random() * 1000000);
        if (this.qrCode.length != 6) {
            this.qrCode = Math.floor(Math.random() * 1000000);
        }
        this.qrCode = this.qrCode.toString();
        console.log("OTP", this, this.qrCode);
        var params = {
            mobileno: this.userDetails.mobile,
            qrcode: this.qrCode
        };
        console.log(this.user);
        if (this.user._loggedInBy == 'customer') {
            this.common.loading++;
            this.api.post('FoAdmin/login', params).subscribe(function (res) {
                _this.common.loading--;
                if (res['code'] > 0) {
                    _this.listenOTP = true;
                    _this.otpCount = 30;
                    if (res['data'] && res['data']['login_type'] && res['data']['login_type'] > 0) {
                        _this.loginType = res['data']['login_type'];
                    }
                    if (_this.loginType === 2) {
                        _this.qrCodeRegenrate();
                    }
                    // this.qrCodeRegenrate();
                    _this.otpResendActive();
                    _this.common.showToast(res['msg']);
                }
                else {
                    _this.common.showError(res['msg']);
                }
            }, function (err) {
                _this.common.loading--;
                _this.common.showError();
            });
        }
        else if (this.user._loggedInBy == 'admin') {
            this.common.loading++;
            this.api.post('Login/login', params)
                .subscribe(function (res) {
                _this.common.loading--;
                if (res['code'] > 0) {
                    _this.listenOTP = true;
                    _this.otpCount = 30;
                    _this.qrCodeRegenrate();
                    _this.otpResendActive();
                    _this.common.showToast(res['msg']);
                }
                else {
                    _this.common.showError(res['msg']);
                }
            }, function (err) {
                _this.common.loading--;
                _this.common.showError();
            });
        }
    };
    LoginComponent.prototype.qrCodeRegenrate = function () {
        var _this = this;
        setTimeout(function () {
            _this.listenOTP = false;
            _this.otpCount = 0;
            _this.formSubmit = false;
            _this.qrCode = null;
        }, 40000);
        this.interval = setInterval(function () {
            _this.login();
        }, 5000);
    };
    LoginComponent.prototype.otpResendActive = function () {
        --this.otpCount;
        if (this.otpCount > 0) {
            setTimeout(this.otpResendActive.bind(this), 1000);
        }
    };
    LoginComponent.prototype.login = function () {
        var _this = this;
        if (this.otpCount <= 0) {
            clearInterval(this.interval);
        }
        var params = {
            mobileno: this.userDetails.mobile,
            qrcode: (this.loginType === 2) ? this.qrCode : null,
            otp: (this.loginType != 2) ? this.userDetails.otp : null
        };
        console.log(this.user);
        var apiCall = null;
        if (this.user._loggedInBy == 'customer') {
            apiCall = 'FoAdmin/verifyOtp';
        }
        else if (this.user._loggedInBy == 'admin') {
            apiCall = 'Login/verifyOtp';
        }
        if (apiCall) {
            (this.loginType === 2) ? null : this.common.loading++;
            this.api.post(apiCall, params).subscribe(function (res) {
                (_this.loginType === 2) ? null : _this.common.loading--;
                if (res['code'] == 1) {
                    _this.common.showToast(res['msg']);
                    clearInterval(_this.interval);
                    localStorage.setItem('ITRM_USER_TOKEN', res['data'][0]['authkey']);
                    localStorage.setItem('ITRM_USER_DETAILS', JSON.stringify(res['data'][0]));
                    localStorage.setItem('ITRM_LOGGED_IN_BY', _this.user._loggedInBy);
                    if (res['data'][0]["generalProfiles"]) {
                        res['data'][0]["generalProfiles"].forEach(function (ele) {
                            if (ele.profile_name == 'Landing Page') {
                                // localStorage.setItem('LANDING_PAGE','pages/task' );
                                localStorage.setItem('LANDING_PAGE', ele.profile_value.substring(1, ele.profile_value.length));
                            }
                            else {
                                localStorage.setItem('LANDING_PAGE', 'pages/task');
                            }
                        });
                    }
                    else {
                        localStorage.setItem('LANDING_PAGE', 'pages/task');
                    }
                    _this.user._details = res['data'][0];
                    _this.user._token = res['data'][0]['authkey'];
                    _this.user.loggedInUser = { id: _this.user._details.id, name: _this.user._details.name };
                    _this.getUserPagesList();
                    _this.messageService.updateWebToken();
                }
                else {
                    if (_this.loginType != 2) {
                        _this.common.showError(res['msg']);
                    }
                }
            }, function (err) {
                _this.common.loading--;
                _this.common.showError();
            });
        }
        // if (this.user._loggedInBy == 'customer') {
        //   this.common.loading++;
        //   this.api.post('FoAdmin/verifyOtp', params)
        //     .subscribe(res => {
        //       this.common.loading--;
        //       if (res['code'] == 1) {
        //         this.common.showToast(res['msg']);
        //         clearInterval(this.interval);
        //         localStorage.setItem('ITRM_USER_TOKEN', res['data'][0]['authkey']);
        //         localStorage.setItem('ITRM_USER_DETAILS', JSON.stringify(res['data'][0]));
        //         localStorage.setItem('ITRM_LOGGED_IN_BY', this.user._loggedInBy);
        //         this.user._details = res['data'][0];
        //         this.user._token = res['data'][0]['authkey'];
        //         this.getUserPagesList();
        //         // this.router.navigate(['/pages/dashboard']);
        //         // this.router.navigate(['/pages/task']);
        //       } else {
        //         this.common.showError(res['msg']);
        //       }
        //     }, err => {
        //       this.common.loading--;
        //       this.common.showError();
        //     });
        // }
        //  else if (this.user._loggedInBy == 'admin') {
        //   this.common.loading++;
        //   this.api.post('Login/verifyOtp', params)
        //     .subscribe(res => {
        //       this.common.loading--;
        //       if (res['code'] == 1) {
        //         this.common.showToast(res['msg']);
        //         clearInterval(this.interval);
        //         localStorage.setItem('ITRM_USER_TOKEN', res['data'][0]['authkey']);
        //         localStorage.setItem('ITRM_USER_DETAILS', JSON.stringify(res['data'][0]));
        //         localStorage.setItem('ITRM_LOGGED_IN_BY', this.user._loggedInBy);
        //         this.user._details = res['data'][0];
        //         this.user._token = res['data'][0]['authkey'];
        //         this.getUserPagesList();
        //         // this.router.navigate(['/pages/dashboard']);
        //         // this.router.navigate(['/pages/task']);
        //       } else {
        //         this.common.showError(res['msg']);
        //       }
        //     },
        //       err => {
        //         this.common.loading--;
        //         this.common.showError();
        //       });
        // }
    };
    LoginComponent.prototype.getUserPagesList = function () {
        var _this = this;
        this.user._pages = null;
        // let userTypeId = this.user._loggedInBy == 'admin' ? 1 : 3;
        // const params = {
        //   userId: this.user._details.id,
        //   userType: userTypeId
        // };
        this.common.loading++;
        this.api.get('UserRole/getUserPages.json?adminId=' + this.user._details.id)
            .subscribe(function (res) {
            _this.common.loading--;
            if (res['code'] === 0) {
                _this.common.showError(res['msg']);
                return false;
            }
            ;
            _this.user._pages = res['data'].filter(function (page) { return page._userid; });
            localStorage.setItem('ITRM_USER_PAGES', JSON.stringify(_this.user._pages));
            _this.user.filterMenu("pages", "pages");
            console.log("UserService._landingPage", localStorage.getItem("LANDING_PAGE"));
            if (_this.user._loggedInBy == 'customer') {
                _this.router.navigate([localStorage.getItem("LANDING_PAGE")]);
            }
            else {
                _this.router.navigate([localStorage.getItem("LANDING_PAGE")]);
            }
        }, function (err) {
            _this.common.loading--;
            _this.common.showError();
            console.log('Error: ', err);
        });
    };
    LoginComponent.prototype.backToLogin = function () {
        this.listenOTP = false;
        this.otpCount = 0;
        this.qrCode = null;
        this.formSubmit = false;
        clearInterval(this.interval);
    };
    LoginComponent = __decorate([
        core_1.Component({
            selector: 'ngx-login',
            templateUrl: './login.component.html',
            styleUrls: ['./login.component.scss']
        })
    ], LoginComponent);
    return LoginComponent;
}());
exports.LoginComponent = LoginComponent;
