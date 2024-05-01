import {  Course } from "./course";
import { Student } from "./student";

export interface Enrollment {
    enrollmentId : string;
    student : Student;
    course : Course;
    dateOfRegister : Date;
    grade : number;
}
