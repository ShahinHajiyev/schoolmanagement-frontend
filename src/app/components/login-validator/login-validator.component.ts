import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, RouterStateSnapshot } from '@angular/router';
import { AuthService, CanComponentDeactivate, CanDeactivateType } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login-validator',
  templateUrl: './login-validator.component.html',
  styleUrls: ['./login-validator.component.css']
})
export class LoginValidatorComponent implements OnInit, CanComponentDeactivate {


  constructor(private authService: AuthService,
    private router: Router) {

  }

  activationForm!: FormGroup;


  ngOnInit() {
    this.authService.hideSideBar();
    this.getNeptunCode;
    console.log(this.getNeptunCode, "ONONOTTTTTTTTTTT")

    this.activationForm = new FormGroup({
      activationCode: new FormControl('', [Validators.required])
    })

  }

  canDeactivate(currentState: RouterStateSnapshot,
    nextState: RouterStateSnapshot): CanDeactivateType {
    console.log("HERE")

    const isLoginRoute = window.location.pathname.includes('/login');

    const currentPath = currentState.url;
    console.log('CurrentState', currentPath)
    const nextRoute = nextState && nextState.url.includes('/login');
    console.log("Next url", nextState.url)
    console.log("PATHNAME", window.location.pathname)

    console.log(isLoginRoute)
    console.log(this.router.url)

    console.log("The next route", nextRoute)

    if (this.authService.isLogoutInProcess) {               //to do
      this.authService.completeLogout();
      return true;
    }

     if (nextRoute) {
     //If the user is logged in, prevent navigation by returning false
     return false;
     }

    // Allow navigation if the user is not logged in
    return true;
  }

  get getNeptunCode() : string {
    return this.authService.neptunCode.toUpperCase();
  }

  activateAccount() : void {
    this.authService.activateAccount(this.activationForm.value.activationCode, this.getNeptunCode).subscribe()
  }

}
