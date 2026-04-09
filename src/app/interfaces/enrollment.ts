import { Course } from './course';
import { Student } from './student';

export interface Enrollment {
  enrollmentId: string;
  student: Student;
  course: Course;
  dateOfRegister: string; // ISO 8601 string as returned by JSON API
  grade: number;
}
