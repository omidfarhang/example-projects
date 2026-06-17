import { Component, inject, signal } from '@angular/core';
import { HighlightDirective, MySharedUiComponent, MySharedUiService } from 'my-shared-ui';

@Component({
  selector: 'app-root',
  imports: [MySharedUiComponent, HighlightDirective],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  private readonly sharedService = inject(MySharedUiService);

  readonly serviceMessage = this.sharedService.getMessage();
  highlightOn = signal(true);

  toggleHighlight(): void {
    this.highlightOn.update((on) => !on);
  }
}
