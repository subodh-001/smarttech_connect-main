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
  selectedForComparison 
}) => {
  if (loading) {
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

  if (technicians?.length === 0) {
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
    <div className="space-y-4">
      {technicians?.map((technician) => (
        <TechnicianCard
          key={technician?.id}
          technician={technician}
          onViewProfile={onViewProfile}
          onSendMessage={onSendMessage}
          onBookNow={onBookNow}
          onCompare={onCompare}
          isSelected={selectedForComparison?.some(selected => selected?.id === technician?.id)}
        />
      ))}
    </div>
  );
};

export default TechnicianList;