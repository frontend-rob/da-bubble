import {Component} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {FormValidationService} from '../../services/form-validation.service';
import {Router, RouterLink} from '@angular/router';
import {AuthService} from '../../services/auth.service';

@Component({
	selector: 'app-log-in',
	standalone: true,
	imports: [
		CommonModule,
		RouterLink,
		ReactiveFormsModule,
		NgOptimizedImage
	],
	templateUrl: './log-in.component.html',
	styleUrl: './log-in.component.scss'
})
export class LogInComponent {
	/**
	 * Form a group for the log-in form.
	 */
	logInForm: FormGroup;

	/**
	 * Error message to be displayed when the server returns an error.
	 */
	serverError: string;

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
		this.serverError = "";
	}

	/**
	 * Handles the form submission. If the form is valid, attempts to log in the user.
	 */
	onSubmit(): void {
		if (this.isFormInvalid()) {
			return;
		}

		const {email, password} = this.logInForm.value;
		this.serverError = "";

		this.authService.logIn(email, password)
			.then(() => {
				this.router.navigate(['/workspace']).then(r => {
					console.info(r, 'navigated to workspace');
				});
			})
			.catch((error) => {
				this.handleLoginError(error);
			});
	}

	/**
	 * Logs in as a guest user using Firebase anonymous authentication.
	 * Resets form validation and error states.
	 */
	guestLogIn(): void {
		this.logInForm.reset();
		this.serverError = "";

		this.authService.signInAnonymously()
			.then(() => {
				this.router.navigate(['/workspace']).then(r => {
					console.info(r, 'navigated to workspace');
				});
			})
			.catch((error) => {
				this.serverError = 'global: *Failed to log in as guest. Please try again.';
				console.error('Guest login error:', error);
			});
	}

	/**
	 * Logs in as a Google user using Firebase google authentication.
	 * Resets form validation and error states.
	 */
	googleLogIn(): void {
		this.logInForm.reset();
		this.serverError = "";

		this.authService.signInWithGoogle()
			.then(() => {
				this.router.navigate(['/workspace']).then(r => console.info(r, 'navigated to workspace'));
			})
			.catch((error) => {
				this.serverError = 'global: *Failed to log in with Google. Please try again.';
				console.error('Google login error:', error);
			});
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
