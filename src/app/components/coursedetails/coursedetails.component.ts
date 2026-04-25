import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Course } from 'src/app/interfaces/course';
import { CourseDetails } from 'src/app/interfaces/course-details';
import { CourseSchedule } from 'src/app/interfaces/course-schedule';
import { Student } from 'src/app/interfaces/student';
import { AuthService } from 'src/app/services/auth.service';
import { CourseService } from 'src/app/services/course.service';
import { EnrollmentService } from 'src/app/services/enrollment.service';

type ActionState = 'idle' | 'loading' | 'success' | 'error';

@Component({
  selector: 'app-coursedetails',
  templateUrl: './coursedetails.component.html',
  styleUrls: ['./coursedetails.component.css']
})
export class CoursedetailsComponent implements OnInit, OnDestroy {

  course: Course | null = null;
  enrolledStudents: Student[] = [];
  isEnrolled = false;
  isAdmin = false;
  enrollActionState: ActionState = 'idle';
  enrollErrorMessage: string | null = null;

  // ─── Basic Data tab ───────────────────────────────────────────
  courseDetails: CourseDetails | null = null;
  editingDetails = false;
  detailsSaveState: ActionState = 'idle';
  detailsSaveErrorMessage: string | null = null;
  detailsForm!: FormGroup;

  // ─── Class Schedule tab ───────────────────────────────────────
  scheduleEntries: CourseSchedule[] = [];
  scheduleLoaded = false;
  deletingScheduleId: number | null = null;
  deleteScheduleError: string | null = null;
  scheduleForm!: FormGroup;
  addScheduleState: ActionState = 'idle';
  scheduleAddErrorMessage: string | null = null;

  readonly days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  tabs = [
    { id: 'basicData',            title: 'Basic data' },
    { id: 'students',             title: 'Students' },
    { id: 'lecturers',            title: 'Lecturers' },
    { id: 'classSchedule',        title: 'Class schedule' },
    { id: 'textbooks',            title: 'Textbooks' },
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
    this.isAdmin = this.authService.isAdmin();

    this.detailsForm = new FormGroup({
      courseCode:            new FormControl('', Validators.required),
      examType:              new FormControl(''),
      courseType:            new FormControl(''),
      classSchedule:         new FormControl(''),
      internetAddress:       new FormControl(''),
      coursePrice:           new FormControl(0),
      minHeadcount:          new FormControl(0),
      maxHeadcount:          new FormControl(0),
      preliminaryRequirement:new FormControl(''),
      classPerWeek:          new FormControl(0),
      classPerTerm:          new FormControl(0),
      organizationName:      new FormControl(''),
      languageName:          new FormControl('')
    });

    this.scheduleForm = new FormGroup({
      dayOfWeek:  new FormControl('', Validators.required),
      startTime:  new FormControl('', Validators.required),
      endTime:    new FormControl('', Validators.required),
      room:       new FormControl('', Validators.required)
    });

    this.route.paramMap.pipe(
      takeUntil(this.destroy$),
      switchMap(params => {
        this.courseId = Number(params.get('courseId') ?? 0);
        this.loadEnrolledStudents();
        this.loadEnrollmentStatus();
        this.loadCourseDetails();
        return this.courseService.getCourseByCourseId(this.courseId);
      })
    ).subscribe({ next: course => this.course = course, error: () => {} });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─── Enrollment ───────────────────────────────────────────────

  private loadEnrolledStudents(): void {
    this.courseService.getEnrolledStudents(this.courseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: data => this.enrolledStudents = data, error: () => {} });
  }

