import {Component, OnInit, OnDestroy} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {Router} from '@angular/router';
import {CrudService} from '../../services/crud.service';
declare var $ : any;
import {FlashMessagesService} from 'angular2-flash-messages';
declare var $;
@Component({selector: 'app-navbar', templateUrl: './navbar.component.html', styleUrls: ['./navbar.component.css']})
export class NavbarComponent implements OnInit,
OnDestroy {
  notiArr = [];
  connection;
  constructor(private authService : AuthService, private router : Router, private flashMessage : FlashMessagesService, private crudService : CrudService) {}

  ngOnInit() {
    this.connection = this
      .crudService
      .getChange()
      .subscribe(data => {
        // let index = this.searchUserListByID(data); if (data.infoChange === 'edit') {
        //    this.userslist[index].name = data.name;     this.userslist[index].email =
        // data.email;     this.userslist[index].role = data.role; } if (data.infoChange
        // === 'delete') {     this         .userslist         .splice(index, 1); } if
        // (data.infoChange === 'add') {     console.log('this is add: ' + data.user)
        //  this         .userslist         .push(data.user); }
        this.setNotiCount();
        this
          .authService
          .editProfile({editType: 'notification', emitUser: data.emitUser, editedUser: data.editedUser, action: data.infoChange})
          .subscribe(data => {
            this.notiArr = data.notification;
          })
      })

                    // HIDE NOTIFICATIONS WHEN CLICKED ANYWHERE ON THE PAGE.
      $(document).ready(function () {
                $(document).click(function () {
            $('#notifications').hide();

            // CHECK IF NOTIFICATION COUNTER IS HIDDEN.
            if ($('#noti_Counter').is(':hidden')) {
                // CHANGE BACKGROUND COLOR OF THE BUTTON.
                $('#noti_Button').css('background-color', '#2E467C');
            }
        });
      })         

  }

  ngOnDestroy() {
    this
      .connection
      .unsubscribe();
  }

  onclickNotiButton() {
     $(document).ready(function () {
    // TOGGLE (SHOW OR HIDE) NOTIFICATION WINDOW.
    $('#notifications')
      .fadeToggle('fast', 'linear', function () {
        if ($('#notifications').is(':hidden')) {
          $('#noti_Button').css('background-color', '#2E467C');
        } else 
          $('#noti_Button').css('background-color', '#FFF'); // CHANGE BACKGROUND COLOR OF THE BUTTON.
        }
      );

    $('#noti_Counter').fadeOut('slow'); // HIDE THE COUNTER.
     })
  }
  setSmallProfileImage() {
    if (this.authService.loggedIn() == true) {
      if (localStorage.getItem('currentProfileImage') && localStorage.getItem('currentProfileName')) {
        let fullName = localStorage.getItem('currentProfileName') + ' ';
        let image = localStorage.getItem('currentProfileImage')
        document
          .getElementById('small-image')
          .setAttribute('src', image);
        document
          .getElementById('small-name')
          .innerHTML = fullName.substr(0, fullName.indexOf(' ')) // chi lay first name
      } else {
        this
          .authService
          .getProfile()
          .subscribe(data => {
            let currentImageSource = this.getCurrentImageSource(data.avatar);
            localStorage.setItem('currentProfileImage', currentImageSource);
            localStorage.setItem('currentProfileName', data.name); // lay tu dau tien
            let fullName = localStorage.getItem('currentProfileName') + ' ';
            document
              .getElementById('small-image')
              .setAttribute('src', localStorage.getItem('currentProfileImage'));
            document
              .getElementById('small-name')
              .innerHTML = fullName.substr(0, fullName.indexOf(' '));

          })
      }
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

  setNotiCount() {
    console.log('aaa')
    let notiCount = parseInt($('#noti_Counter').text());
    notiCount++;
    $('#noti_Counter')
      .css({opacity: 0})
      .text(notiCount) // ADD DYNAMIC VALUE (YOU CAN EXTRACT DATA FROM DATABASE OR XML).
      .css({top: '-10px'})
      .animate({
        top: '-2px',
        opacity: 1
      }, 500);
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
