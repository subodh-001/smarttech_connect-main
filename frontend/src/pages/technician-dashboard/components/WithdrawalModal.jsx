import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const WithdrawalModal = ({ isOpen, onClose, availableBalance, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [withdrawalPIN, setWithdrawalPIN] = useState('');
  const [showPINStep, setShowPINStep] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [technicianInfo, setTechnicianInfo] = useState(null);
  const [loadingInfo, setLoadingInfo] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchTechnicianInfo();
    }
  }, [isOpen]);

  const fetchTechnicianInfo = async () => {
    try {
      setLoadingInfo(true);
      const { data } = await axios.get('/api/technicians/me/profile');
      if (data?.technician) {
        setTechnicianInfo(data.technician);
        setUpiId(data.technician.upiId || '');
      }
    } catch (error) {
      console.error('Failed to fetch technician info:', error);
    } finally {
      setLoadingInfo(false);
    }
  };

  const handleConfirmDetails = async (e) => {
    e.preventDefault();
    setError(null);

    const withdrawAmount = parseFloat(amount);
    
    if (!amount || isNaN(withdrawAmount) || withdrawAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (withdrawAmount > availableBalance) {
      setError(`Amount cannot exceed available balance of ₹${availableBalance.toLocaleString('en-IN')}`);
      return;
    }

    if (withdrawAmount < 100) {
      setError('Minimum withdrawal amount is ₹100');
      return;
    }

    if (!upiId || upiId.trim() === '') {
      setError('Please enter your UPI ID');
      return;
    }

    // Basic UPI ID validation
    const upiPattern = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    if (!upiPattern.test(upiId.trim())) {
      setError('Please enter a valid UPI ID (e.g., yourname@paytm)');
      return;
    }

    // Check if PIN is set
    if (!technicianInfo?.withdrawalPIN) {
      setError('Withdrawal PIN not set. Please set your 4-digit PIN in profile settings first.');
      return;
    }

    // Move to PIN entry step
    setShowPINStep(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate PIN
    if (!withdrawalPIN || withdrawalPIN.length !== 4 || !/^\d{4}$/.test(withdrawalPIN)) {
      setError('Please enter a valid 4-digit PIN');
      return;
    }

    const withdrawAmount = parseFloat(amount);
    setLoading(true);

    try {
      // First, update UPI ID if it has changed
      if (technicianInfo?.upiId !== upiId.trim()) {
        await axios.put('/api/technicians/me/profile', {
          upiId: upiId.trim(),
        });
      }

      // Process withdrawal
      const { data } = await axios.post('/api/technicians/me/withdraw', {
        amount: withdrawAmount,
        upiId: upiId.trim(),
        withdrawalPIN: withdrawalPIN,
      });

      if (data.success) {
        onSuccess?.();
        handleClose();
      } else {
        setError(data.error || 'Withdrawal failed. Please try again.');
      }
    } catch (error) {
      console.error('Withdrawal error:', error);
      setError(
        error.response?.data?.error || 
        'Failed to process withdrawal. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAmount('');
    setWithdrawalPIN('');
    setShowPINStep(false);
    setError(null);
    onClose();
  };

  const handleBackToDetails = () => {
    setWithdrawalPIN('');
    setShowPINStep(false);
    setError(null);
  };

  const handleQuickAmount = (percentage) => {
    const quickAmount = Math.floor((availableBalance * percentage) / 100);
    setAmount(quickAmount.toString());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg border border-border shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-text-primary">Withdraw Funds</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-muted rounded-md transition-colors"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        {/* Content */}
        {!showPINStep ? (
          <form onSubmit={handleConfirmDetails} className="p-6 space-y-6">
          {/* Available Balance */}
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Available Balance</p>
                <p className="text-2xl font-bold text-text-primary mt-1">
                  ₹{Number.isFinite(availableBalance) ? availableBalance.toLocaleString('en-IN') : '0'}
                </p>
              </div>
              <Icon name="Wallet" size={32} color="var(--color-primary)" />
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Withdrawal Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                min="100"
                max={availableBalance}
                step="1"
                className="w-full pl-8 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
                disabled={loading || loadingInfo}
              />
            </div>
            <div className="flex space-x-2 mt-2">
              <button
                type="button"
                onClick={() => handleQuickAmount(25)}
                className="text-xs px-3 py-1 bg-muted hover:bg-muted/80 rounded-md text-text-secondary"
              >
                25%
              </button>
              <button
                type="button"
                onClick={() => handleQuickAmount(50)}
                className="text-xs px-3 py-1 bg-muted hover:bg-muted/80 rounded-md text-text-secondary"
              >
                50%
              </button>
              <button
                type="button"
                onClick={() => handleQuickAmount(75)}
                className="text-xs px-3 py-1 bg-muted hover:bg-muted/80 rounded-md text-text-secondary"
              >
                75%
              </button>
              <button
                type="button"
                onClick={() => setAmount(availableBalance.toString())}
                className="text-xs px-3 py-1 bg-muted hover:bg-muted/80 rounded-md text-text-secondary"
              >
                Max
              </button>
            </div>
            <p className="text-xs text-text-secondary mt-1">
              Minimum withdrawal: ₹100
            </p>
          </div>

          {/* UPI ID Input */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              UPI ID
            </label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="yourname@paytm"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
              disabled={loading || loadingInfo}
            />
            <p className="text-xs text-text-secondary mt-1">
              Enter your UPI ID to receive the payment
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Icon name="AlertCircle" size={16} color="var(--color-destructive)" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            </div>
          )}

          {/* Info Message */}
          <div className="bg-muted rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <Icon name="Info" size={16} color="var(--color-primary)" className="mt-0.5" />
              <div className="text-xs text-text-secondary">
                <p className="font-medium mb-1">Withdrawal Information:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Funds will be transferred within 24-48 hours</li>
                  <li>Processing fee may apply</li>
                  <li>Ensure your UPI ID is correct</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="success"
              className="flex-1"
              disabled={loading || loadingInfo || !amount || !upiId}
            >
              Continue
            </Button>
          </div>
        </form>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Security Step Header */}
            <div className="text-center mb-6">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Lock" size={32} color="var(--color-primary)" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Enter Withdrawal PIN
              </h3>
              <p className="text-sm text-text-secondary">
                Please enter your 4-digit PIN to confirm withdrawal
              </p>
            </div>

            {/* Withdrawal Summary */}
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-text-secondary">Amount:</span>
                <span className="text-sm font-semibold text-text-primary">
                  ₹{parseFloat(amount || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-text-secondary">UPI ID:</span>
                <span className="text-sm font-medium text-text-primary">{upiId}</span>
              </div>
            </div>

            {/* PIN Input */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                4-Digit PIN
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength="4"
                value={withdrawalPIN}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setWithdrawalPIN(value);
                  setError(null);
                }}
                placeholder="Enter 4-digit PIN"
                className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary font-mono"
                disabled={loading}
                autoFocus
              />
              <p className="text-xs text-text-secondary mt-2 text-center">
                Enter the 4-digit PIN you set when adding your UPI ID
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Icon name="AlertCircle" size={16} color="var(--color-destructive)" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-3 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={handleBackToDetails}
                className="flex-1"
                disabled={loading}
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="success"
                className="flex-1"
                disabled={loading || withdrawalPIN.length !== 4}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  'Confirm Withdrawal'
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default WithdrawalModal;

