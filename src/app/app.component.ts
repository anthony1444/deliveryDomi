import { Component } from '@angular/core';
import { getMessaging, getToken, onMessage } from '@angular/fire/messaging';
import { RouterOutlet } from '@angular/router';
import { MessagingService } from './messaging/messaging.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule],
  providers:[MessagingService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'firebasetest';

  message: any;

  constructor(private messagingService: MessagingService) {}

 





 
}
