import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormValidationService } from '../../services/form-validation.service';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

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
     * Error message to be displayed when the server returns an error.
     */
    serverError: string | null = null;

    /**
     * Constructor initializes the form group and injects required services.
     */
    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.logInForm = this.fb.group({
            email: ['', [Validators.required, FormValidationService.emailValidator]],
            password: ['', [Validators.required, FormValidationService.passwordValidator]]
        });
    }

    /**
     * Checks if the form is valid. If not, marks all fields as touched.
     * @returns true if the form is invalid, false otherwise.
     */
    private isFormInvalid(): boolean {
        if (this.logInForm.invalid) {
            this.logInForm.markAllAsTouched();
            return true;
        }
        return false;
    }

    /**
     * Handles the form submission. If the form is valid, attempts to log in the user.
     */
    onSubmit(): void {
        if (this.isFormInvalid()) {
            return;
        }

        const { email, password } = this.logInForm.value;
        this.serverError = null;

        this.authService.logIn(email, password)
            .then(() => {
                this.router.navigate(['/workspace']);
            })
            .catch((error) => {
                this.handleLoginError(error);
            });
    }

    /**
     * Logs in as a guest user with predefined credentials.
     */
    guestLogIn(): void {
        this.logInForm.setValue({
            email: 'guest@dabubble.com',
            password: 'guest@dabubble406'
        });
        this.onSubmit();
    }

    /**
     * Returns the appropriate error message for the email field.
     */
    getEmailErrorMessage(): string {
        const control = this.logInForm.get('email');

        if (control?.hasError('invalidEmail')) {
            return '*Please enter a valid e-mail address.';
        }

        if (this.serverError?.startsWith('email:')) {
            return this.serverError.split(':')[1];
        }

        return '';
    }

    /**
     * Returns the appropriate error message for the password field.
     */
    getPasswordErrorMessage(): string {
        const control = this.logInForm.get('password');

        if (control?.hasError('invalidPassword')) {
            return '*Password must contain at least 8 characters.';
        }

        if (this.serverError?.startsWith('password:')) {
            return this.serverError.split(':')[1];
        }

        return '';
    }

    /**
     * Handles login errors and sets the appropriate error message.
     */
    private handleLoginError(error: any): void {
        if (error?.code === 'auth/invalid-credential') {
            this.serverError = 'email: *Invalid email or password. Please try again.';
        } else {
            this.serverError = 'global: *Unexpected error occurred. Please try again.';
        }
    }
}
