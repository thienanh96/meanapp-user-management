import { Component, OnInit } from '@angular/core';
import { SharedServiceService } from '../../services/shared-service.service';
import { AuthService } from '../../services/auth.service'
import {NavbarComponent} from '../navbar/navbar.component';
import { Router } from '@angular/router';
import { FlashMessagesService } from 'angular2-flash-messages';
import {FormControl, Validators} from '@angular/forms';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  username: String;
  password: String;
  authEndpoint: String;
  usernameFormControl = new FormControl('', [
    Validators.required]);
  passwordFormControl = new FormControl('', [
    Validators.required]);
  constructor(
    private authService: AuthService,
    private shareService: SharedServiceService,
    private router:Router,
    private flashMessage:FlashMessagesService,
    private navbarComponent: NavbarComponent
  ) {}

  ngOnInit() {
    localStorage.setItem('authConfig',JSON.stringify({
      facebook: 
        {client_id: '1972338099664129',authEndpoint: 'http://localhost:3000/auth/facebook', redirect_uri: 'http://localhost:4200'},
      google:
        {client_id: '267825466382-sj3e4nh9g8sr8qbk5bv1mqaj8p8031oh.apps.googleusercontent.com',authEndpoint: 'http://localhost:3000/auth/google', redirect_uri: 'http://localhost:4200'}
    }));

  }

  onLoginSubmit(){
    const user = {
      username: this.username,
      password: this.password
    }

    this.authService.authenticateUser(user).subscribe(data => {
      if(data.success){
        let savedUser = {
          _id: data.user._id,
          username: data.user.username,
          name: data.user.name,
          role: data.user.role,
          email: data.user.email,
          avatar: data.user.avatar
        }
        this.authService.storeUserData(data.token, savedUser);
        this.shareService.observeTokenSubject(data.token);
        //this.authService.observeStatusOfData(data.token);
       // this.navbarComponent.setSmallProfileImage(data.user.avatar);
        this.flashMessage.show('You are now logged in', {
          cssClass: 'alert-success',
          timeout: 3000});
        this.router.navigate(['']);
      } else {
        this.flashMessage.show(data.msg, {
          cssClass: 'alert-danger',
          timeout: 3000});
        this.router.navigate(['login']);
      }
    });
  }

  onLoginFacebook(){
    this.authService.authProvider('facebook',JSON.parse(localStorage.getItem('authConfig')));
  }
  onLoginGoogle(){
    this.authService.authProvider('google',JSON.parse(localStorage.getItem('authConfig')));
  }


}
