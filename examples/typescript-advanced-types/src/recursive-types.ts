/** Recursive types — types that reference themselves. */

export type Json =
  | string
  | number
  | boolean
  | null
  | Json[]
  | { [key: string]: Json };

export interface TreeNode<T> {
  value: T;
  children: TreeNode<T>[];
}

export type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

export function flattenTree<T>(node: TreeNode<T>): T[] {
  return [node.value, ...node.children.flatMap(flattenTree)];
}

export const sampleTree: TreeNode<string> = {
  value: 'root',
  children: [
    { value: 'child-a', children: [] },
    { value: 'child-b', children: [{ value: 'grandchild', children: [] }] },
  ],
};
