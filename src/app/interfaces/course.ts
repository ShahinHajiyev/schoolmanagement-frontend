import { Enrollment } from "../interfaces/enrollment";
import { Teacher } from "../interfaces/teacher";

export interface Course {
    courseId: number;
    courseName: string;
    credit: number;
    teacher: Teacher;
    enrollments: Enrollment[];
}
