import { describe, it, expect } from 'vitest';
import { extractYoutubeId } from './extractYoutubeId';

describe('extractYoutubeId', () => {
  it('extrai de watch?v=', () => {
    expect(extractYoutubeId('https://www.youtube.com/watch?v=abc123DEF45')).toBe('abc123DEF45');
  });

  it('extrai de youtu.be/', () => {
    expect(extractYoutubeId('https://youtu.be/abc123DEF45')).toBe('abc123DEF45');
  });

  it('extrai de embed/', () => {
    expect(extractYoutubeId('https://www.youtube.com/embed/abc123DEF45')).toBe('abc123DEF45');
  });

  it('extrai de shorts/', () => {
    expect(extractYoutubeId('https://www.youtube.com/shorts/abc123DEF45')).toBe('abc123DEF45');
  });

  it('ignora parâmetros extras depois do id', () => {
    expect(extractYoutubeId('https://www.youtube.com/watch?v=abc123DEF45&t=30s')).toBe('abc123DEF45');
  });

  it('retorna null para um link que não é do YouTube', () => {
    expect(extractYoutubeId('https://vimeo.com/123456')).toBeNull();
  });

  it('retorna null para texto qualquer', () => {
    expect(extractYoutubeId('não é um link')).toBeNull();
  });
});