  private loadEnrollmentStatus(): void {
    this.enrollmentService.isEnrolled(this.courseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: enrolled => this.isEnrolled = enrolled, error: () => {} });
  }

  register(): void {
    const neptunCode = this.authService.getLoggedUserSync();
    if (!neptunCode || this.enrollActionState === 'loading') return;
    this.enrollActionState = 'loading';
    this.enrollErrorMessage = null;
    this.enrollmentService.registerCourse(this.courseId, neptunCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => { this.isEnrolled = true; this.enrollActionState = 'idle'; this.loadEnrolledStudents(); },
        error: (e: HttpErrorResponse) => {
          this.enrollActionState = 'error';
          this.enrollErrorMessage = (e.error && typeof e.error === 'object') ? (e.error.message ?? null) : null;
        }
      });
  }

  unregister(): void {
    if (this.enrollActionState === 'loading') return;
    this.enrollActionState = 'loading';
    this.enrollErrorMessage = null;
    this.enrollmentService.unregisterCourse(this.courseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => { this.isEnrolled = false; this.enrollActionState = 'idle'; this.loadEnrolledStudents(); },
        error: (e: HttpErrorResponse) => {
          this.enrollActionState = 'error';
          this.enrollErrorMessage = (e.error && typeof e.error === 'object') ? (e.error.message ?? null) : null;
        }
      });
  }

  // ─── Basic Data tab ───────────────────────────────────────────

  private loadCourseDetails(): void {
    this.courseService.getCourseDetails(this.courseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: data => { this.courseDetails = data; this.patchDetailsForm(data); }, error: () => {} });
  }

  private patchDetailsForm(d: CourseDetails): void {
    this.detailsForm.patchValue(d);
  }

  startEditDetails(): void {
    if (this.courseDetails) this.patchDetailsForm(this.courseDetails);
    this.editingDetails = true;
    this.detailsSaveState = 'idle';
  }

  cancelEditDetails(): void {
    this.editingDetails = false;
  }

  saveDetails(): void {
    if (this.detailsForm.invalid || this.detailsSaveState === 'loading') return;
    this.detailsSaveState = 'loading';
    this.detailsSaveErrorMessage = null;
    this.courseService.saveCourseDetails(this.courseId, this.detailsForm.value as CourseDetails)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.courseDetails = this.detailsForm.value as CourseDetails;
          this.editingDetails = false;
          this.detailsSaveState = 'idle';
        },
        error: (e: HttpErrorResponse) => {
          this.detailsSaveState = 'error';
          this.detailsSaveErrorMessage = (e.error && typeof e.error === 'object') ? (e.error.message ?? null) : null;
        }
      });
  }

  // ─── Class Schedule tab ───────────────────────────────────────

  selectTab(tabId: string): void {
    this.selectedTabId = tabId;
    if (tabId === 'classSchedule' && !this.scheduleLoaded) {
      this.loadSchedule();
    }
  }

  private loadSchedule(): void {
    this.courseService.getCourseSchedule(this.courseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: data => { this.scheduleEntries = data; this.scheduleLoaded = true; } });
  }

  addSchedule(): void {
    if (this.scheduleForm.invalid || this.addScheduleState === 'loading') return;
    this.addScheduleState = 'loading';
    this.scheduleAddErrorMessage = null;
    const { dayOfWeek, startTime, endTime, room } = this.scheduleForm.value;
    this.courseService.addCourseSchedule(this.courseId, { dayOfWeek, startTime, endTime, room })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.addScheduleState = 'idle';
          this.scheduleForm.reset();
          this.loadSchedule();
        },
        error: (e: HttpErrorResponse) => {
          this.addScheduleState = 'error';
          this.scheduleAddErrorMessage = (e.error && typeof e.error === 'object') ? (e.error.message ?? null) : null;
        }
      });
  }

  deleteSchedule(scheduleId: number): void {
    if (this.deletingScheduleId !== null) return;
    this.deletingScheduleId = scheduleId;
    this.deleteScheduleError = null;
    this.courseService.deleteCourseSchedule(scheduleId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.scheduleEntries = this.scheduleEntries.filter(e => e.id !== scheduleId);
          this.deletingScheduleId = null;
        },
        error: (e: HttpErrorResponse) => {
          this.deletingScheduleId = null;
          this.deleteScheduleError = (e.error && typeof e.error === 'object')
            ? (e.error.message ?? 'Failed to delete schedule entry.') : 'Failed to delete schedule entry.';
        }
      });
  }

  // ─── Navigation ───────────────────────────────────────────────

  goBack(): void { this.router.navigate(['/enrollment']); }

  trackByTabId(_index: number, tab: { id: string }): string    { return tab.id; }
  trackByNeptunCode(_index: number, s: Student): string        { return s.neptunCode; }
  trackByScheduleId(_index: number, e: CourseSchedule): number { return e.id ?? 0; }
}
