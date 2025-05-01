import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormValidationService } from '../../services/form-validation.service';


@Component({
    selector: 'app-sign-up',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule
    ],
    templateUrl: './sign-up.component.html',
    styleUrls: ['./sign-up.component.scss']
})

export class SignUpComponent {
    /**
     * Form group for the sign-up form.
     */
    signUpForm: FormGroup;

    /**
     * Constructor to initialize the form group.
     * @param fb - FormBuilder instance to create the form group.
     */
    constructor(private fb: FormBuilder) {
        this.signUpForm = this.fb.group({
            name: ['', [Validators.required, FormValidationService.nameValidator]],
            email: ['', [Validators.required, FormValidationService.emailValidator]],
            password: ['', [Validators.required, FormValidationService.passwordValidator]]
        });
    }

    /**
     * Navigates back to the previous page in the browser history.
     */
    navigateBack() {
        window.history.back();
    }

    /**
     * Checks if the form is valid.
     * @returns True if the form is valid, otherwise false.
     */
    isFormValid(): boolean {
        return this.signUpForm.valid;
    }

    /**
     * Handles the form submission.
     * Logs the form data if valid, otherwise logs an invalid form message.
     */
    onSubmit() {
        if (this.signUpForm.valid) {
            console.log('Form submitted:', this.signUpForm.value);
        } else {
            console.log('Form is invalid');
        }
    }
}
