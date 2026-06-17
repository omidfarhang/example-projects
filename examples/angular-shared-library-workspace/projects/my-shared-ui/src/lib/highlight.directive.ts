import { Directive, ElementRef, OnInit, inject } from '@angular/core';

@Directive({
  selector: '[libHighlight]',
  standalone: true,
})
export class HighlightDirective implements OnInit {
  private readonly element = inject(ElementRef<HTMLElement>);

  ngOnInit(): void {
    const host = this.element.nativeElement;
    host.style.boxShadow = 'inset 0 0 0 2px #0891b2';
    host.style.borderRadius = '10px';
  }
}
