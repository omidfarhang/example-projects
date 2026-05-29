export interface FormFieldMetadata {
  name: string;
  label: string;
  type: string;
  value?: string;
  required?: boolean;
  errorMessage?: string;
}

export interface FormMetadata {
  fields: FormFieldMetadata[];
}

export const sampleMetadata: FormMetadata = {
  fields: [
    { name: 'name', label: 'Name', type: 'text', value: '', required: true, errorMessage: 'Name is required' },
    { name: 'email', label: 'Email', type: 'email', value: '', required: true, errorMessage: 'Email is required' },
  ],
};

export function getValidators(field: FormFieldMetadata): unknown[] {
  return field.required ? [{ required: true }] : [];
}

/** Buggy: builds controls from stale/empty field list. */
export function buildControlsBuggy(fields: FormFieldMetadata[] | null): Record<string, unknown[]> {
  const source = fields ?? [];
  const controls: Record<string, unknown[]> = {};
  for (const field of source) {
    controls[field.name] = [field.value ?? '', getValidators(field)];
  }
  return controls;
}

/** Fixed: only builds once fields exist and preserves validators. */
export function buildControlsFixed(fields: FormFieldMetadata[]): Record<string, unknown[]> {
  const controls: Record<string, unknown[]> = {};
  for (const field of fields) {
    controls[field.name] = [field.value ?? '', getValidators(field)];
  }
  return controls;
}
