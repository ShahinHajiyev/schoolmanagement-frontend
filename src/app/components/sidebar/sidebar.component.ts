import { Component, DoCheck, OnChanges, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, OnDestroy, DoCheck {

  

  constructor(){}

  loggedIn = false;
  
  ngDoCheck(): void {
    const loggedInValue =  localStorage.getItem("isLoggedIn");
    this.loggedIn = loggedInValue === "true";
     console.log("ngDoCheck loaded")
  } 



  

   ngOnInit() {
    
    const loggedInValue =  localStorage.getItem("isLoggedIn");
    this.loggedIn = loggedInValue === "true";
    console.log("Sidebar loaded")

  
  }


  ngOnDestroy() {
    console.log("I am now in the ngOnDestroy of sidebar")
  
  }

}


