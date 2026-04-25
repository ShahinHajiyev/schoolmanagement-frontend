import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Course } from 'src/app/interfaces/course';
import { Enrollment } from 'src/app/interfaces/enrollment';
import { AuthService } from 'src/app/services/auth.service';
import { CourseService } from 'src/app/services/course.service';
import { GradesService } from 'src/app/services/grades.service';

type GradeState = 'idle' | 'editing' | 'loading' | 'error';

@Component({
  selector: 'app-grades',
  templateUrl: './grades.component.html',
  styleUrls: ['./grades.component.css']
})
export class GradesComponent implements OnInit, OnDestroy {

  isTeacher = false;

  // ─── Student view ─────────────────────────────────────────────
  myGrades: Enrollment[] = [];

  // ─── Teacher view ─────────────────────────────────────────────
  courses: Course[] = [];
  selectedCourseId: number | null = null;
  courseEnrollments: Enrollment[] = [];

  // Per-enrollment editing state: enrollmentId → state
  gradeStates: Record<string, GradeState> = {};
  // Holds the draft value while editing
  draftGrades: Record<string, number | null> = {};
  // Per-enrollment error messages from backend
  gradeErrors: Record<string, string | null> = {};

  private destroy$ = new Subject<void>();

  constructor(
    private gradesService: GradesService,
    private courseService: CourseService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isTeacher = this.authService.isAdmin();

    if (this.isTeacher) {
      this.courseService.getCourses()
        .pipe(takeUntil(this.destroy$))
        .subscribe({ next: data => this.courses = data });
    } else {
      this.gradesService.getMyGrades()
        .pipe(takeUntil(this.destroy$))
        .subscribe({ next: data => this.myGrades = data });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─── Teacher: course selection ────────────────────────────────

  onCourseChange(courseId: number): void {
    this.selectedCourseId = Number(courseId);
    this.courseEnrollments = [];
    this.gradeStates = {};
    this.draftGrades = {};
    this.gradeErrors = {};

    this.gradesService.getGradesByCourse(this.selectedCourseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => {
          this.courseEnrollments = data;
          data.forEach(e => {
            this.gradeStates[e.enrollmentId] = 'idle';
            this.draftGrades[e.enrollmentId] = e.grade;
          });
        }
      });
  }

  // ─── Teacher: inline grade editing ───────────────────────────

  startEdit(enrollmentId: string): void {
    this.gradeStates[enrollmentId] = 'editing';
  }

  cancelEdit(enrollmentId: string): void {
    const original = this.courseEnrollments.find(e => e.enrollmentId === enrollmentId);
    this.draftGrades[enrollmentId] = original?.grade ?? null;
    this.gradeStates[enrollmentId] = 'idle';
  }

  saveGrade(enrollmentId: string): void {
    const grade = this.draftGrades[enrollmentId];
    if (grade === null || grade === undefined) return;

    this.gradeStates[enrollmentId] = 'loading';
    this.gradeErrors[enrollmentId] = null;
    this.gradesService.updateGrade(enrollmentId, grade)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          const enrollment = this.courseEnrollments.find(e => e.enrollmentId === enrollmentId);
          if (enrollment) enrollment.grade = grade;
          this.gradeStates[enrollmentId] = 'idle';
        },
        error: (e: HttpErrorResponse) => {
          this.gradeStates[enrollmentId] = 'error';
          this.gradeErrors[enrollmentId] = (e.error && typeof e.error === 'object') ? (e.error.message ?? null) : null;
        }
      });
  }

  // ─── Shared helpers ───────────────────────────────────────────

  gradeStatus(grade: number | null): 'pending' | 'fail' | 'pass' {
    if (!grade) return 'pending';
    if (grade === 1) return 'fail';
    return 'pass';
  }

  gradeLabel(grade: number | null): string {
    const status = this.gradeStatus(grade);
    if (status === 'pending') return 'Pending';
    if (status === 'fail')    return 'Fail';
    return 'Pass';
  }

  trackByEnrollmentId(_index: number, e: Enrollment): string { return e.enrollmentId; }
  trackByCourseId(_index: number, c: Course): number         { return c.courseId; }
}
