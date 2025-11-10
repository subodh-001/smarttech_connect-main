export const TECHNICIAN_SPECIALTIES = [
  { id: 'plumbing', label: 'Plumbing', icon: 'Wrench' },
  { id: 'electrical', label: 'Electrical', icon: 'Zap' },
  { id: 'hvac', label: 'AC & HVAC', icon: 'Wind' },
  { id: 'appliance_repair', label: 'Appliance Repair', icon: 'Monitor' },
  { id: 'handyman', label: 'Handyman', icon: 'Hammer' },
  { id: 'cleaning', label: 'Cleaning', icon: 'Sparkles' },
  { id: 'gardening', label: 'Gardening', icon: 'Leaf' },
  { id: 'computer_repair', label: 'Computer Repair', icon: 'Laptop' },
];

export const SPECIALTY_LABEL_MAP = TECHNICIAN_SPECIALTIES.reduce((acc, item) => {
  acc[item.id] = item.label;
  return acc;
}, {});


