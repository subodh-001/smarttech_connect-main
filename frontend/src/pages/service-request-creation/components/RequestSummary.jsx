import React from 'react';
import Icon from '../../../components/AppIcon';

const RequestSummary = ({ 
  selectedCategory, 
  selectedSubcategory, 
  location, 
  description, 
  budget, 
  schedule, 
  photos,
  descriptionMinLength = 30,
}) => {
  const serviceCategories = {
    plumbing: { name: 'Plumber', icon: 'Wrench' },
    electrical: { name: 'Electrician', icon: 'Zap' },
    hvac: { name: 'AC Repair', icon: 'Wind' },
    appliance_repair: { name: 'Appliance Repair', icon: 'Monitor' },
    handyman: { name: 'Handyman', icon: 'Hammer' },
    cleaning: { name: 'Cleaning', icon: 'Sparkles' },
    gardening: { name: 'Gardening', icon: 'Leaf' },
  };

  const subcategoryNames = {
    'pipe-repair': 'Pipe Repair',
    'tap-installation': 'Tap Installation',
    'toilet-repair': 'Toilet Repair',
    'water-heater': 'Water Heater Service',
    'drainage-cleaning': 'Drainage Cleaning',
    'wiring-repair': 'Wiring Repair',
    'switch-installation': 'Switch Installation',
    'fan-installation': 'Fan Installation',
    'light-fitting': 'Light Fitting',
    'power-backup': 'Power Backup Setup',
    'ac-service': 'AC Service',
    'ac-installation': 'AC Installation',
    'ac-gas-refill': 'Gas Refill',
    'ac-repair': 'AC Repair',
    'ac-uninstallation': 'AC Uninstallation',
    'laptop-repair': 'Laptop Repair',
    'desktop-repair': 'Desktop Repair',
    'data-recovery': 'Data Recovery',
    'washing-machine': 'Washing Machine Repair',
    'fridge-service': 'Refrigerator Service',
    'furniture-repair': 'Furniture Repair',
    'door-installation': 'Door Installation',
    'cabinet-making': 'Cabinet Making',
    'wood-polishing': 'Wood Polishing',
    'custom-furniture': 'Custom Furniture',
    'home-deep-clean': 'Home Deep Cleaning',
    'kitchen-clean': 'Kitchen Cleaning',
    'bathroom-clean': 'Bathroom Cleaning',
    'sofa-clean': 'Sofa & Upholstery',
    'office-clean': 'Office Cleaning',
    'landscaping': 'Landscaping',
    'lawn-care': 'Lawn Care',
    'kitchen-garden': 'Kitchen Garden Setup',
    'plant-maintenance': 'Plant Maintenance',
    'balcony-garden': 'Balcony Garden',
  };

  const trimmedDescription = description?.trim() || '';
  const meetsDescriptionRequirement = trimmedDescription.length >= descriptionMinLength;
  const isComplete =
    selectedCategory &&
    selectedSubcategory &&
    location &&
    meetsDescriptionRequirement &&
    budget &&
    schedule;

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Icon name="FileText" size={20} className="text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Request Summary</h3>
      </div>
      <div className="space-y-4">
        {/* Service Details */}
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon name={selectedCategory ? serviceCategories?.[selectedCategory]?.icon : 'Settings'} size={16} className="text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Service</p>
            <p className="text-sm text-muted-foreground">
              {selectedCategory && selectedSubcategory 
                ? `${serviceCategories?.[selectedCategory]?.name} - ${subcategoryNames?.[selectedSubcategory]}`
                : 'Not selected'
              }
            </p>
          </div>
          {selectedCategory && selectedSubcategory && (
            <Icon name="CheckCircle" size={16} className="text-success" />
          )}
        </div>

        {/* Location */}
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon name="MapPin" size={16} className="text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Location</p>
            <p className="text-sm text-muted-foreground">
              {location || 'Not set'}
            </p>
          </div>
          {location && (
            <Icon name="CheckCircle" size={16} className="text-success" />
          )}
        </div>

        {/* Description */}
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon name="MessageSquare" size={16} className="text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Description</p>
            <p className="text-sm text-muted-foreground">
              {description 
                ? `${description?.substring(0, 100)}${description?.length > 100 ? '...' : ''}`
                : 'Not provided'
              }
            </p>
          </div>
          {description ? (
            meetsDescriptionRequirement ? (
            <Icon name="CheckCircle" size={16} className="text-success" />
            ) : (
              <Icon name="AlertCircle" size={16} className="text-warning" />
            )
          ) : null}
        </div>

        {/* Budget */}
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon name="DollarSign" size={16} className="text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Budget</p>
            <p className="text-sm text-muted-foreground">
              {budget?.label || 'Not set'}
            </p>
          </div>
          {budget && (
            <Icon name="CheckCircle" size={16} className="text-success" />
          )}
        </div>

        {/* Schedule */}
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon name="Clock" size={16} className="text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Schedule</p>
            <p className="text-sm text-muted-foreground">
              {schedule?.label || 'Not scheduled'}
              {schedule?.customDate && schedule?.customTime && (
                <span className="block">
                  {new Date(schedule.customDate)?.toLocaleDateString('en-IN')} at {schedule?.customTime}
                </span>
              )}
            </p>
          </div>
          {schedule && (
            <Icon name="CheckCircle" size={16} className="text-success" />
          )}
        </div>

        {/* Photos */}
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon name="Image" size={16} className="text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Photos</p>
            <p className="text-sm text-muted-foreground">
              {photos?.length > 0 ? `${photos?.length} photo${photos?.length > 1 ? 's' : ''} uploaded` : 'No photos added'}
            </p>
          </div>
          {photos?.length > 0 && (
            <Icon name="CheckCircle" size={16} className="text-success" />
          )}
        </div>
      </div>
      {/* Completion Status */}
      <div
        className={`p-4 rounded-lg border ${
          isComplete ? 'bg-success/5 border-success/20' : 'bg-warning/5 border-warning/20'
        }`}
      >
        <div className="flex items-center space-x-2">
          <Icon 
            name={isComplete ? "CheckCircle" : "AlertCircle"} 
            size={16} 
            className={isComplete ? "text-success" : "text-warning"} 
          />
          <span className={`text-sm font-medium ${
            isComplete ? "text-success" : "text-warning"
          }`}>
            {isComplete 
              ? 'Ready to find technicians!'
              : !meetsDescriptionRequirement && trimmedDescription.length > 0
              ? `Add ${descriptionMinLength - trimmedDescription.length} more characters to your description`
              : 'Please complete all required fields'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RequestSummary;