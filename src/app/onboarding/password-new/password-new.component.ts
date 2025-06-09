import {Component, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormValidationService} from '../../services/form-validation.service';
import {NotificationsComponent} from '../notifications/notifications.component';
import {Router, RouterModule} from '@angular/router';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';

@Component({
    selector: 'app-password-new',
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        NotificationsComponent
    ],
    templateUrl: './password-new.component.html',
    styleUrl: './password-new.component.scss'
})

export class PasswordNewComponent {

    @ViewChild('notification') notificationComponent!: NotificationsComponent;

    /**
     * Form group for managing the password reset form.
     */
    changePWForm: FormGroup;

    /**
     * Initializes the component and sets up the form group.
     * @param fb - Instance of FormBuilder for creating the form.
     * @param router - Router instance for navigation.
     */
    constructor(private fb: FormBuilder, private router: Router) {
        this.changePWForm = this.fb.group({
            password: ['', [Validators.required, FormValidationService.passwordValidator]],
            passwordConfirmation: ['', [Validators.required, FormValidationService.passwordValidator]]
        }, {validators: FormValidationService.changePasswordValidator});
    }

    /**
     * Sets a new password if the form is valid, shows a notification, and navigates to the home page.
     */
    setNewPassword() {
        if (this.changePWForm.valid) {
            this.notificationComponent.showNotification('New password set!');

            setTimeout(() => {
                this.changePWForm.reset();
                this.router.navigate(['']).then(r => {console.log(r, 'navigated to home')});
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
