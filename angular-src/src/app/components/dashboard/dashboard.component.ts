import { Component, OnInit, OnDestroy } from '@angular/core';
import { ValidateService } from '../../services/validate.service';
import { AuthService } from '../../services/auth.service';
import { Pipe, PipeTransform } from '@angular/core';
import { FlashMessagesService } from 'angular2-flash-messages';
import { NotificationObject } from '../navbar/notifications/finalNotificationCreator';
import { CrudService } from '../../services/crud.service';
declare var $: any;
@Component({
    //  moduleId: module.id,
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
    userslist = [];
    _id: String;
    temp: number;
    username: String;
    name: string;
    email: String;
    role: String;
    password: String;
    roleUser: String;
    connection;
    notiCount: number;
    //sendNotificationObject: NotificationObject;
    constructor(private authService: AuthService, private crudService: CrudService, private flashMessage: FlashMessagesService, private validateService: ValidateService) { }

    ngOnInit() {
        this.getAllUser();
        this.listenChanges();
        this.roleUser = JSON
            .parse(localStorage.getItem('user'))
            .role;
        this.temp = 0;
    }

    getAllUser() {
        this
            .authService
            .getAllUser()
            .subscribe(data => {
                if (data.success) {
                    this.userslist = data.all;
                } else {
                    this
                        .flashMessage
                        .show(data.msg, {
                            cssClass: 'alert-danger',
                            timeout: 3000
                        });
                }
            });
    }

    searchUserListByID(data) {
        for (let i = 0; i < this.userslist.length; i++) {
            if (this.userslist[i]._id == data._id) {
                return i
            }

        }
        return -1;
    }
    listenChanges() {
        this.connection = this
            .crudService
            .getChange()
            .subscribe(data => {
                let index = this.searchUserListByID(data.data);
                if (data.notificationDetail.action === 'change') {
                    // if(index !== -1){
                        if((this.roleUser === 'Manager' && data.data.role === 'Normal User') ||
                           (this.roleUser === 'Admin' && (data.data.role === 'Normal User' || data.data.role === 'Manager')) ||
                           (this.roleUser === 'Normal User' && (data.data.role === 'Normal User'))){
                                if(index !== -1){
                                    this.userslist[index].name = data.data.name;
                                    this.userslist[index].email = data.data.email;
                                    this.userslist[index].role = data.data.role;
                                } else {
                                    this
                                        .userslist
                                        .push({
                                            username: data.data.username,
                                            name: data.data.name,
                                            role: data.data.role,
                                            email: data.data.email
                                        })
                                }
                        } else {
                            this
                                .userslist
                                .splice(index,1);
                        }
                }
                if (data.notificationDetail.action === 'delete') {
                    this
                        .userslist
                        .splice(index, 1);
                }
                if (data.notificationDetail.action === 'add') {
                    if(!(data.data.user.role === 'Manager' && (this.roleUser === 'Normal User' || this.roleUser === 'Manager'))){
                        this
                            .userslist
                            .push(data.data.user); 
                    }

                }
            })

    }

    openAddModal() {
        this.username = undefined;
        this.name = undefined;
        this.password = undefined;
        this.email = undefined;
        this.role = "Normal User";
        $("#addModal").modal();
    }

    openInfoModal(indexOfList) {
        this.temp = indexOfList;
        $("#infoModal").modal();
    }

    openEditModal(indexOfList) {
        this.temp = indexOfList;
        this.username = this.userslist[this.temp].username;
        this.name = this.userslist[this.temp].name;
        this.email = this.userslist[this.temp].email;
        this.role = this.userslist[this.temp].role;
        $("#editModal").modal();
    }

    openDeleteModal(indexOfList) {
        this.temp = indexOfList;
        $("#deleteModal").modal();
    }

    delete() {
        this
            .authService
            .deleteUser(this.userslist[this.temp]._id)
            .subscribe(data => {
                if (data.success) {
                    let sendNotificationObject: NotificationObject = {
                        notificationDetail: {
                            notificationType: 1,
                            _idEmitUser: JSON.parse(localStorage.getItem('user'))._id +'',
                            emitUser: JSON
                                .parse(localStorage.getItem('user'))
                                .name +'',
                            action: 'delete',
                            editedUser: this.userslist[this.temp].name,
                            time: new Date()
                        },
                        data: {
                            _id: this.userslist[this.temp]._id
                        }
                    }
                    this
                        .flashMessage
                        .show('User has been removed !', {
                            cssClass: 'alert-success',
                            timeout: 3000
                        });
                    this
                        .crudService
                        .sendChange(sendNotificationObject);
                    this
                        .userslist
                        .splice(this.temp, 1);
                    this.temp = 0;
                    console.log('this is del: ' + this.userslist[this.temp]._id)

                } else {
                    this
                        .flashMessage
                        .show(data.msg, {
                            cssClass: 'alert-danger',
                            timeout: 3000
                        });
                    return false;
                }
            });
    }

    add() {
        let user = {
            name: this.name,
            email: this.email,
            username: this.username,
            password: this.password,
            role: this.role
        }
        // Required Fields
        if (!this.validateService.validateRegister(user)) {
            this
                .flashMessage
                .show('Please fill in all fields !', {
                    cssClass: 'alert-danger',
                    timeout: 3000
                });
            return false;
        }

        // Validate Email
        if (!this.validateService.validateEmail(user.email)) {
            this
                .flashMessage
                .show('Please use a valid email !', {
                    cssClass: 'alert-danger',
                    timeout: 3000
                });
            return false;
        }

        // Register user
        this
            .authService
            .addUser(user)
            .subscribe(data => {
                if (data.success) {
                    let sendNotificationObject: NotificationObject = {
                        notificationDetail: {
                            notificationType: 1,
                            _idEmitUser: JSON.parse(localStorage.getItem('user'))._id +'',
                            emitUser: JSON
                                .parse(localStorage.getItem('user'))
                                .name +'',
                            action: 'add',
                            editedUser: this.name,
                            time: new Date()
                        },
                        data: {
                            _id: this.userslist[this.temp]._id,
                            user: data.addedUser,
                        }
                    }
                    this
                        .flashMessage
                        .show(data.msg, {
                            cssClass: 'alert-success',
                            timeout: 3000
                        });
                    this
                        .userslist
                        .push(data.addedUser);
                    this
                        .crudService
                        .sendChange(sendNotificationObject);
                } else {
                    this
                        .flashMessage
                        .show(data.msg, {
                            cssClass: 'alert-danger',
                            timeout: 3000
                        });
                    return false;
                }
            });
    }

    edit() {
        if(this.getChangedFields().length === 0) return false;
        let user = {
            username: this.username,
            name: this.name,
            email: this.email,
            role: this.role
        }
        if (user.name == '' || user.email == '') {
            this
                .flashMessage
                .show('Please fill in all fields !', {
                    cssClass: 'alert-danger',
                    timeout: 3000
                });
            return false;
        }
        if (!this.validateService.validateEmail(user.email)) {
            this
                .flashMessage
                .show('Please use a valid email !', {
                    cssClass: 'alert-danger',
                    timeout: 3000
                });
            return false;
        }
        this
            .authService
            .editUser(this.userslist[this.temp]._id, user)
            .subscribe(data => {
                if (data.success) {
                    let sendNotificationObject: NotificationObject = {
                        notificationDetail: {
                            notificationType: 2,
                            _idEmitUser: JSON.parse(localStorage.getItem('user'))._id +'',
                            emitUser: JSON
                                .parse(localStorage.getItem('user'))
                                .name +'',
                            action: 'change',
                            editedUser: this.userslist[this.temp].name,
                            time: new Date()
                        },
                        data: {
                            _id: this.userslist[this.temp]._id,
                            username: this.username,
                            name: this.name,
                            email: this.email,
                            role: this.role,
                            changedFields: this.getChangedFields()
                        }
                    }
                    this
                        .flashMessage
                        .show('User has been edited !', {
                            cssClass: 'alert-success',
                            timeout: 3000
                        });
                    this.userslist[this.temp].name = this.name;
                    this.userslist[this.temp].email = this.email;
                    this.userslist[this.temp].role = this.role;
                    this
                        .crudService
                        .sendChange(sendNotificationObject);
                } else {
                    this
                        .flashMessage
                        .show(data.msg, {
                            cssClass: 'alert-danger',
                            timeout: 3000
                        });
                    return false;
                }
            })
    }

    updatePermissionAllUser() {
        this
            .authService
            .updatePermissionAllUser()
            .subscribe(data => {
                if (data.success) {
                    this
                        .flashMessage
                        .show(data.msg, {
                            cssClass: 'alert-success',
                            timeout: 3000
                        });
                }
            })
    }

    getChangedFields(){
        let changedFields: Array<string> = [];
        let originalName = this.userslist[this.temp].name;
        let originalEmail = this.userslist[this.temp].email;
        let originalRole = this.userslist[this.temp].role;
        if(originalName !== this.name){
            changedFields.push('name');
        }
        if(originalEmail !== this.email){
            changedFields.push('email');
        }
        if(originalRole !== this.role){
            changedFields.push('role');
        }
        return changedFields;
    }

}
