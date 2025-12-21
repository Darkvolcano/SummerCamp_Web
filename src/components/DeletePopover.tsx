import React from 'react';
import { Popover, Button } from 'antd';
import { Trash2 } from 'lucide-react';

interface DeletePopoverProps {
  onConfirm: () => void;
  onCancel?: () => void;
  title?: string;
  message?: string;
  disabled?: boolean;
  confirmText?: string;
  cancelText?: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  buttonSize?: 'small' | 'large' | 'middle';
  buttonText?: string;
  showIcon?: boolean;
}

const DeletePopover: React.FC<DeletePopoverProps> = ({
  onConfirm,
  onCancel,
  title = 'Confirm Delete',
  message = 'Are you sure you want to delete this?',
  disabled = false,
  confirmText = 'Yes',
  cancelText = 'No',
  isOpen,
  onOpenChange,
  buttonSize = 'small',
  buttonText = 'Delete',
  showIcon = true,
}) => {
  return (
    <Popover
      content={
        <div className="space-y-2">
          <p className="text-sm font-medium">{message}</p>
          <div className="flex gap-2">
            <Button
              size={buttonSize}
              danger
              onClick={() => {
                onConfirm();
                onOpenChange?.(false);
              }}
            >
              {confirmText}
            </Button>
            <Button
              size={buttonSize}
              onClick={() => {
                onCancel?.();
                onOpenChange?.(false);
              }}
            >
              {cancelText}
            </Button>
          </div>
        </div>
      }
      title={title}
      trigger="click"
      open={isOpen}
      onOpenChange={onOpenChange}
    >
      <button
        disabled={disabled}
        className="inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-[#FEE2E2] text-[#DC2626] rounded-lg hover:bg-[#FECACA] transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        title={buttonText || title}
        style={buttonText ? { minWidth: '140px' } : {}}
      >
        {showIcon && <Trash2 size={16} />}
        {buttonText}
      </button>
    </Popover>
  );
};

export default DeletePopover;
