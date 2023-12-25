import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { Course } from 'src/app/interfaces/course';
import { AuthService, CanComponentDeactivate, CanDeactivateType } from 'src/app/services/auth.service';
import { CourseService } from 'src/app/services/course.service';

@Component({
  selector: 'app-course',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.css']
})
export class CourseComponent implements OnInit, CanComponentDeactivate {

  courses: Course[] = [];
  isLoggedIn = false;

  constructor(private courseService: CourseService,
              private authService: AuthService,
              private router: Router,
              private cdr: ChangeDetectorRef){}

  ngOnInit(): void{

     this.isLogged();
     this.getCourses();
     
  }

   canDeactivate(currentState: RouterStateSnapshot, 
                 nextState: RouterStateSnapshot): CanDeactivateType {
    console.log("HERE")
    
    const isLoginRoute = window.location.pathname.includes('/login');

    const currentPath = currentState.url;
    console.log('CurrentState', currentPath)
    const nextRoute = nextState && nextState.url.includes('/login');
    console.log("Next url", nextState.url)
    console.log("PATHNAME" , window.location.pathname)

    console.log(isLoginRoute)
    console.log(this.router.url)

    console.log("The next route" , nextRoute)

    if (this.authService.isLogoutInProcess) {
      this.authService.completeLogout();
      return true;
    }

    if (this.isLoggedIn && nextRoute) {
      // If the user is logged in, prevent navigation by returning false
      return false;
    }

    // Allow navigation if the user is not logged in
    return true;
  } 

  getCourses():void{
     this.courseService.getCourses().subscribe(data => {
      this.courses = data;
     });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
    }

    isLogged(){
     return this.authService.isLogged().subscribe(
      (loggedIn: boolean) => {
        this.isLoggedIn = loggedIn;
        this.cdr.detectChanges();

        // Check the value received from the subscription
        console.log('Is logged in:', loggedIn);
      }
     );
    }
  

}
