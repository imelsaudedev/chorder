import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import KeySelectorButton from './index';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) =>
    params ? `${key}:${JSON.stringify(params)}` : key,
}));

let transpose = 0;
let enharmonicPreference: 'sharp' | 'flat' | null = null;
const setTranspose = vi.fn();
vi.mock('@/components/config/SongConfig', () => ({
  useSongConfig: () => ({ transpose, setTranspose, enharmonicPreference, setEnharmonicPreference: vi.fn() }),
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
    expect(screen.getByRole('button', { name: 'Nota A' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Bemol' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Sustenido' })).toBeDefined();
  });

  it('no tom do culto não mostra o ponto nem o aviso', async () => {
    transpose = 2;
    const user = userEvent.setup();
    render(<KeySelectorButton originalKey="D" cultoTranspose={2} />);
    expect(screen.queryByRole('img')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'keyButtonLabel:{"key":"E"}' }));
    expect(screen.queryByText(/backToOriginalKey/)).toBeNull();
  });

  it('em outro tom do que o do culto mostra o ponto e oferece voltar ao do culto', async () => {
    transpose = 2;
    setTranspose.mockClear();
    const user = userEvent.setup();
    render(<KeySelectorButton originalKey="D" cultoTranspose={0} />);
    expect(screen.getByRole('img', { name: 'keyDiffersFromService:{"key":"D"}' })).toBeDefined();
    await user.click(screen.getByRole('button', { name: 'keyButtonLabel:{"key":"E"}' }));
    await user.click(screen.getByRole('button', { name: 'backToOriginalKey:{"key":"D"}' }));
    expect(setTranspose).toHaveBeenCalledWith(0);
  });

  it('deslocamentos equivalentes (-17 e +7) são o mesmo tom: sem ponto nem aviso', () => {
    transpose = 7;
    render(<KeySelectorButton originalKey="G" cultoTranspose={-17} />);
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('o botão usa a grafia escolhida no seletor (A♯, não B♭) e a padrão quando não há escolha', () => {
    transpose = 1;
    enharmonicPreference = 'sharp';
    const { unmount } = render(<KeySelectorButton originalKey="A" />);
    expect(screen.getByText('A♯')).toBeDefined();
    unmount();
    enharmonicPreference = null;
    render(<KeySelectorButton originalKey="A" />);
    expect(screen.getByText('B♭')).toBeDefined();
  });
});
