import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterStateSnapshot } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Course } from 'src/app/interfaces/course';
import { AuthService, CanComponentDeactivate, CanDeactivateType, sharedCanDeactivate } from 'src/app/services/auth.service';
import { CourseService } from 'src/app/services/course.service';

@Component({
  selector: 'app-course',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.css']
})
export class CourseComponent implements OnInit, OnDestroy, CanComponentDeactivate {

  courses: Course[] = [];
  searchTerm: string = '';
  isAdmin: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(
    private courseService: CourseService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.courseService.getCourses()
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: data => this.courses = data });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get filteredCourses(): Course[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.courses;
    return this.courses.filter(c => c.courseName.toLowerCase().includes(term));
  }

  canDeactivate(_currentState: RouterStateSnapshot, nextState: RouterStateSnapshot): CanDeactivateType {
    return sharedCanDeactivate(this.authService, nextState);
  }

  trackByCourseId(_index: number, course: Course): number {
    return course.courseId;
  }
}
