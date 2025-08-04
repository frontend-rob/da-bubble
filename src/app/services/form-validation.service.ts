/**
 * Service providing reusable form validation logic for Angular forms.
 */
import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';

@Injectable({
    providedIn: 'root'
})
export class FormValidationService {

    constructor() { }

    /**
     * Validates that a name contains only letters and a single space between first and last name.
     * 
     * @param control - The form control containing the name value.
     * @returns An object with 'invalidName' if invalid, otherwise null.
     */
    static nameValidator(control: AbstractControl): ValidationErrors | null {
        const namePattern = /^[A-Za-z]+\s[A-Za-z]+$/;
        return namePattern.test(control.value) ? null : { invalidName: true };
    }

    /**
     * Validates that an email address is in a valid format.
     * 
     * @param control - The form control containing the email value.
     * @returns An object with 'invalidEmail' if invalid, otherwise null.
     */
    static emailValidator(control: AbstractControl): ValidationErrors | null {
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailPattern.test(control.value) ? null : { invalidEmail: true };
    }

    /**
     * Validates that a password meets the minimum length requirement (8 characters).
     * 
     * @param control - The form control containing the password value.
     * @returns An object with 'invalidPassword' if invalid, otherwise null.
     */
    static passwordValidator(control: AbstractControl): ValidationErrors | null {
        return control.value && control.value.length >= 8 ? null : { invalidPassword: true };
    }

    /**
     * Validates that two password fields in a form group have matching values.
     * 
     * @param control - The form group containing 'password' and 'passwordConfirmation' controls.
     * @returns An object with 'valuesDoNotMatch' if passwords do not match, otherwise null.
     */
    static changePasswordValidator(control: AbstractControl): ValidationErrors | null {
        const password = control.get('password')?.value;
        const passwordConfirmation = control.get('passwordConfirmation')?.value;

        return password === passwordConfirmation ? null : { valuesDoNotMatch: true };
    }
}