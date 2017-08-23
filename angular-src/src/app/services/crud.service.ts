import { Injectable, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import * as io from 'socket.io-client';
import 'rxjs/add/operator/map';
import {InfoChange} from '../../Infochange';

@Injectable()
export class CrudService implements OnInit {
  // Our localhost address that we set in our server code
  private url = 'http://localhost:3000'; 
  private socket;
  constructor(){this.socket = io(this.url) ;console.log('reere')}
  ngOnInit(){}
  sendChange(message){
    this.socket.emit('add-message', message);   
  }
  getChange(): any {
    let observable = new Observable(observer => {
      this.socket.on('news', (data) => {
        observer.next(data);   
      });
      return () => {
        this.socket.disconnect();
      }; 
    })    
    return observable;
 } 
}
