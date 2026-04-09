import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ScheduleEntry } from 'src/app/interfaces/schedule-entry';
import { ScheduleService } from 'src/app/services/schedule.service';

const HOUR_START = 8;
const HOUR_END   = 20;

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent implements OnInit, OnDestroy {

  readonly days    = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  readonly hours   = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);

  weekStart!: Date;
  weekLabel  = '';
  weekDates: Date[] = [];

  // grid[dayIndex 0–5][hour 8–19] → ScheduleEntry | null
  grid: (ScheduleEntry | null)[][] = [];

  private destroy$ = new Subject<void>();

  constructor(private scheduleService: ScheduleService) {}

  ngOnInit(): void {
    this.weekStart = this.getMondayOf(new Date());
    this.load();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  prevWeek(): void {
    this.weekStart = new Date(this.weekStart);
    this.weekStart.setDate(this.weekStart.getDate() - 7);
    this.load();
  }

  nextWeek(): void {
    this.weekStart = new Date(this.weekStart);
    this.weekStart.setDate(this.weekStart.getDate() + 7);
    this.load();
  }

  private load(): void {
    this.buildWeekMeta();
    this.grid = this.emptyGrid();

    this.scheduleService.getSchedule(this.toDateString(this.weekStart))
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: entries => this.buildGrid(entries) });
  }

  private buildWeekMeta(): void {
    this.weekDates = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(this.weekStart);
      d.setDate(d.getDate() + i);
      return d;
    });

    const end = new Date(this.weekStart);
    end.setDate(end.getDate() + 5);

    const fmt = (d: Date) => d.toLocaleDateString('default', { month: 'short', day: 'numeric' });
    this.weekLabel = `${fmt(this.weekStart)} – ${fmt(end)}, ${end.getFullYear()}`;
  }

  private emptyGrid(): (ScheduleEntry | null)[][] {
    return Array.from({ length: 6 }, () =>
      Array.from({ length: HOUR_END - HOUR_START }, () => null)
    );
  }

  private buildGrid(entries: ScheduleEntry[]): void {
    this.grid = this.emptyGrid();
    for (const entry of entries) {
      const dayIdx  = entry.dayOfWeek - 1; // 0-based
      const startH  = this.parseHour(entry.startTime);
      const endH    = this.parseHour(entry.endTime);
      if (dayIdx < 0 || dayIdx > 5) continue;

      for (let h = startH; h < endH; h++) {
        const rowIdx = h - HOUR_START;
        if (rowIdx >= 0 && rowIdx < this.grid[dayIdx].length) {
          this.grid[dayIdx][rowIdx] = entry;
        }
      }
    }
  }

  private parseHour(time: string): number {
    return parseInt(time.split(':')[0], 10);
  }

  private getMondayOf(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay(); // 0=Sun
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private toDateString(date: Date): string {
    return date.toISOString().split('T')[0]; // "YYYY-MM-DD"
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  formatHour(hour: number): string {
    return `${String(hour).padStart(2, '0')}:00`;
  }

  trackByHour(_index: number, hour: number): number { return hour; }
  trackByDay(_index: number, day: string): string   { return day; }
}
