import { Component, OnInit,ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute,Router} from '@angular/router';
import { AuthService} from '../../services/auth.service';
import { FlashMessagesService } from 'angular2-flash-messages';
declare var $: any;
@Component({
  selector: 'app-profile-user',
  templateUrl: './profile-user.component.html',
  styleUrls: ['./profile-user.component.css']
})
export class ProfileUserComponent implements OnInit {
  id: string;
  sub: any;
  username: string;
  name: string;
  email: string;
  role: string;
  displayImageType: string;
  imageURL: string;
  imageLocalArray: any = [];
  showTemplate: Boolean = false;
  showOopsImage: Boolean;
  constructor (private route: ActivatedRoute, private authService: AuthService, 
               private router: Router, private flashMessage: FlashMessagesService,
               private cdRef:ChangeDetectorRef){ }

  ngOnInit() {   
  	this.sub = this.route.params.subscribe(params => {
       this.id = params['id']; 
       this.authService.getUser(this.id).subscribe(user => {
       	if(user.success){
          // this.showTemplate = true;
          this.showOopsImage = false;
       		this.username = user.user.username;
       		this.name = user.user.name;
       		this.email = user.user.email;
       		this.role = user.user.role;
       		this.displayImageType = user.user.avatar.displayImageType;
       		this.imageLocalArray = user.user.avatar.local.image;
       		if(this.displayImageType === 'social'){
       			this.imageURL = user.user.path_social;
       		}
       		if(this.displayImageType === 'local'){
       			this.imageURL = this.imageLocalArray[this.toElemIndex(user.user.avatar.local.displayImageID)].path_local;
       		}
           //this.showTemplate = true;
          this.cdRef.detectChanges();
       		document.getElementById('img-avatar-user').setAttribute('src',this.imageURL);
       	} else {
          this.showTemplate = false
          this.flashMessage.show(user.msg, {
            cssClass: 'alert-danger',
            timeout: 3000});
          this.showOopsImage = true;
        }
       })
    });
  }


  onClickOpenModalImage(attributeName,valueName){
    let img = $("["+attributeName+" = "+valueName+"]")
    let modal = document.getElementById('viewAvatarModal-User');
    let modalImg = document.getElementById('img01-user');
    modal.style.display = "block";
    modalImg.setAttribute('src',img.attr('src'));

  }

  toElemIndex(ObjectID){
    for(let i = 0;i < this.imageLocalArray.length ; i++){
      if(ObjectID == this.imageLocalArray[i]._id){
        console.log('aww: '+i)
        return i;
      }
    }
    return -1;
  }

}
