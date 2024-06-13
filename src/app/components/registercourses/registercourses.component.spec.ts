import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistercoursesComponent } from './registercourses.component';

describe('RegistercoursesComponent', () => {
  let component: RegistercoursesComponent;
  let fixture: ComponentFixture<RegistercoursesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegistercoursesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistercoursesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
