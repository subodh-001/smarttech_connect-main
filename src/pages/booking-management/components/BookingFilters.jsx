import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const BookingFilters = ({ onFilterChange, onClearFilters }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: '',
    serviceCategory: '',
    technician: '',
    priceRange: '',
    status: ''
  });

  const serviceCategories = [
    { value: '', label: 'All Categories' },
    { value: 'plumbing', label: 'Plumbing' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'ac-repair', label: 'AC Repair' },
    { value: 'appliance', label: 'Home Appliances' },
    { value: 'computer', label: 'Computer/Mobile' },
    { value: 'carpentry', label: 'Carpentry' }
  ];

  const dateRangeOptions = [
    { value: '', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'Last 3 Months' }
  ];

  const priceRangeOptions = [
    { value: '', label: 'Any Price' },
    { value: '0-50', label: '$0 - $50' },
    { value: '50-100', label: '$50 - $100' },
    { value: '100-200', label: '$100 - $200' },
    { value: '200+', label: '$200+' }
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      dateRange: '',
      serviceCategory: '',
      technician: '',
      priceRange: '',
      status: ''
    };
    setFilters(clearedFilters);
    onClearFilters();
  };

  const hasActiveFilters = Object.values(filters)?.some(value => value !== '');

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6">
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon name="Filter" size={20} className="text-text-secondary" />
          <h3 className="font-medium text-text-primary">Filters</h3>
          {hasActiveFilters && (
            <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
              Active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-text-secondary hover:text-text-primary"
            >
              Clear All
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="lg:hidden"
          >
            <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={20} />
          </Button>
        </div>
      </div>
      {/* Quick Filters - Always Visible */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <Select
          placeholder="Date Range"
          options={dateRangeOptions}
          value={filters?.dateRange}
          onChange={(value) => handleFilterChange('dateRange', value)}
        />
        <Select
          placeholder="Service Category"
          options={serviceCategories}
          value={filters?.serviceCategory}
          onChange={(value) => handleFilterChange('serviceCategory', value)}
        />
        <Select
          placeholder="Price Range"
          options={priceRangeOptions}
          value={filters?.priceRange}
          onChange={(value) => handleFilterChange('priceRange', value)}
        />
        <Select
          placeholder="Status"
          options={statusOptions}
          value={filters?.status}
          onChange={(value) => handleFilterChange('status', value)}
        />
      </div>
      {/* Advanced Filters - Expandable on Mobile */}
      <div className={`${isExpanded ? 'block' : 'hidden'} lg:block`}>
        <div className="border-t border-border pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <Input
              type="text"
              placeholder="Search by technician name..."
              value={filters?.technician}
              onChange={(e) => handleFilterChange('technician', e?.target?.value)}
              className="w-full"
            />
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                disabled={!hasActiveFilters}
                className="flex-1 lg:flex-none"
              >
                <Icon name="RotateCcw" size={16} className="mr-2" />
                Reset
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => onFilterChange(filters)}
                className="flex-1 lg:flex-none"
              >
                <Icon name="Search" size={16} className="mr-2" />
                Apply
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
          {filters?.dateRange && (
            <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
              <span>{dateRangeOptions?.find(opt => opt?.value === filters?.dateRange)?.label}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleFilterChange('dateRange', '')}
                className="h-4 w-4 p-0 hover:bg-primary/20"
              >
                <Icon name="X" size={12} />
              </Button>
            </div>
          )}
          {filters?.serviceCategory && (
            <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
              <span>{serviceCategories?.find(opt => opt?.value === filters?.serviceCategory)?.label}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleFilterChange('serviceCategory', '')}
                className="h-4 w-4 p-0 hover:bg-primary/20"
              >
                <Icon name="X" size={12} />
              </Button>
            </div>
          )}
          {filters?.priceRange && (
            <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
              <span>{priceRangeOptions?.find(opt => opt?.value === filters?.priceRange)?.label}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleFilterChange('priceRange', '')}
                className="h-4 w-4 p-0 hover:bg-primary/20"
              >
                <Icon name="X" size={12} />
              </Button>
            </div>
          )}
          {filters?.status && (
            <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
              <span>{statusOptions?.find(opt => opt?.value === filters?.status)?.label}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleFilterChange('status', '')}
                className="h-4 w-4 p-0 hover:bg-primary/20"
              >
                <Icon name="X" size={12} />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingFilters;