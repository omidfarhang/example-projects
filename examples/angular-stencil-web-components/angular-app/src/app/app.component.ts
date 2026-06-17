import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';

type EventLogEntry = {
  time: string;
  message: string;
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  buttonText = 'Click Me';
  clickCount = 0;
  eventLog: EventLogEntry[] = [];

  onButtonClick(): void {
    this.clickCount += 1;
    this.eventLog.unshift({
      time: new Date().toLocaleTimeString(),
      message: 'buttonClick event received from <my-button>',
    });

    if (this.eventLog.length > 6) {
      this.eventLog.length = 6;
    }
  }
}
