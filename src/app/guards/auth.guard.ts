import {CanActivateFn, Router} from '@angular/router';
import {AuthService} from '../services/auth.service';
import {inject} from '@angular/core';
import {map} from 'rxjs';

export const authGuard: CanActivateFn = () => {
	const authService = inject(AuthService);
	const router = inject(Router);

	return authService.user$.pipe(
		map((user) => {
			if (user) {
				return true;
			} else {
				router.navigate(['']).then(r => {
					console.info(r, 'navigated to login');
				});
				return false;
			}
		})
	);
};
