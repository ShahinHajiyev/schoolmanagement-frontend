import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Enrollment } from 'src/app/interfaces/enrollment';
import { Gpa } from 'src/app/interfaces/gpa';
import { Student } from 'src/app/interfaces/student';
import { TranscriptItem } from 'src/app/interfaces/transcript-item';
import { StudentService } from 'src/app/services/student.service';

type DetailTab = 'enrollments' | 'transcript';

@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.css']
})
export class StudentsComponent implements OnInit, OnDestroy {

  students: Student[] = [];
  searchTerm = '';

  // Pagination
  currentPage = 0;
  totalPages = 0;
  pageSize = 20;

  // Expand state
  expandedNeptunCode: string | null = null;
  loadingNeptunCode: string | null = null;
  activeDetailTab: Record<string, DetailTab> = {};

  // Enrollment cache
  enrollments: Record<string, Enrollment[]> = {};

  // Transcript + GPA cache
  transcripts: Record<string, TranscriptItem[]> = {};
  gpas: Record<string, Gpa> = {};
  loadingTranscript: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(private studentService: StudentService) {}

  ngOnInit(): void {
    this.loadPage(0);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPage(page: number): void {
    this.currentPage = page;
    this.studentService.getStudents(page, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => {
          this.students = data.content;
          this.totalPages = data.totalPages;
        }
      });
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
    if (!this.activeDetailTab[neptunCode]) {
      this.activeDetailTab[neptunCode] = 'enrollments';
    }
    this.loadEnrollmentsIfNeeded(neptunCode);
  }

  setDetailTab(neptunCode: string, tab: DetailTab): void {
    this.activeDetailTab[neptunCode] = tab;
    if (tab === 'transcript') {
      this.loadTranscriptIfNeeded(neptunCode);
    }
  }

  private loadEnrollmentsIfNeeded(neptunCode: string): void {
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

  private loadTranscriptIfNeeded(neptunCode: string): void {
    if (this.transcripts[neptunCode]) return;
    this.loadingTranscript = neptunCode;
    this.studentService.getStudentGpa(neptunCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: gpa => this.gpas[neptunCode] = gpa });

    this.studentService.getStudentTranscript(neptunCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => {
          this.transcripts[neptunCode] = data;
          this.loadingTranscript = null;
        },
        error: () => {
          this.transcripts[neptunCode] = [];
          this.loadingTranscript = null;
        }
      });
  }

  trackByNeptunCode(_index: number, student: Student): string { return student.neptunCode; }
  trackByEnrollmentId(_index: number, e: Enrollment): string  { return e.enrollmentId; }
  trackByCourseName(_index: number, t: TranscriptItem): string { return t.courseName + t.semesterName; }
}
