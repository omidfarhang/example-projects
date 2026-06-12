import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { FormFieldMetadata, buildControlsBuggy, buildControlsFixed, sampleMetadata } from './form-builder';

@Component({
    selector: 'app-dynamic-form',
    imports: [ReactiveFormsModule],
    template: `
    <section class="debug-panel" aria-live="polite">
      <strong>{{ modeLabel }}</strong>
      <span>Metadata fields: {{ fields.length }}</span>
      <span>Form controls: {{ controlNames.length || 'none' }}</span>
      @if (missingFields.length) {
        <span class="warning">Missing controls: {{ missingFieldNames }}</span>
      }
    </section>

    @if (form) {
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        @for (field of fields; track field.name) {
          @if (form.get(field.name)) {
            <label>
              {{ field.label }}
              <input [formControlName]="field.name" [type]="field.type" />
            </label>
            @if (submitted && controlInvalid(field.name)) {
              <p class="error">{{ field.errorMessage }}</p>
            }
          } @else {
            <div class="missing-control">
              <strong>{{ field.label }}</strong>
              <span>Metadata arrived, but no Angular control was registered for "{{ field.name }}".</span>
            </div>
          }
        }
        <button type="submit" [disabled]="!canSubmit">Submit</button>
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
      .debug-panel {
        display: grid;
        gap: 0.35rem;
        max-width: 420px;
        margin: 1rem 0;
        padding: 0.75rem;
        border: 1px solid #d6d6d6;
        border-radius: 0.5rem;
        background: #fafafa;
      }
      .error {
        color: #b00020;
        margin: 0;
      }
      .warning,
      .missing-control {
        color: #8a4b00;
      }
      .missing-control {
        display: grid;
        gap: 0.25rem;
        padding: 0.75rem;
        border: 1px dashed #c47f00;
        border-radius: 0.5rem;
        background: #fff8ed;
      }
    `,
    ]
})
export class DynamicFormComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private loadTimer: ReturnType<typeof setTimeout> | null = null;
  private initialized = false;
  private useBuggyFlowValue = false;

  @Input()
  set useBuggyFlow(value: boolean) {
    this.useBuggyFlowValue = value;
    if (this.initialized) {
      this.restartDemo();
    }
  }

  fields: FormFieldMetadata[] = [];
  form: FormGroup | null = null;
  submitted = false;

  ngOnInit(): void {
    this.initialized = true;
    this.restartDemo();
  }

  ngOnDestroy(): void {
    this.clearLoadTimer();
  }

  get modeLabel(): string {
    return this.useBuggyFlowValue
      ? 'Buggy flow: controls are built before metadata arrives'
      : 'Fixed flow: controls are built after metadata arrives';
  }

  get controlNames(): string[] {
    return this.form ? Object.keys(this.form.controls) : [];
  }

  get missingFields(): FormFieldMetadata[] {
    return this.form ? this.fields.filter((field) => !this.form?.get(field.name)) : [];
  }

  get missingFieldNames(): string {
    return this.missingFields.map((field) => field.name).join(', ');
  }

  get canSubmit(): boolean {
    return !!this.form && this.fields.length > 0 && this.missingFields.length === 0 && this.form.valid;
  }

  controlInvalid(fieldName: string): boolean {
    return !!this.form?.get(fieldName)?.invalid;
  }

  onSubmit(): void {
    this.submitted = true;
  }

  private restartDemo(): void {
    this.clearLoadTimer();
    this.fields = [];
    this.form = this.useBuggyFlowValue ? this.fb.group(buildControlsBuggy(this.fields)) : null;
    this.submitted = false;

    this.loadTimer = setTimeout(() => {
      this.fields = sampleMetadata.fields;
      if (!this.useBuggyFlowValue) {
        this.form = this.fb.group(buildControlsFixed(this.fields));
      }
    }, 300);
  }

  private clearLoadTimer(): void {
    if (this.loadTimer) {
      clearTimeout(this.loadTimer);
      this.loadTimer = null;
    }
  }
}
