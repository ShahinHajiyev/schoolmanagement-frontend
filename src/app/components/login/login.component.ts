import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { AuthService, CanComponentDeactivate, CanDeactivateType } from 'src/app/services/auth.service';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { Subscription, async, map, mapTo, take, tap, throwError } from 'rxjs';
import { NavigationExtras, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';



@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {


  showLogin: boolean = true;
  showRegister: boolean = false;
  adminRole: string = "ROLE_ADMIN";
  errorStatus : any;




  loginForm!: FormGroup;
  registrationForm!: FormGroup;
  isLoggedIn: boolean = false;
  showRegistration: boolean = false;
  homePath: string = '';



  constructor(private authService: AuthService,
    private router: Router) { }

    ngOnDestroy() {
      console.log("This is ondestroy of login component")
      this.authService.showSideBar();
  }

  ngOnInit() {
    this.authService.hideSideBar();

    console.log("_____________", this.homePath)




    if (this.authService.getAuthToken() != null) {
      console.log("LOGIN ONINIT")

      this.homePath = this.authService.isAdmin(this.adminRole) ? '/admin' : '/course';
      this.isLoggedIn = true;
      console.log("--------------", this.homePath)
      console.log("THIS IS THE LOGIN CHECK URL", this.router.url)


    
      this.router.navigate([this.homePath])
      
    }



    this.loginForm = new FormGroup({
      neptunCode: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
    });

    this.registrationForm = new FormGroup({
      password: new FormControl('', [Validators.required]),
      confirmPassword: new FormControl('', [Validators.required]),
      neptunCode: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required])
    })
  }

  



  login(): void {
    this.authService.login(this.loginForm.value.neptunCode, this.loginForm.value.password)
      .pipe(
        take(1),
        tap((isLoggedIn) => {
          if (isLoggedIn) {
            this.isLoggedIn = true;
            this.homePath = this.authService.isAdmin(this.adminRole) ? "/admin" : "/course";
            console.log("I AM IN LOGIN SUBSCRIBE")
            this.router.navigate([this.homePath])
          }
        }),
        
      )
      .subscribe({
        
        error: (e) =>  {
          this.errorStatus = e.status;
        
       
          console.log("LoginComponent error status", this.errorStatus)
          if (this.errorStatus === 409) {
          this.setNeptunCode = this.loginForm.value.neptunCode;
          console.log(this.setNeptunCode)
            console.log("yes here ")
           this.router.navigate(['/login-validator'],
            { queryParams: { status: this.errorStatus} });

            
          }
          console.error('This is an error: ', e) 

         
        
        }
      }
      );
  }

  set setNeptunCode(neptunCode : string) {
    this.authService.neptunCode = neptunCode;
}

test(){
  const navigationExtras: NavigationExtras = {state: {example: 'This is an example'}};
    this.router.navigate(['/login-validator'], navigationExtras);
}


  register() {
    this.authService.register(this.registrationForm.value.password,
      this.registrationForm.value.confirmPassword,
      this.registrationForm.value.neptunCode,
      this.registrationForm.value.email).subscribe(() => {
        if (this.registrationForm.value.password !== this.registrationForm.value.confirmPassword) {
          console.log('Passwords do not match');
        } 
        else {
          console.log("Registration is successful");
          this.router.navigate([''])
        }
      }
      );
  }

  showLoginForm() {
    this.showLogin = true;
    this.showRegister = false;
  }

  showRegisterForm() {
    this.showLogin = false;
    this.showRegister = true;
  }



}
