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
  private i = 0;
  constructor(){this.socket = io(this.url)}
  ngOnInit(){
    
  }
   sendChange(message){
                  // Make sure the "add-message" is written here because this is referenced in on() in our server
    
    this.socket.emit('add-message', message);   
  }
   getChange(): any {

    //  this.socket.on('news',(data) => {
    //    console.log('ollll')
    //    return callback(data);
    //  })
    let observable = new Observable(observer => {
      this.socket.on('news', (data) => {
     // console.log(typeof JSON.parse(data) =='string')
        observer.next(data);   
      });
      return () => {
        this.socket.disconnect();
      }; 
    })    
    return observable;
  } 
}
