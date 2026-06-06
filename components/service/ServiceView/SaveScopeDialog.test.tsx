import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import SaveScopeDialog from './SaveScopeDialog';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

const defaultProps = {
  open: true,
  onOpenChange: vi.fn(),
  songTitle: 'Glória e Força',
  isSaving: false,
  onSaveServiceOnly: vi.fn(),
  onSaveWithOriginal: vi.fn(),
};

describe('SaveScopeDialog', () => {
  it('renders with song title', () => {
    render(<SaveScopeDialog {...defaultProps} />);
    expect(screen.getByText(/Glória e Força/)).toBeDefined();
  });

  it('renders both save option buttons', () => {
    render(<SaveScopeDialog {...defaultProps} />);
    expect(screen.getByTestId('save-service-only')).toBeDefined();
    expect(screen.getByTestId('save-with-original')).toBeDefined();
  });

  it('does not render content when closed', () => {
    render(<SaveScopeDialog {...defaultProps} open={false} />);
    expect(screen.queryByTestId('save-service-only')).toBeNull();
  });

  it('calls onSaveServiceOnly when service-only button clicked', async () => {
    const user = userEvent.setup();
    const onSaveServiceOnly = vi.fn();
    render(<SaveScopeDialog {...defaultProps} onSaveServiceOnly={onSaveServiceOnly} />);
    await user.click(screen.getByTestId('save-service-only'));
    expect(onSaveServiceOnly).toHaveBeenCalledTimes(1);
  });

  it('calls onSaveWithOriginal when original button clicked', async () => {
    const user = userEvent.setup();
    const onSaveWithOriginal = vi.fn();
    render(<SaveScopeDialog {...defaultProps} onSaveWithOriginal={onSaveWithOriginal} />);
    await user.click(screen.getByTestId('save-with-original'));
    expect(onSaveWithOriginal).toHaveBeenCalledTimes(1);
  });

  it('disables both buttons when isSaving', () => {
    render(<SaveScopeDialog {...defaultProps} isSaving={true} />);
    expect((screen.getByTestId('save-service-only') as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByTestId('save-with-original') as HTMLButtonElement).disabled).toBe(true);
  });
});
