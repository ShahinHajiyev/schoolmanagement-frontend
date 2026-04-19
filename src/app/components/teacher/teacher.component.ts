import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Course } from 'src/app/interfaces/course';
import { Student } from 'src/app/interfaces/student';
import { Teacher } from 'src/app/interfaces/teacher';
import { AuthService } from 'src/app/services/auth.service';
import { TeacherService } from 'src/app/services/teacher.service';

@Component({
  selector: 'app-teacher',
  templateUrl: './teacher.component.html',
  styleUrls: ['./teacher.component.css']
})
export class TeacherComponent implements OnInit, OnDestroy {

  isAdmin = false;

  // ─── Admin view ───────────────────────────────────────────────
  teachers: Teacher[] = [];

  // ─── Teacher view ─────────────────────────────────────────────
  courses: Course[] = [];
  expandedCourseId: number | null = null;
  loadingCourseId: number | null = null;
  courseStudents: Record<number, Student[]> = {};

  private destroy$ = new Subject<void>();

  constructor(
    private teacherService: TeacherService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();

    if (this.isAdmin) {
      this.teacherService.getTeachers()
        .pipe(takeUntil(this.destroy$))
        .subscribe({ next: data => this.teachers = data });
    } else {
      this.teacherService.getMyCourses()
        .pipe(takeUntil(this.destroy$))
        .subscribe({ next: data => this.courses = data });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleExpand(courseId: number): void {
    if (this.expandedCourseId === courseId) {
      this.expandedCourseId = null;
      return;
    }
    this.expandedCourseId = courseId;
    if (this.courseStudents[courseId]) return;

    this.loadingCourseId = courseId;
    this.teacherService.getCourseStudents(courseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => {
          this.courseStudents[courseId] = data;
          this.loadingCourseId = null;
        },
        error: () => {
          this.courseStudents[courseId] = [];
          this.loadingCourseId = null;
        }
      });
  }

  trackByUserId(_index: number, t: Teacher): number   { return t.userId; }
  trackByCourseId(_index: number, c: Course): number  { return c.courseId; }
  trackByNeptunCode(_index: number, s: Student): string { return s.neptunCode; }
}
