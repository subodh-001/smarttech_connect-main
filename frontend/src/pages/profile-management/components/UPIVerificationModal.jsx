import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const UPIVerificationModal = ({ isOpen, onClose, upiId, onConfirm, onCancel }) => {
  const [confirmUpiId, setConfirmUpiId] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!confirmUpiId.trim()) {
      setError('Please enter your UPI ID to confirm');
      return;
    }
    
    if (confirmUpiId.trim().toLowerCase() !== upiId.trim().toLowerCase()) {
      setError('UPI ID does not match. Please enter the same UPI ID.');
      return;
    }

    setError('');
    onConfirm();
  };

  const handleCancel = () => {
    setConfirmUpiId('');
    setError('');
    onCancel();
  };

  return (
    <div 
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleCancel();
        }
      }}
    >
      <div 
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">Verify UPI ID</h2>
            <p className="text-sm text-text-secondary mt-1">
              Please confirm your UPI ID to save it
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-muted"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <div className="mb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon name="Smartphone" size={32} className="text-primary" />
              </div>
            </div>
            <p className="text-sm text-text-secondary text-center mb-4">
              You entered the following UPI ID:
            </p>
            <div className="bg-muted/50 rounded-lg p-4 mb-4 text-center">
              <p className="text-lg font-semibold text-text-primary font-mono">
                {upiId}
              </p>
            </div>
            <p className="text-sm text-text-secondary text-center mb-6">
              Please re-enter your UPI ID below to confirm it's correct:
            </p>
          </div>

          <div className="mb-4">
            <label htmlFor="confirmUpiId" className="block text-sm font-medium text-text-primary mb-2">
              Re-enter UPI ID <span className="text-error">*</span>
            </label>
            <Input
              id="confirmUpiId"
              type="text"
              placeholder="yourname@paytm"
              value={confirmUpiId}
              onChange={(e) => {
                setConfirmUpiId(e.target.value);
                setError('');
              }}
              className="w-full"
              autoFocus
            />
            {error && (
              <p className="mt-2 text-sm text-error">{error}</p>
            )}
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 mb-6">
            <div className="flex items-start space-x-2">
              <Icon name="Info" size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-700">
                <p className="font-medium mb-1">Important:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Make sure your UPI ID is correct</li>
                  <li>Customers will use this to pay you</li>
                  <li>You can update it later if needed</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <Button
              variant="primary"
              onClick={handleConfirm}
              iconName="CheckCircle"
              iconPosition="left"
              className="w-full"
            >
              Confirm & Save
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UPIVerificationModal;

