import { Teacher } from '../interfaces/teacher';
import { Semester } from './semester';

export interface Course {
  courseId: number;
  courseName: string;
  credit: number;
  teacher: Teacher;
  semester: Semester;
}
