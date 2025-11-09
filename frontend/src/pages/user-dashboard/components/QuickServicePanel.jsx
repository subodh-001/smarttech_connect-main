import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QuickServicePanel = () => {
  const [selectedCategory, setSelectedCategory] = useState('');

  const serviceCategories = [
    { id: 'plumbing', name: 'Plumbing', icon: 'Wrench', color: 'text-blue-600' },
    { id: 'electrical', name: 'Electrical', icon: 'Zap', color: 'text-yellow-600' },
    { id: 'ac-repair', name: 'AC Repair', icon: 'Wind', color: 'text-green-600' },
    { id: 'appliance', name: 'Appliance', icon: 'Tv', color: 'text-purple-600' },
    { id: 'carpentry', name: 'Carpentry', icon: 'Hammer', color: 'text-orange-600' },
    { id: 'cleaning', name: 'Cleaning', icon: 'Sparkles', color: 'text-pink-600' }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6 trust-shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Quick Service Request</h2>
        <Icon name="Plus" size={20} className="text-primary" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        {serviceCategories?.map((category) => (
          <button
            key={category?.id}
            onClick={() => setSelectedCategory(category?.id)}
            className={`p-3 rounded-lg border trust-transition ${
              selectedCategory === category?.id
                ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex flex-col items-center space-y-2">
              <Icon name={category?.icon} size={24} className={category?.color} />
              <span className="text-xs font-medium text-foreground">{category?.name}</span>
            </div>
          </button>
        ))}
      </div>
      <div className="space-y-3 mb-4">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Icon name="MapPin" size={16} />
          <span>Current Location: Koramangala, Bangalore</span>
          <button className="text-primary hover:underline">Change</button>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Icon name="IndianRupee" size={16} />
          <span>Budget Range: ₹500 - ₹2000</span>
        </div>
      </div>
      <Link to="/service-request-creation">
        <Button
          variant="default"
          fullWidth
          iconName="ArrowRight"
          iconPosition="right"
          disabled={!selectedCategory}
        >
          Create Service Request
        </Button>
      </Link>
    </div>
  );
};

export default QuickServicePanel;