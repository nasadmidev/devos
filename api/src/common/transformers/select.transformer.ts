export const selectTransformer = <T = object>(arr: Array<keyof T>) =>
  arr.reduce((acc, current) => ((acc[current as string] = true), acc), {});
