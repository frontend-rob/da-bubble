import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormValidationService } from '../../services/form-validation.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule
],
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.scss'
})
export class LogInComponent {
  /**
   * Form group for the log-in form.
   */
  logInForm: FormGroup;

  /**
   * Constructor to initialize the form group.
   * @param fb - FormBuilder instance to create the form group.
   */
  constructor(private fb: FormBuilder) {
    this.logInForm = this.fb.group({
      email: ['', [Validators.required, FormValidationService.emailValidator]],
      password: ['', [Validators.required, FormValidationService.passwordValidator]]
    });
  }

  /**
   * Handles the form submission.
   * Logs the form data if valid, otherwise logs an invalid form message.
   */
  onSubmit() {
    if (this.logInForm.valid) {
      console.log('Log in successful:', this.logInForm.value);
    } else {
      console.log('Log in form is invalid');
    }
  }
}
