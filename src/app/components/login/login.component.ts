import { Component, OnInit, inject } from '@angular/core';
import { AuthService, CanComponentDeactivate, CanDeactivateType } from 'src/app/services/auth.service';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { async, take } from 'rxjs';
import { Router } from '@angular/router';



@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {


  showLogin: boolean = true;
  showRegister: boolean = false;
  adminRole: string = "ROLE_ADMIN";
  //configure hompath normally, it does not assign, only going to the empty route which is login in the routing table i guess.



  loginForm!: FormGroup;
  registrationForm!: FormGroup;
  isLoggedIn: boolean = false;
  showRegistration: boolean = false;
  homePath: string = '';
 // homePath = this.authService.isAdmin(this.adminRole) ? "/admin" : "/course";



  constructor(private authService: AuthService,
    private router: Router) { }

  ngOnInit() {
    
    console.log("_____________", this.homePath)

    
    //console.log("THIS IS THE HOMEPATH URL", this.homePath)

    if (this.authService.getAuthToken() != null) {
      console.log("LOGIN ONINIT")
      //this.homePath = this.authService.isAdmin(this.adminRole) ? "/admin" : "/course";
      this.homePath = this.authService.isAdmin(this.adminRole) ? '/admin' : '/course';
      this.isLoggedIn = true;
      console.log("--------------", this.homePath)
      console.log("THIS IS THE LOGIN CHECK URL", this.router.url)
      //console.log("THIS IS THE HOMEPATH URL", this.homePath)
      this.router.navigate([this.homePath])
      //this.router.navigate(['/course'])
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
      .pipe(take(1))
      .subscribe({
        next: (loggedIn) => {
          if (loggedIn) {
            this.isLoggedIn = true;
            this.homePath = this.authService.isAdmin(this.adminRole) ? "/admin" : "/course";
            console.log("I AM IN LOGIN SUBSCRIBE")

            if (this.authService.isAdmin(this.adminRole) === true) {
              //this.homePath = '/admin'
              console.log("I AM HERE", this.homePath)
              //this.router.navigate([homePath]);
              this.router.navigate([this.homePath])
            }
            else {
              //this.homePath = '/course'
              //this.router.navigate([this.homePath]);
              console.log("I AM HERE", this.homePath)
              this.router.navigate([this.homePath])
            }


          }
        },
        error: (e) => console.error("Wrong credentials", e),
        complete: () => console.info('complete')
      }
      );

  }

  register() {
    this.authService.register(this.registrationForm.value.password,
      this.registrationForm.value.confirmPassword,
      this.registrationForm.value.neptunCode,
      this.registrationForm.value.email).subscribe(() => {
        if (this.registrationForm.value.password === this.registrationForm.value.confirmPassword) {
          console.log('Registration successful');
        } else {
          console.error('Passwords do not match');
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
