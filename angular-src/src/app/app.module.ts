import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from  '@angular/http';
import { RouterModule, Routes } from '@angular/router';
import { MdInputModule} from '@angular/material';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProfileComponent } from './components/profile/profile.component';
import { UsersmanagementComponent } from './components/usersmanagement/usersmanagement.component';
import { CrudService } from './services/crud.service';
import { ValidateService } from './services/validate.service';
import { SharedServiceService} from './services/shared-service.service';
import { AuthService } from './services/auth.service';
import { FlashMessagesModule } from 'angular2-flash-messages';
import { AuthGuard } from './guards/auth.guard';
import { FilterPipe } from './filter/filter.pipe';
import { TimeAgoPipe} from 'time-ago-pipe';
import { NotificationsComponent } from './components/navbar/notifications/notifications.component';
import { ProfileImageComponent } from './components/navbar/profile-image/profile-image.component';
import { ProfileUserComponent } from './components/profile-user/profile-user.component';


const appRoutes: Routes = [
  {path:'', component: HomeComponent},
  {path:'register', component: RegisterComponent},
  {path:'login', component: LoginComponent},
  {path:'dashboard', component: DashboardComponent, canActivate:[AuthGuard]},
  {path:'profile', component: ProfileComponent, canActivate:[AuthGuard]},
  {path:'usersmanagement', component: UsersmanagementComponent, canActivate:[AuthGuard]},
  {path: 'user/:id', component: ProfileUserComponent,canActivate: [AuthGuard] }
];

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    DashboardComponent,
    ProfileComponent,
    UsersmanagementComponent,
    FilterPipe,
    TimeAgoPipe,
    NotificationsComponent,
    ProfileImageComponent,
    ProfileUserComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(appRoutes),
    FlashMessagesModule,
    ReactiveFormsModule,
    MdInputModule
  ],
  providers: [ValidateService, AuthService,SharedServiceService, AuthGuard, FilterPipe,NavbarComponent,CrudService,DashboardComponent, NotificationsComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
