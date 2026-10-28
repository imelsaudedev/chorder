import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import EditOrSaveCancelGroup from './EditOrSaveCancelGroup';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

const defaultProps = {
  isEditing: false,
  isSaving: false,
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
