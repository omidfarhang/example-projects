import type { Json } from './recursive-types';
import { flattenTree, sampleTree } from './recursive-types';

const json: Json = {
  name: 'demo',
  count: 3,
  tags: ['a', 'b'],
  meta: { nested: true },
};

const flat = flattenTree(sampleTree);

void json;
void flat;

// @ts-expect-error — Json does not allow arbitrary object shapes without index signature
const _invalid: Json = { when: new Date() };
