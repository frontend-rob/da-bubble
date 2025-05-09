import {CommonModule} from '@angular/common';
import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-channel-list-item',
  imports: [CommonModule],
  templateUrl: './channel-list-item.component.html',
  styleUrl: './channel-list-item.component.scss'
})
export class ChannelListItemComponent {
  @Input() channel: any;
  activeChannel: number | null = null;

  openChannel(id: number) {
    this.activeChannel = id;
  }
}
