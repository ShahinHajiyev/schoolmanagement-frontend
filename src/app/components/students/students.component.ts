import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Enrollment } from 'src/app/interfaces/enrollment';
import { Student } from 'src/app/interfaces/student';
import { StudentService } from 'src/app/services/student.service';

@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.css']
})
export class StudentsComponent implements OnInit, OnDestroy {

  students: Student[] = [];
  searchTerm = '';

  // neptunCode → enrollment list (loaded on expand)
  enrollments: Record<string, Enrollment[]> = {};
  // neptunCode of the currently expanded row (null = none)
  expandedNeptunCode: string | null = null;
  loadingNeptunCode: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(private studentService: StudentService) {}

  ngOnInit(): void {
    this.studentService.getStudents()
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: data => this.students = data });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get filteredStudents(): Student[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.students;
    return this.students.filter(s =>
      s.neptunCode.toLowerCase().includes(term) ||
      s.email.toLowerCase().includes(term)
    );
  }

  toggleExpand(neptunCode: string): void {
    if (this.expandedNeptunCode === neptunCode) {
      this.expandedNeptunCode = null;
      return;
    }

    this.expandedNeptunCode = neptunCode;

    // Only fetch if not already loaded
    if (this.enrollments[neptunCode]) return;

    this.loadingNeptunCode = neptunCode;
    this.studentService.getStudentEnrollments(neptunCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => {
          this.enrollments[neptunCode] = data;
          this.loadingNeptunCode = null;
        },
        error: () => {
          this.enrollments[neptunCode] = [];
          this.loadingNeptunCode = null;
        }
      });
  }

  trackByNeptunCode(_index: number, student: Student): string {
    return student.neptunCode;
  }

  trackByEnrollmentId(_index: number, enrollment: Enrollment): string {
    return enrollment.enrollmentId;
  }
}
