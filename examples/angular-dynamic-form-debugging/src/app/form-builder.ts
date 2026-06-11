import { Validators } from '@angular/forms';
import type { ValidatorFn } from '@angular/forms';

export interface FormFieldMetadata {
  name: string;
  label: string;
  type: string;
  value?: string;
  required?: boolean;
  minLength?: number;
  errorMessage?: string;
}

export interface FormMetadata {
  fields: FormFieldMetadata[];
}

export type FormControlConfig = [string, ValidatorFn[]];

export const sampleMetadata: FormMetadata = {
  fields: [
    { name: 'name', label: 'Name', type: 'text', value: '', required: true, minLength: 3, errorMessage: 'Name is required' },
    { name: 'email', label: 'Email', type: 'email', value: '', required: true, errorMessage: 'Email is required' },
  ],
};

export function getValidators(field: FormFieldMetadata): ValidatorFn[] {
  const validators: ValidatorFn[] = [];
  if (field.required) {
    validators.push(Validators.required);
  }
  if (field.minLength) {
    validators.push(Validators.minLength(field.minLength));
  }
  return validators;
}

/** Buggy: builds controls from stale/empty field list. */
export function buildControlsBuggy(fields: FormFieldMetadata[] | null): Record<string, FormControlConfig> {
  const source = fields ?? [];
  const controls: Record<string, FormControlConfig> = {};
  for (const field of source) {
    controls[field.name] = [field.value ?? '', getValidators(field)];
  }
  return controls;
}

/** Fixed: only builds once fields exist and preserves validators. */
export function buildControlsFixed(fields: FormFieldMetadata[]): Record<string, FormControlConfig> {
  const controls: Record<string, FormControlConfig> = {};
  for (const field of fields) {
    controls[field.name] = [field.value ?? '', getValidators(field)];
  }
  return controls;
}
