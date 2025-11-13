import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { useAuth } from '../../../contexts/NewAuthContext';
import UPIVerificationModal from './UPIVerificationModal';

const PayoutSettingsSection = ({ userProfile }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  
  const [payoutMethod, setPayoutMethod] = useState('none');
  const [upiId, setUpiId] = useState('');
  const [withdrawalPIN, setWithdrawalPIN] = useState('');
  const [confirmPIN, setConfirmPIN] = useState('');
  const [hasExistingPIN, setHasExistingPIN] = useState(false);
  const [showChangePIN, setShowChangePIN] = useState(false);
  const [oldPIN, setOldPIN] = useState('');
  const [newPIN, setNewPIN] = useState('');
  const [confirmNewPIN, setConfirmNewPIN] = useState('');
  const [showForgotPIN, setShowForgotPIN] = useState(false);
  const [bankAccountName, setBankAccountName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankIfscCode, setBankIfscCode] = useState('');

  // Check if user is technician
  const isTechnician = user?.role === 'technician' || user?.type === 'technician' || userProfile?.role === 'technician';

  useEffect(() => {
    const fetchPayoutInfo = async () => {
      if (!isTechnician) return;
      
      setLoading(true);
      try {
        const { data } = await axios.get('/api/technicians/me/profile');
        if (data?.technician) {
          setPayoutMethod(data.technician.payoutMethod || 'none');
          setUpiId(data.technician.upiId || '');
          setHasExistingPIN(data.technician.withdrawalPIN || false);
          setBankAccountName(data.technician.bankAccountName || '');
          setBankAccountNumber(data.technician.bankAccountNumber || '');
          setBankIfscCode(data.technician.bankIfscCode || '');
        }
      } catch (err) {
        console.error('Failed to fetch payout settings:', err);
        setError('Failed to load payout settings');
      } finally {
        setLoading(false);
      }
    };

    fetchPayoutInfo();
  }, [isTechnician]);

  const handleSave = async () => {
    if (!isTechnician) return;

    setError(null);
    setSuccess(false);

    // Validate UPI ID format if UPI is selected
    if (payoutMethod === 'upi') {
      if (!upiId || !upiId.trim()) {
        setError('UPI ID is required when UPI is selected');
        return;
      }
      // Basic UPI ID validation (format: name@paytm, name@phonepe, etc.)
      const upiPattern = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
      if (!upiPattern.test(upiId.trim())) {
        setError('Please enter a valid UPI ID (e.g., yourname@paytm)');
        return;
      }
      // Validate withdrawal PIN (only if setting new PIN, not changing)
      // If PIN already exists, don't require it in this save flow
      if (!hasExistingPIN && !showChangePIN) {
        if (!withdrawalPIN || withdrawalPIN.length !== 4 || !/^\d{4}$/.test(withdrawalPIN)) {
          setError('Please enter a valid 4-digit withdrawal PIN');
          return;
        }
        if (withdrawalPIN !== confirmPIN) {
          setError('PIN confirmation does not match. Please re-enter both PINs.');
          return;
        }
      }
      // Show verification modal for UPI
      setShowVerificationModal(true);
      return;
    }

    // Validate bank details if bank transfer is selected
    if (payoutMethod === 'bank_transfer') {
      if (!bankAccountName || !bankAccountName.trim()) {
        setError('Bank account name is required');
        return;
      }
      if (!bankAccountNumber || !bankAccountNumber.trim()) {
        setError('Bank account number is required');
        return;
      }
      if (!bankIfscCode || !bankIfscCode.trim()) {
        setError('IFSC code is required');
        return;
      }
      // Basic IFSC validation (11 characters, alphanumeric)
      const ifscPattern = /^[A-Z]{4}0[A-Z0-9]{6}$/;
      if (!ifscPattern.test(bankIfscCode.trim().toUpperCase())) {
        setError('Please enter a valid IFSC code (e.g., SBIN0001234)');
        return;
      }
    }

    // For bank transfer or none, save directly
    await performSave();
  };

  const performSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    setShowVerificationModal(false);

    try {
      const payload = {
        payoutMethod,
        upiId: payoutMethod === 'upi' ? upiId.trim() : null,
        bankAccountName: payoutMethod === 'bank_transfer' ? bankAccountName.trim() : null,
        bankAccountNumber: payoutMethod === 'bank_transfer' ? bankAccountNumber.trim() : null,
        bankIfscCode: payoutMethod === 'bank_transfer' ? bankIfscCode.trim().toUpperCase() : null,
      };
      
      // Include withdrawal PIN if UPI is selected and PIN is provided (only for new PINs)
      if (payoutMethod === 'upi' && !hasExistingPIN && !showChangePIN && withdrawalPIN && withdrawalPIN.length === 4) {
        payload.withdrawalPIN = withdrawalPIN;
      }
      
      await axios.put('/api/technicians/me/profile', payload);

      setSuccess(true);
      // Clear PIN fields after successful save (for security)
      setWithdrawalPIN('');
      setConfirmPIN('');
      setOldPIN('');
      setNewPIN('');
      setConfirmNewPIN('');
      setShowChangePIN(false);
      // Refresh to check if PIN is now set
      const { data } = await axios.get('/api/technicians/me/profile');
      if (data?.technician) {
        setHasExistingPIN(data.technician.withdrawalPIN || false);
      }
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('Failed to save payout settings:', err);
      setError(err.response?.data?.error || 'Failed to save payout settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleVerificationConfirm = () => {
    performSave();
  };

  const handleVerificationCancel = () => {
    setShowVerificationModal(false);
  };

  const handleChangePIN = async () => {
    if (!isTechnician) return;

    setError(null);
    setSuccess(false);

    // Validate change PIN fields
    if (!oldPIN || oldPIN.length !== 4 || !/^\d{4}$/.test(oldPIN)) {
      setError('Please enter your current 4-digit PIN');
      return;
    }
    if (!newPIN || newPIN.length !== 4 || !/^\d{4}$/.test(newPIN)) {
      setError('Please enter a valid 4-digit new PIN');
      return;
    }
    if (newPIN !== confirmNewPIN) {
      setError('New PIN confirmation does not match. Please re-enter both PINs.');
      return;
    }
    if (oldPIN === newPIN) {
      setError('New PIN must be different from your current PIN');
      return;
    }

    // Save with change PIN
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await axios.put('/api/technicians/me/profile', {
        withdrawalPIN: newPIN,
        oldWithdrawalPIN: oldPIN,
      });

      setSuccess(true);
      setOldPIN('');
      setNewPIN('');
      setConfirmNewPIN('');
      setShowChangePIN(false);
      
      // Refresh to check if PIN is now set
      const { data } = await axios.get('/api/technicians/me/profile');
      if (data?.technician) {
        setHasExistingPIN(data.technician.withdrawalPIN || false);
      }
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('Failed to change PIN:', err);
      setError(err.response?.data?.error || 'Failed to change PIN. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isTechnician) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-sm">
        <div className="text-center">
          <Icon name="Info" size={48} className="text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Payout Settings</h3>
          <p className="text-sm text-slate-500">
            Payout settings are only available for technicians.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-sm">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-6 shadow-sm sm:px-8 sm:py-7">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Payment & Payout Settings</h3>
        <p className="text-sm text-slate-500">
          Configure how you want to receive payments from completed jobs. Customers will pay you directly using these details.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 flex items-center space-x-2">
          <Icon name="CheckCircle" size={20} className="text-emerald-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-emerald-800">
              {showChangePIN ? 'Withdrawal PIN changed successfully!' : hasExistingPIN && !showChangePIN ? 'Payout settings saved successfully!' : 'Withdrawal PIN successfully added!'}
            </p>
            {payoutMethod === 'upi' && upiId && (
              <p className="text-xs text-emerald-700 mt-1">
                Your UPI ID <span className="font-mono font-semibold">{upiId}</span> is now active. Customers can pay you using this ID.
              </p>
            )}
            {!hasExistingPIN && !showChangePIN && withdrawalPIN && (
              <p className="text-xs text-emerald-700 mt-1">
                Your 4-digit withdrawal PIN has been set. You'll need this PIN to withdraw funds.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Payout Method Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Payment Method
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setPayoutMethod('upi')}
              className={`flex items-center justify-center space-x-2 p-4 rounded-lg border-2 transition-all ${
                payoutMethod === 'upi'
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <Icon name="Smartphone" size={20} />
              <span className="font-medium">UPI</span>
            </button>
            <button
              type="button"
              onClick={() => setPayoutMethod('bank_transfer')}
              className={`flex items-center justify-center space-x-2 p-4 rounded-lg border-2 transition-all ${
                payoutMethod === 'bank_transfer'
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <Icon name="Building2" size={20} />
              <span className="font-medium">Bank Transfer</span>
            </button>
            <button
              type="button"
              onClick={() => setPayoutMethod('none')}
              className={`flex items-center justify-center space-x-2 p-4 rounded-lg border-2 transition-all ${
                payoutMethod === 'none'
                  ? 'border-slate-200 bg-slate-50 text-slate-500'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <Icon name="X" size={20} />
              <span className="font-medium">Not Set</span>
            </button>
          </div>
        </div>

        {/* UPI Settings */}
        {payoutMethod === 'upi' && (
          <div className="space-y-4 p-4 rounded-lg border border-slate-200 bg-slate-50">
            <div>
              <label htmlFor="upiId" className="block text-sm font-medium text-slate-700 mb-2">
                UPI ID <span className="text-rose-500">*</span>
              </label>
              <Input
                id="upiId"
                type="text"
                placeholder="yourname@paytm"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full"
              />
              <p className="mt-1 text-xs text-slate-500">
                Enter your UPI ID (e.g., yourname@paytm, yourname@phonepe, yourname@ybl)
              </p>
            </div>
            
            {/* Withdrawal PIN Section */}
            {hasExistingPIN && !showChangePIN && !showForgotPIN ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Icon name="CheckCircle" size={20} className="text-emerald-600" />
                    <div>
                      <p className="text-sm font-medium text-emerald-800">Withdrawal PIN is set</p>
                      <p className="text-xs text-emerald-700">Your PIN is active and secure</p>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowChangePIN(true);
                      setShowForgotPIN(false);
                      setError(null);
                    }}
                    className="flex-1"
                  >
                    Change PIN
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowForgotPIN(true);
                      setShowChangePIN(false);
                      setError(null);
                    }}
                    className="flex-1 text-slate-600"
                  >
                    Forgot PIN?
                  </Button>
                </div>
              </div>
            ) : showChangePIN ? (
              <div className="space-y-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-slate-700">Change Withdrawal PIN</h4>
                  <button
                    type="button"
                    onClick={() => {
                      setShowChangePIN(false);
                      setOldPIN('');
                      setNewPIN('');
                      setConfirmNewPIN('');
                      setError(null);
                    }}
                    className="text-xs text-slate-500 hover:text-slate-700"
                  >
                    Cancel
                  </button>
                </div>
                
                {/* Old PIN */}
                <div>
                  <label htmlFor="oldPIN" className="block text-sm font-medium text-slate-700 mb-2">
                    Current PIN <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    id="oldPIN"
                    type="password"
                    inputMode="numeric"
                    maxLength="4"
                    placeholder="0000"
                    value={oldPIN}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                      setOldPIN(value);
                      setError(null);
                    }}
                    className="w-full text-center text-2xl tracking-widest font-mono"
                  />
                </div>
                
                {/* New PIN */}
                <div>
                  <label htmlFor="newPIN" className="block text-sm font-medium text-slate-700 mb-2">
                    New PIN <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    id="newPIN"
                    type="password"
                    inputMode="numeric"
                    maxLength="4"
                    placeholder="0000"
                    value={newPIN}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                      setNewPIN(value);
                      setError(null);
                    }}
                    className="w-full text-center text-2xl tracking-widest font-mono"
                  />
                </div>
                
                {/* Confirm New PIN */}
                <div>
                  <label htmlFor="confirmNewPIN" className="block text-sm font-medium text-slate-700 mb-2">
                    Confirm New PIN <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    id="confirmNewPIN"
                    type="password"
                    inputMode="numeric"
                    maxLength="4"
                    placeholder="0000"
                    value={confirmNewPIN}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                      setConfirmNewPIN(value);
                      setError(null);
                    }}
                    className="w-full text-center text-2xl tracking-widest font-mono"
                  />
                </div>
              </div>
            ) : showForgotPIN ? (
              <div className="space-y-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Icon name="AlertTriangle" size={20} className="text-amber-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-amber-800 mb-1">Forgot Withdrawal PIN?</h4>
                    <p className="text-xs text-amber-700 mb-3">
                      To reset your withdrawal PIN, please contact support. For security reasons, PIN reset requires account verification.
                    </p>
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-amber-800">Contact Support:</p>
                      <p className="text-xs text-amber-700">Email: support@smarttechconnect.com</p>
                      <p className="text-xs text-amber-700">Phone: +91-XXXX-XXXX</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowForgotPIN(false);
                        setError(null);
                      }}
                      className="mt-3"
                    >
                      Back
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Withdrawal PIN */}
                <div>
                  <label htmlFor="withdrawalPIN" className="block text-sm font-medium text-slate-700 mb-2">
                    Withdrawal PIN <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    id="withdrawalPIN"
                    type="password"
                    inputMode="numeric"
                    maxLength="4"
                    placeholder="0000"
                    value={withdrawalPIN}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                      setWithdrawalPIN(value);
                      setError(null);
                    }}
                    className="w-full text-center text-2xl tracking-widest font-mono"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Set a 4-digit PIN to secure your withdrawals. You'll need this PIN every time you withdraw funds.
                  </p>
                </div>
                
                {/* Confirm PIN */}
                <div>
                  <label htmlFor="confirmPIN" className="block text-sm font-medium text-slate-700 mb-2">
                    Confirm PIN <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    id="confirmPIN"
                    type="password"
                    inputMode="numeric"
                    maxLength="4"
                    placeholder="0000"
                    value={confirmPIN}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                      setConfirmPIN(value);
                      setError(null);
                    }}
                    className="w-full text-center text-2xl tracking-widest font-mono"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Re-enter your 4-digit PIN to confirm
                  </p>
                </div>
              </>
            )}
            
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <div className="flex items-start space-x-2">
                <Icon name="Info" size={16} className="text-blue-600 mt-0.5" />
                <div className="text-xs text-blue-700">
                  <p className="font-medium mb-1">How it works:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Customers will scan a QR code to pay you directly</li>
                    <li>Payment goes straight to your UPI account</li>
                    <li>No platform fees or delays</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bank Transfer Settings */}
        {payoutMethod === 'bank_transfer' && (
          <div className="space-y-4 p-4 rounded-lg border border-slate-200 bg-slate-50">
            <div>
              <label htmlFor="bankAccountName" className="block text-sm font-medium text-slate-700 mb-2">
                Account Holder Name <span className="text-rose-500">*</span>
              </label>
              <Input
                id="bankAccountName"
                type="text"
                placeholder="John Doe"
                value={bankAccountName}
                onChange={(e) => setBankAccountName(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="bankAccountNumber" className="block text-sm font-medium text-slate-700 mb-2">
                Account Number <span className="text-rose-500">*</span>
              </label>
              <Input
                id="bankAccountNumber"
                type="text"
                placeholder="1234567890"
                value={bankAccountNumber}
                onChange={(e) => setBankAccountNumber(e.target.value.replace(/\D/g, ''))}
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="bankIfscCode" className="block text-sm font-medium text-slate-700 mb-2">
                IFSC Code <span className="text-rose-500">*</span>
              </label>
              <Input
                id="bankIfscCode"
                type="text"
                placeholder="SBIN0001234"
                value={bankIfscCode}
                onChange={(e) => setBankIfscCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                className="w-full"
                maxLength={11}
              />
              <p className="mt-1 text-xs text-slate-500">
                Enter 11-character IFSC code (e.g., SBIN0001234)
              </p>
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <div className="flex items-start space-x-2">
                <Icon name="Info" size={16} className="text-blue-600 mt-0.5" />
                <div className="text-xs text-blue-700">
                  <p className="font-medium mb-1">Note:</p>
                  <p>Bank transfers may take 1-3 business days to process.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200">
          {showChangePIN && (
            <Button
              variant="primary"
              onClick={handleChangePIN}
              disabled={saving || !oldPIN || !newPIN || !confirmNewPIN}
              iconName={saving ? 'Loader' : 'Save'}
              iconPosition="left"
            >
              {saving ? 'Changing...' : 'Change PIN'}
            </Button>
          )}
          {!showChangePIN && (
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={saving || payoutMethod === 'none'}
              iconName={saving ? 'Loader' : 'Save'}
              iconPosition="left"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          )}
        </div>
      </div>

      {/* UPI Verification Modal */}
      <UPIVerificationModal
        isOpen={showVerificationModal}
        onClose={handleVerificationCancel}
        upiId={upiId}
        onConfirm={handleVerificationConfirm}
        onCancel={handleVerificationCancel}
      />
    </div>
  );
};

export default PayoutSettingsSection;

