import { Component, OnInit } from '@angular/core';
import { ValidateService } from '../../services/validate.service';
import { AuthService } from '../../services/auth.service';
import { FlashMessagesService } from 'angular2-flash-messages';
import { Router } from '@angular/router';
import {FormControl, Validators} from '@angular/forms';

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
const PASSWORD_REGEX = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  name: String;
  username: string;
  email: string;
  password: String;
  usernameFormControl = new FormControl('', [
    Validators.required]);
  nameFormControl = new FormControl('', [
    Validators.required]);
  emailFormControl = new FormControl('', [
    Validators.required, Validators.pattern(EMAIL_REGEX)]);
  passwordFormControl = new FormControl('', [
    Validators.required, Validators.pattern(PASSWORD_REGEX)]);
  constructor(
    private validateService: ValidateService,
    private flashMessage:FlashMessagesService,
    private authService:AuthService,
    private router: Router
  ) { }

  ngOnInit() {
  }

  onRegisterSubmit(){
    let user = {
      name: this.name,
      email: this.email,
      username: this.username,
      password: this.password,
      role: 'Normal User'
    }

    // Validation
    if(!this.validateService.validateRegister(user) || !this.validateService.validateEmail(user.email) || !this.validateService.validatePasword(user.password)){
      this.flashMessage.show('Error occurs', {cssClass: 'alert-danger', timeout: 3000});
      return false;
    }

    // Register user
    this.authService.registerUser(user).subscribe(data => {
      if(data.success){
        localStorage.setItem('currentEmail',this.email);
        this.flashMessage.show('You are now registered and can log in !', {cssClass: 'alert-success', timeout: 3000});
        this.router.navigate(['/login']);
      } else {
        this.flashMessage.show(data.msg, {cssClass: 'alert-danger', timeout: 3000});
        this.router.navigate(['/register']);
      }
    });

  }

}
