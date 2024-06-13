import { Component, DoCheck, OnChanges, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Subscription, tap } from 'rxjs';
import { Menu } from 'src/app/interfaces/menu';
import { AuthService } from 'src/app/services/auth.service';
import { SidebarService } from 'src/app/services/sidebar.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, OnDestroy, DoCheck {

  

  constructor(private sidebarService:SidebarService,
              private authService : AuthService
  ){}

  menuItems : Menu[] = [];
  loggedIn = false;
  isInitiated = false;
  isExp = false;

  
  ngDoCheck(): void {
    const loggedInValue =  localStorage.getItem("isLoggedIn");
    this.loggedIn = loggedInValue === "true";
    
    console.log("LOG", this.isExp)
    // console.log("ngDoCheck loaded")
     if (this.loggedIn && !this.isInitiated && !this.isExp){
      console.log("ISINITIATED IS FALSE")
      this.getMenu();
      this.isInitiated = true;
     }
     this.isInitiated === true ? null :  localStorage.removeItem('auth-token');
  } 


   ngOnInit() {
    
    const loggedInValue =  localStorage.getItem("isLoggedIn");
    this.loggedIn = loggedInValue === "true"; 
    console.log("Sidebar loaded")
   
    
    
    //this.getMenu();
  
  }

  tokenExpired(){
    return this.authService.isTokenExpired().subscribe((data) => {
      this.isExp = data;
    });
  }


  ngOnDestroy() {
    console.log("I am now in the ngOnDestroy of sidebar")
    this.isInitiated = false;
    localStorage.removeItem('auth-token');
  }

  getMenu():void{
   this.sidebarService.getMenus().pipe(
    tap(data =>{
        this.menuItems = data;
   })).subscribe()
  }

}


