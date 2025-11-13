import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const JobDetailsModal = ({ isOpen, onClose, jobs = [], title = 'Job Details' }) => {
  if (!isOpen) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      if (Number.isNaN(date.getTime())) return '—';
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return '—';
    }
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '₹0';
    try {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(Number(value) || 0);
    } catch {
      return `₹${value}`;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-success/10 text-success border-success/20';
      case 'in_progress':
      case 'confirmed':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'cancelled':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg shadow-elevated max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
            <p className="text-sm text-text-secondary mt-1">
              {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} found
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {jobs.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="FileText" size={48} className="mx-auto mb-4 text-text-secondary opacity-50" />
              <p className="text-text-secondary">No jobs found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job, index) => (
                <div
                  key={job.id || job._id || index}
                  className="border border-border rounded-lg p-4 bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-text-primary">
                          {job.title || job.category || job.service || 'Service Request'}
                        </h3>
                        <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(job.status)}`}>
                          {job.status || 'Unknown'}
                        </span>
                      </div>
                      {job.id && (
                        <p className="text-sm text-text-secondary mb-2">
                          ID: #{job.id}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    {/* Customer/Technician Info */}
                    {(job.customer || job.customerId || job.technician || job.technicianId) && (
                      <div>
                        <p className="text-xs text-text-secondary mb-1">
                          {job.partyLabel || (job.customer || job.customerId ? 'Customer' : 'Technician')}
                        </p>
                        <p className="text-sm font-medium text-text-primary">
                          {job.partyName ||
                            job.customer?.name ||
                            job.customer?.fullName ||
                            job.customerId?.name ||
                            job.technician?.name ||
                            job.technicianId?.name ||
                            'N/A'}
                        </p>
                        {(job.customer?.email || job.technician?.email) && (
                          <p className="text-xs text-text-secondary mt-1">
                            {job.customer?.email || job.technician?.email}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Amount */}
                    {(job.finalCost || job.budgetMax || job.budgetMin || job.amount) && (
                      <div>
                        <p className="text-xs text-text-secondary mb-1">Amount</p>
                        <p className="text-sm font-semibold text-success">
                          {formatCurrency(job.finalCost || job.budgetMax || job.budgetMin || job.amount)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    {(job.scheduledDate || job.createdAt || job.updatedAt) && (
                      <div className="flex items-center gap-2">
                        <Icon name="Calendar" size={16} className="text-text-secondary" />
                        <div>
                          <p className="text-xs text-text-secondary">Date</p>
                          <p className="text-sm font-medium text-text-primary">
                            {formatDate(job.scheduledDate || job.completionDate || job.createdAt || job.updatedAt)}
                          </p>
                        </div>
                      </div>
                    )}

                    {job.locationAddress && (
                      <div className="flex items-center gap-2">
                        <Icon name="MapPin" size={16} className="text-text-secondary" />
                        <div>
                          <p className="text-xs text-text-secondary">Location</p>
                          <p className="text-sm font-medium text-text-primary truncate">
                            {job.locationAddress}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {job.description && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs text-text-secondary mb-1">Description</p>
                      <p className="text-sm text-text-primary">{job.description}</p>
                    </div>
                  )}

                  {/* Review Rating for Completed Jobs */}
                  {job.status === 'completed' && job.reviewRating && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="flex items-center gap-2">
                        <Icon name="Star" size={16} className="text-warning fill-current" />
                        <p className="text-sm font-medium text-text-primary">
                          Rating: {job.reviewRating}/5
                        </p>
                        {job.reviewComment && (
                          <p className="text-xs text-text-secondary ml-2">- {job.reviewComment}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsModal;

