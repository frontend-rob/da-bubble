/**
 * Service to provide reusable form validation logic.
 */
import {Injectable} from '@angular/core';
import {AbstractControl, ValidationErrors} from '@angular/forms';

@Injectable({
	providedIn: 'root'
})

export class FormValidationService {

	constructor() {
	}

	/**
	 * Validates if a name contains only letters and a space between the first and last name.
	 * @param control - The form control to validate.
	 * @returns Validation errors if invalid, otherwise null.
	 */
	static nameValidator(control: AbstractControl): ValidationErrors | null {
		const namePattern = /^[A-Za-z]+\s[A-Za-z]+$/;
		return namePattern.test(control.value) ? null : {invalidName: true};
	}

	/**
	 * Validates if an email is in a proper format.
	 * @param control - The form control to validate.
	 * @returns Validation errors if invalid, otherwise null.
	 */
	static emailValidator(control: AbstractControl): ValidationErrors | null {
		const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
		return emailPattern.test(control.value) ? null : {invalidEmail: true};
	}

	/**
	 * Validates if a password meets the minimum length requirement.
	 * @param control - The form control to validate.
	 * @returns Validation errors if invalid, otherwise null.
	 */
	static passwordValidator(control: AbstractControl): ValidationErrors | null {
		return control.value && control.value.length >= 8 ? null : {invalidPassword: true};
	}

	/**
	 * Validates if two form controls have matching values.
	 * @param control - The form group to validate.
	 * @returns Validation errors if invalid, otherwise null.
	 */
	static changePasswordValidator(control: AbstractControl): ValidationErrors | null {
		const password = control.get('password')?.value;
		const passwordConfirmation = control.get('passwordConfirmation')?.value;

		return password === passwordConfirmation ? null : {valuesDoNotMatch: true};
	}
}
