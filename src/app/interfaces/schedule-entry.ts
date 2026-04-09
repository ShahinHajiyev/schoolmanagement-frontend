export interface ScheduleEntry {
  courseId: number;
  courseName: string;
  teacherName: string;
  room?: string;
  dayOfWeek: number;  // 1=Mon, 2=Tue, ..., 6=Sat
  startTime: string;  // "HH:mm"
  endTime: string;    // "HH:mm"
}
