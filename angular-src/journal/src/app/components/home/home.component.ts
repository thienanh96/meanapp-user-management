import { Component, OnInit } from '@angular/core';
import { AuthService} from '../../services/auth.service';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import {NavbarComponent} from '../navbar/navbar.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
tempConfigProvider = {client_id: '',authEndpoint: '', redirect_uri: ''};
code: String;
name: String;
  constructor(private authService: AuthService, private location: Location,private router: Router, private navbarComponent: NavbarComponent) {}	

  ngOnInit() {          
    let params = new URLSearchParams(this.location.path(false).split('?')[1]);
    this.code = params.get('code');  
    if(this.code){
      let provider = localStorage.getItem('provider');
      let auth_config = localStorage.getItem('authConfig');
      this.tempConfigProvider = JSON.parse(auth_config)[provider];
      this.authService.loginProvider(this.code,this.tempConfigProvider.authEndpoint).subscribe(data => { 
        this.authService.storeUserData(data.token,data.user);
        this.router.navigate(['']);
        this.navbarComponent.setSmallProfileImage()
      })
    } else {
      this.navbarComponent.setSmallProfileImage()
    }
  }

}
