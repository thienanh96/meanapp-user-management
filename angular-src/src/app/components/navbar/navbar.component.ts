import { Component, OnInit} from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CrudService } from '../../services/crud.service';
import { Observable } from 'rxjs/Observable';
import { SharedServiceService}  from '../../services/shared-service.service';
import { TimeAgoPipe} from 'time-ago-pipe';
import { NotificationsComponent } from './notifications/notifications.component';
import { Location } from '@angular/common';
declare var $: any;
import { FlashMessagesService } from 'angular2-flash-messages';

@Component({ selector: 'app-navbar', templateUrl: './navbar.component.html', styleUrls: ['./navbar.component.css'] })
export class NavbarComponent implements OnInit{
  tempConfigProvider = {
    client_id: '',
    authEndpoint: '',
    redirect_uri: ''
  };
  code: String;
  constructor(private authService: AuthService,private shareService: SharedServiceService, private router: Router, private flashMessage: FlashMessagesService, private crudService: CrudService, private location: Location, private notificationsComponent: NotificationsComponent) { }

  ngOnInit() {
    this.shareService.tokenSubject$.subscribe((token) => { // set property when log in via facebook, google
      if(token !== null && token !== undefined){
          this.setProperty();
      }
    })
    // HIDE NOTIFICATIONS WHEN CLICKED ANYWHERE ON THE PAGE.
    $(document).ready(function() {

      $(document)
        .on('click', function(e) {
          $('#notifications').hide();
          // CHECK IF NOTIFICATION COUNTER IS HIDDEN.
          if ($('#noti_Counter').is(':hidden')) {
            // CHANGE BACKGROUND COLOR OF THE BUTTON.
            $('#noti_Button').css('background-color', '#2E467C');
          }
        });
    })

  }

  setProperty() {
    if (this.authService.loggedIn() === true) {
      this
        .authService
        .getProfile()
        .subscribe(data => {
            this.shareService.observeNotificationSubject(data.notification);
            this.shareService.observeProfileImageSubject(data);
        })
    }
  }

  onLogoutClick() {
    this
      .authService
      .logout();
    this
      .flashMessage
      .show('You are logged out', {
        cssClass: 'alert-success',
        timeout: 3000
      });
    this
      .router
      .navigate(['/login']);
    return false;
  }


  getCurrentImageSource(avatarField) {
    if (avatarField.displayImageType == 'social') {
      return avatarField.path_social
    } else {
      let imageLocalArray = avatarField.local.image;
      let displayImageID = avatarField.local.displayImageID;
      for (let i = 0; i < imageLocalArray.length; i++) {
        if (displayImageID == imageLocalArray[i]._id) {
          return imageLocalArray[i].path_local
        }
      }
      return -1;
    }
  }
}
