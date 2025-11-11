import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const BudgetSelector = ({ budget, onBudgetChange, selectedCategory, selectedSubcategory }) => {
  const [showEstimates, setShowEstimates] = useState(false);

  const budgetRanges = [
    { id: 'under-500', label: 'Under ₹500', min: 0, max: 500 },
    { id: '500-1000', label: '₹500 - ₹1,000', min: 500, max: 1000 },
    { id: '1000-2000', label: '₹1,000 - ₹2,000', min: 1000, max: 2000 },
    { id: '2000-5000', label: '₹2,000 - ₹5,000', min: 2000, max: 5000 },
    { id: 'above-5000', label: 'Above ₹5,000', min: 5000, max: 10000 }
  ];

  const marketEstimates = {
    plumbing: {
      'pipe-repair': { min: 300, max: 800, typical: 500 },
      'tap-installation': { min: 200, max: 600, typical: 400 },
      'toilet-repair': { min: 400, max: 1200, typical: 700 },
      'water-heater': { min: 800, max: 2500, typical: 1500 },
      'drainage-cleaning': { min: 500, max: 1500, typical: 800 }
    },
    electrical: {
      'wiring-repair': { min: 400, max: 1500, typical: 800 },
      'switch-installation': { min: 150, max: 400, typical: 250 },
      'fan-installation': { min: 300, max: 800, typical: 500 },
      'light-fitting': { min: 200, max: 600, typical: 350 },
      'power-backup': { min: 2000, max: 8000, typical: 4000 }
    },
    hvac: {
      'ac-service': { min: 800, max: 2000, typical: 1200 },
      'ac-installation': { min: 2000, max: 5000, typical: 3000 },
      'ac-gas-refill': { min: 1500, max: 3000, typical: 2000 },
      'ac-repair': { min: 1000, max: 4000, typical: 2000 },
      'ac-uninstallation': { min: 500, max: 1500, typical: 800 }
    },
    appliance_repair: {
      'laptop-repair': { min: 800, max: 3000, typical: 1500 },
      'desktop-repair': { min: 600, max: 2500, typical: 1200 },
      'data-recovery': { min: 1500, max: 5000, typical: 2500 },
      'washing-machine': { min: 900, max: 2500, typical: 1500 },
      'fridge-service': { min: 700, max: 2200, typical: 1300 }
    },
    handyman: {
      'furniture-repair': { min: 500, max: 2000, typical: 1000 },
      'door-installation': { min: 1500, max: 4000, typical: 2500 },
      'cabinet-making': { min: 3000, max: 15000, typical: 8000 },
      'wood-polishing': { min: 800, max: 2500, typical: 1500 },
      'custom-furniture': { min: 5000, max: 25000, typical: 12000 }
    },
    cleaning: {
      'home-deep-clean': { min: 1500, max: 4000, typical: 2500 },
      'kitchen-clean': { min: 800, max: 2000, typical: 1200 },
      'bathroom-clean': { min: 500, max: 1500, typical: 900 },
      'sofa-clean': { min: 700, max: 1800, typical: 1100 },
      'office-clean': { min: 2500, max: 7000, typical: 4000 }
    },
    gardening: {
      'landscaping': { min: 2000, max: 8000, typical: 4000 },
      'lawn-care': { min: 600, max: 2000, typical: 1200 },
      'kitchen-garden': { min: 1500, max: 5000, typical: 2500 },
      'plant-maintenance': { min: 500, max: 1500, typical: 900 },
      'balcony-garden': { min: 1200, max: 3500, typical: 2000 }
    }
  };

  const getCurrentEstimate = () => {
    if (selectedCategory && selectedSubcategory) {
      return marketEstimates?.[selectedCategory]?.[selectedSubcategory];
    }
    return null;
  };

  const currentEstimate = getCurrentEstimate();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Set Your Budget</h3>
        {currentEstimate && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEstimates(!showEstimates)}
            iconName="TrendingUp"
            iconPosition="left"
          >
            Market Rates
          </Button>
        )}
      </div>
      {currentEstimate && showEstimates && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Icon name="Info" size={16} className="text-primary" />
            <span className="text-sm font-medium text-primary">Market Price Estimates</span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Minimum</p>
              <p className="text-lg font-semibold text-foreground">₹{currentEstimate?.min?.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Typical</p>
              <p className="text-lg font-semibold text-primary">₹{currentEstimate?.typical?.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Maximum</p>
              <p className="text-lg font-semibold text-foreground">₹{currentEstimate?.max?.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
      )}
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">Select your preferred budget range:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {budgetRanges?.map((range) => (
            <button
              key={range?.id}
              onClick={() => onBudgetChange(range)}
              className={`p-4 rounded-lg border-2 text-center trust-transition ${
                budget?.id === range?.id
                  ? 'border-primary bg-primary/5 text-primary' :'border-border hover:border-primary/50 hover:bg-muted'
              }`}
            >
              <p className="font-medium">{range?.label}</p>
              {currentEstimate && (
                <p className="text-xs text-muted-foreground mt-1">
                  {range?.min <= currentEstimate?.typical && range?.max >= currentEstimate?.typical
                    ? 'Recommended'
                    : range?.max < currentEstimate?.typical
                    ? 'Below market' :'Above market'}
                </p>
              )}
            </button>
          ))}
        </div>
      </div>
      {budget && (
        <div className="bg-muted/50 border border-border rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Icon name="DollarSign" size={16} className="text-primary" />
            <span className="text-sm font-medium">Selected Budget: {budget?.label}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Technicians can send counter-offers if needed
          </p>
        </div>
      )}
    </div>
  );
};

export default BudgetSelector;