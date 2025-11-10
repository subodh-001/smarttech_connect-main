import React from 'react';
import TechnicianCard from './TechnicianCard';
import Icon from '../../../components/AppIcon';

const TechnicianList = ({
  technicians,
  loading,
  onViewProfile,
  onSendMessage,
  onBookNow,
  onCompare,
  selectedForComparison,
  bookingState = {},
}) => {
  const hasResults = Array.isArray(technicians) && technicians.length > 0;
  const showInitialSkeleton = loading && !hasResults;

  if (showInitialSkeleton) {
    return (
      <div className="space-y-4">
        {[...Array(3)]?.map((_, index) => (
          <div key={index} className="bg-card border border-border rounded-lg p-4 animate-pulse">
            <div className="flex items-start space-x-3 mb-3">
              <div className="w-12 h-12 bg-muted rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/3"></div>
                <div className="h-3 bg-muted rounded w-1/4"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded w-full"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </div>
            <div className="flex space-x-2 mt-4">
              <div className="h-8 bg-muted rounded flex-1"></div>
              <div className="h-8 bg-muted rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!loading && !hasResults) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="Users" size={24} className="text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No Technicians Found</h3>
        <p className="text-muted-foreground mb-4">
          We couldn't find any technicians matching your criteria. Try adjusting your filters or expanding your search area.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <button className="px-4 py-2 text-sm text-primary hover:text-primary/80 font-medium">
            Clear All Filters
          </button>
          <button className="px-4 py-2 text-sm text-primary hover:text-primary/80 font-medium">
            Expand Search Area
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative space-y-4">
      {loading && hasResults ? (
        <div className="absolute inset-0 bg-background/70 backdrop-blur-[1px] flex items-center justify-center z-10">
          <div className="flex items-center space-x-2 text-xs text-muted-foreground bg-card px-3 py-2 rounded-md border border-border">
            <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Refreshing technicians…</span>
          </div>
        </div>
      ) : null}
      {technicians?.map((technician) => {
        const isSelected = selectedForComparison?.some((selected) => selected?.id === technician?.id);
        const isSubmitting = bookingState?.submitting && bookingState?.technicianId === technician?.id;
        return (
          <TechnicianCard
            key={technician?.id}
            technician={technician}
            onViewProfile={onViewProfile}
            onSendMessage={onSendMessage}
            onBookNow={onBookNow}
            onCompare={onCompare}
            isSelected={isSelected}
            isBooking={isSubmitting}
          />
        );
      })}
    </div>
  );
};

export default TechnicianList;