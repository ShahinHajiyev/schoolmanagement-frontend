import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AdminService } from 'src/app/services/admin.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {
  
  constructor(private adminService: AdminService){}


  studentForm!: FormGroup

  ngOnInit(){
    this.studentForm = new FormGroup({
      neptunCode:  new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required])
    })
  }

  addStudent(){
    return this.adminService.addStudent(this.studentForm.value.neptunCode, this.studentForm.value.email).subscribe();
  }

}
