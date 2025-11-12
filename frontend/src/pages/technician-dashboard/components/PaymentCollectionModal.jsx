import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PaymentCollectionModal = ({ isOpen, onClose, job, technicianUpiId, onConfirmPayment }) => {
  const navigate = useNavigate();
  
  // Calculate values safely (hooks must be called before any early returns)
  const amount = job?.amount || job?.finalCost || job?.budgetMax || job?.budgetMin || 0;
  const technicianName = job?.technician?.name || job?.technician?.fullName || 'Technician';
  const jobTitle = job?.title || 'Service';
  const jobId = job?.id || '';
  
  // Generate UPI payment link (hooks must always be called)
  const upiLink = useMemo(() => {
    if (!technicianUpiId || !job) return null;
    
    // UPI deep link format: upi://pay?pa=<UPI_ID>&pn=<Name>&am=<Amount>&cu=INR&tn=<TransactionNote>
    const transactionNote = `Payment for ${jobTitle} - ${jobId?.slice(-6) || ''}`;
    const encodedName = encodeURIComponent(technicianName);
    const encodedNote = encodeURIComponent(transactionNote);
    
    return `upi://pay?pa=${technicianUpiId}&pn=${encodedName}&am=${amount}&cu=INR&tn=${encodedNote}`;
  }, [technicianUpiId, amount, technicianName, jobTitle, jobId, job]);
  
  // Early return AFTER all hooks have been called
  if (!isOpen || !job) return null;

  const handleCopyLink = () => {
    if (upiLink) {
      navigator.clipboard.writeText(upiLink);
      alert('UPI payment link copied to clipboard!');
    }
  };

  const handleOpenUpiApp = () => {
    if (upiLink) {
      window.location.href = upiLink;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
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
            <h2 className="text-xl font-semibold text-text-primary">Collect Payment</h2>
            <p className="text-sm text-text-secondary mt-1">
              {jobTitle || 'Service Request'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-muted"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {!technicianUpiId ? (
            <div className="text-center py-8">
              <Icon name="AlertCircle" size={48} className="text-warning mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                UPI ID Not Configured
              </h3>
              <p className="text-sm text-text-secondary mb-6">
                Please add your UPI ID in profile settings to collect payments via QR code.
              </p>
              <Button
                variant="primary"
                onClick={() => {
                  onClose();
                  // Navigate to profile management page with payment tab
                  navigate('/profile-management?tab=payment');
                }}
              >
                Go to Profile Settings
              </Button>
            </div>
          ) : (
            <>
              {/* Amount Display */}
              <div className="text-center mb-6">
                <p className="text-sm text-text-secondary mb-2">Amount to Collect</p>
                <p className="text-3xl font-bold text-success">
                  ₹{Number(amount).toLocaleString('en-IN')}
                </p>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center mb-6">
                <div className="bg-white p-4 rounded-lg border-2 border-border mb-4">
                  <QRCodeSVG
                    value={upiLink || ''}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <p className="text-xs text-text-secondary text-center">
                  Customer can scan this QR code to pay via any UPI app
                </p>
              </div>

              {/* UPI ID Display */}
              <div className="bg-muted/50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-text-secondary mb-1">Your UPI ID</p>
                    <p className="text-sm font-medium text-text-primary">{technicianUpiId}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyLink}
                    iconName="Copy"
                  >
                    Copy Link
                  </Button>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-primary/10 rounded-lg p-4 mb-6">
                <p className="text-sm font-medium text-text-primary mb-2">Instructions:</p>
                <ol className="text-xs text-text-secondary space-y-1 list-decimal list-inside">
                  <li>Show this QR code to the customer</li>
                  <li>Customer scans and pays via their UPI app</li>
                  <li>Wait for payment confirmation</li>
                  <li>Click "Payment Received" once confirmed</li>
                </ol>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                <Button
                  variant="primary"
                  onClick={handleOpenUpiApp}
                  iconName="Smartphone"
                  iconPosition="left"
                  className="w-full"
                >
                  Open in UPI App
                </Button>
                <Button
                  variant="success"
                  onClick={() => {
                    if (onConfirmPayment) {
                      onConfirmPayment();
                    }
                  }}
                  iconName="CheckCircle"
                  iconPosition="left"
                  className="w-full"
                >
                  Payment Received
                </Button>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentCollectionModal;

