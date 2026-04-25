import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from 'src/app/services/auth.service';
import { EnrollmentService } from 'src/app/services/enrollment.service';

@Component({
  selector: 'app-registercourses',
  templateUrl: './registercourses.component.html',
  styleUrls: ['./registercourses.component.css']
})
export class RegistercoursesComponent implements OnInit, OnDestroy {

  courseId = 0;
  errorMessage: string | null = null;
  isLoading = false;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private enrollmentService: EnrollmentService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.courseId = Number(params.get('courseId') ?? 0);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  registerCourse(): void {
    const neptunCode = this.authService.getLoggedUserSync();
    if (!neptunCode || this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = null;
    this.enrollmentService.registerCourse(this.courseId, neptunCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/enrollment']);
        },
        error: (e: HttpErrorResponse) => {
          this.isLoading = false;
          this.errorMessage = (e.error && typeof e.error === 'object')
            ? (e.error.message ?? 'Registration failed. Please try again.') : 'Registration failed. Please try again.';
        }
      });
  }
}
