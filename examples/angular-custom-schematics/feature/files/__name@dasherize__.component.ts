import { Component } from '@angular/core';

@Component({
  selector: 'app-<%= dasherize(name) %>',
  standalone: true,
  template: `<h2><%= classify(name) %> feature</h2>`,
})
export class <%= classify(name) %>Component {}
