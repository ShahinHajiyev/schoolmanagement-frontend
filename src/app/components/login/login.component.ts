import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { take } from 'rxjs';
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



  loginForm!: FormGroup;
  registrationForm!: FormGroup;
  isLoggedIn: boolean = false;
  showRegistration: boolean = false;


  constructor(private authService: AuthService,
    private router: Router) { }

  ngOnInit() {

    if (this.authService.getAuthToken() !== '') {
      this.isLoggedIn = true;
    }

    this.loginForm = new FormGroup({
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
    });

    this.registrationForm = new FormGroup({
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
      confirmPassword: new FormControl('', [Validators.required]),
      neptunCode: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required])
    })
  }

  login(): void {

    this.authService.login(this.loginForm.value.username, this.loginForm.value.password)
      .pipe(take(1))
      .subscribe((loggedIn) => {
        if (loggedIn) {
          this.isLoggedIn = true;

          if (this.authService.isAdmin(this.adminRole) === true) {
            this.router.navigate(['/admin']);
          }
          else
            this.router.navigate(['/course']);
          
        }
      }
      );

  }

  register() {
    this.authService.register(this.registrationForm.value.password, 
                              this.registrationForm.value.confirmPassword,
                              this.registrationForm.value.neptunCode,
                              this.registrationForm.value.email ).subscribe(() => {
                                if (this.registrationForm.value.password === this.registrationForm.value.confirmPassword) {
                                  console.log('Registration successful');
                                }else{
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
