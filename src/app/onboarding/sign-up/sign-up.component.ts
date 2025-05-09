import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {FormValidationService} from '../../services/form-validation.service';
import {UserDataService} from '../../services/user-data.service';

/**
 * Component for handling the user sign-up process.
 * Provides a form for user registration and navigation to the avatar selection step.
 */
@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule
  ],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {
  /**
   * Reactive form group for the sign-up form.
   */
  signUpForm: FormGroup;

  /**
   * Injecting required services using Angular's inject() function.
   */
  private fb = inject(FormBuilder);
  private userDataService = inject(UserDataService);
  private router = inject(Router);

  constructor() {
    this.signUpForm = this.fb.group({
      name: ['', [Validators.required, FormValidationService.nameValidator]],
      email: ['', [Validators.required, FormValidationService.emailValidator]],
      password: ['', [Validators.required, FormValidationService.passwordValidator]],
      policy: [false, [Validators.requiredTrue]],
    });
  }

  /**
   * Lifecycle hook to initialize the form with existing user data.
   */
  ngOnInit() {
    const userData = this.userDataService.getUserData();
    this.signUpForm.patchValue({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      policy: userData.policy || false
    });
  }

  /**
   * Checks if the form is valid.
   * @returns True if the form is valid, otherwise false.
   */
  isFormValid(): boolean {
    return this.signUpForm.valid;
  }

  /**
   * Handles the form submission by saving user data and navigating to the avatar selection step.
   */
  async onSubmit() {
    if (this.signUpForm.valid) {
      this.userDataService.setUserData({
        name: this.signUpForm.value.name,
        email: this.signUpForm.value.email,
        password: this.signUpForm.value.password,
        policy: this.signUpForm.value.policy
      });
      this.router.navigate(['/avatars']);
    } else {
      console.log('Form is invalid');
    }
  }

  /**
   * Navigates back to the previous page in the browser history.
   */
  navigateBack() {
    window.history.back();
  }
}
