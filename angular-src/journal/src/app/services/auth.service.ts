import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import {Router} from '@angular/router';
import { Http, Headers,URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/map';
import { tokenNotExpired } from 'angular2-jwt';

@Injectable()
export class AuthService {
  tempConfigProvider = {client_id: '',authEndpoint: '', redirect_uri: ''};
  authToken: any;
  user: any;
  constructor(private http:Http, private location: Location,private router:Router) {}

  registerUser(user){
    let headers = new Headers();
    headers.append('Content-Type','application/json');
    return this.http.post('http://localhost:3000/register',user,{headers: headers})
      .map(res => res.json());
  }

  addUser(user){
    let headers = new Headers();
    this.loadToken();
    headers.append('Authorization', this.authToken);
    headers.append('Content-Type','application/json');
    return this.http.post('http://localhost:3000/users/add',user,{headers: headers})
      .map(res => res.json());
  }

  getAllUser(){
    let headers = new Headers();
    this.loadToken();
    headers.append('Authorization', this.authToken);
    headers.append('Content-Type','application/json');
    return this.http.get('http://localhost:3000/users/dashboard',{headers: headers})
      .map(res => res.json());
  }

  authenticateUser(user){
    let headers = new Headers();
    headers.append('Content-Type','application/json');
    return this.http.post('http://localhost:3000/login',user,{headers: headers})
      .map(res => res.json());
  }

  loginProvider(code,authEndpoint){
    let headers = new Headers();
    headers.append('Content-Type','application/json');
    return this.http.post(authEndpoint,{code: code},{headers: headers})
      .map(res => res.json());
  }

  authProvider(provider: string,configObj: any){
    console.log(configObj);
    localStorage.setItem('provider',provider);
    if(provider =='facebook'){
      window.location.href = 'https://www.facebook.com/v2.9/dialog/oauth?client_id='+configObj.facebook.client_id+'&redirect_uri=http://localhost:4200&scope=email';
    }
    if(provider == 'google'){
      window.location.href = 'https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id='+configObj.google.client_id+'&redirect_uri='+configObj.google.redirect_uri+'&scope=openid%20email%20profile';
    }
  }

  deleteUser(id){
    let headers = new Headers();
    this.loadToken();
    headers.append('Authorization', this.authToken);
    headers.append('Content-Type','application/json');
    return this.http.delete('http://localhost:3000/users/'+id,{headers: headers})
      .map(res => res.json());
  }

  editUser(id,user){
    let headers = new Headers();
    this.loadToken();
    headers.append('Authorization', this.authToken);
    headers.append('Content-Type','application/json');
    return this.http.put('http://localhost:3000/users/'+id,user,{headers: headers})
      .map(res => res.json());
  }

  editProfileAvatar(avaInfo){
    let headers = new Headers();
    this.loadToken();
    headers.append('Authorization', this.authToken);
    headers.append('Content-Type','application/json');
    return this.http.put('http://localhost:3000/users/profile/avatar',avaInfo,{headers: headers})
      .map(res => res.json());
  }
  editProfile(user){
    let headers = new Headers();
    this.loadToken();
    headers.append('Authorization', this.authToken);
    headers.append('Content-Type','application/json');
    return this.http.put('http://localhost:3000/users/profile',user,{headers: headers})
      .map(res => res.json());
  }

  getProfile(){
    let headers = new Headers();
    this.loadToken();
    headers.append('Authorization', this.authToken);
    headers.append('Content-Type','application/json');
    return this.http.get('http://localhost:3000/users/profile',{headers: headers})
      .map(res => res.json());
  }
  
  updatePermissionAllUser(){
    let headers = new Headers();
    this.loadToken();
    headers.append('Authorization', this.authToken);
    headers.append('Content-Type','application/json');
    return this.http.put('http://localhost:3000/users/updatepermission/alluser',{},{headers: headers})
      .map(res => res.json());
  }

  uploadFile(formData){
    let headers = new Headers();
    this.loadToken();
    headers.append('Authorization', this.authToken);
    return this.http.post('http://localhost:3000/users/upload/image', formData,{headers: headers})
      .map(files => files.json());
  }

  storeUserData(token, user){
    localStorage.setItem('id_token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.authToken = token;
    this.user = user;
  }

  loadToken(){
    const token = localStorage.getItem('id_token');
    this.authToken = token;
  }

  loggedIn(){
    return tokenNotExpired('id_token')
  }

  logout(){
    localStorage.setItem('isLoggedIn','false');
    this.authToken = null;
    this.user = null;
    localStorage.clear();
  }

}
