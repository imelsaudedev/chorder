import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ColumnViewer from './index';
import { ClientSongUnit } from '@/prisma/models';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

const songUnits: ClientSongUnit[] = [
  { type: 'VERSE', content: '[D]Primeiro bloco', order: 1, notes: null, repeatCount: 1 },
  { type: 'CHORUS', content: '[D]Último bloco', order: 2, notes: null, repeatCount: 1 },
];

describe('ColumnViewer — footer', () => {
  it('não renderiza nada extra quando footer não é passado', () => {
    render(
      <ColumnViewer columns={1} songUnits={songUnits} transpose={0} mode="chords" density="normal" />
    );
    expect(screen.queryByTestId('footer')).toBeNull();
  });

  it('renderiza o footer dentro da última coluna, depois do último bloco', () => {
    const { container } = render(
      <ColumnViewer
        columns={1}
        songUnits={songUnits}
        transpose={0}
        mode="chords"
        density="normal"
        footer={<p data-testid="footer">Compositor: Alguém</p>}
      />
    );
    expect(screen.getByTestId('footer')).toBeDefined();

    const lastColumn = container.querySelector('.grid')!.lastElementChild!;
    expect(lastColumn.lastElementChild).toBe(screen.getByTestId('footer'));
  });

  it('com múltiplas colunas, o footer fica só na última coluna', () => {
    const { container } = render(
      <ColumnViewer
        columns={2}
        songUnits={songUnits}
        transpose={0}
        mode="chords"
        density="normal"
        footer={<p data-testid="footer">Compositor: Alguém</p>}
      />
    );
    const columns = container.querySelector('.grid')!.children;
    expect(columns.length).toBeGreaterThan(1);
    for (let i = 0; i < columns.length - 1; i++) {
      expect(columns[i].querySelector('[data-testid="footer"]')).toBeNull();
    }
    expect(columns[columns.length - 1].lastElementChild).toBe(screen.getByTestId('footer'));
  });
});
