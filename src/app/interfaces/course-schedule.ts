export interface CourseSchedule {
  id?: number;
  courseId: number;
  courseName?: string;
  teacherName?: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
}
