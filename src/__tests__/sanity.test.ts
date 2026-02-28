/**
 * Sanity check test to verify Jest is working
 */

describe('Sanity', () => {
  it('should pass a basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle async tests', async () => {
    const result = await Promise.resolve(42);
    expect(result).toBe(42);
  });
});
