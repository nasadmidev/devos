import { selectTransformer } from './select.transformer';

describe('Select Transformer', () => {
  it('transforming an array of strings into an object with booleans', () => {
    const arr: Array<keyof { author: boolean }> = ['author'];
    const result = selectTransformer<{ author: boolean }>(arr);
    expect(result).toEqual({ author: true });
  });
});
