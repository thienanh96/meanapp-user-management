var RawNotificationList = [ // push raw notifications here!
	{notificationType: 1, notiMessage: ' User #emitUser has #action user #editedUser'}, //use syntax #emitUser , #action, #editUser to insert emitUser, editedUser, action to notificationMessage
	{notificationType: 2, notiMessage: " User <strong>#emitUser</strong> has changed <strong>#editedUser</strong>'s #changedFields to <strong>#newUserInfo</strong>"}
]
declare var $: any;
var _idEmitUser: string ;
var _idEditedUser: string;
export interface NotificationObject{
	notificationDetail : {
		notificationType: number,
		_idEmitUser: string,
		emitUser: string,
		action: string,
		editedUser: string,
		time: Date
	}
	data : any
}

export interface FinalNotification{
	notificationType: number;
	notiMessage: string;
	time: Date;
	_idEditedUser: string;
}

export class Notification {
	private notificationObject: NotificationObject;
	private finalNotificationsList : FinalNotification;
	constructor(notificationObject: NotificationObject) {
		this.notificationObject = notificationObject;
		_idEmitUser = this.notificationObject.notificationDetail._idEmitUser;
		_idEditedUser = this.notificationObject.data._id;
		this.setNotiDetail();
	}
	public getNotificationObject(){
		return this.notificationObject;
	}
	private convertVerbToPastParticiple(verb: string){
		let originalVerb = ['set','read','put','hit','cut','shut','spread','bet','hurt','broadcast','go','give','keep','know','leave','pay','ride','arise'];
		let convertedVerb = ['set','read','put','hit','cut','shut','spread','bet','hurt','broadcast','gone','given','kept','left','paid','riden','arisen'];
		let index = originalVerb.indexOf(verb);
		if(index !== -1){
			return convertedVerb[index];
		}
		if(verb.slice(-1) === 'e'){
			return verb + 'd';
		}
		return verb + 'ed';
	}
	
	private setNotiDetail(){
		let message;
		for (let i = 0; i < RawNotificationList.length ; i++) {
			let currentNoti = RawNotificationList[i];
			console.log('drr: '+ currentNoti.notiMessage)
			if(currentNoti.notificationType === this.notificationObject.notificationDetail.notificationType){
				if(currentNoti.notiMessage.includes('#emitUser')){
					message = currentNoti.notiMessage.replace(/#emitUser/g,this.notificationObject.notificationDetail.emitUser);
				}
				if(currentNoti.notiMessage.includes('#editedUser')){
					message = message.replace(/#editedUser/g,this.notificationObject.notificationDetail.editedUser);
				}
				if(currentNoti.notiMessage.includes('#changedFields')){
					message = message.replace(/#changedFields/g,this.notificationObject.data.changedFields.toString());
				}
				if(currentNoti.notiMessage.includes('#newUserInfo')){
					let newUserInfoList: Array<string> = [];
					for (let i = 0; i < this.notificationObject.data.changedFields.length; i++) {
						newUserInfoList.push(this.notificationObject.data[this.notificationObject.data.changedFields[i]]);
					}
					message = message.replace(/#newUserInfo/g,newUserInfoList.toString());
				}
				if(currentNoti.notiMessage.includes('#action')){
					message = message.replace(/#action/g,this.convertVerbToPastParticiple(this.notificationObject.notificationDetail.action));
				}
				this.finalNotificationsList = {notificationType: currentNoti.notificationType, notiMessage: message, time: this.notificationObject.notificationDetail.time, _idEditedUser: this.notificationObject.data._id};
			}

		}
	}

	public getNotiDetail(){
		return this.finalNotificationsList;
	}

}