import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take, tap } from 'rxjs';
import { Course } from 'src/app/interfaces/course';
import { CourseService } from 'src/app/services/course.service';

@Component({
  selector: 'app-coursedetails',
  templateUrl: './coursedetails.component.html',
  styleUrls: ['./coursedetails.component.css']
})
export class CoursedetailsComponent implements OnInit{

  courseId : number;
  course: Course;

  tabs = [
    { id: 'basicData', title: 'Basic data', content: 'Content for Basic data tab.' },
    { id: 'students', title: 'Students', content: 'Content for Students tab.' },
    { id: 'lecturers', title: 'Lecturers', content: 'Content for Lecturers tab.' },
    { id: 'textbooks', title: 'Textbooks', content: 'Content for Textbooks tab.' },
    { id: 'classSchedule', title: 'Class schedule', content: 'Content for Class Schedule tab.' },
    { id: 'attendanceStatistics', title: 'Attendance statistics', content: 'Content for Attendance Statistics tab.' },
    { id: 'tasks', title: 'Tasks', content: 'Content for Tasks tab.' },
    { id: 'eMaterials', title: 'E-materials', content: 'Content for E-materials tab.' },
    { id: 'rankedRegistration', title: 'Ranked registration', content: 'Content for Ranked Registration tab.' }
  ];

  selectedTabId = this.tabs[0].id;



  constructor(private route : ActivatedRoute,
              private courseService : CourseService
  ){}


  ngOnInit(): void {
    
    this.route.paramMap.subscribe(params => {
      const paramId = params.get('courseId');
      if (paramId !== null) {
        this.courseId = Number(paramId);
        this.getCourseByCourseId(this.courseId);
      } else {
        this.courseId = 0; 
        console.error('No course ID provided');
      }
    });
  }
  


  selectTab(tabId: string) {
    this.selectedTabId = tabId;
  }

  get selectedTab() {
    return this.tabs.find(tab => tab.id === this.selectedTabId);
  }

  getCourseByCourseId(courseId : number){
    return this.courseService.getCourseByCourseId(courseId).pipe(
      tap(courseFromDB => {
         this.course = courseFromDB;
      })
    ).subscribe();

  }

}
