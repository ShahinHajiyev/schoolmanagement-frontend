import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Training } from 'src/app/interfaces/training';
import { AuthService } from 'src/app/services/auth.service';
import { TrainingService } from 'src/app/services/training.service';

@Component({
  selector: 'app-training',
  templateUrl: './training.component.html',
  styleUrls: ['./training.component.css']
})
export class TrainingComponent implements OnInit, OnDestroy {

  isAdmin = false;

  // Student view
  myTraining: Training | null = null;
  noTraining = false;

  // Admin view
  allTrainings: Training[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private trainingService: TrainingService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();

    if (this.isAdmin) {
      this.trainingService.getAllTrainings()
        .pipe(takeUntil(this.destroy$))
        .subscribe({ next: data => this.allTrainings = data });
    } else {
      this.trainingService.getMyTraining()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: data => this.myTraining = data,
          error: () => this.noTraining = true
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackByTrainingId(_index: number, t: Training): number { return t.trainingId; }
}
