import { Component, HostListener, OnInit } from '@angular/core';
import { tap } from 'rxjs';
import { Course } from 'src/app/interfaces/course';
import { Testdropdown } from 'src/app/interfaces/testdropdown';
import { CourseService } from 'src/app/services/course.service';
import { EnrollmentService } from 'src/app/services/enrollment.service';

@Component({
  selector: 'app-enrollment',
  templateUrl: './enrollment.component.html',
  styleUrls: ['./enrollment.component.css']
})
export class EnrollmentComponent implements OnInit{

  availableCourses: Course[] = [];
  dropdowns : Testdropdown[] = [];
  dropdownStates: boolean[] = [];
  openedByButton: boolean = false;
  indexOfDropdown: number = 0;

  constructor(private courseService: CourseService,
    private enrollmentService: EnrollmentService
  ){
    this.dropdownStates = new Array(this.dropdowns.length).fill(false);
  }



  ngOnInit(): void {
    this.getAvailableCourses();
    
         }


  getAvailableCourses(){
    return this.courseService.getAvailableCourses().pipe(
     tap(data => this.availableCourses = data)
    )
    .subscribe()
  }

  toggleDropdown(index: number) {

    this.indexOfDropdown = index;
    this.openedByButton = true;
    console.log("dropdown states", this.dropdownStates)
    
    this.closeAllDropdowns(index)
    
    this.dropdownStates[index] = !this.dropdownStates[index];
    console.log("dropdown states", this.dropdownStates)
    this.getDropdowns();
    console.log("index", index);
    console.log("state",this.dropdownStates[index]);
    
  }

  closeAllDropdowns(index: number) {
  
    this.dropdownStates.forEach((state, i) => {
      if (i !== index) {
        this.dropdownStates[i] = false;
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    const isButtonClicked = (event.target as HTMLElement).tagName === 'BUTTON';
    const isInsideDropdown = event.composedPath().some((element) => {
      const el = element as HTMLElement; 
      console.log("dropdown states", this.dropdownStates)
      return el.classList && el.classList.contains('dropdown-content');
    });

 
    if (!isInsideDropdown && !isButtonClicked && this.openedByButton) {
      this.openedByButton = false;
      console.log("hostlistener")
     
      this.dropdownStates[this.indexOfDropdown] = !this.dropdownStates[this.indexOfDropdown];
    }
  }


  getDropdowns(){
    return this.enrollmentService.getDropdown().pipe(tap((data) => {
      if (data) {
        
        this.dropdowns = data;
        
        console.log("dropdown states", this.dropdownStates)
        console.log(this.dropdowns)
      }
    }
    
    
    )).subscribe();
    
  }
}
