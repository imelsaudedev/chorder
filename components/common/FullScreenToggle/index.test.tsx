import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import FullScreenToggle from './index';

const baseProps = {
  isFullScreen: false,
  currentIndex: 0,
  total: 5,
  onPrev: vi.fn(),
  onNext: vi.fn(),
  onToggle: vi.fn(),
};

describe('FullScreenToggle — modo normal', () => {
  it('exibe botão de maximizar', () => {
    render(<FullScreenToggle {...baseProps} />);
    expect(screen.getByRole('button', { name: /entrar em modo tela cheia/i })).toBeDefined();
  });

  it('não exibe barra de status', () => {
    render(<FullScreenToggle {...baseProps} />);
    expect(screen.queryByRole('button', { name: /anterior/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /próxima/i })).toBeNull();
  });

  it('chama onToggle ao clicar em maximizar', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<FullScreenToggle {...baseProps} onToggle={onToggle} />);
    await user.click(screen.getByRole('button', { name: /entrar em modo tela cheia/i }));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});

describe('FullScreenToggle — modo fullscreen', () => {
  const fsProps = { ...baseProps, isFullScreen: true, currentIndex: 2, total: 5 };

  it('exibe botões de anterior, próxima e minimizar', () => {
    render(<FullScreenToggle {...fsProps} />);
    expect(screen.getByRole('button', { name: /anterior/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /próxima/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /sair do modo/i })).toBeDefined();
  });

  it('não exibe botão de maximizar', () => {
    render(<FullScreenToggle {...fsProps} />);
    expect(screen.queryByRole('button', { name: /entrar em modo tela cheia/i })).toBeNull();
  });

  it('exibe contador no formato "atual/total"', () => {
    render(<FullScreenToggle {...fsProps} currentIndex={2} total={5} />);
    expect(screen.getByText('3/5')).toBeDefined();
  });

  it('exibe o título da música quando fornecido', () => {
    render(<FullScreenToggle {...fsProps} currentTitle="Nada Além do Sangue" />);
    expect(screen.getByText('Nada Além do Sangue')).toBeDefined();
  });

  it('não exibe título quando não fornecido', () => {
    render(<FullScreenToggle {...fsProps} />);
    expect(screen.queryByText(/além/i)).toBeNull();
  });

  it('chama onPrev ao clicar em anterior', async () => {
    const user = userEvent.setup();
    const onPrev = vi.fn();
    render(<FullScreenToggle {...fsProps} onPrev={onPrev} />);
    await user.click(screen.getByRole('button', { name: /anterior/i }));
    expect(onPrev).toHaveBeenCalledTimes(1);
  });

  it('chama onNext ao clicar em próxima', async () => {
    const user = userEvent.setup();
    const onNext = vi.fn();
    render(<FullScreenToggle {...fsProps} onNext={onNext} />);
    await user.click(screen.getByRole('button', { name: /próxima/i }));
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('chama onToggle ao clicar em minimizar', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<FullScreenToggle {...fsProps} onToggle={onToggle} />);
    await user.click(screen.getByRole('button', { name: /sair do modo/i }));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});

describe('FullScreenToggle — botões de navegação', () => {
  it('anterior desabilitado na primeira música', () => {
    render(<FullScreenToggle {...baseProps} isFullScreen currentIndex={0} total={5} />);
    const btn = screen.getByRole('button', { name: /anterior/i }) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it('anterior habilitado quando não é a primeira', () => {
    render(<FullScreenToggle {...baseProps} isFullScreen currentIndex={1} total={5} />);
    const btn = screen.getByRole('button', { name: /anterior/i }) as HTMLButtonElement;
    expect(btn.disabled).toBe(false);
  });

  it('próxima desabilitada na última música', () => {
    render(<FullScreenToggle {...baseProps} isFullScreen currentIndex={4} total={5} />);
    const btn = screen.getByRole('button', { name: /próxima/i }) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it('próxima habilitada quando não é a última', () => {
    render(<FullScreenToggle {...baseProps} isFullScreen currentIndex={3} total={5} />);
    const btn = screen.getByRole('button', { name: /próxima/i }) as HTMLButtonElement;
    expect(btn.disabled).toBe(false);
  });
});

describe('FullScreenToggle — controles de fonte', () => {
  const fontProps = {
    ...baseProps,
    isFullScreen: true,
    fontSize: 16,
    onFontSizeChange: vi.fn(),
  };

  it('exibe botões de zoom quando onFontSizeChange e fontSize fornecidos', () => {
    render(<FullScreenToggle {...fontProps} />);
    expect(screen.getByRole('button', { name: /diminuir fonte/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /aumentar fonte/i })).toBeDefined();
  });

  it('não exibe botões de zoom quando onFontSizeChange ausente', () => {
    render(<FullScreenToggle {...baseProps} isFullScreen fontSize={16} />);
    expect(screen.queryByRole('button', { name: /diminuir fonte/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /aumentar fonte/i })).toBeNull();
  });

  it('chama onFontSizeChange com fontSize - 1 ao diminuir', async () => {
    const user = userEvent.setup();
    const onFontSizeChange = vi.fn();
    render(<FullScreenToggle {...fontProps} fontSize={16} onFontSizeChange={onFontSizeChange} />);
    await user.click(screen.getByRole('button', { name: /diminuir fonte/i }));
    expect(onFontSizeChange).toHaveBeenCalledWith(15);
  });

  it('chama onFontSizeChange com fontSize + 1 ao aumentar', async () => {
    const user = userEvent.setup();
    const onFontSizeChange = vi.fn();
    render(<FullScreenToggle {...fontProps} fontSize={16} onFontSizeChange={onFontSizeChange} />);
    await user.click(screen.getByRole('button', { name: /aumentar fonte/i }));
    expect(onFontSizeChange).toHaveBeenCalledWith(17);
  });

  it('diminuir desabilitado no tamanho mínimo (10)', () => {
    render(<FullScreenToggle {...fontProps} fontSize={10} />);
    const btn = screen.getByRole('button', { name: /diminuir fonte/i }) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it('aumentar desabilitado no tamanho máximo (32)', () => {
    render(<FullScreenToggle {...fontProps} fontSize={32} />);
    const btn = screen.getByRole('button', { name: /aumentar fonte/i }) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it('não vai abaixo do mínimo ao diminuir no limite', async () => {
    const user = userEvent.setup();
    const onFontSizeChange = vi.fn();
    render(<FullScreenToggle {...fontProps} fontSize={11} onFontSizeChange={onFontSizeChange} />);
    await user.click(screen.getByRole('button', { name: /diminuir fonte/i }));
    expect(onFontSizeChange).toHaveBeenCalledWith(10);
  });

  it('não ultrapassa o máximo ao aumentar no limite', async () => {
    const user = userEvent.setup();
    const onFontSizeChange = vi.fn();
    render(<FullScreenToggle {...fontProps} fontSize={31} onFontSizeChange={onFontSizeChange} />);
    await user.click(screen.getByRole('button', { name: /aumentar fonte/i }));
    expect(onFontSizeChange).toHaveBeenCalledWith(32);
  });
});
