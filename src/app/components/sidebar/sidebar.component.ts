import { Component, DoCheck, OnChanges, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
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

  

  constructor(private sidebarService:SidebarService){}

  menuItems : Menu[] = [];
  loggedIn = false;
  isInitiated = false;

  
  ngDoCheck(): void {
    const loggedInValue =  localStorage.getItem("isLoggedIn");
    this.loggedIn = loggedInValue === "true";
    // console.log("ngDoCheck loaded")
     if (this.loggedIn && !this.isInitiated){
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


  ngOnDestroy() {
    console.log("I am now in the ngOnDestroy of sidebar")
    this.isInitiated = false;
    
  }

  getMenu():void{
   this.sidebarService.getMenus().pipe(
    tap(data =>{
        this.menuItems = data;
   })).subscribe()
  }

}


