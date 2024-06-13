import { Component, HostListener, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from 'src/app/services/admin.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  constructor(private adminService: AdminService,
    private authService: AuthService,
    private router: Router) { }


  studentForm!: FormGroup

  dropdowns = [
    { key: '1', value: 'Student', },
    { key: '2', value: 'Teacher', }
  ];


  toggleDropdown(event : Event) {
         //To do : If there is a need to fetch a data from some api over the option change
  }


  ngOnInit() {
    this.studentForm = new FormGroup({
      neptunCode: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required]),
      selectedUser: new FormControl('', [Validators.required])
    })
  }

  addStudent() {
    return this.adminService.addStudent(this.studentForm.value.neptunCode, 
                                        this.studentForm.value.email,
                                        this.studentForm.value.selectedUser).subscribe();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }



}
