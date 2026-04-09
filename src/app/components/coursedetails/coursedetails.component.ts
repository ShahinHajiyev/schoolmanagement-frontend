import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { Course } from 'src/app/interfaces/course';
import { Student } from 'src/app/interfaces/student';
import { AuthService } from 'src/app/services/auth.service';
import { CourseService } from 'src/app/services/course.service';
import { EnrollmentService } from 'src/app/services/enrollment.service';

@Component({
  selector: 'app-coursedetails',
  templateUrl: './coursedetails.component.html',
  styleUrls: ['./coursedetails.component.css']
})
export class CoursedetailsComponent implements OnInit, OnDestroy {

  course: Course | null = null;
  enrolledStudents: Student[] = [];
  isEnrolled = false;
  enrollActionState: 'idle' | 'loading' | 'success' | 'error' = 'idle';

  tabs = [
    { id: 'basicData',            title: 'Basic data' },
    { id: 'students',             title: 'Students' },
    { id: 'lecturers',            title: 'Lecturers' },
    { id: 'textbooks',            title: 'Textbooks' },
    { id: 'classSchedule',        title: 'Class schedule' },
    { id: 'attendanceStatistics', title: 'Attendance statistics' },
    { id: 'tasks',                title: 'Tasks' },
    { id: 'eMaterials',           title: 'E-materials' },
    { id: 'rankedRegistration',   title: 'Ranked registration' }
  ];

  selectedTabId = this.tabs[0].id;

  private courseId = 0;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private enrollmentService: EnrollmentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(
      takeUntil(this.destroy$),
      switchMap(params => {
        this.courseId = Number(params.get('courseId') ?? 0);
        this.loadEnrolledStudents();
        this.loadEnrollmentStatus();
        return this.courseService.getCourseByCourseId(this.courseId);
      })
    ).subscribe({ next: course => this.course = course });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadEnrolledStudents(): void {
    this.courseService.getEnrolledStudents(this.courseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: data => this.enrolledStudents = data });
  }

  private loadEnrollmentStatus(): void {
    this.enrollmentService.isEnrolled(this.courseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: enrolled => this.isEnrolled = enrolled });
  }

  register(): void {
    const neptunCode = this.authService.getLoggedUserSync();
    if (!neptunCode || this.enrollActionState === 'loading') return;

    this.enrollActionState = 'loading';
    this.enrollmentService.registerCourse(this.courseId, neptunCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isEnrolled = true;
          this.enrollActionState = 'idle';
          this.loadEnrolledStudents();
        },
        error: () => this.enrollActionState = 'error'
      });
  }

  unregister(): void {
    if (this.enrollActionState === 'loading') return;

    this.enrollActionState = 'loading';
    this.enrollmentService.unregisterCourse(this.courseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isEnrolled = false;
          this.enrollActionState = 'idle';
          this.loadEnrolledStudents();
        },
        error: () => this.enrollActionState = 'error'
      });
  }

  goBack(): void {
    this.router.navigate(['/enrollment']);
  }

  selectTab(tabId: string): void {
    this.selectedTabId = tabId;
  }

  trackByTabId(_index: number, tab: { id: string }): string {
    return tab.id;
  }

  trackByNeptunCode(_index: number, student: Student): string {
    return student.neptunCode;
  }
}
