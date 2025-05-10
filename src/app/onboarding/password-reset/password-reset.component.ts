import {CommonModule} from '@angular/common';
import {Component, ViewChild} from '@angular/core';
import {Router, RouterModule} from '@angular/router';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {FormValidationService} from '../../services/form-validation.service';
import {AuthService} from '../../services/auth.service';
import {NotificationsComponent} from '../notifications/notifications.component';


@Component({
    selector: 'app-password-reset',
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        NotificationsComponent
    ],
    templateUrl: './password-reset.component.html',
    styleUrl: './password-reset.component.scss'
})

export class PasswordResetComponent {

    @ViewChild('notification') notificationComponent!: NotificationsComponent;

    /**
     * Form group for managing the password reset form.
     */
    resetPWForm: FormGroup;

    /**
     * Initializes the component and sets up the form group.
     * @param fb - Instance of FormBuilder for creating the form.
     * @param router - Router instance for navigation.
     */
    constructor(private fb: FormBuilder, private router: Router, private authService: AuthService) {
        this.resetPWForm = this.fb.group({
            email: ['', [Validators.required, FormValidationService.emailValidator]],
        });
    }

    /**
     * Validates the form.
     * @returns True if the form is valid, otherwise false.
     */
    isFormValid(): boolean {
        return this.resetPWForm.valid;
    }

    /**
     * Handles form submission.
     * If the form is valid, logs the email and navigates to the home page.
     * calls the auth service to send the user an email reset.
     * Otherwise, logs an error message.
     */
    resetPassword() {
        if (this.resetPWForm.valid) {
            const email = this.resetPWForm.value.email;
            this.authService.resetPassword(email);
            this.notificationComponent.showNotification('Email sent successfully!');
            console.log('Form submitted with email:', email);

            // Navigate and reset forms after notification is shown
            setTimeout(() => {
                this.resetPWForm.reset();
                this.router.navigate(['']);
            }, 3000);
        } else {
            console.log('Form is invalid');
        }
    }

    /**
     * Navigates to the previous page in the browser history.
     */
    navigateBack() {
        window.history.back();
    }
}
