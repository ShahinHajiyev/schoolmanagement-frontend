import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { Course } from 'src/app/interfaces/course';
import { AuthService } from 'src/app/services/auth.service';
import { CourseService } from 'src/app/services/course.service';

@Component({
  selector: 'app-course',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.css']
})
export class CourseComponent {

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
