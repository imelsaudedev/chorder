import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import KeySelectorButton from './KeySelectorButton';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) =>
    params ? `${key}:${JSON.stringify(params)}` : key,
}));

let transpose = 0;
const setTranspose = vi.fn();
vi.mock('@/components/config/SongConfig', () => ({
  useSongConfig: () => ({ transpose, setTranspose, setEnharmonicPreference: vi.fn() }),
}));

describe('KeySelectorButton', () => {
  it('mostra só o tom atual, sem o rótulo "Tom"', () => {
    transpose = 0;
    render(<KeySelectorButton originalKey="D" />);
    expect(screen.getByText('D')).toBeDefined();
    expect(screen.queryByText(/Tom/)).toBeNull();
  });

  it('abre o popover com o seletor de tom ao clicar', async () => {
    transpose = 0;
    const user = userEvent.setup();
    render(<KeySelectorButton originalKey="D" />);
    await user.click(screen.getByRole('button', { name: 'keyButtonLabel:{"key":"D"}' }));
    expect(screen.getByLabelText('Aumentar o tom em um semitom')).toBeDefined();
    expect(screen.getByLabelText('Diminuir o tom em um semitom')).toBeDefined();
  });
});
