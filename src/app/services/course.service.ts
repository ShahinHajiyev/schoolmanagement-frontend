import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Course } from '../interfaces/course';

@Injectable({
  providedIn: 'root'
})
export class CourseService {

  constructor(private httpClient: HttpClient) { }

   private courseUrl = 'http://localhost:8090/api/course';

   getCourses():Observable<Course[]>{
    return this.httpClient.get<Course[]>(`${this.courseUrl}/getcourses`);
   }

   getAvailableCourses():Observable<Course[]>{
    return this.httpClient.get<Course[]>(`${this.courseUrl}/availablecourses`)
   } 

   getCourseByCourseId(courseId: number):Observable<Course>{
    return this.httpClient.get<Course>(`${this.courseUrl}/getcourse/${courseId}`)

   }


}
