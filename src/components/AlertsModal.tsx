import { css } from 'styled-system/css';
import { Stack } from 'styled-system/jsx';
import { type KeyboardEvent, type SyntheticEvent, useId, useLayoutEffect, useRef } from 'react';

import { copy } from '../data/fixtures';

export interface AlertsModalProps {
  onClose: () => void;
}

const closeButtonClass = css({
  alignSelf: 'flex-start',
  bg: 'surface.base',
  borderColor: 'border.primary',
  borderRadius: 'md',
  borderStyle: 'solid',
  borderWidth: 'xs',
  color: 'text.primary',
  cursor: 'pointer',
  minH: '10',
  px: '4',
  textStyle: 't_small_b',
  _hover: { bg: 'surface.subtle' },
  _focusVisible: {
    outlineColor: 'focus.default',
    outlineOffset: '0.125rem',
    outlineStyle: 'solid',
    outlineWidth: '0.125rem',
  },
});

const checkboxClass = css({
  accentColor: 'graphics.brand',
  flexShrink: '0',
  h: '5',
  w: '5',
  _focusVisible: {
    outlineColor: 'focus.default',
    outlineOffset: '0.125rem',
    outlineStyle: 'solid',
    outlineWidth: '0.125rem',
  },
});

const labelClass = css({
  alignItems: 'center',
  borderRadius: 'md',
  color: 'text.primary',
  cursor: 'pointer',
  display: 'flex',
  gap: '3',
  px: '2',
  py: '1',
  textStyle: 't_medium',
  _hover: { bg: 'surface.subtle' },
});

export function AlertsModal({ onClose }: AlertsModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const heatChangesRef = useRef<HTMLInputElement>(null);
  const titleId = useId();

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    if (dialog !== null && !dialog.open) {
      dialog.showModal();
    }
    heatChangesRef.current?.focus();

    return () => {
      if (dialog?.open) {
        dialog.close();
      }
      opener?.focus();
    };
  }, []);

  const handleKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    }
  };

  const handleCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onKeyDown={handleKeyDown}
      onCancel={handleCancel}
      className={css({
        bg: 'surface.elevated',
        borderColor: 'border.primary',
        borderRadius: 'lg',
        borderStyle: 'solid',
        borderWidth: 'xs',
        boxShadow: '0 0.5rem 1.5rem rgba(22, 25, 35, 0.28)',
        color: 'text.primary',
        m: 'auto',
        maxH: 'calc(100dvh - 2rem)',
        maxW: 'min(24rem, calc(100% - 2rem))',
        overflowY: 'auto',
        p: '6',
        w: 'full',
        _backdrop: { bg: 'rgba(22, 25, 35, 0.6)' },
      })}
    >
      <Stack gap="4">
        <h2 id={titleId} className={css({ color: 'text.primary', textStyle: 'h_small' })}>
          {copy.alertTitle}
        </h2>
        <Stack gap="3">
          <label className={labelClass}>
            <input ref={heatChangesRef} type="checkbox" className={checkboxClass} />
            {copy.heatChanges}
          </label>
          <label className={labelClass}>
            <input type="checkbox" className={checkboxClass} />
            {copy.medalCeremonies}
          </label>
        </Stack>
        <button type="button" className={closeButtonClass} onClick={onClose}>
          {copy.close}
        </button>
      </Stack>
    </dialog>
  );
}

AlertsModal.displayName = 'AlertsModal';
