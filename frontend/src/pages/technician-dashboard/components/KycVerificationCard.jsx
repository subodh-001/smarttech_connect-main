import React, { useRef, useState } from 'react';
import { ShieldCheck, Upload, CheckCircle2, AlertTriangle, RefreshCcw } from 'lucide-react';
import Button from '../../../components/ui/Button';

const statusConfig = {
  not_submitted: {
    title: 'Verification required',
    description:
      'Upload a government-issued ID or business license so we can verify your profile before you start accepting jobs.',
    badgeClass: 'bg-amber-100 text-amber-700',
    badgeLabel: 'Action required',
  },
  under_review: {
    title: 'Verification in review',
    description:
      'Thanks for submitting your documents. Our compliance team is reviewing them and will update you soon.',
    badgeClass: 'bg-blue-100 text-blue-700',
    badgeLabel: 'Pending review',
  },
  approved: {
    title: 'Verification approved',
    description:
      'Your documents have been verified. You can continue accepting jobs without any additional steps.',
    badgeClass: 'bg-emerald-100 text-emerald-700',
    badgeLabel: 'Verified',
  },
  rejected: {
    title: 'Verification needs attention',
    description:
      'We were unable to approve your submission. Please review the feedback below and upload an updated document.',
    badgeClass: 'bg-rose-100 text-rose-700',
    badgeLabel: 'Update required',
  },
};

const formatDate = (value) => {
  if (!value) return null;
  return new Date(value).toLocaleString();
};

const KycVerificationCard = ({
  status,
  submittedAt,
  feedback,
  documentUrl,
  onUpload,
  isUploading,
  error,
  success,
  manageProfileLink,
}) => {
  const fileInputRef = useRef(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const currentStatus = statusConfig[status] ?? statusConfig.not_submitted;
  const canUpload = typeof onUpload === 'function';

  const handleSelectClick = () => {
    if (!canUpload) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedFileName(file.name);
    if (canUpload) {
      onUpload(file);
    }
  };

  const showUploadControls = canUpload && (status === 'not_submitted' || status === 'rejected');

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            {status === 'approved' ? <CheckCircle2 size={24} /> : <ShieldCheck size={24} />}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-semibold text-slate-900">{currentStatus.title}</h2>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${currentStatus.badgeClass}`}
              >
                {currentStatus.badgeLabel}
              </span>
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{currentStatus.description}</p>

            {(status === 'under_review' || status === 'approved') && submittedAt ? (
              <p className="mt-3 text-xs text-slate-500">
                Last submitted on <span className="font-medium text-slate-700">{formatDate(submittedAt)}</span>
              </p>
            ) : null}

            {documentUrl && status !== 'not_submitted' ? (
              <a
                href={documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex text-sm font-semibold text-blue-600 hover:text-blue-500"
              >
                View submitted document
              </a>
            ) : null}

            {feedback ? (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Feedback</p>
                  <p className="mt-1 leading-6">{feedback}</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {showUploadControls ? (
          <div className="flex w-full flex-col gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600 lg:max-w-sm">
            <p className="font-medium text-slate-800">Upload document</p>
            <p>Accepted formats: PDF, JPG, PNG. Maximum file size 5MB.</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                onClick={handleSelectClick}
                disabled={isUploading}
                className="flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <RefreshCcw className="h-4 w-4 animate-spin" />
                    Uploading…
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Choose file
                  </>
                )}
              </Button>
              {selectedFileName ? (
                <span className="text-xs text-slate-500">{selectedFileName}</span>
              ) : null}
            </div>
            <p className="text-xs text-slate-500">
              Make sure the document is clear, unobstructed, and includes your full name.
            </p>
          </div>
        ) : !canUpload && (status === 'not_submitted' || status === 'rejected') ? (
          <div className="flex w-full flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 lg:max-w-sm">
            <p>
              Upload verification documents from your{' '}
              {manageProfileLink ? (
                <a href={manageProfileLink} className="font-medium text-blue-600 hover:text-blue-500">
                  profile page
                </a>
              ) : (
                'profile page'
              )}
              . Verification is required before you can accept jobs.
            </p>
          </div>
        ) : null}
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      ) : null}
    </section>
  );
};

export default KycVerificationCard;

