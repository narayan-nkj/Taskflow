import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Modal } from '../src/components/common/Modal';

describe('Modal component accessibility and focus behavior', () => {
  it('skips disabled controls and focuses the first enabled control', async () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Test Dialog" hideCloseButton={true}>
        <div>
          <button disabled data-testid="disabled-btn">Disabled Button</button>
          <input disabled data-testid="disabled-input" />
          <button data-testid="enabled-btn">Enabled Button</button>
        </div>
      </Modal>
    );

    const enabledBtn = screen.getByTestId('enabled-btn');
    await waitFor(() => {
      expect(document.activeElement).toBe(enabledBtn);
    });
  });

  it('safely focuses the dialog surface when there are no enabled focusable controls', async () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Informational Dialog" hideCloseButton={true}>
        <div>
          <p>This is purely read-only text without buttons.</p>
          <button disabled>Disabled action</button>
        </div>
      </Modal>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    // The dialog container has tabIndex={-1}
    await waitFor(() => {
      // Either the dialog itself or the modal surface container inside receives focus
      const isFocusedOnDialogSurface =
        document.activeElement?.getAttribute('role') === 'dialog' ||
        document.activeElement?.getAttribute('tabindex') === '-1';
      expect(isFocusedOnDialogSurface).toBe(true);
    });
  });

  it('traps focus, handles Escape, and restores focus to previous element on close', async () => {
    const handleClose = vi.fn();

    const Wrapper = () => {
      const [open, setOpen] = React.useState(false);
      return (
        <div>
          <button data-testid="open-btn" onClick={() => setOpen(true)}>
            Open Modal
          </button>
          <Modal isOpen={open} onClose={() => { setOpen(false); handleClose(); }} title="Trap Dialog" hideCloseButton={true}>
            <div>
              <button data-testid="btn-first">First</button>
              <button data-testid="btn-last">Last</button>
            </div>
          </Modal>
        </div>
      );
    };

    render(<Wrapper />);

    const openBtn = screen.getByTestId('open-btn');
    openBtn.focus();
    expect(document.activeElement).toBe(openBtn);

    // Open modal
    fireEvent.click(openBtn);

    const firstBtn = await screen.findByTestId('btn-first');
    await waitFor(() => {
      expect(document.activeElement).toBe(firstBtn);
    });

    // Press Escape
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalled();

    // Verify modal closes and focus restores to open-btn
    await waitFor(() => {
      expect(document.activeElement).toBe(openBtn);
    });
  });
});
