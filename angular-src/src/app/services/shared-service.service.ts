import { Injectable, EventEmitter } from '@angular/core';
import { AuthService} from './auth.service';
import { BehaviorSubject }    from 'rxjs/BehaviorSubject';

@Injectable()
export class SharedServiceService {
  dataNotification: Array<any>;
  dataProfile: any;
  notificationSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  profileImageSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  tokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  notificationSubject$ = this.notificationSubject.asObservable();
  profileImageSubject$ = this.profileImageSubject.asObservable();
  tokenSubject$ = this.tokenSubject.asObservable();
  constructor() { }
  observeNotificationSubject(data: any){
  	this.notificationSubject.next(data);
  }

  observeProfileImageSubject(data: any){
    this.profileImageSubject.next(data);
  }

  observeTokenSubject(data: any){
    this.tokenSubject.next(data);
  }

}
