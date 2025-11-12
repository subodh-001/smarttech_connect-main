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
      await axios.put('/api/technicians/me/profile', {
        payoutMethod,
        upiId: payoutMethod === 'upi' ? upiId.trim() : null,
        bankAccountName: payoutMethod === 'bank_transfer' ? bankAccountName.trim() : null,
        bankAccountNumber: payoutMethod === 'bank_transfer' ? bankAccountNumber.trim() : null,
        bankIfscCode: payoutMethod === 'bank_transfer' ? bankIfscCode.trim().toUpperCase() : null,
      });

      setSuccess(true);
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
              Payout settings saved successfully!
            </p>
            {payoutMethod === 'upi' && upiId && (
              <p className="text-xs text-emerald-700 mt-1">
                Your UPI ID <span className="font-mono font-semibold">{upiId}</span> is now active. Customers can pay you using this ID.
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
        <div className="flex justify-end pt-4 border-t border-slate-200">
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={saving || payoutMethod === 'none'}
            iconName={saving ? 'Loader' : 'Save'}
            iconPosition="left"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
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

