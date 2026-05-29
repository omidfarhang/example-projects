import { Component, Input, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { FormFieldMetadata, buildControlsFixed, sampleMetadata } from './form-builder';

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    @if (form) {
      <form [formGroup]="form" (ngSubmit)="submitted = true">
        @for (field of fields; track field.name) {
          <label>
            {{ field.label }}
            <input [formControlName]="field.name" [type]="field.type" />
          </label>
          @if (submitted && form.get(field.name)?.invalid) {
            <p class="error">{{ field.errorMessage }}</p>
          }
        }
        <button type="submit">Submit</button>
      </form>
    } @else {
      <p>Loading metadata...</p>
    }
  `,
  styles: [
    `
      form {
        display: grid;
        gap: 0.75rem;
        max-width: 420px;
      }
      .error {
        color: #b00020;
        margin: 0;
      }
    `,
  ],
})
export class DynamicFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);

  @Input() useBuggyFlow = false;

  fields: FormFieldMetadata[] = [];
  form: FormGroup | null = null;
  submitted = false;

  ngOnInit(): void {
    setTimeout(() => {
      this.fields = sampleMetadata.fields;
      this.form = this.useBuggyFlow
        ? this.fb.group({})
        : this.fb.group(buildControlsFixed(this.fields));
    }, 300);
  }
}
