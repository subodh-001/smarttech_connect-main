import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const FilterControls = ({ onFilterChange, onSortChange, totalResults, activeFilters }) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState({
    sortBy: 'distance',
    availability: 'all',
    rating: 'all',
    priceRange: 'all',
    experience: 'all',
    verified: false,
    responseTime: 'all'
  });

  const sortOptions = [
    { value: 'distance', label: 'Distance (Nearest)' },
    { value: 'rating', label: 'Rating (Highest)' },
    { value: 'price-low', label: 'Price (Low to High)' },
    { value: 'price-high', label: 'Price (High to Low)' },
    { value: 'experience', label: 'Experience (Most)' },
    { value: 'response-time', label: 'Response Time (Fastest)' }
  ];

  const availabilityOptions = [
    { value: 'all', label: 'All Technicians' },
    { value: 'available', label: 'Available Now' },
    { value: 'busy', label: 'Busy' }
  ];

  const ratingOptions = [
    { value: 'all', label: 'All Ratings' },
    { value: '4.5', label: '4.5+ Stars' },
    { value: '4.0', label: '4.0+ Stars' },
    { value: '3.5', label: '3.5+ Stars' }
  ];

  const priceRangeOptions = [
    { value: 'all', label: 'All Prices' },
    { value: '0-300', label: '₹0 - ₹300/hr' },
    { value: '300-500', label: '₹300 - ₹500/hr' },
    { value: '500-800', label: '₹500 - ₹800/hr' },
    { value: '800+', label: '₹800+/hr' }
  ];

  const experienceOptions = [
    { value: 'all', label: 'All Experience' },
    { value: '1-3', label: '1-3 years' },
    { value: '3-5', label: '3-5 years' },
    { value: '5-10', label: '5-10 years' },
    { value: '10+', label: '10+ years' }
  ];

  const responseTimeOptions = [
    { value: 'all', label: 'Any Response Time' },
    { value: '5min', label: 'Within 5 minutes' },
    { value: '15min', label: 'Within 15 minutes' },
    { value: '30min', label: 'Within 30 minutes' },
    { value: '1hr', label: 'Within 1 hour' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    if (key === 'sortBy') {
      onSortChange(value);
    } else {
      onFilterChange(newFilters);
    }
  };

  const clearAllFilters = () => {
    const defaultFilters = {
      sortBy: 'distance',
      availability: 'all',
      rating: 'all',
      priceRange: 'all',
      experience: 'all',
      verified: false,
      responseTime: 'all'
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
    onSortChange('distance');
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters?.availability !== 'all') count++;
    if (filters?.rating !== 'all') count++;
    if (filters?.priceRange !== 'all') count++;
    if (filters?.experience !== 'all') count++;
    if (filters?.verified) count++;
    if (filters?.responseTime !== 'all') count++;
    return count;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 trust-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Icon name="Filter" size={18} className="text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Filters & Sort</h3>
          <span className="text-xs text-muted-foreground">({totalResults} results)</span>
        </div>
        <div className="flex items-center space-x-2">
          {getActiveFilterCount() > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              iconName="X"
              iconSize={14}
            >
              Clear ({getActiveFilterCount()})
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            iconName={showAdvancedFilters ? "ChevronUp" : "ChevronDown"}
            iconSize={14}
          >
            {showAdvancedFilters ? 'Less' : 'More'}
          </Button>
        </div>
      </div>
      {/* Quick Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        <Select
          label="Sort by"
          options={sortOptions}
          value={filters?.sortBy}
          onChange={(value) => handleFilterChange('sortBy', value)}
        />
        
        <Select
          label="Availability"
          options={availabilityOptions}
          value={filters?.availability}
          onChange={(value) => handleFilterChange('availability', value)}
        />
        
        <Select
          label="Rating"
          options={ratingOptions}
          value={filters?.rating}
          onChange={(value) => handleFilterChange('rating', value)}
        />
      </div>
      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="border-t border-border pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            <Select
              label="Price Range"
              options={priceRangeOptions}
              value={filters?.priceRange}
              onChange={(value) => handleFilterChange('priceRange', value)}
            />
            
            <Select
              label="Experience"
              options={experienceOptions}
              value={filters?.experience}
              onChange={(value) => handleFilterChange('experience', value)}
            />
            
            <Select
              label="Response Time"
              options={responseTimeOptions}
              value={filters?.responseTime}
              onChange={(value) => handleFilterChange('responseTime', value)}
            />
          </div>

          {/* Checkbox Filters */}
          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters?.verified}
                onChange={(e) => handleFilterChange('verified', e?.target?.checked)}
                className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
              />
              <div className="flex items-center space-x-1">
                <Icon name="Shield" size={14} className="text-success" />
                <span className="text-sm text-foreground">Verified Only</span>
              </div>
            </label>
          </div>
        </div>
      )}
      {/* Active Filters Display */}
      {getActiveFilterCount() > 0 && (
        <div className="border-t border-border pt-3 mt-3">
          <div className="flex flex-wrap gap-2">
            {filters?.availability !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-primary/10 text-primary">
                {availabilityOptions?.find(opt => opt?.value === filters?.availability)?.label}
                <button
                  onClick={() => handleFilterChange('availability', 'all')}
                  className="ml-1 hover:text-primary/80"
                >
                  <Icon name="X" size={10} />
                </button>
              </span>
            )}
            {filters?.rating !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-primary/10 text-primary">
                {ratingOptions?.find(opt => opt?.value === filters?.rating)?.label}
                <button
                  onClick={() => handleFilterChange('rating', 'all')}
                  className="ml-1 hover:text-primary/80"
                >
                  <Icon name="X" size={10} />
                </button>
              </span>
            )}
            {filters?.priceRange !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-primary/10 text-primary">
                {priceRangeOptions?.find(opt => opt?.value === filters?.priceRange)?.label}
                <button
                  onClick={() => handleFilterChange('priceRange', 'all')}
                  className="ml-1 hover:text-primary/80"
                >
                  <Icon name="X" size={10} />
                </button>
              </span>
            )}
            {filters?.experience !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-primary/10 text-primary">
                {experienceOptions?.find(opt => opt?.value === filters?.experience)?.label}
                <button
                  onClick={() => handleFilterChange('experience', 'all')}
                  className="ml-1 hover:text-primary/80"
                >
                  <Icon name="X" size={10} />
                </button>
              </span>
            )}
            {filters?.verified && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-primary/10 text-primary">
                Verified Only
                <button
                  onClick={() => handleFilterChange('verified', false)}
                  className="ml-1 hover:text-primary/80"
                >
                  <Icon name="X" size={10} />
                </button>
              </span>
            )}
            {filters?.responseTime !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-primary/10 text-primary">
                {responseTimeOptions?.find(opt => opt?.value === filters?.responseTime)?.label}
                <button
                  onClick={() => handleFilterChange('responseTime', 'all')}
                  className="ml-1 hover:text-primary/80"
                >
                  <Icon name="X" size={10} />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterControls;