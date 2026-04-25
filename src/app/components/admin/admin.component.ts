import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Course } from 'src/app/interfaces/course';
import { Enrollment } from 'src/app/interfaces/enrollment';
import { Program } from 'src/app/interfaces/program';
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
  userSearchQuery = '';

  get filteredUsers(): UserDto[] {
    const term = this.userSearchQuery.trim().toLowerCase();
    if (!term) return this.users;
    return this.users.filter(u => u.neptunCode?.toLowerCase().includes(term));
  }
  userForm!: FormGroup;
  userActionState: ActionState = 'idle';
  userErrorStatus: number | null = null;
  userErrorMessage: string | null = null;
  unblockingNeptunCode: string | null = null;
  unblockError: string | null = null;

  roles = [
    { key: 'Student', label: 'Student' },
    { key: 'Teacher', label: 'Teacher' }
  ];

  // ─── Programs ─────────────────────────────────────────────────
  programs: Program[] = [];
  selectedProgramIds: number[] = [];
  programDropdownOpen = false;

  get selectedRole(): string {
    return this.userForm?.get('role')?.value ?? '';
  }

  get selectedProgramLabels(): string {
    if (this.selectedProgramIds.length === 0) return '— Select programs —';
    return this.programs
      .filter(p => this.selectedProgramIds.includes(p.programId))
      .map(p => p.programName)
      .join(', ');
  }

  // ─── Courses ──────────────────────────────────────────────────
  courses: Course[] = [];
  semesters: Semester[] = [];
  courseForm!: FormGroup;
  courseActionState: ActionState = 'idle';
  courseErrorMessage: string | null = null;
  deletingCourseId: number | null = null;
  deleteCourseError: string | null = null;

  // ─── Enrollments ──────────────────────────────────────────────
  enrollments: Enrollment[] = [];
  enrollmentsLoaded = false;
  deletingEnrollmentId: number | null = null;
  deleteEnrollmentError: string | null = null;

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

    this.userForm.get('role')!.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => { this.selectedProgramIds = []; this.programDropdownOpen = false; });

    this.loadUsers();
    this.loadPrograms();
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

  private loadPrograms(): void {
    this.adminService.getPrograms()
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: data => this.programs = data, error: () => {} });
  }

  toggleProgram(programId: number): void {
    const idx = this.selectedProgramIds.indexOf(programId);
    if (idx >= 0) {
      this.selectedProgramIds.splice(idx, 1);
    } else if (this.selectedRole === 'Student' || this.selectedProgramIds.length < 3) {
      this.selectedProgramIds = [programId]; // Student: replace; Teacher: handled below
    }
  }

  onTeacherProgramChange(event: Event): void {
    const selected = Array.from((event.target as HTMLSelectElement).selectedOptions)
      .map(o => Number(o.value))
      .slice(0, 3);
    this.selectedProgramIds = selected;
  }

  toggleProgramDropdown(event: Event): void {
    event.stopPropagation();
    this.programDropdownOpen = !this.programDropdownOpen;
  }

  toggleTeacherProgram(programId: number, event: Event): void {
    event.stopPropagation();
    const idx = this.selectedProgramIds.indexOf(programId);
    if (idx >= 0) {
      this.selectedProgramIds.splice(idx, 1);
    } else if (this.selectedProgramIds.length < 3) {
      this.selectedProgramIds.push(programId);
    }
  }

  @HostListener('document:click')
  closeProgramDropdown(): void {
    this.programDropdownOpen = false;
  }

  isProgramSelected(programId: number): boolean {
    return this.selectedProgramIds.includes(programId);
  }

  addUser(): void {
    if (this.userForm.invalid || this.userActionState === 'loading') return;
    this.userActionState = 'loading';
    this.userErrorStatus = null;
    this.userErrorMessage = null;

    const { neptunCode, email, role } = this.userForm.value;
    this.adminService.addUser(neptunCode, email, role, this.selectedProgramIds)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.userActionState = 'success';
          this.userForm.reset();
          this.selectedProgramIds = [];
          this.programDropdownOpen = false;
          this.loadUsers();
          setTimeout(() => this.userActionState = 'idle', 2500);
        },
        error: (e: HttpErrorResponse) => {
          this.userActionState = 'error';
          this.userErrorStatus = e.status;
          this.userErrorMessage = (e.error && typeof e.error === 'object')
            ? (e.error.message ?? null)
            : null;
        }
      });
  }

  unblockActivation(neptunCode: string): void {
    if (this.unblockingNeptunCode !== null) return;
    this.unblockingNeptunCode = neptunCode;
    this.unblockError = null;
    this.adminService.unblockActivation(neptunCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.unblockingNeptunCode = null;
          this.loadUsers();
        },
        error: (e: HttpErrorResponse) => {
          this.unblockingNeptunCode = null;
          this.unblockError = (e.error && typeof e.error === 'object')
            ? (e.error.message ?? 'Failed to unblock user.') : 'Failed to unblock user.';
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
    this.courseErrorMessage = null;

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
        error: (e: HttpErrorResponse) => {
          this.courseActionState = 'error';
          this.courseErrorMessage = (e.error && typeof e.error === 'object')
            ? (e.error.message ?? null)
            : null;
        }
      });
  }

  deleteCourse(courseId: number): void {
    if (this.deletingCourseId !== null) return;
    this.deletingCourseId = courseId;
    this.deleteCourseError = null;

    this.adminService.deleteCourse(courseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.deletingCourseId = null;
          this.loadCourses();
        },
        error: (e: HttpErrorResponse) => {
          this.deletingCourseId = null;
          this.deleteCourseError = (e.error && typeof e.error === 'object')
            ? (e.error.message ?? 'Failed to delete course.') : 'Failed to delete course.';
        }
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
    this.deleteEnrollmentError = null;
    this.enrollmentService.deleteEnrollment(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.enrollments = this.enrollments.filter(e => Number(e.enrollmentId) !== id);
          this.deletingEnrollmentId = null;
        },
        error: (e: HttpErrorResponse) => {
          this.deletingEnrollmentId = null;
          this.deleteEnrollmentError = (e.error && typeof e.error === 'object')
            ? (e.error.message ?? 'Failed to delete enrollment.') : 'Failed to delete enrollment.';
        }
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
