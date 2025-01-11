import { render, screen, fireEvent } from '@testing-library/react';
import { Dialog } from '../common/Dialog';
import { AccessibilityProvider } from '../../contexts/AccessibilityContext';

describe('Dialog', () => {
  const mockOnClose = jest.fn();
  const title = 'Test Dialog';
  const children = <div>Dialog content</div>;

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('renders correctly when open', () => {
    render(
      <AccessibilityProvider>
        <Dialog isOpen={true} onClose={mockOnClose} title={title}>
          {children}
        </Dialog>
      </AccessibilityProvider>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByText('Dialog content')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <AccessibilityProvider>
        <Dialog isOpen={false} onClose={mockOnClose} title={title}>
          {children}
        </Dialog>
      </AccessibilityProvider>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls onClose when backdrop is clicked', () => {
    render(
      <AccessibilityProvider>
        <Dialog isOpen={true} onClose={mockOnClose} title={title}>
          {children}
        </Dialog>
      </AccessibilityProvider>
    );

    fireEvent.click(screen.getByTestId('dialog-backdrop'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when Escape key is pressed', () => {
    render(
      <AccessibilityProvider>
        <Dialog isOpen={true} onClose={mockOnClose} title={title}>
          {children}
        </Dialog>
      </AccessibilityProvider>
    );

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(mockOnClose).toHaveBeenCalled();
  });
});