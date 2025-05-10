import {Component} from '@angular/core';
import {RouterModule} from '@angular/router';

@Component({
  selector: 'app-legal-notice',
  imports: [RouterModule],
  templateUrl: './legal-notice.component.html',
  styleUrl: './legal-notice.component.scss'
})

export class LegalNoticeComponent {
  /**
   * Navigates back to the previous page in the browser history.
   */
  navigateBack() {
    window.history.back();
  }

}
