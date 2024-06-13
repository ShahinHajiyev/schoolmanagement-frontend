import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, catchError, of, tap } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { EnrollmentService } from 'src/app/services/enrollment.service';

@Component({
  selector: 'app-registercourses',
  templateUrl: './registercourses.component.html',
  styleUrls: ['./registercourses.component.css']
})
export class RegistercoursesComponent implements OnInit{

  
  courseId : number;
  //studentId: number;
  neptunCode: string;
  private subscription: Subscription;

  constructor(private route : ActivatedRoute,
              private enrollmentService: EnrollmentService,
              private authService : AuthService
  ){}
  
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const paramMap = params.get('courseId'); 
      if (paramMap !== null) {
        this.courseId = Number(paramMap);
      }
      else {
        this.courseId = 0;
        console.error('No course ID provided');
      }
    });
  }

  registerCourse() {
    this.getUser();
    console.log("ENROLLMENTDTO", this.courseId, this.neptunCode);
    return this.enrollmentService.registerCourse(this.courseId, this.neptunCode).subscribe();
    }

    getUser() {
      this.subscription = this.authService.geLoggedUser()
        .pipe(
          tap((neptunCode) => {
            this.neptunCode = neptunCode;
          }),
          catchError(error => {
            console.error('Error fetching logged in user:', error);
            // Handle the error accordingly
            return of(null); // Return a default fallback value or handle the error appropriately
          })
        )
        .subscribe();
    }
  

}
