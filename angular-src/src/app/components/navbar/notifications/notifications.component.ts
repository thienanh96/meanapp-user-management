import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { CrudService } from '../../../services/crud.service';
import { SharedServiceService} from '../../../services/shared-service.service';
import { TimeAgoPipe} from 'time-ago-pipe';
import { Notification , NotificationObject, FinalNotification} from './finalNotificationCreator';
declare var $: any;
@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notiArr: Array<FinalNotification>;
  allNotiArr: Array<FinalNotification>;
  click: number;
  connection;
  notiDetail: string;
  constructor(private authService: AuthService,private shareService: SharedServiceService, private router: Router, private crudService: CrudService) {}
  ngOnInit() {
    this.shareService.notificationSubject$.subscribe((data) => {
      if(data !== null){
        this.setAllNotiArray(data);
        this.setnotiArray();
        this.setNotiCount(this.allNotiArr.length);
        this.click = 0;
        
      }

    })
  this.listenChange(); 
  }

  listenChange() {
    this.connection = this
      .crudService
      .getChange()
      .subscribe(data => {
        let notification: Notification = new Notification(data)
        let finalNotification = notification.getNotiDetail();
        this.pushFinalNotiToAllNotiArray(finalNotification);
        this.setnotiArray();
        this.setNotiCount(this.allNotiArr.length);    
        this.click = 0;
      })
  }

  ngOnDestroy() {
    this
      .connection
      .unsubscribe();
  }
  removeElemAllNotiArr() {
    if (this.allNotiArr.length <= 4) {
      this.allNotiArr = [];
    } else {
      this.allNotiArr = this.allNotiArr.slice(4, this.allNotiArr.length)
    }
  }
  setAllNotiArray(objectNotificationList){
    this.allNotiArr = [];
    for (let i = 0; i < objectNotificationList.length; i++) {
      let notification: Notification = new Notification(objectNotificationList[i])
      let finalNotification = notification.getNotiDetail();
      this.allNotiArr.unshift(finalNotification)
    }
  }

  pushFinalNotiToAllNotiArray(finalNotification){
    this.allNotiArr.unshift(finalNotification);
  }
  setnotiArray() {
    let length = this.allNotiArr.length;
    let endPoint;
    if (length < 4) {
      endPoint = length;
    } else {
      endPoint = 4;
    }
    this.notiArr = this.allNotiArr
      .slice(0, endPoint);
  }

  onclickNotiButton() {
    this.click++;
    if (this.click >= 2) { //click lan 2 se xoa notification
      this.removeElemAllNotiArr();
      this.setnotiArray();
      this.deleteNotifications(4);
      this.setNotiCount(this.allNotiArr.length)
    }
    $(document)
      .ready(function() {
        // TOGGLE (SHOW OR HIDE) NOTIFICATION WINDOW.
        $('#notifications')
          .fadeToggle('fast', 'linear', function() {
            if ($('#notifications').is(':hidden')) {
              $('#noti_Button').css('background-color', '#2E467C');
            } else
              $('#noti_Button').css('background-color', '#FFF'); // CHANGE BACKGROUND COLOR OF THE BUTTON.
          }
          );
      })
  }

  deleteNotifications(deleteCount) {
    this
      .authService
      .editProfile({ editType: 'DELETE_NOTIFICATION', deleteCount: deleteCount })
      .subscribe(data => {})
  }

  onClickDeleteAllNoti() {
    this.allNotiArr = [];
    this.notiArr = [];
    this.deleteNotifications('all');
  }

  viewOtherUserProfile(_id){
    console.log('_id: '+_id)
    this.router.navigate(['/user',_id]);
  }
  openNotificationModal() {
    $('#notificationModal').modal();
  }
  setNotiCount(notiCount) {
  	$(document)
      .ready(function() {
    $('#noti_Counter')
      .show()
      .css({ opacity: 0 })
      .text(notiCount)
      .css({ top: '-10px' })
      .animate({
        top: '-2px',
        opacity: 1
      }, 500);
  })
  }
	

}
