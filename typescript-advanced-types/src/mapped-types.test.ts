import type { ReadonlyUser, Stringify, UserWithoutEmail } from './mapped-types';

const readonlyUser: ReadonlyUser = { id: 1, name: 'Ada', email: 'ada@example.com' };
const partialUser: UserWithoutEmail = { id: 2, name: 'Grace' };
const stringified: Stringify<{ id: number; active: boolean }> = { id: '1', active: 'true' };

void readonlyUser;
void partialUser;
void stringified;

// @ts-expect-error — ReadonlyUser.id is readonly
readonlyUser.id = 2;
