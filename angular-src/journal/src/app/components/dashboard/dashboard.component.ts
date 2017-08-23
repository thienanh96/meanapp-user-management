import {Component, OnInit, OnDestroy} from '@angular/core';
import {ValidateService} from '../../services/validate.service';
import {AuthService} from '../../services/auth.service';
import {Pipe, PipeTransform} from '@angular/core';
import {FlashMessagesService} from 'angular2-flash-messages';
import {NavbarComponent} from '../navbar/navbar.component';
import {CrudService} from '../../services/crud.service';
declare var $ : any;
@Component({
    //  moduleId: module.id,
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
    userslist = [];
    _id : String;
    temp : number;
    username : String;
    name : String;
    email : String;
    role : String;
    password : String;
    roleUser : String;
    connection;
    notiCount : number;
    constructor(private authService : AuthService, private crudService : CrudService, private flashMessage : FlashMessagesService, private validateService : ValidateService, private navbarComponent : NavbarComponent) {}

    ngOnInit() {

        this
            .authService
            .getAllUser()
            .subscribe(data => {
                this
                    .navbarComponent
                    .setSmallProfileImage();
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
        //this.getChangeFromAnother();
        this.roleUser = JSON
            .parse(localStorage.getItem('user'))
            .role;
        this.temp = 0;
    }

    // Let's unsubscribe our Observable
    // ngOnDestroy() {
    //     this
    //         .connection
    //         .unsubscribe();
    // }

    getChangeFromAnother() {
        this.connection = this
            .crudService
            .getChange()
            .subscribe(data => {
                let index = this.searchUserListByID(data);
                if (data.infoChange === 'edit') {
                    this.userslist[index].name = data.name;
                    this.userslist[index].email = data.email;
                    this.userslist[index].role = data.role;
                }
                if (data.infoChange === 'delete') {
                    this
                        .userslist
                        .splice(index, 1);
                }
                if (data.infoChange === 'add') {
                    console.log('this is add: ' + data.user)
                    this
                        .userslist
                        .push(data.user);
                }
                this
                    .navbarComponent
                    .setNotiCount();
                this
                    .authService
                    .editProfile({editType: 'notification', emitUser: data.emitUser, editedUser: data.editedUser, action: data.infoChange})
                    .subscribe(data => {
                        console.log('tt : ')
                    })
            })
    }

    searchUserListByID(data) {
        for (let i = 0; i < this.userslist.length; i++) {
            console.log('01: ' + this.userslist[i]._id)
            console.log('02: ' + data._id)
            if (this.userslist[i]._id == data._id) {
                return i
            }

        }
        return -1;
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
                    this
                        .flashMessage
                        .show('User has been removed !', {
                            cssClass: 'alert-success',
                            timeout: 3000
                        });
                    this
                        .crudService
                        .sendChange({
                            infoChange: 'delete',
                            _id: this.userslist[this.temp]._id,
                            emitUser: JSON
                                .parse(localStorage.getItem('user'))
                                .name,
                            editedUser: this.name
                        });
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
                        .sendChange({
                            infoChange: 'add',
                            user: data.addedUser,
                            emitUser: JSON
                                .parse(localStorage.getItem('user'))
                                .name,
                            editedUser: this.name
                        });
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
                        .sendChange({
                            infoChange: 'edit',
                            _id: this.userslist[this.temp]._id,
                            name: this.name,
                            email: this.email,
                            role: this.role,
                            emitUser: JSON
                                .parse(localStorage.getItem('user'))
                                .name,
                            editedUser: this.name
                        });
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

    sendMess() {}
}
