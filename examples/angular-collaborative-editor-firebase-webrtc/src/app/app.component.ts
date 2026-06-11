import { Component } from '@angular/core';

import { TextEditorComponent } from './text-editor/text-editor.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TextEditorComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {}
