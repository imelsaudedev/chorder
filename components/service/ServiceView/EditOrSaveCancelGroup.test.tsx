import { render as rtlRender, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import type { UserRole } from '@prisma/client';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ViewerProvider } from '@/components/auth/ViewerProvider';
import EditOrSaveCancelGroup from './EditOrSaveCancelGroup';
import { ServiceEditAccessProvider } from './ServiceEditAccess';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Por padrão, quem edita músicas (Louvor); os casos de quem não edita passam os perfis.
const render = (ui: ReactElement, roles: UserRole[] = ['WORSHIP']) =>
  rtlRender(<ViewerProvider authenticated roles={roles}>{ui}</ViewerProvider>);

const defaultProps = {
  isEditing: false,
  isSaving: false,
  isDirty: false,
  hasOriginal: false,
  onStartEdit: vi.fn(),
  onCancel: vi.fn(),
  onSaveServiceOnly: vi.fn(),
  onSaveBoth: vi.fn(),
};

describe('EditOrSaveCancelGroup — fora da edição', () => {
  it('mostra só o lápis', () => {
    render(<EditOrSaveCancelGroup {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'editChords' })).toBeDefined();
    expect(screen.queryByRole('button', { name: /saveChanges/i })).toBeNull();
  });

  it('chama onStartEdit ao clicar no lápis', async () => {
    const user = userEvent.setup();
    const onStartEdit = vi.fn();
    render(<EditOrSaveCancelGroup {...defaultProps} onStartEdit={onStartEdit} />);
    await user.click(screen.getByRole('button', { name: 'editChords' }));
    expect(onStartEdit).toHaveBeenCalledTimes(1);
  });
});

describe('EditOrSaveCancelGroup — edição, sem original', () => {
  const editProps = { ...defaultProps, isEditing: true, hasOriginal: false };

  it('calls onSaveServiceOnly directly when save clicked (no original)', async () => {
    const user = userEvent.setup();
    const onSaveServiceOnly = vi.fn();
    render(<EditOrSaveCancelGroup {...editProps} onSaveServiceOnly={onSaveServiceOnly} />);
    await user.click(screen.getByRole('button', { name: /saveChanges/i }));
    expect(onSaveServiceOnly).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when X button clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<EditOrSaveCancelGroup {...editProps} onCancel={onCancel} />);
    await user.click(screen.getByRole('button', { name: /cancelEdit/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('D11: com isDirty, X abre confirmação em vez de cancelar direto', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<EditOrSaveCancelGroup {...editProps} isDirty onCancel={onCancel} />);
    await user.click(screen.getByRole('button', { name: /cancelEdit/i }));
    expect(onCancel).not.toHaveBeenCalled();
    expect(screen.getByRole('alertdialog')).toBeDefined();
    await user.click(screen.getByRole('button', { name: /^discard$/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('disables save and cancel when isSaving', () => {
    render(<EditOrSaveCancelGroup {...editProps} isSaving />);
    const buttons = screen.getAllByRole('button') as HTMLButtonElement[];
    const disabledButtons = buttons.filter((b) => b.disabled);
    expect(disabledButtons.length).toBeGreaterThanOrEqual(2);
  });
});

describe('EditOrSaveCancelGroup — edição, com original', () => {
  const editProps = { ...defaultProps, isEditing: true, hasOriginal: true };

  it('opens scope dialog when save clicked', async () => {
    const user = userEvent.setup();
    render(<EditOrSaveCancelGroup {...editProps} />);
    await user.click(screen.getByRole('button', { name: /saveChanges/i }));
    expect(screen.getByRole('dialog')).toBeDefined();
  });

  it('calls onSaveServiceOnly and closes dialog when service-only chosen', async () => {
    const user = userEvent.setup();
    const onSaveServiceOnly = vi.fn();
    render(<EditOrSaveCancelGroup {...editProps} onSaveServiceOnly={onSaveServiceOnly} />);
    await user.click(screen.getByRole('button', { name: /saveChanges/i }));
    await user.click(screen.getByRole('button', { name: /serviceOnly/i }));
    expect(onSaveServiceOnly).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('calls onSaveBoth and closes dialog when both chosen', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    const onSaveBoth = vi.fn();
    render(<EditOrSaveCancelGroup {...editProps} onSaveBoth={onSaveBoth} />);
    await user.click(screen.getByRole('button', { name: /saveChanges/i }));
    await user.click(screen.getByRole('button', { name: /serviceAndOriginal/i }));
    expect(onSaveBoth).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('does not call onSaveServiceOnly directly (opens dialog instead)', async () => {
    const user = userEvent.setup();
    const onSaveServiceOnly = vi.fn();
    render(<EditOrSaveCancelGroup {...editProps} onSaveServiceOnly={onSaveServiceOnly} />);
    await user.click(screen.getByRole('button', { name: /saveChanges/i }));
    expect(onSaveServiceOnly).not.toHaveBeenCalled();
  });
});


describe('EditOrSaveCancelGroup — quem não edita músicas', () => {
  const editProps = { ...defaultProps, isEditing: true, hasOriginal: true };

  it('salva "só nesta liturgia" direto, sem perguntar (não pode alterar o original)', async () => {
    const user = userEvent.setup();
    const onSaveServiceOnly = vi.fn();
    render(<EditOrSaveCancelGroup {...editProps} onSaveServiceOnly={onSaveServiceOnly} />, []);
    await user.click(screen.getByRole('button', { name: /saveChanges/i }));
    expect(onSaveServiceOnly).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('serviceAndOriginal')).toBeNull();
  });

  it('Mídia também (edita a liturgia, não as músicas)', async () => {
    const user = userEvent.setup();
    const onSaveServiceOnly = vi.fn();
    render(<EditOrSaveCancelGroup {...editProps} onSaveServiceOnly={onSaveServiceOnly} />, ['MEDIA']);
    await user.click(screen.getByRole('button', { name: /saveChanges/i }));
    expect(onSaveServiceOnly).toHaveBeenCalledTimes(1);
  });
});

describe('EditOrSaveCancelGroup — quem só visualiza a liturgia', () => {
  it('não mostra o lápis', () => {
    rtlRender(
      <ViewerProvider authenticated roles={['WORSHIP']}>
        <ServiceEditAccessProvider value={false}>
          <EditOrSaveCancelGroup {...defaultProps} />
        </ServiceEditAccessProvider>
      </ViewerProvider>
    );
    expect(screen.queryByRole('button', { name: 'editChords' })).toBeNull();
  });
});
