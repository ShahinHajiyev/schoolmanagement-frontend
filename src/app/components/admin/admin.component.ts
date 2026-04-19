import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Course } from 'src/app/interfaces/course';
import { Enrollment } from 'src/app/interfaces/enrollment';
import { Semester } from 'src/app/interfaces/semester';
import { UserDto } from 'src/app/interfaces/user-dto';
import { AdminService } from 'src/app/services/admin.service';
import { CourseService } from 'src/app/services/course.service';
import { DashboardService } from 'src/app/services/dashboard.service';
import { EnrollmentService } from 'src/app/services/enrollment.service';
import { SemesterService } from 'src/app/services/semester.service';
import { DashboardStats } from 'src/app/interfaces/dashboard-stats';
import { AuthService, CanComponentDeactivate, CanDeactivateType, sharedCanDeactivate } from 'src/app/services/auth.service';
import { RouterStateSnapshot } from '@angular/router';

type ActionState = 'idle' | 'loading' | 'success' | 'error';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit, OnDestroy, CanComponentDeactivate {

  activeTab: 'users' | 'courses' | 'enrollments' | 'reports' = 'users';

  // ─── Users ───────────────────────────────────────────────────
  users: UserDto[] = [];
  userForm!: FormGroup;
  userActionState: ActionState = 'idle';
  userErrorStatus: number | null = null;

  roles = [
    { key: 'Student', label: 'Student' },
    { key: 'Teacher', label: 'Teacher' }
  ];

  // ─── Courses ──────────────────────────────────────────────────
  courses: Course[] = [];
  semesters: Semester[] = [];
  courseForm!: FormGroup;
  courseActionState: ActionState = 'idle';
  deletingCourseId: number | null = null;

  // ─── Enrollments ──────────────────────────────────────────────
  enrollments: Enrollment[] = [];
  enrollmentsLoaded = false;
  deletingEnrollmentId: number | null = null;

  // ─── Reports ──────────────────────────────────────────────────
  stats: DashboardStats | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private adminService: AdminService,
    private courseService: CourseService,
    private dashboardService: DashboardService,
    private enrollmentService: EnrollmentService,
    private semesterService: SemesterService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userForm = new FormGroup({
      neptunCode: new FormControl('', [Validators.required]),
      email:      new FormControl('', [Validators.required, Validators.email]),
      role:       new FormControl('', [Validators.required])
    });

    this.courseForm = new FormGroup({
      courseName:        new FormControl('', [Validators.required]),
      credit:            new FormControl('', [Validators.required, Validators.min(1)]),
      teacherNeptunCode: new FormControl('', [Validators.required]),
      semesterId:        new FormControl('', [Validators.required])
    });

    this.loadUsers();
    this.loadCourses();
    this.loadSemesters();
    this.loadStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  canDeactivate(_currentState: RouterStateSnapshot, nextState: RouterStateSnapshot): CanDeactivateType {
    return sharedCanDeactivate(this.authService, nextState);
  }

  // ─── Users ───────────────────────────────────────────────────

  private loadUsers(): void {
    this.adminService.getUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: data => this.users = data });
  }

  addUser(): void {
    if (this.userForm.invalid || this.userActionState === 'loading') return;
    this.userActionState = 'loading';
    this.userErrorStatus = null;

    const { neptunCode, email, role } = this.userForm.value;
    this.adminService.addUser(neptunCode, email, role)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.userActionState = 'success';
          this.userForm.reset();
          this.loadUsers();
          setTimeout(() => this.userActionState = 'idle', 2500);
        },
        error: (e: HttpErrorResponse) => {
          this.userActionState = 'error';
          this.userErrorStatus = e.status;
        }
      });
  }

  trackByNeptunCode(_index: number, user: UserDto): string {
    return user.neptunCode;
  }

  // ─── Courses ──────────────────────────────────────────────────

  private loadCourses(): void {
    this.courseService.getCourses()
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: data => this.courses = data });
  }

  private loadSemesters(): void {
    this.semesterService.getSemesters()
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: data => this.semesters = data });
  }

  trackBySemesterId(_index: number, s: Semester): number { return s.id; }

  addCourse(): void {
    if (this.courseForm.invalid || this.courseActionState === 'loading') return;
    this.courseActionState = 'loading';

    const { courseName, credit, teacherNeptunCode, semesterId } = this.courseForm.value;
    this.adminService.addCourse(courseName, Number(credit), teacherNeptunCode, Number(semesterId))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.courseActionState = 'success';
          this.courseForm.reset();
          this.loadCourses();
          setTimeout(() => this.courseActionState = 'idle', 2500);
        },
        error: () => this.courseActionState = 'error'
      });
  }

  deleteCourse(courseId: number): void {
    if (this.deletingCourseId !== null) return;
    this.deletingCourseId = courseId;

    this.adminService.deleteCourse(courseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.deletingCourseId = null;
          this.loadCourses();
        },
        error: () => this.deletingCourseId = null
      });
  }

  trackByCourseId(_index: number, course: Course): number {
    return course.courseId;
  }

  // ─── Tab switching ────────────────────────────────────────────

  switchTab(tab: 'users' | 'courses' | 'enrollments' | 'reports'): void {
    this.activeTab = tab;
    if (tab === 'enrollments' && !this.enrollmentsLoaded) {
      this.loadEnrollments();
    }
  }

  // ─── Enrollments ──────────────────────────────────────────────

  private loadEnrollments(): void {
    this.enrollmentService.getAllEnrollments()
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: data => { this.enrollments = data; this.enrollmentsLoaded = true; } });
  }

  deleteEnrollment(id: number): void {
    if (this.deletingEnrollmentId !== null) return;
    this.deletingEnrollmentId = id;
    this.enrollmentService.deleteEnrollment(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.enrollments = this.enrollments.filter(e => Number(e.enrollmentId) !== id);
          this.deletingEnrollmentId = null;
        },
        error: () => this.deletingEnrollmentId = null
      });
  }

  trackByEnrollmentId(_index: number, e: Enrollment): string { return e.enrollmentId; }

  // ─── Reports ──────────────────────────────────────────────────

  private loadStats(): void {
    this.dashboardService.getStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: data => this.stats = data });
  }
}
