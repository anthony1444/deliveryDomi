import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    standalone:true,
    imports: [CommonModule]
})
export class HomeComponent {
  // @HostBinding('class') protected readonly class = 'contents'; // Makes component host as if it was not there, can offer less css headaches. Assumes .contents{display:contents} css class exits
  // constructor() {}
}
