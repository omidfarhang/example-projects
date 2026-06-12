import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    standalone: false
})
export class AppComponent {
  @Input() message = '';

  sendMessage() {
    window.dispatchEvent(
      new CustomEvent('microfrontend:message', {
        detail: {
          source: 'Angular',
          message: 'Angular handled the shared contract',
        },
      }),
    );
  }
}
