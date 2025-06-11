import {Component} from '@angular/core';
import {RouterModule} from '@angular/router';

/**
 * Komponente für die Anzeige der rechtlichen Hinweise.
 *
 * Diese Komponente zeigt die rechtlichen Hinweise der Anwendung an
 * und bietet Navigationsmöglichkeiten zurück zur vorherigen Seite.
 */
@Component({
	selector: 'app-legal-notice',
	imports: [RouterModule],
	templateUrl: './legal-notice.component.html',
	styleUrl: './legal-notice.component.scss'
})

export class LegalNoticeComponent {

	navigateBack() {
		window.history.back();
	}

}
