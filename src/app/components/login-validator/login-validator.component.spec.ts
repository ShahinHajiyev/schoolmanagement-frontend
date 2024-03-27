import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginValidatorComponent } from './login-validator.component';

describe('LoginValidatorComponent', () => {
  let component: LoginValidatorComponent;
  let fixture: ComponentFixture<LoginValidatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoginValidatorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginValidatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
