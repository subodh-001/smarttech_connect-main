import React from 'react';
import Icon from '../../../components/AppIcon';

const ServiceCategorySelector = ({ selectedCategory, onCategorySelect, selectedSubcategory, onSubcategorySelect }) => {
  const serviceCategories = [
    {
      id: 'plumber',
      name: 'Plumber',
      icon: 'Wrench',
      color: 'bg-blue-100 text-blue-700',
      subcategories: [
        { id: 'pipe-repair', name: 'Pipe Repair' },
        { id: 'tap-installation', name: 'Tap Installation' },
        { id: 'toilet-repair', name: 'Toilet Repair' },
        { id: 'water-heater', name: 'Water Heater Service' },
        { id: 'drainage-cleaning', name: 'Drainage Cleaning' }
      ]
    },
    {
      id: 'electrician',
      name: 'Electrician',
      icon: 'Zap',
      color: 'bg-yellow-100 text-yellow-700',
      subcategories: [
        { id: 'wiring-repair', name: 'Wiring Repair' },
        { id: 'switch-installation', name: 'Switch Installation' },
        { id: 'fan-installation', name: 'Fan Installation' },
        { id: 'light-fitting', name: 'Light Fitting' },
        { id: 'power-backup', name: 'Power Backup Setup' }
      ]
    },
    {
      id: 'ac-repair',
      name: 'AC Repair',
      icon: 'Wind',
      color: 'bg-cyan-100 text-cyan-700',
      subcategories: [
        { id: 'ac-service', name: 'AC Service' },
        { id: 'ac-installation', name: 'AC Installation' },
        { id: 'ac-gas-refill', name: 'Gas Refill' },
        { id: 'ac-repair', name: 'AC Repair' },
        { id: 'ac-uninstallation', name: 'AC Uninstallation' }
      ]
    },
    {
      id: 'computer-repair',
      name: 'Computer Repair',
      icon: 'Monitor',
      color: 'bg-purple-100 text-purple-700',
      subcategories: [
        { id: 'laptop-repair', name: 'Laptop Repair' },
        { id: 'desktop-repair', name: 'Desktop Repair' },
        { id: 'data-recovery', name: 'Data Recovery' },
        { id: 'virus-removal', name: 'Virus Removal' },
        { id: 'software-installation', name: 'Software Installation' }
      ]
    },
    {
      id: 'carpenter',
      name: 'Carpenter',
      icon: 'Hammer',
      color: 'bg-orange-100 text-orange-700',
      subcategories: [
        { id: 'furniture-repair', name: 'Furniture Repair' },
        { id: 'door-installation', name: 'Door Installation' },
        { id: 'cabinet-making', name: 'Cabinet Making' },
        { id: 'wood-polishing', name: 'Wood Polishing' },
        { id: 'custom-furniture', name: 'Custom Furniture' }
      ]
    }
  ];

  const selectedCategoryData = serviceCategories?.find(cat => cat?.id === selectedCategory);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Select Service Category</h3>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {serviceCategories?.map((category) => (
            <button
              key={category?.id}
              onClick={() => onCategorySelect(category?.id)}
              className={`p-4 rounded-lg border-2 trust-transition ${
                selectedCategory === category?.id
                  ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50 hover:bg-muted'
              }`}
            >
              <div className={`w-12 h-12 rounded-lg ${category?.color} flex items-center justify-center mx-auto mb-2`}>
                <Icon name={category?.icon} size={24} />
              </div>
              <p className="text-sm font-medium text-center">{category?.name}</p>
            </button>
          ))}
        </div>
      </div>
      {selectedCategoryData && (
        <div>
          <h4 className="text-md font-medium text-foreground mb-3">Select Specific Service</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {selectedCategoryData?.subcategories?.map((subcategory) => (
              <button
                key={subcategory?.id}
                onClick={() => onSubcategorySelect(subcategory?.id)}
                className={`p-3 rounded-md border text-left trust-transition ${
                  selectedSubcategory === subcategory?.id
                    ? 'border-primary bg-primary/5 text-primary' :'border-border hover:border-primary/50 hover:bg-muted'
                }`}
              >
                <span className="text-sm font-medium">{subcategory?.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceCategorySelector;