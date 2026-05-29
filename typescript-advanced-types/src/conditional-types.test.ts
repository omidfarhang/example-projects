import type { IsString, TypeName } from './conditional-types';
import { getTypeName, processValue } from './conditional-types';

type A = IsString<string>;
type B = IsString<number>;

const _a: A = 'Yes';
const _b: B = 'No';

const stringResult = processValue('hello');
const numberResult = processValue(42);

const strType: TypeName<string> = getTypeName('hello');
const numType: TypeName<number> = getTypeName(42);

void _a;
void _b;
void stringResult;
void numberResult;
void strType;
void numType;

// @ts-expect-error — number is not assignable to 'Yes'
const _wrong: IsString<number> = 'Yes';
