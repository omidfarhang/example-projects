import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { FormFieldMetadata, buildControlsBuggy, buildControlsFixed, sampleMetadata } from './form-builder';

@Component({
  selector: 'app-dynamic-form',
  imports: [ReactiveFormsModule],
  templateUrl: './dynamic-form.component.html',
  styleUrl: './dynamic-form.component.css',
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
  metadataPending = true;
  submitSummary = '';

  ngOnInit(): void {
    this.initialized = true;
    this.restartDemo();
  }

  ngOnDestroy(): void {
    this.clearLoadTimer();
  }

  get isBuggyFlow(): boolean {
    return this.useBuggyFlowValue;
  }

  get modeLabel(): string {
    return this.useBuggyFlowValue ? 'Buggy flow' : 'Fixed flow';
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

  get hasMismatch(): boolean {
    return !this.metadataPending && this.fields.length > 0 && this.missingFields.length > 0;
  }

  get isHealthy(): boolean {
    return !this.metadataPending && this.fields.length > 0 && this.missingFields.length === 0;
  }

  controlInvalid(fieldName: string): boolean {
    return !!this.form?.get(fieldName)?.invalid;
  }

  onSubmit(): void {
    this.submitted = true;
    if (!this.form || !this.canSubmit) {
      this.submitSummary = '';
      return;
    }

    this.submitSummary = JSON.stringify(this.form.getRawValue(), null, 2);
  }

  private restartDemo(): void {
    this.clearLoadTimer();
    this.fields = [];
    this.metadataPending = true;
    this.submitted = false;
    this.submitSummary = '';
    this.form = this.useBuggyFlowValue ? this.fb.group(buildControlsBuggy(this.fields)) : null;

    this.loadTimer = setTimeout(() => {
      this.fields = sampleMetadata.fields;
      this.metadataPending = false;
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
