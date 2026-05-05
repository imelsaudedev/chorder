import { cn } from './utils';
import { describe, it, expect } from 'vitest';

describe('cn utility', () => {
  it('merges classnames correctly', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
    expect(cn('class1', { class2: true, class3: false })).toBe('class1 class2');
    expect(cn('p-4', 'p-8')).toBe('p-8'); // tailwind merge test
  });
});
