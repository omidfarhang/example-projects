import { Component, inject } from '@angular/core';
import { HighlightDirective, MySharedUiComponent, MySharedUiService } from 'my-shared-ui';

@Component({
    selector: 'app-root',
    imports: [MySharedUiComponent, HighlightDirective],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {
  private readonly sharedService = inject(MySharedUiService);
  readonly message = this.sharedService.getMessage();
}
