import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormValidationService } from '../../services/form-validation.service';
import { UserDataService } from '../../services/user-data.service';


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

export class SignUpComponent implements OnInit {
    /**
     * Form group for the sign-up form.
     */
    signUpForm: FormGroup;

    /**
     * Constructor to initialize the form group.
     * @param fb - FormBuilder instance to create the form group.
     * @param userDataService - UserDataService instance to handle user data.
     * @param router - Router instance to navigate to other components.
     */
    constructor(private fb: FormBuilder, private userDataService: UserDataService, private router: Router) {
        this.signUpForm = this.fb.group({
            name: ['', [Validators.required, FormValidationService.nameValidator]],
            email: ['', [Validators.required, FormValidationService.emailValidator]],
            password: ['', [Validators.required, FormValidationService.passwordValidator]],
            policy: [false, [Validators.requiredTrue]],
        });
    }

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
     * Handles the form submission.
     * Logs the form data if valid, otherwise logs an invalid form message.
     * Navigates to the AvatarsComponent if the form is valid.
     */
    onSubmit() {
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
