import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import PageTitleBlock from './index';

describe('PageTitleBlock', () => {
  it('põe as ações na mesma linha do título', () => {
    render(<PageTitleBlock title="Liturgias" actions={<button>Modelos</button>} />);
    const heading = screen.getByRole('heading', { level: 1, name: 'Liturgias' });
    const action = screen.getByRole('button', { name: 'Modelos' });
    expect(heading.parentElement).toBe(action.parentElement?.parentElement);
  });

  it('sem ações, não cria o contêiner delas', () => {
    const { container } = render(<PageTitleBlock title="Músicas" />);
    expect(container.querySelector('.shrink-0')).toBeNull();
  });

  it('o link de voltar fica na linha de cima, fora da linha do título', () => {
    render(<PageTitleBlock title="Modelos" backLink={<a href="/services">Liturgias</a>} />);
    const heading = screen.getByRole('heading', { level: 1, name: 'Modelos' });
    const back = screen.getByRole('link', { name: 'Liturgias' });
    expect(heading.parentElement?.contains(back)).toBe(false);
  });
});
