import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Course } from 'src/app/interfaces/course';
import { Enrollment } from 'src/app/interfaces/enrollment';
import { AuthService } from 'src/app/services/auth.service';
import { CourseService } from 'src/app/services/course.service';
import { EnrollmentService } from 'src/app/services/enrollment.service';

@Component({
  selector: 'app-enrollment',
  templateUrl: './enrollment.component.html',
  styleUrls: ['./enrollment.component.css']
})
export class EnrollmentComponent implements OnInit, OnDestroy {

  myEnrollments: Enrollment[] = [];
  availableCourses: Course[] = [];

  // Per-row state: courseId → 'idle' | 'loading' | 'success' | 'error'
  registerState: Record<number, 'idle' | 'loading' | 'success' | 'error'> = {};

  private destroy$ = new Subject<void>();

  constructor(
    private courseService: CourseService,
    private enrollmentService: EnrollmentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadMyEnrollments();
    this.loadAvailableCourses();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadMyEnrollments(): void {
    this.enrollmentService.getMyEnrollments()
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: data => this.myEnrollments = data });
  }

  private loadAvailableCourses(): void {
    this.courseService.getAvailableCourses()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => {
          this.availableCourses = data;
          data.forEach(c => this.registerState[c.courseId] = 'idle');
        }
      });
  }

  register(courseId: number): void {
    const neptunCode = this.authService.getLoggedUserSync();
    if (!neptunCode || this.registerState[courseId] === 'loading') return;

    this.registerState[courseId] = 'loading';
    this.enrollmentService.registerCourse(courseId, neptunCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.registerState[courseId] = 'success';
          this.loadMyEnrollments();
          this.loadAvailableCourses();
        },
        error: () => {
          this.registerState[courseId] = 'error';
        }
      });
  }

  trackByCourseId(_index: number, course: Course): number {
    return course.courseId;
  }

  trackByEnrollmentId(_index: number, enrollment: Enrollment): string {
    return enrollment.enrollmentId;
  }
}
