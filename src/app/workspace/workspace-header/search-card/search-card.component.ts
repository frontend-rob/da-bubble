import {Component, EventEmitter, Output} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({
    selector: 'app-search-card',
    imports: [
        CommonModule
    ],
    templateUrl: './search-card.component.html',
    styleUrl: './search-card.component.scss'
})
export class SearchCardComponent {
    @Output() toggleMenu = new EventEmitter<boolean>();


}
