import { Component } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  bannerHtml: SafeHtml;
  themeStyles = { padding: '1rem' };
  accent = '#0f6e56';

  constructor(sanitizer: DomSanitizer) {
    // Trusted Types: needs angular#unsafe-bypass
    this.bannerHtml = sanitizer.bypassSecurityTrustHtml(
      '<em>Welcome back</em>'
    );

    // Hostile to strict CSP
    const dynamic = new Function('return 1 + 1');
    void dynamic();

    setTimeout('console.log("legacy timer")', 0);
  }
}
