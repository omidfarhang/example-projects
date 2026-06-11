import { Directive, ElementRef, OnInit, inject } from '@angular/core';

@Directive({
  selector: '[libHighlight]',
  standalone: true,
})
export class HighlightDirective implements OnInit {
  private readonly element = inject(ElementRef<HTMLElement>);

  ngOnInit(): void {
    this.element.nativeElement.style.outline = '2px solid #0b5ed7';
  }
}
