import { Component, OnInit } from '@angular/core';
import { SharedServiceService} from '../../../services/shared-service.service';
import { AuthService} from '../../../services/auth.service';
declare var $: any;
@Component({
	selector: 'app-profile-image',
	templateUrl: './profile-image.component.html',
	styleUrls: ['./profile-image.component.css']
})
export class ProfileImageComponent implements OnInit {

	constructor(private shareService: SharedServiceService, private authService: AuthService) { }

	ngOnInit() {
		this.shareService.profileImageSubject$.subscribe((data) => {
			if(data !== null){
				let currentImageSource = this.getCurrentImageSource(data.avatar);
				let fullName = data.name + ' ';
				$(document).ready(() => {
					document
					.getElementById('small-image')
					.setAttribute('src', currentImageSource);

					document
					.getElementById('small-name')
					.innerHTML = fullName.substr(0, fullName.indexOf(' '));
				})
			}

		})


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
