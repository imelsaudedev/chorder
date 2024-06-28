import { getAvailableSlug } from './slug';
import { getDB } from './client';
import { mockCollections } from './test-utils';

jest.mock('./client', () => ({
  getDB: jest.fn(),
}));

describe('getAvailableSlug', () => {
  it('should generate an available slug', async () => {
    mockCollections(getDB, {
      slugs: {
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([]),
        }),
      },
    });

    const original = 'Test Slug';
    const expectedSlug = 'test-slug';
    const generatedSlug = await getAvailableSlug(original);

    expect(generatedSlug).toBe(expectedSlug);
  });

  it('should generate a unique slug when there are existing slugs', async () => {
    mockCollections(getDB, {
      slugs: {
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([{ slug: 'test-slug' }, { slug: 'test-slug-1' }]),
        }),
      },
    });

    const original = 'Test Slug';
    const expectedSlug = 'test-slug-2';
    const generatedSlug = await getAvailableSlug(original);

    expect(generatedSlug).toBe(expectedSlug);
  });
});
